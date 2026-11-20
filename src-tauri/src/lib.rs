//! Open IPTV Pro Rust Lab, separate from the Electron desktop release.
//! Tauri 2 is the only packaged desktop shell; JavaScript UI is reused intact.
mod bridge;
mod stream;
mod smart;
mod backup;
mod recordings;
mod compat;
mod primary_store;
mod link_checker;
mod safe_network;
mod local_ai;
mod video_enhance;
mod hidden_process;

use std::{path::PathBuf,sync::Arc};
use tokio::sync::Mutex;
use tauri::Manager;
use uuid::Uuid;

pub struct AppState {
    pub client: reqwest::Client,
    pub data_dir: PathBuf,
    pub port: u16,
    pub secret: String,
    pub ffmpeg: Option<String>,
    pub timeshift: Mutex<Option<recordings::TimeSession>>,
    pub compat: Mutex<Option<compat::CompatSession>>,
    pub dvr: Mutex<recordings::DvrStore>,
    pub pending_backup: Mutex<Option<backup::PendingBackup>>,
    pub pending_restore: Mutex<Option<backup::PendingRestore>>,
}

fn resolve_ffmpeg(resources: &std::path::Path) -> Option<String> {
    let name=if cfg!(target_os="windows"){"ffmpeg.exe"}else{"ffmpeg"};
    let options=[std::env::var("OPEN_IPTV_FFMPEG").ok(),
      Some(resources.join("resources").join(name).to_string_lossy().into_owned()),
      Some(name.to_string())];
    options.into_iter().flatten().find(|bin|{
        crate::hidden_process::standard(bin).args(["-version"]).output()
           .is_ok_and(|result|result.status.success())
    })
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let data_dir=app.path().app_data_dir()?;
            std::fs::create_dir_all(&data_dir)?;
            let listener=tauri::async_runtime::block_on(async {
                tokio::net::TcpListener::bind("127.0.0.1:0").await
            })?;
            let port=listener.local_addr()?.port();
            let client=reqwest::Client::builder()
                .connect_timeout(std::time::Duration::from_secs(10))
                .redirect(reqwest::redirect::Policy::limited(5))
                .build()?;
            let state=Arc::new(AppState {
                client, data_dir:data_dir.clone(), port,
                secret:Uuid::new_v4().simple().to_string(),
                ffmpeg:resolve_ffmpeg(&app.path().resource_dir()?),
                timeshift:Mutex::new(None),
                compat:Mutex::new(None),
                dvr:Mutex::new(recordings::DvrStore::load(&data_dir)),
                pending_backup:Mutex::new(None), pending_restore:Mutex::new(None),
            });
            let server=stream::router(state.clone());
            tauri::async_runtime::spawn(async move {
                if let Err(e)=axum::serve(listener,server).await {eprintln!("IPTV relay stopped: {e}");}
            });
            let monitor=state.clone();
            tauri::async_runtime::spawn(async move { recordings::dvr_monitor(monitor).await; });
            app.manage(Arc::new(local_ai::LocalAi::new(data_dir.clone(),state.ffmpeg.clone())));
            app.manage(state);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![bridge::bridge])
        .run(tauri::generate_context!())
        .expect("Unable to start Open IPTV Pro Rust Lab");
}
