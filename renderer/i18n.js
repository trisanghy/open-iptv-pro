/* Open IPTV Pro desktop localization. Local dictionaries ship inside the app: no translation API or account required. */
'use strict';
(() => {
  const locales = Object.freeze({"vi":"Tiếng Việt","en":"English","es":"Español","pt-BR":"Português (Brasil)","zh-CN":"简体中文","th":"ไทย","lo":"ລາວ","km":"ភាសាខ្មែរ","fr":"Français","de":"Deutsch","it":"Italiano","ja":"日本語","ko":"한국어","ru":"Русский","id":"Bahasa Indonesia","hi":"हिन्दी","ar":"العربية"});
  const dictionaries=window.OPEN_IPTV_TRANSLATIONS || {};

  // Offline supplemental UI translations. Preserve playlist, EPG and user-supplied names.
  const patchEnglish={"Chuyển":"Move","Link phát":"Stream link","Chưa có chương trình":"No program available","Chưa có lịch tiếp theo":"No upcoming schedule","Kênh nổi bật":"Featured channels","Tất cả kênh":"All channels","Công cụ":"Tools","Công cụ nhanh":"Quick tools","Đang phát":"Now playing","Tiếp theo":"Up next","Vừa xem":"Recently watched","Kênh vừa xem":"Recently watched channels","Tua lại":"Timeshift","Bộ đệm":"Buffer","Bật bộ đệm":"Enable buffer","Về LIVE":"Go Live","phút":"minutes","giây":"seconds","Vừa khung":"Fit","Lấp đầy":"Fill","Kéo giãn":"Stretch","Kích thước gốc":"Original size","Gốc":"Original","Giọng":"Voice","Tốc độ":"Speed","Màu chữ":"Text color","Viền chữ":"Text outline","Màu giao diện":"Theme color","Nền phụ đề":"Subtitle background","Kích thước chữ":"Font size","Nhỏ":"Small","Vừa":"Medium","Lớn":"Large","Rất lớn":"Extra large","Phông chữ":"Font family","Hệ thống":"System","Nền đen mờ":"Translucent black","Nền đen đậm":"Solid black","Nền sáng mờ":"Translucent light","Không nền":"No background","Không viền":"No outline","Viền đen":"Black outline","Viền trắng":"White outline","Tùy chỉnh phụ đề (CC)":"Customize captions (CC)","Hiển thị phụ đề trên video":"Show captions over video","Nội dung hiển thị":"Displayed content","Chỉ gốc":"Original only","Chỉ dịch":"Translation only","Cả hai":"Both","Vị trí hiển thị":"Position","Độ trong suốt nền":"Background opacity","Cài Whisper tự động":"Install Whisper automatically","Chọn whisper-cli":"Choose whisper-cli","Chọn mô hình GGML (.bin)":"Choose GGML model (.bin)","Kiểm tra dịch mẫu":"Test translation","Đang kiểm tra Whisper…":"Checking Whisper…","↻ Thử lại":"↻ Retry","Kiểm tra TTS…":"Checking TTS…","🔊 Giọng dịch":"🔊 Translated voice","▣ Chụp ảnh":"▣ Snapshot","Tắt gốc":"Mute original","Nghe thử":"Test voice","Cài mô hình tự động":"Install model automatically","Chưa chọn mẫu giọng.":"No voice sample selected.","Tùy chọn chỉ ảnh hưởng phụ đề AI của Open IPTV Pro; không thể xóa chữ đã nằm sẵn trong hình phim. Thiết lập được lưu trên máy.":"These settings affect only Open IPTV Pro AI captions; they cannot remove burned-in subtitles from video. Settings are saved locally.","Tự động · dùng mô hình đã cài":"Automatic · use installed model","Bộ dịch mặc định":"Default translation model","Live Translate · Bộ dịch offline":"Live Translate · Offline translation","TTS · Giọng đọc và thử giọng":"TTS · Voices and preview","Bộ nhớ AI đã tải":"Downloaded AI storage","Đang kiểm tra dung lượng AI…":"Checking AI storage…","KÊNH HIỆN TẠI":"CURRENT CHANNEL","Chưa có EPG cho kênh này":"No EPG available for this channel","Xem lịch phát sóng":"View TV Guide","Xem EPG đầy đủ ›":"Full EPG ›","Cài đặt":"Settings","Ngôn ngữ giao diện":"Interface language","Ngôn ngữ hiển thị":"Display language","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"Choose the application language. Changes apply immediately without restarting.","Sẵn sàng":"Ready","Chưa có kênh":"No channels","Chưa có nguồn":"No sources","Danh sách kênh":"Channel list","Yêu thích":"Favorites","Quản lý nguồn":"Manage sources","Sức khỏe kênh":"Channel health","Lịch phát sóng EPG":"EPG guide","Mở file M3U":"Open M3U file","Thêm URL":"Add URL","Chưa chọn kênh":"No channel selected","Kênh yêu thích":"Favorite channels","Ảnh chụp kênh":"Channel snapshots","Thư mục kênh":"Channel folders","Cấu hình kiểm tra":"Check settings","Tất cả":"All","Gập hết":"Collapse all","Mở hết":"Expand all","Kiểm tra kênh":"Check channels","Sao lưu":"Backup","Khôi phục":"Restore","Tùy chọn":"Options","Tải xuống":"Download","Tải phần mềm":"Download app","Xem truyền hình":"Watch TV","Lưu":"Save","Hủy":"Cancel","Đóng":"Close","Chọn kênh":"Select channel","Danh sách yêu thích":"Favorites list","Kiểm tra":"Check","Đã lưu":"Saved","Phát":"Play","Tạm dừng":"Pause","Dừng":"Stop","Toàn màn hình":"Fullscreen","Tài khoản":"Account","Cài đặt chung":"General settings","Quản lý":"Manage","Lọc":"Filter","Tìm kiếm":"Search","Làm mới":"Refresh","Lịch":"Guide","Nguồn":"Sources","Thêm":"More","Sống":"Live","Die":"Offline","Chưa rõ":"Unknown","Chưa có chương trình tiếp theo":"No next program","Bắt đầu":"Start","Kết thúc":"End","Cân bằng":"Balanced","Lưu dự phòng":"Save fallback","Link dự phòng":"Backup links","Nguồn EPG":"EPG sources","Tự cập nhật EPG khi khởi động":"Auto-update EPG on startup","Tự phát kênh đã xem ở phiên trước":"Resume last channel automatically","Tự động PiP khi rời ứng dụng":"Auto PiP when app is backgrounded","Bộ đệm 10 phút bắt đầu khi bật; các nút tua chỉ lùi trong phần đã ghi được.":"The 10-minute buffer starts when enabled; rewind works only within recorded content.","Chưa tải EPG":"EPG not loaded","Hiển thị":"Display","Chế độ sáng":"Light mode","Chế độ tối":"Dark mode","Ngôn ngữ / Language":"Language","Sẵn sàng xem truyền hình":"Ready to watch TV","Nhập danh sách để bắt đầu":"Import a playlist to begin","Quyền sử dụng":"Content rights","Tải mô hình":"Download model","Chọn mô hình":"Choose model","Dùng thử":"Try","Thông báo":"Notification","Tải EPG ngay":"Load EPG now","Màu đã chọn":"Selected color","Đặt lại màu mặc định":"Reset default color"};
  Object.assign(dictionaries.en||(dictionaries.en={}),patchEnglish);
  const patchOther={"fr":{"Xem truyền hình":"Regarder la TV","Kênh yêu thích":"Favoris","Lịch phát sóng EPG":"Guide EPG","Quản lý nguồn":"Gérer les sources","Danh sách kênh":"Liste des chaînes","Cài đặt":"Paramètres","Ngôn ngữ giao diện":"Langue de l’interface","Ngôn ngữ hiển thị":"Langue d’affichage","Yêu thích":"Favoris","Tất cả":"Tout","Nguồn":"Sources","Lịch":"Programme","Thêm":"Plus","Kiểm tra kênh":"Vérifier les chaînes","Mở file M3U":"Ouvrir un fichier M3U","Thêm URL":"Ajouter URL","Sao lưu":"Sauvegarde","Khôi phục":"Restaurer","Tìm kiếm":"Rechercher","Tải xuống":"Télécharger","Tiếp theo":"À suivre","Đang phát":"En cours","Link phát":"Lien du flux","Link dự phòng":"Flux de secours","Bắt đầu":"Démarrer","Kết thúc":"Terminer","Lưu":"Enregistrer","Hủy":"Annuler","Đóng":"Fermer","Mở hết":"Tout développer","Gập hết":"Tout réduire","Chưa có nguồn":"Aucune source","Chưa có kênh":"Aucune chaîne","Chưa chọn kênh":"Aucune chaîne choisie","Vừa xem":"Récemment regardés","Chưa có lịch tiếp theo":"Aucun programme à venir","Chưa có chương trình":"Aucun programme","Phát":"Lire","Dừng":"Arrêter","Tạm dừng":"Pause","Toàn màn hình":"Plein écran","Tua lại":"Retour en arrière","Về LIVE":"Retour au direct","Chế độ tối":"Mode sombre","Chế độ sáng":"Mode clair","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"Choisissez la langue de l’application. Le changement est immédiat."},"de":{"Xem truyền hình":"Fernsehen","Kênh yêu thích":"Favoriten","Lịch phát sóng EPG":"EPG-Programmführer","Quản lý nguồn":"Quellen verwalten","Danh sách kênh":"Senderliste","Cài đặt":"Einstellungen","Ngôn ngữ giao diện":"Oberflächensprache","Ngôn ngữ hiển thị":"Anzeigesprache","Yêu thích":"Favoriten","Tất cả":"Alle","Nguồn":"Quellen","Lịch":"Programm","Thêm":"Mehr","Kiểm tra kênh":"Sender prüfen","Mở file M3U":"M3U-Datei öffnen","Thêm URL":"URL hinzufügen","Sao lưu":"Sicherung","Khôi phục":"Wiederherstellen","Tìm kiếm":"Suchen","Tải xuống":"Herunterladen","Tiếp theo":"Als Nächstes","Đang phát":"Läuft gerade","Link phát":"Stream-Link","Link dự phòng":"Ersatzstreams","Bắt đầu":"Starten","Kết thúc":"Beenden","Lưu":"Speichern","Hủy":"Abbrechen","Đóng":"Schließen","Mở hết":"Alle öffnen","Gập hết":"Alle zuklappen","Chưa có nguồn":"Keine Quellen","Chưa có kênh":"Keine Sender","Chưa chọn kênh":"Kein Sender gewählt","Vừa xem":"Kürzlich gesehen","Chưa có lịch tiếp theo":"Kein Folgeprogramm","Chưa có chương trình":"Kein Programm","Phát":"Abspielen","Dừng":"Stopp","Tạm dừng":"Pause","Toàn màn hình":"Vollbild","Tua lại":"Zeitversatz","Về LIVE":"Zum Livebild","Chế độ tối":"Dunkelmodus","Chế độ sáng":"Hellmodus","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"Wählen Sie die App-Sprache. Änderungen gelten sofort."},"it":{"Xem truyền hình":"Guarda TV","Kênh yêu thích":"Preferiti","Lịch phát sóng EPG":"Guida EPG","Quản lý nguồn":"Gestisci sorgenti","Danh sách kênh":"Elenco canali","Cài đặt":"Impostazioni","Ngôn ngữ giao diện":"Lingua interfaccia","Ngôn ngữ hiển thị":"Lingua di visualizzazione","Yêu thích":"Preferiti","Tất cả":"Tutti","Nguồn":"Sorgenti","Lịch":"Guida","Thêm":"Altro","Kiểm tra kênh":"Controlla canali","Mở file M3U":"Apri file M3U","Thêm URL":"Aggiungi URL","Sao lưu":"Backup","Khôi phục":"Ripristina","Tìm kiếm":"Cerca","Tải xuống":"Scarica","Tiếp theo":"Successivo","Đang phát":"In riproduzione","Link phát":"Link streaming","Link dự phòng":"Stream alternativi","Bắt đầu":"Avvia","Kết thúc":"Fine","Lưu":"Salva","Hủy":"Annulla","Đóng":"Chiudi","Mở hết":"Espandi tutto","Gập hết":"Comprimi tutto","Chưa có nguồn":"Nessuna sorgente","Chưa có kênh":"Nessun canale","Chưa chọn kênh":"Nessun canale selezionato","Vừa xem":"Visti di recente","Chưa có lịch tiếp theo":"Nessun programma successivo","Chưa có chương trình":"Nessun programma","Phát":"Riproduci","Dừng":"Ferma","Tạm dừng":"Pausa","Toàn màn hình":"Schermo intero","Tua lại":"Timeshift","Về LIVE":"Torna in diretta","Chế độ tối":"Modalità scura","Chế độ sáng":"Modalità chiara","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"Scegli la lingua. Le modifiche sono immediate."},"ja":{"Xem truyền hình":"テレビを見る","Kênh yêu thích":"お気に入り","Lịch phát sóng EPG":"EPG番組表","Quản lý nguồn":"ソース管理","Danh sách kênh":"チャンネル一覧","Cài đặt":"設定","Ngôn ngữ giao diện":"表示言語","Ngôn ngữ hiển thị":"表示言語","Yêu thích":"お気に入り","Tất cả":"すべて","Nguồn":"ソース","Lịch":"番組表","Thêm":"その他","Kiểm tra kênh":"チャンネル確認","Mở file M3U":"M3Uを開く","Thêm URL":"URLを追加","Sao lưu":"バックアップ","Khôi phục":"復元","Tìm kiếm":"検索","Tải xuống":"ダウンロード","Tiếp theo":"次の番組","Đang phát":"再生中","Link phát":"再生リンク","Link dự phòng":"予備ストリーム","Bắt đầu":"開始","Kết thúc":"終了","Lưu":"保存","Hủy":"キャンセル","Đóng":"閉じる","Mở hết":"すべて展開","Gập hết":"すべて折りたたむ","Chưa có nguồn":"ソースなし","Chưa có kênh":"チャンネルなし","Chưa chọn kênh":"チャンネル未選択","Vừa xem":"最近見た","Chưa có lịch tiếp theo":"次の番組なし","Chưa có chương trình":"番組なし","Phát":"再生","Dừng":"停止","Tạm dừng":"一時停止","Toàn màn hình":"全画面","Tua lại":"タイムシフト","Về LIVE":"ライブへ","Chế độ tối":"ダークモード","Chế độ sáng":"ライトモード","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"言語を選択するとすぐに反映されます。"},"ko":{"Xem truyền hình":"TV 시청","Kênh yêu thích":"즐겨찾기","Lịch phát sóng EPG":"EPG 편성표","Quản lý nguồn":"소스 관리","Danh sách kênh":"채널 목록","Cài đặt":"설정","Ngôn ngữ giao diện":"인터페이스 언어","Ngôn ngữ hiển thị":"표시 언어","Yêu thích":"즐겨찾기","Tất cả":"전체","Nguồn":"소스","Lịch":"편성표","Thêm":"더 보기","Kiểm tra kênh":"채널 검사","Mở file M3U":"M3U 파일 열기","Thêm URL":"URL 추가","Sao lưu":"백업","Khôi phục":"복원","Tìm kiếm":"검색","Tải xuống":"다운로드","Tiếp theo":"다음","Đang phát":"재생 중","Link phát":"재생 링크","Link dự phòng":"대체 스트림","Bắt đầu":"시작","Kết thúc":"종료","Lưu":"저장","Hủy":"취소","Đóng":"닫기","Mở hết":"모두 펼치기","Gập hết":"모두 접기","Chưa có nguồn":"소스 없음","Chưa có kênh":"채널 없음","Chưa chọn kênh":"채널 미선택","Vừa xem":"최근 시청","Chưa có lịch tiếp theo":"다음 편성 없음","Chưa có chương trình":"프로그램 없음","Phát":"재생","Dừng":"정지","Tạm dừng":"일시정지","Toàn màn hình":"전체 화면","Tua lại":"타임시프트","Về LIVE":"라이브로","Chế độ tối":"다크 모드","Chế độ sáng":"라이트 모드","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"언어를 선택하면 즉시 적용됩니다."},"ru":{"Xem truyền hình":"Смотреть ТВ","Kênh yêu thích":"Избранное","Lịch phát sóng EPG":"Телепрограмма EPG","Quản lý nguồn":"Управление источниками","Danh sách kênh":"Список каналов","Cài đặt":"Настройки","Ngôn ngữ giao diện":"Язык интерфейса","Ngôn ngữ hiển thị":"Язык интерфейса","Yêu thích":"Избранное","Tất cả":"Все","Nguồn":"Источники","Lịch":"Программа","Thêm":"Ещё","Kiểm tra kênh":"Проверить каналы","Mở file M3U":"Открыть файл M3U","Thêm URL":"Добавить URL","Sao lưu":"Резервная копия","Khôi phục":"Восстановить","Tìm kiếm":"Поиск","Tải xuống":"Скачать","Tiếp theo":"Далее","Đang phát":"Сейчас играет","Link phát":"Ссылка потока","Link dự phòng":"Резервные потоки","Bắt đầu":"Начать","Kết thúc":"Завершить","Lưu":"Сохранить","Hủy":"Отмена","Đóng":"Закрыть","Mở hết":"Развернуть все","Gập hết":"Свернуть все","Chưa có nguồn":"Нет источников","Chưa có kênh":"Нет каналов","Chưa chọn kênh":"Канал не выбран","Vừa xem":"Недавно смотрели","Chưa có lịch tiếp theo":"Нет следующих передач","Chưa có chương trình":"Нет программы","Phát":"Воспроизвести","Dừng":"Стоп","Tạm dừng":"Пауза","Toàn màn hình":"На весь экран","Tua lại":"Таймшифт","Về LIVE":"В эфир","Chế độ tối":"Тёмная тема","Chế độ sáng":"Светлая тема","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"Выберите язык. Изменения применяются сразу."},"id":{"Xem truyền hình":"Tonton TV","Kênh yêu thích":"Favorit","Lịch phát sóng EPG":"Panduan EPG","Quản lý nguồn":"Kelola sumber","Danh sách kênh":"Daftar saluran","Cài đặt":"Pengaturan","Ngôn ngữ giao diện":"Bahasa antarmuka","Ngôn ngữ hiển thị":"Bahasa tampilan","Yêu thích":"Favorit","Tất cả":"Semua","Nguồn":"Sumber","Lịch":"Jadwal","Thêm":"Lainnya","Kiểm tra kênh":"Periksa saluran","Mở file M3U":"Buka berkas M3U","Thêm URL":"Tambah URL","Sao lưu":"Cadangan","Khôi phục":"Pulihkan","Tìm kiếm":"Cari","Tải xuống":"Unduh","Tiếp theo":"Berikutnya","Đang phát":"Sedang diputar","Link phát":"Tautan streaming","Link dự phòng":"Stream cadangan","Bắt đầu":"Mulai","Kết thúc":"Selesai","Lưu":"Simpan","Hủy":"Batal","Đóng":"Tutup","Mở hết":"Buka semua","Gập hết":"Tutup semua","Chưa có nguồn":"Belum ada sumber","Chưa có kênh":"Belum ada saluran","Chưa chọn kênh":"Belum memilih saluran","Vừa xem":"Baru ditonton","Chưa có lịch tiếp theo":"Tidak ada jadwal berikutnya","Chưa có chương trình":"Tidak ada program","Phát":"Putar","Dừng":"Berhenti","Tạm dừng":"Jeda","Toàn màn hình":"Layar penuh","Tua lại":"Timeshift","Về LIVE":"Kembali LIVE","Chế độ tối":"Mode gelap","Chế độ sáng":"Mode terang","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"Pilih bahasa. Perubahan langsung diterapkan."},"hi":{"Xem truyền hình":"टीवी देखें","Kênh yêu thích":"पसंदीदा","Lịch phát sóng EPG":"ईपीजी गाइड","Quản lý nguồn":"स्रोत प्रबंधन","Danh sách kênh":"चैनल सूची","Cài đặt":"सेटिंग","Ngôn ngữ giao diện":"इंटरफ़ेस भाषा","Ngôn ngữ hiển thị":"प्रदर्शन भाषा","Yêu thích":"पसंदीदा","Tất cả":"सभी","Nguồn":"स्रोत","Lịch":"कार्यक्रम","Thêm":"अधिक","Kiểm tra kênh":"चैनल जाँचें","Mở file M3U":"M3U फ़ाइल खोलें","Thêm URL":"URL जोड़ें","Sao lưu":"बैकअप","Khôi phục":"पुनर्स्थापित","Tìm kiếm":"खोजें","Tải xuống":"डाउनलोड","Tiếp theo":"अगला","Đang phát":"अभी चल रहा है","Link phát":"स्ट्रीम लिंक","Link dự phòng":"बैकअप स्ट्रीम","Bắt đầu":"शुरू करें","Kết thúc":"समाप्त","Lưu":"सहेजें","Hủy":"रद्द करें","Đóng":"बंद करें","Mở hết":"सभी खोलें","Gập hết":"सभी समेटें","Chưa có nguồn":"कोई स्रोत नहीं","Chưa có kênh":"कोई चैनल नहीं","Chưa chọn kênh":"कोई चैनल नहीं चुना","Vừa xem":"हाल में देखा","Chưa có lịch tiếp theo":"अगला कार्यक्रम नहीं","Chưa có chương trình":"कोई कार्यक्रम नहीं","Phát":"चलाएँ","Dừng":"रोकें","Tạm dừng":"रोकें","Toàn màn hình":"पूर्ण स्क्रीन","Tua lại":"टाइमशिफ्ट","Về LIVE":"लाइव पर लौटें","Chế độ tối":"डार्क मोड","Chế độ sáng":"लाइट मोड","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"भाषा चुनें। बदलाव तुरंत लागू होंगे।"},"ar":{"Xem truyền hình":"مشاهدة التلفزيون","Kênh yêu thích":"المفضلة","Lịch phát sóng EPG":"دليل البرامج","Quản lý nguồn":"إدارة المصادر","Danh sách kênh":"قائمة القنوات","Cài đặt":"الإعدادات","Ngôn ngữ giao diện":"لغة الواجهة","Ngôn ngữ hiển thị":"لغة العرض","Yêu thích":"المفضلة","Tất cả":"الكل","Nguồn":"المصادر","Lịch":"الجدول","Thêm":"المزيد","Kiểm tra kênh":"فحص القنوات","Mở file M3U":"فتح ملف M3U","Thêm URL":"إضافة رابط","Sao lưu":"نسخ احتياطي","Khôi phục":"استعادة","Tìm kiếm":"بحث","Tải xuống":"تنزيل","Tiếp theo":"التالي","Đang phát":"قيد التشغيل","Link phát":"رابط البث","Link dự phòng":"بث احتياطي","Bắt đầu":"بدء","Kết thúc":"إنهاء","Lưu":"حفظ","Hủy":"إلغاء","Đóng":"إغلاق","Mở hết":"توسيع الكل","Gập hết":"طي الكل","Chưa có nguồn":"لا توجد مصادر","Chưa có kênh":"لا توجد قنوات","Chưa chọn kênh":"لم يتم اختيار قناة","Vừa xem":"شوهد مؤخراً","Chưa có lịch tiếp theo":"لا يوجد برنامج قادم","Chưa có chương trình":"لا يوجد برنامج","Phát":"تشغيل","Dừng":"إيقاف","Tạm dừng":"إيقاف مؤقت","Toàn màn hình":"ملء الشاشة","Tua lại":"إرجاع البث","Về LIVE":"العودة للمباشر","Chế độ tối":"الوضع الداكن","Chế độ sáng":"الوضع الفاتح","Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.":"اختر لغة التطبيق. يتم تطبيق التغييرات فورًا."}};
  for(const [lang,entries] of Object.entries(patchOther)){
    Object.assign(dictionaries[lang]||(dictionaries[lang]={}),entries);
  }
  const key='open-iptv-pro-language';
  let locale='vi';
  try{const stored=localStorage.getItem(key);if(stored && Object.hasOwn(locales,stored))locale=stored;}catch{}
  const originalText=new WeakMap(), originalAttrs=new WeakMap();
  const skipSelector='script,style,code,pre,.channel-text b,.folder-header .folder-name,.folder-card h3,.fav-card h3,.shot-card b,#playingTitle,.epg-program b,.epg-row header b,.source-top h3,.source-url,.source-card h3,.preview-title,.channel-preview b';
  const attributeList=['title','placeholder','aria-label'];
  let inApply=false;
  function translate(raw,language=locale){
    if(typeof raw!=='string' || language==='vi')return raw;
    const dict=dictionaries[language]||{};
    const english=dictionaries.en||{};
    const compact=raw.trim().replace(/\s+/g,' ');
    if(!compact)return raw;
    let out=dict[compact]||english[compact];
    const prefixMatch=!out && compact.match(/^([^\p{L}\p{N}]+)(.+)$/u);
    if(!out && prefixMatch){const localized=dict[prefixMatch[2]];if(localized)out=prefixMatch[1]+localized;
      else if(english[prefixMatch[2]])out=prefixMatch[1]+english[prefixMatch[2]];}
    if(!out){
      const n=compact.match(/^(\d+)\s+luồng$/);
      if(n)out=n[1]+' '+({en:'workers',es:'tareas', 'pt-BR':'tarefas','zh-CN':'个并发',th:'งาน',lo:'ວຽກ',km:'ការងារ'}[language]||'workers');
    }
    if(!out){
      const n=compact.match(/^(\d+)\s*·\s*(.+)$/);
      if(n){const label=dict[n[2]]||english[n[2]];if(label)out=n[1]+' · '+label;}
    }
    if(!out){
      const n=compact.match(/^Tự động theo hệ thống\s*•\s*Hiện tại:\s*(Sáng|Tối)$/);
      if(n)out=(dict['Tự động theo hệ thống']||'Follow system')+' • '+(dict['Hiện tại']||'Current')+': '+(dict[n[1]]||n[1]);
    }
    if(!out){
      const n=compact.match(/^Đã thêm (\d+) kênh mới$/);
      if(n)out=(dict['Đã thêm']||'Added')+' '+n[1]+' '+(dict['kênh mới']||'new channels');
    }
    if(!out){
      const n=compact.match(/^(\d+)\s+kênh\s*•\s*(\d+)\s+nguồn$/);
      if(n)out=n[1]+' '+(dict['kênh']||'channels')+' • '+n[2]+' '+(dict['nguồn']||'sources');
    }
    if(!out){
      const n=compact.match(/^(\d+)\s*·\s*luồng song song$/);
      if(n)out=n[1]+' · '+({en:'parallel workers',es:'tareas paralelas','pt-BR':'tarefas paralelas','zh-CN':'个并行任务',th:'งานพร้อมกัน',lo:'ວຽກພ້ອມກັນ',km:'ការងារព្រមគ្នា'}[language]||'parallel workers');
    }
    if(!out){
      // Dynamic channel counts only, never change channel names supplied by playlist users.
      const n=compact.match(/^(\d+(?:\s*\/\s*\d+)?)\s+kênh$/);
      if(n)out=n[1]+' '+({en:'channels',es:'canales','pt-BR':'canais','zh-CN':'个频道',th:'ช่อง',lo:'ຊ່ອງ',km:'ប៉ុស្តិ៍'}[language]||'channels');
    }
    if(!out){
      const v=compact.match(/^Phiên bản hiện tại: (.+)$/);
      if(v)out=(dict['Phiên bản hiện tại']||'Current version')+': '+v[1];
    }
    if(!out)return raw;
    const leading=raw.match(/^\s*/)?.[0]||'',trailing=raw.match(/\s*$/)?.[0]||'';
    return leading+out+trailing;
  }
  function protectedNode(node){
    const parent=node.nodeType===3?node.parentElement:node;
    return !parent||!!parent.closest?.(skipSelector)||!!parent.closest?.('[data-i18n-ignore="true"]');
  }
  function translateNode(node){
    if(protectedNode(node))return;
    const value=node.nodeValue;
    if(typeof value!=='string'||!value.trim())return;
    let item=originalText.get(node);
    if(!item){item={source:value,last:value};originalText.set(node,item);}
    else if(value!==item.last && value!==item.source)item.source=value;
    const result=translate(item.source);
    item.last=result;
    if(value!==result)node.nodeValue=result;
  }
  function translateAttributes(el){
    if(protectedNode(el))return;
    let stored=originalAttrs.get(el);
    if(!stored){stored={};originalAttrs.set(el,stored);}
    for(const attr of attributeList){
      if(!el.hasAttribute(attr))continue;
      const value=el.getAttribute(attr);
      let item=stored[attr];
      if(!item){item={source:value,last:value};stored[attr]=item;}
      else if(value!==item.last && value!==item.source)item.source=value;
      const result=translate(item.source);
      item.last=result;
      if(value!==result)el.setAttribute(attr,result);
    }
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===3){translateNode(root);return;}
    if(root.nodeType!==1 && root.nodeType!==11)return;
    if(root.nodeType===1)translateAttributes(root);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.nodeType===3)translateNode(node);
      else translateAttributes(node);
    }
  }
  function apply(root=document.body){
    if(inApply)return;
    inApply=true;
    try{
      document.documentElement.lang=locale;
      walk(root);
      const control=document.getElementById('appLanguage');
      if(control&&control.value!==locale)control.value=locale;
    }finally{inApply=false;}
  }
  function setLanguage(code){
    if(!Object.hasOwn(locales,code))throw new Error('Unsupported language: '+code);
    locale=code;
    try{localStorage.setItem(key,locale);}catch{}
    apply();
    document.dispatchEvent(new CustomEvent('openiptv:languagechange',{detail:{locale}}));
  }
  // Translating newly-created modals, list/status labels and settings without interfering with app data.
  const observer=new MutationObserver(changes=>{
    if(inApply)return;
    for(const change of changes){
      if(change.type==='characterData')translateNode(change.target);
      else if(change.type==='attributes')translateAttributes(change.target);
      else for(const node of change.addedNodes)walk(node);
    }
  });
  observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributeList});
  window.OpenIPTVI18n=Object.freeze({locales,getLanguage:()=>locale,setLanguage,t:translate,apply});
  const setup=()=>{
    const control=document.getElementById('appLanguage');
    if(control){
      for(const [code,name] of Object.entries(locales)){
        if(!Array.from(control.options).some(option=>option.value===code)){
          const option=document.createElement('option'); option.value=code; option.textContent=name; control.appendChild(option);
        }
      }
      control.value=locale;control.addEventListener('change',e=>setLanguage(e.target.value));
    }
    apply();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();
