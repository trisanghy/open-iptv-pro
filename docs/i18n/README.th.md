# Open IPTV Pro — คู่มือภาษาไทย

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · **ไทย** · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile Beta (Android/iOS):** รุ่น Capacitor พัฒนาแยกจาก Electron และ Rust Lab จึงไม่มีฟีเจอร์เหมือนกันทั้งหมด APK Android ลงลายเซ็นแบบ debug เพื่อทดสอบ ส่วน IPA ของ iOS ยังไม่ลงลายเซ็น ต้องมีใบรับรองและ provisioning ของ Apple ที่ถูกต้องก่อนติดตั้ง

## ภาพรวม

Open IPTV Pro เป็นเครื่องเล่น IPTV และตัวจัดการรายการ M3U แบบโอเพนซอร์สสำหรับเว็บ Windows และ macOS ซึ่งพัฒนาเป็นโครงการส่วนบุคคล ผู้ใช้ต้องจัดหาแหล่ง M3U/EPG ที่มีสิทธิ์ใช้งานเอง แอปไม่มีช่องหรือแพ็กเกจทีวีให้

Open IPTV Pro มีรุ่นแยกสำหรับ Web, Windows/macOS และ Android/iOS โดยไม่มีช่องทีวีหรือแพ็กเกจสมัครสมาชิกให้

## รุ่นและแพลตฟอร์ม

Electron Desktop เป็นรุ่นเสถียรที่มีฟีเจอร์มากกว่า Rust Lab เป็นรุ่นเบต้า Tauri/Rust แยกต่างหาก ส่วน Web Online เปิดใช้ผ่านเบราว์เซอร์โดยไม่ต้องติดตั้ง แต่มีข้อจำกัดด้าน CORS โคเดก DRM และการเล่นอัตโนมัติ

- **Web Online — เบราว์เซอร์:** [เปิดเครื่องเล่น](https://trisanghy.github.io/open-iptv-pro/) ไม่ต้องติดตั้ง แต่มีข้อจำกัด CORS โคเดกและ DRM
- **Electron Desktop — Windows/macOS:** [ตัวติดตั้งอย่างเป็นทางการ](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- **Rust Lab Beta — Windows/macOS:** [รุ่นแยกต่างหาก](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab)
- **Mobile Capacitor Beta — Android/iOS:** [APK debug / IPA ไม่ได้ลงลายเซ็น](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10), [ซอร์สโค้ด](../../mobile/) และ[คู่มือติดตั้ง](../MOBILE_ANDROID_IOS.md)

## ฟีเจอร์หลัก

- นำเข้าไฟล์ M3U หรือ URL ที่ได้รับอนุญาต จัดกลุ่ม ค้นหาและบันทึกรายการโปรด
- รวมช่องที่ซ้ำกันและเก็บลิงก์สำรองที่แตกต่างกันจริง
- ดูผังรายการ EPG เมื่อข้อมูล XMLTV ตรงกับช่อง
- ปรับเสียง เต็มจอและ PiP; AirPlay/Cast ขึ้นกับอุปกรณ์ที่รองรับ
- เดสก์ท็อปบางรุ่นมีบันทึกวิดีโอ ย้อนเวลา คำบรรยาย แปลภาษา และ TTS
- บันทึกการตั้งค่าในเครื่อง สำรองข้อมูล และซิงค์บนเว็บเมื่อกำหนดค่าคลาวด์

## เริ่มต้นใช้งาน

1. เปิดเครื่องเล่นเว็บหรือดาวน์โหลดตัวติดตั้งที่ตรงกับระบบและ CPU
2. อ่านคำเตือนเรื่องสิทธิ์และเพิ่ม M3U ที่คุณมีสิทธิ์ใช้งาน
3. เลือกช่องจากกลุ่ม ค้นหา รายการโปรด หรือประวัติ
4. ตั้งค่า EPG ธีม และลิงก์สำรองตามต้องการ
5. สำรองข้อมูลก่อนอัปเดตหรือเปลี่ยนอุปกรณ์

## ดาวน์โหลด

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in ไทย](https://trisanghy.github.io/?lang=th)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## ภาพหน้าจอ

แกลเลอรีมีภาพเว็บล่าสุด 12 ภาพ: เดสก์ท็อปและ iOS/Android แบบจำลอง พร้อมวิดีโอเดโมที่สร้างในเครื่อง

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## ความเข้ากันได้และปัญหา

การเล่นอาจล้มเหลวจาก CORS การยืนยันตัวตน HTTPS DRM โคเดก หรือข้อกำหนดเซิร์ฟเวอร์ ข้อผิดพลาดบนเว็บไม่ได้หมายความว่าสตรีมเสียเสมอไป ภาพ iOS/Android เป็นการจำลองอุปกรณ์ในเบราว์เซอร์

## รันจากซอร์ส

หากเรียกใช้ Electron จากซอร์สต้องใช้ Node.js 22+ และคำสั่ง `npm install --no-audit --no-fund`, `npm test`, `npm start` ดูรายละเอียดใน README ฉบับเวียดนาม

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## สิทธิ์และข้อจำกัดความรับผิด

ผู้พัฒนาจัดหาเฉพาะเครื่องมือ ไม่ได้จัดหาช่อง เนื้อหา แพ็กเกจ หรือสิทธิ์การรับชม ผู้ใช้รับผิดชอบการตรวจสอบสิทธิ์ของแหล่งข้อมูลและดูแลบัญชี การบันทึก และการสำรองข้อมูล ซอฟต์แวร์ให้ใช้งานตามสภาพภายใต้กฎหมายที่เกี่ยวข้อง

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## ความช่วยเหลือและซอร์สโค้ด

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=th)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
