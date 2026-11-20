use open_iptv_pro_native::{epg, epg_cache, export, failover, health, m3u, media, model::{Channel, NativeData, Source}, mpv::{self, VideoBackend}, player::Player as Mpv, storage, netguard};
use slint::{ComponentHandle, ModelRc, VecModel};
use std::cell::RefCell;
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::Child;
use std::rc::Rc;
use std::sync::mpsc::{self, Receiver, Sender};
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

slint::include_modules!();

struct State {
    data: NativeData,
    visible: Vec<usize>,
    total_matches: usize,
    page: usize,
    selected_source: Option<String>,
    favorites_only: bool,
    recent_only: bool,
    playback_candidates: Vec<String>,
    playback_index: usize,
    pending_delete: Option<String>,
    current_epg: HashMap<String, String>,
    normalized_epg: HashMap<String, String>,
    epg_schedule: Vec<epg::GuideEntry>,
    guide_day_offset: i32,
    folder_filter: Option<String>,
    selected_url: Option<String>,
}

enum ImportGuard { New, ExistingAnyOrigin, ExistingOrigin(String) }

enum Background {
    Playlist { source: Source, result: Result<Vec<Channel>, String>, guard: ImportGuard },
    Epg { source: Option<String>, result: Result<epg::GuideData, String> },
    Health(Vec<(String, health::Health)>),
    Snapshot(Result<(PathBuf, bool), String>),
    SnapshotBatch { ok: usize, cached: usize, fail: usize },
}

/// Download, parse and persist EPG on a worker thread, never serializing a
/// multi-day guide in Slint's UI thread.
fn load_online_epg(url: &str) -> Result<epg::GuideData, String> {
    let guide=epg::from_url(url)?;
    if let Err(e)=epg_cache::save(url, &guide.now_next) {
        eprintln!("EPG current cache: {e}");
    }
    if let Err(e)=epg_cache::save_full(url, &guide.schedule) {
        eprintln!("EPG full cache: {e}");
    }
    Ok(guide)
}

fn source_id() -> String {
    let ns = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_nanos();
    format!("native_{ns:x}")
}

fn normalize_guide(map: &HashMap<String, String>) -> HashMap<String, String> {
    let mut result = HashMap::with_capacity(map.len());
    for (key, title) in map {
        result.entry(epg::channel_key(key)).or_insert_with(|| title.clone());
    }
    result
}

fn guide_title<'a>(state: &'a State, tvg_id: &str, name: &str) -> Option<&'a String> {
    state.current_epg.get(tvg_id).or_else(|| state.current_epg.get(name))
        .or_else(|| state.normalized_epg.get(&epg::channel_key(tvg_id)))
        .or_else(|| state.normalized_epg.get(&epg::channel_key(name)))
}

fn refresh_schedule(ui: &MainWindow, state: &State) {
    let day = chrono::Local::now().date_naive()
        + chrono::Duration::days(state.guide_day_offset as i64);
    let phrase = ui.get_epg_search().trim().to_lowercase();
    let mut by_id: HashMap<String, String> = HashMap::new();
    for ch in &state.data.channels {
        if !ch.tvg_id.trim().is_empty() {
            by_id.entry(epg::channel_key(&ch.tvg_id)).or_insert_with(|| ch.name.clone());
        }
        by_id.entry(epg::channel_key(&ch.name)).or_insert_with(|| ch.name.clone());
    }
    let mut total = 0usize;
    let mut visible = Vec::new();
    for e in &state.epg_schedule {
        let local_start = e.start.with_timezone(&chrono::Local);
        let local_stop = e.stop.with_timezone(&chrono::Local);
        if local_start.date_naive() != day { continue; }
        let key = epg::channel_key(&e.channel);
        let channel = by_id.get(&key).map(String::as_str).unwrap_or(&e.channel);
        if !phrase.is_empty()
            && !channel.to_lowercase().contains(&phrase)
            && !e.channel.to_lowercase().contains(&phrase)
            && !e.title.to_lowercase().contains(&phrase) { continue; }
        total += 1;
        if visible.len() < 250 {
            visible.push(GuideView {
                channel: channel.into(),
                time: format!("{} – {}", local_start.format("%H:%M"), local_stop.format("%H:%M")).into(),
                title: e.title.clone().into(),
            });
        }
    }
    ui.set_guide_rows(ModelRc::new(VecModel::from(visible)));
    ui.set_guide_day_text(day.format("%d/%m/%Y").to_string().into());
    ui.set_guide_count(format!("{} chương trình · hiển thị tối đa 250; tìm tên kênh để thu hẹp", total).into());
}

fn refresh(ui: &MainWindow, state: &mut State) {
    let phrase = ui.get_search_text().trim().to_lowercase();
    let all: Vec<usize> = state.data.channels.iter().enumerate().filter_map(|(idx, ch)| {
        if state.favorites_only && !state.data.favorite_urls.contains(&ch.url) { return None; }
        if state.recent_only && !state.data.recent_urls.contains(&ch.url) { return None; }
        if let Some(folder) = state.folder_filter.as_ref() {
            if !state.data.folders.iter().any(|f| &f.name == folder && f.urls.contains(&ch.url)) { return None; }
        }
        if let Some(source_id) = state.selected_source.as_ref() {
            if &ch.source_id != source_id { return None; }
        }
        if !phrase.is_empty() && !ch.name.to_lowercase().contains(&phrase)
            && !ch.group.to_lowercase().contains(&phrase)
            && !ch.tvg_id.to_lowercase().contains(&phrase) { return None; }
        Some(idx)
    }).collect();
    let mut all = all;
    if state.recent_only {
        all.sort_by_key(|index| {
            state.data.recent_urls.iter().position(|url| &state.data.channels[*index].url == url).unwrap_or(usize::MAX)
        });
    }
    state.total_matches = all.len();
    const PAGE_SIZE: usize = 200;
    let max_page = all.len().saturating_sub(1) / PAGE_SIZE;
    state.page = state.page.min(max_page);
    state.visible = all.into_iter().skip(state.page * PAGE_SIZE).take(PAGE_SIZE).collect();
    let rows: Vec<ChannelView> = state.visible.iter().filter_map(|index| state.data.channels.get(*index)).map(|ch| {
        let show = guide_title(state, &ch.tvg_id, &ch.name)
            .map(|t| format!("EPG đang chiếu: {t}"))
            .unwrap_or_default();
        ChannelView {
            title: ch.name.clone().into(),
            subtitle: format!("{} · {}", ch.group, ch.tvg_id).into(),
            epg: show.into(),
            favorite: state.data.favorite_urls.contains(&ch.url),
            health: state.data.health.get(&ch.url).cloned().unwrap_or_default().into(),
        }
    }).collect();
    let sources: Vec<SourceView> = state.data.sources.iter().map(|src| SourceView {
        title: src.name.clone().into(),
        count: format!("{} kênh", state.data.channels.iter().filter(|ch| ch.source_id == src.id).count()).into(),
    }).collect();
    ui.set_channels(ModelRc::new(VecModel::from(rows)));
    ui.set_sources(ModelRc::new(VecModel::from(sources)));
    ui.set_sources_count(state.data.sources.len().to_string().into());
    ui.set_favorites_count(state.data.favorite_urls.len().to_string().into());
    ui.set_recent_count(state.data.recent_urls.len().to_string().into());
    ui.set_epg_auto_refresh_enabled(state.data.epg_auto_refresh);
    ui.set_source_auto_refresh_enabled(state.data.auto_refresh_sources);
    ui.set_quick_tools_expanded(state.data.quick_tools_expanded);
    ui.set_aspect_mode_text(match state.data.aspect_mode.as_str() {
        "fill" => "Lấp đầy (cắt cạnh)", "original" => "Kích thước gốc", _ => "Vừa khung"
    }.into());
    ui.set_muted(state.data.muted);
    ui.set_auto_resume_last_channel(state.data.auto_resume_last_channel);
    ui.set_auto_failover_text(if state.data.auto_failover { "Đang bật".into() } else { "Đang tắt".into() });
    ui.set_volume_text(format!("{}%", state.data.volume).into());
    ui.set_current_theme(state.data.theme.clone().into());
    ui.set_video_backend_mode(state.data.video_backend.clone().into());
    ui.set_light_mode(state.data.theme == "Sáng");
    ui.set_amoled_mode(state.data.theme == "AMOLED");
    let accent = match state.data.theme.as_str() {
        "Tối · Xanh" => slint::Color::from_rgb_u8(98,198,107),
        "Apple tối" => slint::Color::from_rgb_u8(100,176,252),
        "Material 3" => slint::Color::from_rgb_u8(174,147,255),
        "AMOLED" => slint::Color::from_rgb_u8(225,189,255),
        _ => slint::Color::from_rgb_u8(188,124,255),
    };
    ui.set_accent(accent.into());
    ui.set_source_hint(format!("{} nguồn đang lưu", state.data.sources.len()).into());
    if let Some(url) = &state.selected_url {
        let epg_now = state.data.channels.iter().find(|c| &c.url == url)
            .and_then(|c| guide_title(state, &c.tvg_id, &c.name));
        ui.set_selected_epg_text(epg_now.cloned().unwrap_or("Chưa khớp chương trình EPG cho kênh đang chọn".into()).into());
        ui.set_selected_health_text(state.data.health.get(url).cloned().unwrap_or("Chưa kiểm tra kênh này".into()).into());
        let alternates = state.data.alternate_links.get(url);
        let count=alternates.map_or(0, |a|a.len());
        let active=state.playback_index;
        let desc=if let Some(list)=alternates {
            format!("{} link dự phòng · luồng đang dùng: {}\n{}",count,active+1,
                list.iter().enumerate().map(|(i,l)|format!("{}. {}",i+2,l)).collect::<Vec<_>>().join("\n"))
        } else { "Chưa có link dự phòng cho kênh này".to_string() };
        ui.set_alternates_text(desc.into());
    }
    ui.set_count_text(format!("{} / {} kết quả · trang {} / {} · {} nguồn",
        state.visible.len(), state.total_matches, state.page + 1,
        state.total_matches.saturating_sub(1) / PAGE_SIZE + 1, state.data.sources.len()).into());
    let selected = if let Some(folder) = state.folder_filter.as_ref() { format!("Thư mục: {folder}") }
        else if state.favorites_only { "Kênh yêu thích".to_string() }
        else if state.recent_only { "Kênh xem gần đây".to_string() }
        else if let Some(id) = state.selected_source.as_ref() {
            state.data.sources.iter().find(|s| &s.id == id).map(|s| s.name.clone()).unwrap_or("Nguồn đã xóa".into())
        } else { "Tất cả nguồn".into() };
    ui.set_selected_source_text(selected.into());
    // Do not rebuild large EPG lists while a viewer is using other pages.
    if ui.get_active_page().as_str() == "epg" {
        refresh_schedule(ui, state);
    }
}

fn status(ui: &MainWindow, msg: impl Into<String>) {
    ui.set_status_text(msg.into().into());
}

fn persist(ui: &MainWindow, state: &mut State, previous: NativeData, success: impl Into<String>) {
    if let Err(e) = storage::save(&state.data) {
        state.data = previous;
        refresh(ui, state);
        status(ui, format!("LỖI LƯU (đã hoàn tác thay đổi): {e}"));
    } else {
        refresh(ui, state);
        status(ui, success);
    }
}

fn import_playlist(ui: &MainWindow, state: &mut State, source: Source, result: Result<Vec<Channel>, String>, guard: ImportGuard) {
    // A background refresh/edit must not re-create a source removed by the user.
    // An older refresh must not overwrite a source whose URL was edited meanwhile.
    let existing = state.data.sources.iter().find(|s| s.id == source.id);
    let still_current = match guard {
        ImportGuard::New => true,
        ImportGuard::ExistingAnyOrigin => existing.is_some(),
        ImportGuard::ExistingOrigin(origin) => existing.is_some_and(|s| s.origin == origin),
    };
    if !still_current { return; }
    match result {
        Ok(channels) => {
            let previous = state.data.clone();
            let name = source.name.clone();
            let id = source.id.clone();
            let origin = source.origin.clone();
            let replacing = state.data.sources.iter().any(|s| s.id == id);
            let count = channels.len();
            match state.data.insert_source(source, channels) {
                Ok(_) => {
                    state.selected_source = if replacing { Some(id) } else { None };
                    state.favorites_only = false;
                    state.recent_only = false;
                    if replacing {
                        ui.set_source_edit_url(origin.into());
                        ui.set_source_edit_name(name.clone().into());
                    }
                    persist(ui, state, previous,
                        if replacing {format!("Đã kiểm tra và thay URL nguồn {name}, nạp {count} kênh; giữ dữ liệu kênh khớp.")}
                        else {format!("Đã thêm {count} kênh từ {name}.")});
                }
                Err(e) => status(ui, format!("Lỗi nhập playlist: {e}")),
            }
        }
        Err(e) => status(ui, format!("Không thể nhập M3U: {e}")),
    }
}

fn merge_import(ui: &MainWindow, state: &mut State, incoming: NativeData, prefix: &str) {
    let previous = state.data.clone();
    let count = match state.data.merge_backup(incoming, prefix) {
        Ok(count) => count,
        Err(e) => {
            status(ui, format!("Không thể gộp backup (đã giữ nguyên dữ liệu): {e}"));
            return;
        }
    };
    state.selected_source = None;
    state.favorites_only = false;
    state.recent_only = false;
    state.pending_delete = None;
    state.folder_filter = None;
    persist(ui, state, previous, format!(
        "Đã gộp {count} kênh và giữ link dự phòng, yêu thích, lịch sử xem, thư mục từ backup."
    ));
}

fn spawn_m3u(tx: Sender<Background>, source: Source, location: String, file: Option<PathBuf>, guard: ImportGuard) {
    std::thread::spawn(move || {
        let result = match file {
            Some(path) => storage::read_m3u_file(&path),
            None => storage::download_m3u(&location),
        }.and_then(|txt| m3u::parse_m3u(&txt, &source.id));
        let _ = tx.send(Background::Playlist { source, result, guard });
    });
}


/// Refresh known playlist sources on a bounded background queue; never run
/// network I/O on the Slint UI thread or spawn one thread per saved source.
fn queue_sources_refresh(tx: Sender<Background>, sources: Vec<Source>) -> usize {
    let todo: Vec<Source> = sources.into_iter()
        .filter(|src| src.origin.starts_with("https://") || src.origin.starts_with("http://")
            || std::path::Path::new(&src.origin).is_file())
        .take(30).collect();
    let count = todo.len();
    if count == 0 { return 0; }
    std::thread::spawn(move || {
        for batch in todo.chunks(4) {
            std::thread::scope(|scope| {
                for source in batch {
                    let tx = tx.clone();
                    scope.spawn(move || {
                        let origin = source.origin.clone();
                        let text = if origin.starts_with("https://") || origin.starts_with("http://") {
                            storage::download_m3u(&origin)
                        } else {
                            storage::read_m3u_file(std::path::Path::new(&origin))
                        };
                        let result = text.and_then(|content| m3u::parse_m3u(&content, &source.id));
                        let _ = tx.send(Background::Playlist {
                            source: source.clone(), result,
                            guard: ImportGuard::ExistingOrigin(origin),
                        });
                    });
                }
            });
        }
    });
    count
}

/// Select logical channel, then try its primary URL and saved alternates.
/// An accepted mpv command is not proof that network playback has succeeded.
fn play_logical(
    ui: &MainWindow,
    shared: &Rc<RefCell<State>>,
    player: &Rc<RefCell<Option<Mpv>>>,
    name: String,
    primary_url: String,
    volume: i32,
) {
    let candidates={
        let s=shared.borrow();
        failover::candidates(&primary_url,s.data.alternate_links.get(&primary_url).map_or(&[],|x|x.as_slice()))
    };
    if candidates.is_empty() {status(ui,"Kênh không có URL hợp lệ");return;}
    let mode=shared.borrow().data.video_backend.clone();
    let mut guard=player.borrow_mut();
    if guard.is_none() {
        match Mpv::new_with_backend(&mode) {
            Ok(p)=>*guard=Some(p),
            Err(e)=>{
                ui.set_video_status("Lỗi tải thư viện phát video".into());
                ui.set_video_hint(format!("Không mở được video: {e}").into());
                status(ui,format!("Không khởi động được libmpv: {e}"));return;
            }
        }
    }
    let Some(p)=guard.as_ref() else{return;};
    ui.set_has_video_frame(false);
    ui.set_video_frame(slint::Image::default());
    ui.set_video_paused(false);
    ui.set_playback_progress(0.0);
    ui.set_playback_clock("--:-- / LIVE".into());
    ui.set_video_status(match p.video_backend() {
        VideoBackend::EmbeddedSoftware => "Đang kết nối video trong Slint...",
        VideoBackend::NativeWindow => "Đang mở cửa sổ mpv riêng...",
    }.into());
    if let Err(e)=p.set_volume(volume){status(ui,e);return;}
    let (muted, aspect_mode) = {
        let s=shared.borrow();
        (s.data.muted, s.data.aspect_mode.clone())
    };
    if let Err(e)=p.set_mute(muted){status(ui,format!("Không đặt được âm thanh: {e}"));return;}
    if let Err(e)=p.set_aspect_mode(&aspect_mode){status(ui,format!("Không đặt được khung hình: {e}"));return;}
    let mut chosen=None;
    let mut last_error=String::new();
    for (index,url) in candidates.iter().enumerate() {
        match p.play(url) {
            Ok(())=>{chosen=Some((index,url.clone()));break;},
            Err(e)=>{last_error=e;}
        }
    }
    let Some((index,playing_url))=chosen else{
        status(ui,format!("Không gửi được lệnh phát tới libmpv: {last_error}"));return;
    };
    ui.set_playing_text(name.clone().into());
    ui.set_playing_subtitle(playing_url.into());
    ui.set_video_hint(format!("Đang nạp hình ảnh: {name}").into());
    let mut s=shared.borrow_mut();
    let prev=s.data.clone();
    s.playback_candidates=candidates;
    s.playback_index=index;
    s.selected_url=Some(primary_url.clone());
    s.data.last_channel_url=primary_url.clone();
    s.data.remember_channel(&primary_url);
    let candidate_count=s.playback_candidates.len();
    persist(ui,&mut s,prev,format!("Đang kết nối {name} (URL {}/{}); đợi libmpv xác nhận khung hình.", index+1,candidate_count));
}

fn connect_callbacks(
    ui: &MainWindow,
    shared: Rc<RefCell<State>>,
    player: Rc<RefCell<Option<Mpv>>>,
    tx: Sender<Background>,
    multiview: Rc<RefCell<Vec<Mpv>>>,
    recording: Rc<RefCell<Option<(Child, PathBuf)>>>,
) {
    {
        let weak = ui.as_weak(); let shared = shared.clone();
        ui.on_navigate(move |page| {
            let Some(ui) = weak.upgrade() else { return; };
            let page = page.to_string();
            let title = match page.as_str() {
                "tv" => "Xem truyền hình", "fav" => "Kênh yêu thích", "recent" => "Xem gần đây", "epg" => "Lịch phát sóng EPG",
                "multiview" => "MultiView · 4 kênh", "shots" => "Ảnh chụp kênh", "folders" => "Thư mục kênh",
                "sources" => "Quản lý nguồn", "health" => "Sức khỏe kênh / Failover",
                "doctor" => "Smart IPTV Doctor", "discovery" => "Khám phá IPTV",
                "profiles" => "Hồ sơ / Khóa trẻ em", "settings" => "Cài đặt", _ => "Xem truyền hình",
            };
            ui.set_active_page(page.clone().into());
            ui.set_page_title(title.into());
            let mut s = shared.borrow_mut();
            if page == "fav" { s.favorites_only = true; s.recent_only = false; s.selected_source = None; s.folder_filter = None; s.page=0; }
            else if page == "recent" { s.favorites_only = false; s.recent_only = true; s.selected_source=None; s.folder_filter=None;s.page=0; }
            else if page == "tv" { s.favorites_only = false; s.recent_only = false; s.folder_filter = None; s.page=0; }
            refresh(&ui, &mut s);
        });
    }
    {
        let weak = ui.as_weak(); let tx = tx.clone();
        ui.on_add_url(move || {
            let Some(ui) = weak.upgrade() else { return; };
            let raw = ui.get_url_input().trim().to_string();
            if raw.is_empty() { status(&ui, "Nhập URL playlist trước khi thêm."); return; }
            if let Err(e) = netguard::validate_public_http_url(&raw) { status(&ui, e); return; }
            if !ui.get_import_rights_confirmed() { status(&ui,"Hãy xác nhận quyền sử dụng nguồn M3U trước mỗi lần nhập.");return; }
            ui.set_import_rights_confirmed(false);
            let name = raw.split('/').filter(|part| !part.is_empty()).next_back().unwrap_or("M3U online");
            let src = Source { id: source_id(), name: name.chars().take(90).collect(), origin: raw.clone() };
            spawn_m3u(tx.clone(), src, raw, None, ImportGuard::New);
            status(&ui, "Đang tải playlist trên luồng nền...");
        });
    }
    {
        let weak = ui.as_weak(); let tx = tx.clone();
        ui.on_open_m3u(move || {
            let Some(ui) = weak.upgrade() else { return; };
            if !ui.get_import_rights_confirmed() { status(&ui,"Hãy xác nhận quyền sử dụng file M3U trước mỗi lần nhập.");return; }
            let Some(path) = rfd::FileDialog::new().add_filter("M3U", &["m3u", "m3u8", "txt"]).pick_file() else { return; };
            ui.set_import_rights_confirmed(false);
            let name = path.file_name().and_then(|x| x.to_str()).unwrap_or("Local M3U").to_string();
            let src = Source { id: source_id(), name, origin: path.to_string_lossy().to_string() };
            spawn_m3u(tx.clone(), src, String::new(), Some(path), ImportGuard::New);
            status(&ui, "Đang phân tích playlist cục bộ...");
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_page_next(move || {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut();
                if (s.page + 1) * 200 < s.total_matches { s.page += 1; }
                refresh(&ui, &mut s);
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_page_prev(move || {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut();s.page=s.page.saturating_sub(1);
                refresh(&ui, &mut s);
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_filter_changed(move |_| {
            if let Some(ui)=weak.upgrade() { let mut s=shared.borrow_mut();s.page=0;refresh(&ui, &mut s); }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_show_all(move || {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut(); s.selected_source=None; s.favorites_only=false; s.recent_only=false; s.pending_delete=None; s.folder_filter=None; s.page=0;
                refresh(&ui, &mut s);
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_show_favorites(move || {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut(); s.selected_source=None; s.favorites_only=true; s.recent_only=false; s.pending_delete=None; s.folder_filter=None; s.page=0;
                refresh(&ui, &mut s);
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_select_source(move |idx| {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut();
                let selected = s.data.sources.get(idx as usize).cloned();
                if let Some(src)=selected {
                    ui.set_source_edit_url(src.origin.clone().into());
                    ui.set_source_edit_name(src.name.clone().into());
                    s.selected_source=Some(src.id); s.favorites_only=false; s.recent_only=false; s.pending_delete=None; s.folder_filter=None; s.page=0;
                    refresh(&ui, &mut s);
                }
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_rename_source(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let new_name=ui.get_source_edit_name().trim().to_string();
            if new_name.is_empty() || new_name.len() > 1024 {status(&ui,"Tên nguồn phải có độ dài từ 1 đến 1024 byte");return;}
            let mut state=shared.borrow_mut();
            let Some(id)=state.selected_source.clone() else{status(&ui,"Chọn nguồn trước khi đổi tên");return;};
            let old=state.data.clone();
            let Some(src)=state.data.sources.iter_mut().find(|s|s.id==id) else{status(&ui,"Không tìm thấy nguồn đang chọn");return;};
            src.name=new_name;
            persist(&ui,&mut state,old,"Đã đổi tên nguồn và lưu dữ liệu");
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let tx=tx.clone();
        ui.on_update_source_url(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let new_url=ui.get_source_edit_url().trim().to_string();
            if !ui.get_import_rights_confirmed() {status(&ui,"Xác nhận có quyền sử dụng URL M3U trước khi cập nhật nguồn");return;}
            if let Err(e) = netguard::validate_public_http_url(&new_url) {
                status(&ui, e); return;
            }
            let selected={
                let s=shared.borrow();
                s.selected_source.as_ref().and_then(|id|s.data.sources.iter().find(|src|&src.id==id)).cloned()
            };
            let Some(mut src)=selected else{status(&ui,"Chọn nguồn trước khi cập nhật URL");return;};
            if src.origin==new_url {status(&ui,"URL nguồn chưa thay đổi");return;}
            src.origin=new_url.clone();
            ui.set_import_rights_confirmed(false);
            spawn_m3u(tx.clone(),src,new_url,None,ImportGuard::ExistingAnyOrigin);
            status(&ui,"Đang kiểm tra URL và playlist mới. Nguồn hiện tại được giữ nguyên nếu tải thất bại.");
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_remove_source(move || {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut();
                let Some(id)=s.selected_source.clone() else { status(&ui, "Chọn một nguồn ở danh sách trước khi xóa."); return; };
                if s.pending_delete.as_ref()!=Some(&id) {
                    s.pending_delete=Some(id);
                    status(&ui, "Xác nhận: nhấn 'Xóa nguồn đang chọn' lần thứ hai để xóa trong bản Rust Native.");
                    return;
                }
                let previous=s.data.clone();
                let removed=s.data.remove_source(&id);
                s.selected_source=None; s.pending_delete=None;
                persist(&ui, &mut s, previous, format!("Đã xóa nguồn trong Rust Native ({removed} kênh). Electron không bị ảnh hưởng."));
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone(); let player=player.clone();
        ui.on_play_channel(move |row| {
            let Some(ui)=weak.upgrade() else {return;};
            let selection={
                let s=shared.borrow();
                s.visible.get(row as usize).and_then(|idx| s.data.channels.get(*idx)).map(|ch| (ch.name.clone(),ch.url.clone(),s.data.volume))
            };
            let Some((name,url,volume))=selection else {return;};
            play_logical(&ui,&shared,&player,name,url,volume);
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let player=player.clone();
        ui.on_play_last_channel(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let selection={
                let s=shared.borrow();
                s.data.channels.iter().find(|ch|ch.url==s.data.last_channel_url)
                    .map(|ch|(ch.name.clone(),ch.url.clone(),s.data.volume))
            };
            let Some((name,url,volume))=selection else {status(&ui,"Không có kênh đã xem trước đó");return;};
            play_logical(&ui,&shared,&player,name,url,volume);
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_toggle_favorite(move |row| {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();
            let url=s.visible.get(row as usize).and_then(|idx| s.data.channels.get(*idx)).map(|ch| ch.url.clone());
            if let Some(url)=url {
                let is_fav=if s.data.favorite_urls.contains(&url) { s.data.favorite_urls.remove(&url);false }
                    else { s.data.favorite_urls.insert(url.clone());true };
                if let Err(e)=storage::save(&s.data) {
                    if is_fav { s.data.favorite_urls.remove(&url); } else { s.data.favorite_urls.insert(url); }
                    status(&ui, format!("Không lưu được yêu thích, đã hoàn tác: {e}"));
                } else { status(&ui, if is_fav { "Đã thêm kênh yêu thích" } else { "Đã bỏ kênh yêu thích" }); }
                refresh(&ui,&mut s);
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_reorder_channel(move |row, direction| {
            let Some(ui)=weak.upgrade() else{return;};
            let mut state=shared.borrow_mut();
            if state.recent_only {status(&ui,"Danh sách gần đây luôn sắp xếp theo thời gian xem");return;}
            let previous=state.data.clone();
            let visible=state.visible.clone();
            match state.data.move_visible_channel(&visible,row as usize,direction) {
                Ok(())=>persist(&ui,&mut state,previous,"Đã thay đổi thứ tự kênh và lưu lại"),
                Err(e)=>status(&ui,e),
            }
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone();
        ui.on_pause_video(move || {
            if let Some(ui)=weak.upgrade() {
                let result=player.borrow().as_ref().map(|p| p.toggle_pause()).unwrap_or_else(|| Err("Chưa mở video".into()));
                status(&ui, result.map(|_| "Đã gửi lệnh bật/tắt tạm dừng".to_owned()).unwrap_or_else(|e| e));
            }
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone(); let shared=shared.clone();
        ui.on_stop_video(move || {
            if let Some(ui)=weak.upgrade() {
                let result=player.borrow().as_ref().map(|p| p.stop()).unwrap_or_else(|| Err("Chưa mở video".into()));
                match result {
                    Ok(()) => {
                        ui.set_playing_text("Đã dừng phát".into());
                        ui.set_video_frame(slint::Image::default());
                        ui.set_has_video_frame(false);
                        ui.set_video_status("Đã dừng".into());
                        ui.set_playback_clock("--:-- / --:--".into());
                        ui.set_playback_progress(0.0);
                        let mut s=shared.borrow_mut();s.playback_candidates.clear();s.playback_index=0;
                        status(&ui, "Đã dừng video");
                    }
                    Err(e) => status(&ui, e),
                }
            }
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone();
        ui.on_seek_video(move |secs| {
            if let Some(ui)=weak.upgrade() {
                let result=player.borrow().as_ref().map(|p|
                    if secs==999999 {p.seek_to_live()} else {p.seek(secs)})
                    .unwrap_or_else(|| Err("Chưa mở video".into()));
                status(&ui,result.map(|_| if secs==999999 {
                    "Đã yêu cầu chuyển tới vị trí mới nhất (nếu luồng hỗ trợ seek)".to_string()
                } else {
                    format!("Đã yêu cầu tua {secs}s (nếu luồng hỗ trợ seek)")
                }).unwrap_or_else(|e|e));
            }
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone();
        ui.on_seek_percent(move |percent| {
            let Some(ui)=weak.upgrade() else {return;};
            let result=player.borrow().as_ref().map(|p|p.seek_percent(percent))
                .unwrap_or_else(||Err("Chưa có video để tua".into()));
            if let Err(e)=result {status(&ui,format!("Không thể tua video: {e}"));}
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone();
        ui.on_cycle_audio_track(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let result=player.borrow().as_ref().map(|p|p.cycle_audio_track())
                .unwrap_or_else(||Err("Chưa phát video".into()));
            status(&ui,result.map(|_|"Đã yêu cầu chuyển track âm thanh".to_string())
                .unwrap_or_else(|e|format!("Không thể đổi track âm thanh: {e}")));
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone();
        ui.on_cycle_subtitle_track(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let result=player.borrow().as_ref().map(|p|p.cycle_subtitle_track())
                .unwrap_or_else(||Err("Chưa phát video".into()));
            status(&ui,result.map(|_|"Đã yêu cầu chuyển track phụ đề".to_string())
                .unwrap_or_else(|e|format!("Không thể đổi track phụ đề: {e}")));
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone(); let shared=shared.clone();
        ui.on_volume_delta(move |delta| {
            if let Some(ui)=weak.upgrade() {
                let mut s=shared.borrow_mut();
                let target=(s.data.volume+delta).clamp(0,100);
                if let Some(p)=player.borrow().as_ref() {
                    if let Err(e)=p.set_volume(target) { status(&ui, e);return; }
                }
                let previous=s.data.volume; s.data.volume=target;
                if let Err(e)=storage::save(&s.data){s.data.volume=previous;status(&ui,format!("Không lưu được âm lượng: {e}"));}
                else{status(&ui,format!("Âm lượng: {target}%"));}
                refresh(&ui,&mut s);
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_import_electron_backup(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let Some(path)=rfd::FileDialog::new().add_filter("Electron backup", &["iptvbackup"]).pick_file() else {return;};
            let data=storage::read_limited(&path,96*1024*1024).and_then(|bytes|storage::import_electron_backup(&bytes));
            match data {Ok(d)=>merge_import(&ui,&mut shared.borrow_mut(),d,"electron_"),Err(e)=>status(&ui,format!("Lỗi backup Electron: {e}"))}
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_import_native_backup(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let Some(path)=rfd::FileDialog::new().add_filter("Rust Native", &["json"]).pick_file() else {return;};
            let data=storage::read_limited(&path,96*1024*1024).and_then(|bytes|storage::parse_native_json(&bytes));
            match data {Ok(d)=>merge_import(&ui,&mut shared.borrow_mut(),d,"import_"),Err(e)=>status(&ui,format!("Lỗi backup Rust: {e}"))}
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_export_native_backup(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let Some(path)=rfd::FileDialog::new().set_file_name("open-iptv-pro-rust-native.json").save_file() else {return;};
            let data=shared.borrow().data.clone();
            match storage::save_to(&path,&data) {Ok(())=>status(&ui,format!("Đã xuất dữ liệu Rust Native: {}",path.display())),Err(e)=>status(&ui,format!("Xuất thất bại: {e}"))}
        });
    }
    {
        let weak=ui.as_weak(); let tx=tx.clone();
        ui.on_import_epg(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let Some(path)=rfd::FileDialog::new().add_filter("XMLTV", &["xml", "xmltv", "gz"]).pick_file() else {return;};
            let tx=tx.clone();
            std::thread::spawn(move || { let _=tx.send(Background::Epg { source: None, result: epg::from_file(&path) }); });
            status(&ui, "Đang đọc EPG XMLTV trong luồng nền...");
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_guide_filter_changed(move |_| {
            let Some(ui)=weak.upgrade() else {return;};
            refresh_schedule(&ui, &shared.borrow());
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_guide_day(move |delta| {
            let Some(ui)=weak.upgrade() else {return;};
            let mut state=shared.borrow_mut();
            state.guide_day_offset=if delta==0 {0}
                else {(state.guide_day_offset + delta).clamp(0,6)};
            refresh_schedule(&ui, &state);
        });
    }
    // Refresh online playlists without deleting source IDs, favorites or local Electron data.
    {
        let weak=ui.as_weak(); let shared=shared.clone(); let tx=tx.clone();
        ui.on_refresh_sources(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let sources = shared.borrow().data.sources.clone();
            let count = queue_sources_refresh(tx.clone(), sources);
            status(&ui,format!("Đang làm mới {count} nguồn, tối đa 4 tác vụ tải cùng lúc."));
        });
    }
    {
        let weak=ui.as_weak(); let tx=tx.clone();
        ui.on_discover_vn(move || {
            if let Some(ui)=weak.upgrade() {
                if !ui.get_discovery_rights_confirmed() { status(&ui,"Hãy xác minh điều khoản Smart Discovery và quyền sử dụng nguồn trước khi tải.");return; }
                ui.set_discovery_rights_confirmed(false);
                let url="https://iptv-org.github.io/iptv/countries/vn.m3u".to_string();
                let src=Source {id:source_id(),name:"Khám phá công khai · Việt Nam".into(),origin:url.clone()};
                spawn_m3u(tx.clone(),src,url,None,ImportGuard::New);
                status(&ui,"Đang tải playlist công khai Việt Nam (không bảo đảm mọi link phát được)...");
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_export_m3u(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let Some(path)=rfd::FileDialog::new().set_file_name("open-iptv-pro-native.m3u").save_file() else {return;};
            let all=shared.borrow().data.channels.clone();
            match export::save_m3u(&path,&all) {
                Ok(())=>status(&ui,format!("Đã xuất {} kênh ra {}",all.len(),path.display())),
                Err(e)=>status(&ui,format!("Lỗi xuất M3U: {e}"))
            }
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();
        ui.on_export_favorites_m3u(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let all={let s=shared.borrow();s.data.channels.iter().filter(|c|s.data.favorite_urls.contains(&c.url)).cloned().collect::<Vec<_>>()};
            if all.is_empty(){status(&ui,"Chưa có kênh yêu thích để xuất");return;}
            let Some(path)=rfd::FileDialog::new().set_file_name("open-iptv-pro-favorites.m3u").save_file() else {return;};
            match export::save_m3u(&path,&all) {
                Ok(())=>status(&ui,format!("Đã xuất {} kênh yêu thích: {}",all.len(),path.display())),
                Err(e)=>status(&ui,format!("Xuất yêu thích thất bại: {e}"))
            }
        });
    }
    {
        let weak=ui.as_weak();
        ui.on_select_epg_preset(move |preset| {
            let Some(ui)=weak.upgrade() else {return;};
            let url=match preset.as_str() {
                "xml" => "https://epg.io.vn/epg.xml",
                "gzip-vi" => "https://epg.io.vn/epgu.xml.gz",
                "xml-vi" => "https://epg.io.vn/epgu.xml",
                _ => "https://epg.io.vn/epg.xml.gz",
            };
            ui.set_epg_url_input(url.into());
            status(&ui,"Đã chọn nguồn EPG. Nhấn Tải EPG từ URL để sử dụng.");
        });
    }
    {
        let weak=ui.as_weak(); let tx=tx.clone(); let shared=shared.clone();
        ui.on_load_epg_url(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let url=ui.get_epg_url_input().to_string();
            if let Err(e) = netguard::validate_public_http_url(&url) { status(&ui, e); return; }
            let mut s=shared.borrow_mut();
            let previous=s.data.clone();
            s.data.epg_url=url.clone();
            persist(&ui,&mut s,previous,"Đang tải EPG online...");
            std::thread::spawn({let tx=tx.clone(); move || {let _=tx.send(Background::Epg { source: Some(url.clone()), result: load_online_epg(&url) });}});
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_create_folder(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let name=ui.get_folder_input().to_string();
            let mut s=shared.borrow_mut();
            let prev=s.data.clone();
            match s.data.add_folder(&name) {
                Ok(())=>persist(&ui,&mut s,prev,format!("Đã tạo thư mục: {name}")),
                Err(e)=>status(&ui,e)
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_put_in_folder(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let name=ui.get_folder_input().to_string();
            let mut s=shared.borrow_mut();
            let Some(url)=s.selected_url.clone() else {status(&ui,"Hãy phát một kênh trước khi thêm vào thư mục.");return;};
            let prev=s.data.clone();
            match s.data.folder_add_url(&name,&url) {
                Ok(())=>persist(&ui,&mut s,prev,format!("Đã thêm kênh vào: {name}")),
                Err(e)=>status(&ui,e)
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_show_folder(move |folder| {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();
            if !s.data.folders.iter().any(|f| f.name == folder.as_str()) {status(&ui,"Không tìm thấy thư mục. Hãy nhập đúng tên.");return;}
            s.folder_filter=Some(folder.to_string());s.favorites_only=false;s.recent_only=false;s.selected_source=None;
            ui.set_active_page("tv".into()); ui.set_page_title("Xem truyền hình".into());
            refresh(&ui,&mut s);
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_clear_folder(move || {
            if let Some(ui)=weak.upgrade() { let mut s=shared.borrow_mut();s.folder_filter=None;refresh(&ui,&mut s); }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_toggle_epg_auto_refresh(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();let old=s.data.clone();
            s.data.epg_auto_refresh=!s.data.epg_auto_refresh;
            let enabled=s.data.epg_auto_refresh;
            persist(&ui,&mut s,old,if enabled {"EPG sẽ tự cập nhật mỗi 10 phút"} else {"Đã tắt tự cập nhật EPG định kỳ"});
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_toggle_source_auto_refresh(move || {
            let Some(ui)=weak.upgrade() else { return; };
            let mut state=shared.borrow_mut();
            let before=state.data.clone();
            state.data.auto_refresh_sources=!state.data.auto_refresh_sources;
            let enabled=state.data.auto_refresh_sources;
            persist(&ui,&mut state,before,
                if enabled {"Sẽ tự làm mới nguồn M3U khi mở ứng dụng"}
                else {"Đã tắt tự làm mới M3U khi khởi động"});
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();
        ui.on_toggle_quick_tools(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let mut state=shared.borrow_mut();
            let old=state.data.clone();
            state.data.quick_tools_expanded=!state.data.quick_tools_expanded;
            persist(&ui,&mut state,old,"Đã lưu trạng thái công cụ nhanh");
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let player=player.clone();
        ui.on_set_aspect_mode(move |mode| {
            let Some(ui)=weak.upgrade() else{return;};
            if !open_iptv_pro_native::model::valid_aspect_mode(mode.as_str()) {status(&ui,"Chế độ khung hình không hợp lệ");return;}
            if let Some(p)=player.borrow().as_ref(){if let Err(e)=p.set_aspect_mode(mode.as_str()){
                status(&ui,format!("Không áp dụng được khung hình: {e}"));return;
            }}
            let mut state=shared.borrow_mut();let old=state.data.clone();
            state.data.aspect_mode=mode.to_string();
            persist(&ui,&mut state,old,"Đã lưu cách hiển thị khung hình");
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let player=player.clone();
        ui.on_toggle_mute(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let mut state=shared.borrow_mut();let old=state.data.clone();
            let muted=!state.data.muted;
            if let Some(p)=player.borrow().as_ref(){if let Err(e)=p.set_mute(muted){status(&ui,format!("Không chỉnh được tắt tiếng: {e}"));return;}}
            state.data.muted=muted;
            persist(&ui,&mut state,old,if muted {"Đã tắt tiếng"}else{"Đã bật tiếng"});
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();
        ui.on_toggle_resume_last_channel(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let mut state=shared.borrow_mut();let old=state.data.clone();
            state.data.auto_resume_last_channel=!state.data.auto_resume_last_channel;
            let enabled=state.data.auto_resume_last_channel;
            persist(&ui,&mut state,old,if enabled {"Sẽ tự mở kênh cuối khi khởi động"}else{"Đã tắt tự mở kênh cuối"});
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone();
        ui.on_set_theme(move |value| {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();let old=s.data.theme.clone();s.data.theme=value.to_string();
            if let Err(e)=storage::save(&s.data){s.data.theme=old;status(&ui,format!("Không lưu được theme: {e}"));}
            else {status(&ui,"Đã đổi giao diện cơ bản (chưa chuyển toàn bộ theme Electron)");}
            refresh(&ui,&mut s);
        });
    }
    {
        let weak=ui.as_weak(); let player=player.clone();
        ui.on_fullscreen_video(move || {
            if let Some(ui)=weak.upgrade() {
                let result=player.borrow().as_ref().map(|p|{
                    if p.video_backend()==VideoBackend::EmbeddedSoftware {
                        let expanded=!ui.get_player_fullscreen();
                        ui.set_active_page("tv".into());
                        ui.set_player_fullscreen(expanded);
                        Ok(if expanded {"Video Slint toàn màn hình"} else {"Đã thoát toàn màn hình"})
                    } else {
                        p.fullscreen().map(|_|"Đã chuyển chế độ toàn màn cửa sổ mpv")
                    }
                }).unwrap_or_else(||Err("Chưa phát kênh".into()));
                status(&ui,result.map(str::to_string).unwrap_or_else(|e|e));
            }
        });
    }
    {
        let weak=ui.as_weak(); let shared=shared.clone(); let player=player.clone();
        ui.on_select_video_backend(move |backend| {
            let Some(ui)=weak.upgrade() else {return;};
            let backend=backend.to_string();
            if !open_iptv_pro_native::model::valid_video_backend(&backend) {
                status(&ui,"Chế độ video không hợp lệ");
                return;
            }
            let resume={
                let mut state=shared.borrow_mut();
                if state.data.video_backend==backend {
                    status(&ui,"Đang sử dụng chế độ video đã chọn");return;
                }
                let previous=state.data.clone();
                state.data.video_backend=backend.clone();
                if let Err(e)=storage::save(&state.data) {
                    state.data=previous;
                    status(&ui,format!("Không lưu được đầu ra video: {e}"));return;
                }
                let selected=state.selected_url.as_ref().and_then(|url|
                    state.data.channels.iter().find(|ch|&ch.url==url)
                        .map(|ch|(ch.name.clone(),ch.url.clone(),state.data.volume))
                );
                refresh(&ui,&mut state);
                selected
            };
            ui.set_player_fullscreen(false);
            *player.borrow_mut()=None;
            ui.set_has_video_frame(false);
            ui.set_video_frame(slint::Image::default());
            if let Some((name,url,volume))=resume {
                play_logical(&ui,&shared,&player,name,url,volume);
            } else {
                status(&ui,if backend=="native" {
                    "Đã chọn cửa sổ mpv riêng cho lần phát tiếp theo"
                } else {"Đã chọn video nhúng trong Slint cho lần phát tiếp theo"});
            }
        });
    }
    // Use the same mpv instance for channel navigation; no extra leaked player.
    for relative in [-1_i64, 1] {
        let weak=ui.as_weak();let shared=shared.clone();let player=player.clone();
        let handler=move || {
            let Some(ui)=weak.upgrade() else {return;};
            let selection={
                let s=shared.borrow();
                let pos=s.selected_url.as_ref().and_then(|url|s.visible.iter().position(|i|s.data.channels.get(*i).is_some_and(|ch| &ch.url==url))).unwrap_or(0);
                if s.visible.is_empty(){None}else{
                    let next=(pos as i64+relative).rem_euclid(s.visible.len() as i64) as usize;
                    s.visible.get(next).and_then(|i|s.data.channels.get(*i)).map(|ch|(ch.name.clone(),ch.url.clone(),s.data.volume))
                }
            };
            let Some((name,url,volume))=selection else {status(&ui,"Danh sách hiện không có kênh");return;};
            play_logical(&ui,&shared,&player,name,url,volume);
        };
        if relative < 0 {ui.on_prev_video(handler);}else{ui.on_next_video(handler);}
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();
        ui.on_add_alternate(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();
            let Some(primary)=s.selected_url.clone() else{status(&ui,"Hãy chọn kênh trước");return;};
            let new_link=ui.get_alternate_input().to_string();
            let old=s.data.clone();
            match s.data.add_alternate(&primary,&new_link) {
                Ok(())=>{
                    s.playback_candidates=failover::candidates(&primary,s.data.alternate_links.get(&primary).map_or(&[],|links|links.as_slice()));
                    persist(&ui,&mut s,old,"Đã lưu URL dự phòng cho kênh");
                    ui.set_alternate_input("".into());
                },
                Err(e)=>status(&ui,e)
            }
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();
        ui.on_remove_alternate(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let mut s=shared.borrow_mut();
            let Some(primary)=s.selected_url.clone() else {status(&ui,"Chưa chọn kênh");return;};
            let old=s.data.clone();
            if s.data.remove_last_alternate(&primary){
                s.playback_candidates=failover::candidates(&primary,s.data.alternate_links.get(&primary).map_or(&[],|links|links.as_slice()));
                s.playback_index=s.playback_index.min(s.playback_candidates.len().saturating_sub(1));
                persist(&ui,&mut s,old,"Đã xóa link dự phòng cuối cùng");
            } else {status(&ui,"Kênh không có link dự phòng");}
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let player=player.clone();
        ui.on_next_alternate(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();
            let Some(next)=failover::next_index(s.playback_index,s.playback_candidates.len()) else {
                status(&ui,"Không còn link dự phòng để chuyển");return;
            };
            let url=s.playback_candidates[next].clone();
            let result=player.borrow().as_ref().map(|p|p.play(&url)).unwrap_or_else(||Err("Player chưa mở".into()));
            match result {
                Ok(())=>{
                    s.playback_index=next;
                    ui.set_playing_subtitle(url.into());
                    status(&ui,format!("Đã yêu cầu chuyển sang luồng {}",next+1));
                    refresh(&ui,&mut s);
                },
                Err(e)=>status(&ui,format!("Chuyển link dự phòng lỗi: {e}"))
            }
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();
        ui.on_toggle_auto_failover(move || {
            let Some(ui)=weak.upgrade() else {return;};
            let mut s=shared.borrow_mut();let old=s.data.clone();
            s.data.auto_failover=!s.data.auto_failover;
            let enabled=s.data.auto_failover;
            persist(&ui,&mut s,old, if enabled {"Đã bật tự chuyển link khi mpv báo lỗi"} else {"Đã tắt tự chuyển link"});
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let tx=tx.clone();
        ui.on_check_selected_channel(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let selected=shared.borrow().selected_url.clone();
            let Some(url)=selected else {status(&ui,"Hãy chọn một kênh để kiểm tra");return;};
            let tx=tx.clone();
            std::thread::spawn(move || { let _=tx.send(Background::Health(vec![(url.clone(),health::probe(&url))])); });
            status(&ui,"Đang kiểm tra luồng kênh hiện tại...");
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let tx=tx.clone();
        ui.on_check_channels(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let phrase=ui.get_search_text().trim().to_lowercase();
            let urls={let s=shared.borrow();s.data.channels.iter().filter(|ch| {
                (!s.favorites_only || s.data.favorite_urls.contains(&ch.url))
                && (!s.recent_only || s.data.recent_urls.contains(&ch.url))
                && s.selected_source.as_ref().is_none_or(|id| &ch.source_id==id)
                && s.folder_filter.as_ref().is_none_or(|folder| s.data.folders.iter().any(|f| &f.name==folder && f.urls.contains(&ch.url)))
                && (phrase.is_empty() || ch.name.to_lowercase().contains(&phrase) || ch.group.to_lowercase().contains(&phrase) || ch.tvg_id.to_lowercase().contains(&phrase))
            }).map(|ch|ch.url.clone()).take(1000).collect::<Vec<_>>()};
            let count=urls.len();let tx=tx.clone();
            std::thread::spawn(move ||{let res=health::check_batch(&urls,16);let _=tx.send(Background::Health(res));});
            status(&ui,format!("Đang kiểm tra {count} kênh bằng 16 luồng (không kết luận Die khi timeout)..."));
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let tx=tx.clone();
        ui.on_snapshot_current(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let selected={let s=shared.borrow();s.selected_url.as_ref().and_then(|url|s.data.channels.iter().find(|ch|&ch.url==url)).cloned()};
            let Some(ch)=selected else {status(&ui,"Hãy chọn/phát một kênh trước khi chụp");return;};
            let tx=tx.clone();
            std::thread::spawn(move ||{let _=tx.send(Background::Snapshot(media::snapshot(&ch)));});
            status(&ui,"Đang chụp ảnh qua FFmpeg...");
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let tx=tx.clone();
        ui.on_snapshot_all(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let channels={let s=shared.borrow();s.visible.iter().filter_map(|i|s.data.channels.get(*i)).take(10).cloned().collect::<Vec<_>>()};
            let count=channels.len();let tx=tx.clone();
            std::thread::spawn(move ||{
                let mut ok=0;let mut cached=0;let mut fail=0;
                for ch in channels {match media::snapshot(&ch){Ok((_,true))=>cached+=1,Ok(_)=>ok+=1,Err(_)=>fail+=1}}
                let _=tx.send(Background::SnapshotBatch {ok,cached,fail});
            });
            status(&ui,format!("Đang chụp tối đa {count} kênh; cache 6 giờ, không làm mới toàn bộ giao diện..."));
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let multiview=multiview.clone();
        ui.on_multiview_four(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let channels={let s=shared.borrow();s.visible.iter().filter_map(|i|s.data.channels.get(*i)).take(4).cloned().collect::<Vec<_>>()};
            if channels.is_empty() {status(&ui,"Danh sách đang lọc không có kênh");return;}
            let mut four=multiview.borrow_mut();four.clear();
            let mut succeeded=0;
            for (i,ch) in channels.iter().enumerate() {
                if let Ok(p)=Mpv::new_native_window(){
                    let _=p.set_volume(if i==0 {shared.borrow().data.volume}else{0});
                    if p.play(&ch.url).is_ok(){four.push(p);succeeded+=1;}
                }
            }
            status(&ui,format!("Đã gửi yêu cầu mở {succeeded} cửa sổ mpv; chưa ghép 4 video vào một khung Slint."));
        });
    }
    {
        let weak=ui.as_weak();let shared=shared.clone();let recording=recording.clone();
        ui.on_start_recording(move || {
            let Some(ui)=weak.upgrade() else{return;};
            if recording.borrow().is_some(){status(&ui,"Đã có phiên ghi hình, hãy dừng trước khi ghi phiên khác");return;}
            let channel={let s=shared.borrow();s.selected_url.as_ref().and_then(|url|s.data.channels.iter().find(|c|&c.url==url)).cloned()};
            let Some(ch)=channel else {status(&ui,"Hãy phát kênh trước khi ghi");return;};
            match media::start_record_60s(&ch) {
                Ok((child,path))=>{ui.set_recording_text(format!("Đang ghi 60 giây: {}",path.display()).into());*recording.borrow_mut()=Some((child,path));status(&ui,"Đã bắt đầu ghi hình ngắn bằng FFmpeg");},
                Err(e)=>status(&ui,e),
            }
        });
    }
    {
        let weak=ui.as_weak();let recording=recording.clone();
        ui.on_stop_recording(move || {
            let Some(ui)=weak.upgrade() else{return;};
            let rec=recording.borrow_mut().take();
            if let Some((mut child,path))=rec {
                let _=child.kill();let _=child.wait();
                ui.set_recording_text(format!("Đã dừng: {} (có thể chưa hoàn chỉnh)",path.display()).into());
                status(&ui,"Đã dừng FFmpeg. File dừng đột ngột có thể không phát được, nên dùng MKV.");
            }else{status(&ui,"Không có phiên ghi hình đang chạy");}
        });
    }
}

fn background_timer(ui: &MainWindow, shared: Rc<RefCell<State>>, rx: Receiver<Background>, tx: Sender<Background>, recording: Rc<RefCell<Option<(Child, PathBuf)>>>, player: Rc<RefCell<Option<Mpv>>>) -> slint::Timer {
    let weak=ui.as_weak();
    let timer=slint::Timer::default();
    let mut last_epg_refresh=Instant::now();
    let mut last_frame_refresh=Instant::now();
    let mut last_player_status=Instant::now();
    let mut last_frame_error=Instant::now();
    timer.start(slint::TimerMode::Repeated, Duration::from_millis(40), move || {
        let Some(ui)=weak.upgrade() else { return; };
        while let Ok(message)=rx.try_recv() {
            match message {
                Background::Playlist {source,result,guard} => import_playlist(&ui,&mut shared.borrow_mut(),source,result,guard),
                Background::Health(results) => {
                    let mut s=shared.borrow_mut();let prev=s.data.clone();
                    let mut alive=0;let mut dead=0;let mut unknown=0;
                    for (url, result) in results {
                        match result {health::Health::Alive=>alive+=1,health::Health::Dead=>dead+=1,health::Health::Uncertain=>unknown+=1}
                        s.data.health.insert(url,result.label().into());
                    }
                    persist(&ui,&mut s,prev,format!("Kiểm tra: {alive} Sống · {dead} Die · {unknown} Chưa rõ"));
                }
                Background::Snapshot(result) => match result {
                    Ok((path,cached))=>status(&ui,format!("Snapshot {}: {}",if cached {"dùng cache"}else{"đã chụp"},path.display())),
                    Err(e)=>status(&ui,format!("Snapshot lỗi: {e}")),
                },
                Background::SnapshotBatch{ok,cached,fail}=>status(&ui,format!("Snapshot hàng loạt: {ok} mới · {cached} cache · {fail} lỗi")),
                Background::Epg {source,result} => {
                    // A previous URL fetch must never replace a newly selected guide.
                    if source.as_ref().is_some_and(|url| shared.borrow().data.epg_url != *url) {
                        continue;
                    }
                    match result {
                        Ok(guide) => {
                            let count=guide.now_next.len();
                            let scheduled=guide.schedule.len();
                            let mut s=shared.borrow_mut();
                            s.normalized_epg=normalize_guide(&guide.now_next);
                            s.current_epg=guide.now_next;
                            s.epg_schedule=guide.schedule;
                            refresh(&ui,&mut s);
                            status(&ui,format!("Đã nạp EPG {count} kênh và {scheduled} chương trình; lưu cache nếu còn dung lượng."));
                        }
                        Err(e) => status(&ui,format!("EPG lỗi, giữ lịch trước đó: {e}")),
                    }
                }
            }
        }
        // Limit refresh frequency and keep the last usable guide on errors.
        if last_epg_refresh.elapsed() >= Duration::from_secs(600) {
            last_epg_refresh=Instant::now();
            let source={let s=shared.borrow();
                if s.data.epg_auto_refresh && !s.data.epg_url.trim().is_empty() {Some(s.data.epg_url.clone())}else{None}};
            if let Some(url)=source {
                let epg_tx=tx.clone();
                std::thread::spawn(move || {
                    let result=load_online_epg(&url);
                    let _=epg_tx.send(Background::Epg {source:Some(url),result});
                });
            }
        }
        // Always drain the libmpv SW render queue, even when the guide or
        // settings page is active. Only publish image pixels when TV is visible,
        // preventing a frozen decoder and unnecessary Slint texture uploads.
        if last_frame_refresh.elapsed() >= Duration::from_millis(40) {
            last_frame_refresh=Instant::now();
            let result={
                let guard=player.borrow();
                guard.as_ref().map(|p|p.render_embedded_frame())
            };
            match result {
                Some(Ok(Some(frame))) if matches!(ui.get_active_page().as_str(),"tv"|"fav"|"recent") => {
                    let pixels=slint::SharedPixelBuffer::<slint::Rgba8Pixel>::clone_from_slice(
                        &frame,mpv::FRAME_WIDTH as u32,mpv::FRAME_HEIGHT as u32
                    );
                    ui.set_video_frame(slint::Image::from_rgba8(pixels));
                    ui.set_has_video_frame(true);
                }
                Some(Err(error)) if last_frame_error.elapsed() >= Duration::from_secs(4) => {
                    last_frame_error=Instant::now();
                    status(&ui,format!("Lỗi khung hình: {error}"));
                }
                _ => {}
            }
        }
        if last_player_status.elapsed() >= Duration::from_millis(350) {
            last_player_status=Instant::now();
            let info=player.borrow().as_ref().map(|p|(p.video_backend(),p.playback_info()));
            if let Some((backend,info))=info {
                let is_live=info.duration_seconds.is_none_or(|v|v<=0.0);
                ui.set_video_is_live(is_live);
                ui.set_video_seekable(!is_live && info.position_seconds.is_some());
                ui.set_video_paused(info.paused.unwrap_or(false));
                ui.set_playback_progress(mpv::progress_percent(&info));
                let position=info.position_seconds.map(mpv::clock).unwrap_or_else(||"--:--".into());
                let duration=info.duration_seconds.filter(|d|*d>0.0)
                    .map(mpv::clock).unwrap_or_else(||"LIVE".into());
                ui.set_playback_clock(format!("{position} / {duration}").into());
                ui.set_video_status(if info.idle==Some(true) {
                    "Chưa có luồng đang phát"
                } else if info.paused==Some(true) {
                    "Đang tạm dừng"
                } else if info.is_video_loaded() {
                    match backend {
                        VideoBackend::EmbeddedSoftware=>"Đang phát trong Slint",
                        VideoBackend::NativeWindow=>"Đang phát ở cửa sổ mpv",
                    }
                } else if backend==VideoBackend::NativeWindow {
                    "Đang tải vào cửa sổ mpv"
                } else {
                    "Đang kết nối / đệm video"
                }.into());
            }
        }
        // Each mpv event is consumed only once. EOF/Stop are NOT playback failures.
        let failure=player.borrow().as_ref().and_then(|p|p.poll_playback_failure());
        if let Some(code)=failure {
            let (enabled, alternatives, next)={
                let s=shared.borrow();
                (s.data.auto_failover, s.playback_candidates.clone(), failover::next_index(s.playback_index,s.playback_candidates.len()))
            };
            if !enabled || next.is_none() {
                ui.set_video_status(format!("Lỗi phát mpv ({code})").into());
                status(&ui,format!("libmpv báo lỗi phát ({code}); {}",if enabled {"không còn URL dự phòng"} else {"Auto Failover đã tắt"}));
            } else if let Some(first_next)=next {
                let mut accepted=None;
                for idx in first_next..alternatives.len() {
                    let result=player.borrow().as_ref().map(|p|p.play(&alternatives[idx])).unwrap_or_else(||Err("Chưa có player".into()));
                    if result.is_ok(){accepted=Some(idx);break;}
                }
                if let Some(idx)=accepted {
                    let mut s=shared.borrow_mut();
                    s.playback_index=idx;
                    ui.set_playing_subtitle(alternatives[idx].clone().into());
                    status(&ui,format!("libmpv lỗi ({code}). Đã thử URL dự phòng {}/{}; đang đợi kết quả phát.",idx+1,alternatives.len()));
                    refresh(&ui,&mut s);
                } else {status(&ui,format!("libmpv lỗi ({code}), thử hết link dự phòng nhưng không phát được"));}
            }
        }
        let done = {
            let mut rec=recording.borrow_mut();
            if let Some((child,_))=rec.as_mut() { child.try_wait().ok().flatten().is_some() }else{false}
        };
        if done {
            if let Some((_,path))=recording.borrow_mut().take() {
                ui.set_recording_text(format!("Hoàn tất FFmpeg: {}",path.display()).into());
                status(&ui,"Phiên ghi hình đã kết thúc, kiểm tra file MKV trong thư mục recordings");
            }
        }
    });
    timer
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let saved = storage::load().map_err(|e| format!("Không đọc được dữ liệu Rust Native. Chưa sửa file cũ: {e}"))?;
    let cached_epg=epg_cache::load(&saved.epg_url).unwrap_or_default();
    let cached_schedule=epg_cache::load_full(&saved.epg_url).unwrap_or_default();
    let epg_source=saved.epg_url.clone();
    let state=Rc::new(RefCell::new(State {
        selected_url:if saved.last_channel_url.is_empty(){None}else{Some(saved.last_channel_url.clone())},
        data:saved,visible:Vec::new(),total_matches:0,page:0,selected_source:None,favorites_only:false,recent_only:false,playback_candidates:Vec::new(),playback_index:0,pending_delete:None,normalized_epg:normalize_guide(&cached_epg),current_epg:cached_epg,epg_schedule:cached_schedule,guide_day_offset:0,folder_filter:None,
    }));
    let ui=MainWindow::new()?;
    refresh(&ui,&mut state.borrow_mut());
    ui.set_epg_url_input(state.borrow().data.epg_url.clone().into());
    let player:Rc<RefCell<Option<Mpv>>>=Rc::new(RefCell::new(None));
    let (tx,rx)=mpsc::channel();
    let startup_sources={
        let current=state.borrow();
        if current.data.auto_refresh_sources {current.data.sources.clone()} else {Vec::new()}
    };
    let refresh_count=queue_sources_refresh(tx.clone(),startup_sources);
    if refresh_count>0 {
        status(&ui,format!("Đang cập nhật {refresh_count} nguồn M3U đã lưu trên luồng nền..."));
    }
    if !epg_source.trim().is_empty() {
        let startup_tx=tx.clone();
        std::thread::spawn(move || {
            let result=load_online_epg(&epg_source);
            let _=startup_tx.send(Background::Epg{source:Some(epg_source),result});
        });
    }
    let multiview: Rc<RefCell<Vec<Mpv>>> = Rc::new(RefCell::new(Vec::new()));
    let recording: Rc<RefCell<Option<(Child, PathBuf)>>> = Rc::new(RefCell::new(None));
    connect_callbacks(&ui,state.clone(),player.clone(),tx.clone(),multiview,recording.clone());
    let resume = {
        let s=state.borrow();
        if s.data.auto_resume_last_channel {
            s.data.channels.iter().find(|c| c.url==s.data.last_channel_url)
                .map(|c| (c.name.clone(),c.url.clone(),s.data.volume))
        } else {None}
    };
    if let Some((name,url,volume))=resume {
        play_logical(&ui,&state,&player,name,url,volume);
    }
    let _poller=background_timer(&ui,state,rx,tx,recording.clone(),player);
    ui.run()?;
    // Stop sidecar recording when GUI exits to avoid orphan processes.
    if let Some((mut child,_))=recording.borrow_mut().take(){let _=child.kill();let _=child.wait();}
    Ok(())
}
