# Đăng nhập Open IPTV Pro Web bằng OTP email (đa trình duyệt)

Mã nguồn web đã hỗ trợ `supabase.auth.signInWithOtp` và `supabase.auth.verifyOtp({email,token,type:'email'})`. **Phải bật mẫu email có mã số trong Supabase**: nếu mẫu đang chứa chỉ `{{ .ConfirmationURL }}`, Supabase vẫn gửi nút Sign in thay cho mã OTP.

## Cấu hình mẫu email trên Supabase (bắt buộc)

1. Mở [Authentication → Email Templates](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/templates).
2. Chọn **Magic Link / OTP** (không phải Reset Password hoặc Reauthentication).
3. Đặt tiêu đề: **Mã đăng nhập Open IPTV Pro**.
4. Đặt nội dung HTML:

```html
<h2>Mã đăng nhập Open IPTV Pro</h2>
<p>Mã xác thực của bạn:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>Nhập mã này trong mục Tài khoản &amp; Đồng bộ đám mây của Open IPTV Pro.</p>
<p>Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email. Không chia sẻ mã với bất kỳ ai.</p>
```

5. Lưu thay đổi. Ở **Authentication → Providers → Email**, xác nhận email OTP đang được bật và có hạn sử dụng phù hợp. Cấu hình SMTP riêng nếu cần gửi email ra ngoài nhóm thành viên dự án hoặc dùng trong môi trường thực tế.

Lưu ý: mẫu `Magic Link / OTP` quyết định nội dung email. Thêm trường nhập OTP vào web **không đủ** để Supabase gửi mã số.

## Thử nghiệm trên Safari và trình duyệt khác

1. Mở trang [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/), vào **Thêm → Tài khoản & Đồng bộ đám mây**.
2. Nhập email, bấm **Gửi mã OTP qua email**.
3. Mở Gmail trên Safari, Chrome hoặc máy khác. Lấy mã gồm 6–8 chữ số từ email mới nhất.
4. Nhập mã ở Bước 2 của **đúng phiên Open IPTV Pro muốn đăng nhập**, bấm **Xác nhận & đăng nhập**.
5. Xác nhận giao diện chuyển sang **Đã đăng nhập**; kiểm tra việc tải và đồng bộ dữ liệu trên trình duyệt mới.

OTP dùng một lần và không cần dùng chung cookie, phiên PKCE hoặc trình duyệt Gmail. Đừng đặt mã OTP, URL đăng nhập, hoặc refresh token vào playlist hay báo lỗi công khai. Khi yêu cầu email liên tục, ứng dụng tôn trọng giới hạn gửi của Supabase.

## Phương án dự phòng

Web vẫn hỗ trợ nhập Magic Link cũ qua nút **Dùng liên kết đăng nhập (dự phòng)** nếu email chưa đổi sang mã OTP. Chỉ sử dụng liên kết chưa từng mở; liên kết đã dùng hoặc hết hạn không thể xác minh lại.

## Kiểm thử

Chạy `node --test tests/web-email-otp-login.test.cjs`. Bài test xác nhận định dạng, mã bắt đầu bằng số 0, nhập mã từ Gmail, gọi `verifyOtp`, và giữ đường dẫn Magic Link dự phòng.

**Trạng thái triển khai:** mã nguồn web riêng và email template Supabase là hai cấu hình độc lập. Cần xác nhận cả hai trước khi tuyên bố email OTP hoạt động từ đầu đến cuối.

## Dự án mới (20/11/2026)

- Project: `Open IPTV Pro`, ref `zjbsvqryaxtafuffpifu`, region Singapore.
- Giao diện Web dùng publishable key (không lưu service-role/secret key trong GitHub).
- Bảng `public.openiptv_user_state` đã khởi tạo với chính sách RLS tách biệt từng tài khoản.
- Dự án mới không tự có tài khoản người dùng hoặc dữ liệu của dự án cũ.
- Khi phát hiện dữ liệu tài khoản cũ trong trình duyệt, Web lưu bản sao cục bộ trước khi đổi phiên, rồi cho người dùng đang đăng nhập xác nhận thủ công khi muốn khôi phục. Không tự chuyển dữ liệu giữa hai tài khoản.

**Chưa tự động cấu hình trên Dashboard:** mẫu thư OTP `{{ .Token }}`, các URL chuyển hướng và GitHub OAuth Client ID/Secret. Cần thiết lập bằng chủ dự án trong Supabase Authentication; kết nối GitHub repo không tự bật đăng nhập OAuth. Khi chưa có các cấu hình này, ứng dụng không nên tuyên bố GitHub/OTP đã kiểm thử thành công từ đầu đến cuối.

Cấu hình URL: [Authentication → URL Configuration](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/url-configuration): site URL `https://trisanghy.github.io/open-iptv-pro/` và redirect URL `https://trisanghy.github.io/open-iptv-pro/**`.
GitHub: [Authentication → Providers](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/providers); callback trên GitHub OAuth App: `https://zjbsvqryaxtafuffpifu.supabase.co/auth/v1/callback`.
