# Đăng nhập Open IPTV Pro Web bằng OTP email (đa trình duyệt)

## Chỉnh số chữ số OTP do máy chủ gửi (không phải email template)

Nếu email thực tế hiển thị **8 chữ số** dù giao diện nói 6, đó là cấu hình `Email OTP length` của **Supabase Auth**, không phải lỗi biến `{{ .Token }}`. Không cắt hai chữ số đầu/cuối của OTP; hãy nhập đầy đủ mã hiện tại.

Để chuyển về **6 chữ số** cho email gửi mới: mở [Authentication → Sign In / Providers](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/providers), mở **Email** trong danh sách Auth Providers, tìm **Email OTP length**, đổi thành **6** rồi **Save**. Supabase hỗ trợ độ dài email OTP 6–10 chữ số; ít chữ số hơn có độ khó đoán thấp hơn. Mẫu email chỉ cần `{{ .Token }}`, không ghi cứng “6-digit code”. Sau khi lưu, yêu cầu **email OTP mới** để xác nhận mã thực tế đúng 6 chữ số.

Trang Open IPTV Pro chấp nhận mã 6–10 số do Supabase phát hành và không cắt mã khi người dùng dán; độ dài do máy chủ quyết định. Không thay đổi độ dài OTP bằng việc chỉ sửa giao diện hoặc cắt mã trong email.

Mã nguồn web đã hỗ trợ `supabase.auth.signInWithOtp` và `supabase.auth.verifyOtp({email,token,type:'email'})`. **Phải bật mẫu email có mã số trong Supabase**: nếu mẫu đang chứa chỉ `{{ .ConfirmationURL }}`, Supabase vẫn gửi nút Sign in thay cho mã OTP.

## Sửa trường hợp email chỉ có "Confirm your email address" (đăng ký lần đầu)

**Dấu hiệu:** email có tiêu đề **Confirm your email address**, liên kết chứa `type=signup` và chuyển về `http://localhost:3000`. Đây là email **Confirm sign up**, không phải email **Magic Link / OTP**. Không có mã 6 số vì mẫu thư đang dùng `{{ .ConfirmationURL }}` thay vì `{{ .Token }}`. Việc đổi mẫu Magic Link *một mình* không sửa email đăng ký đầu tiên.

### Bước 1 — Sửa cả hai mẫu thư

Mở [Supabase Authentication → Email Templates](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/templates). Lần lượt cấu hình:

- **Confirm sign up** (quan trọng cho tài khoản mới, như email trong ảnh).
- **Magic Link / OTP** (quan trọng cho tài khoản đã có).

Với mỗi mẫu, có thể đặt tiêu đề tương ứng "Xác nhận đăng ký Open IPTV Pro" hoặc "Mã đăng nhập Open IPTV Pro". Nội dung HTML có thể dùng giống nhau:

```html
<h2>Mã xác thực Open IPTV Pro</h2>
<p>Nhập mã dưới đây vào mục Tài khoản &amp; Đồng bộ đám mây:</p>
<p style="font-size:32px;font-weight:700;letter-spacing:6px">{{ .Token }}</p>
<p>Mã chỉ dùng một lần, sẽ hết hạn. Không chia sẻ mã với bất kỳ ai.</p>
<p>Nếu bạn không yêu cầu đăng nhập, hãy bỏ qua email.</p>
```

Supabase thay `{{ .Token }}` bằng mã dùng một lần; không điền mã giả, không thay bằng `{{ .ConfirmationURL }}`. Nếu bạn muốn giữ nút liên kết dự phòng, có thể cung cấp **cả** mã và nút, nhưng đừng để chỉ còn liên kết khi trang web đang yêu cầu OTP.

### Bước 2 — Sửa URL trả về localhost

Mở [Authentication → URL Configuration](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/url-configuration).

- **Site URL**: `https://trisanghy.github.io/open-iptv-pro/`.
- **Redirect URLs**: thêm `https://trisanghy.github.io/open-iptv-pro/**` (có thể thêm địa chỉ chính xác `https://trisanghy.github.io/open-iptv-pro/`).

Không để `http://localhost:3000` làm Site URL của dự án production. Điều chỉnh URL chỉ ảnh hưởng **email mới**; các liên kết đã phát hành không tự đổi.

### Bước 3 — Xác nhận từ đầu đến cuối

1. Lưu **cả hai** mẫu và URL Configuration.
2. Mở trang Web ở tab/thiết bị bạn muốn đăng nhập, nhập email và yêu cầu **email mới** (không tái sử dụng liên kết đã gửi trong chat).
3. Xác nhận thư mới có mã số, sau đó nhập tại Bước 2 trên Web; Gmail có thể ở trình duyệt khác.
4. Xác nhận tài khoản đã đăng nhập và dữ liệu được đồng bộ. Nếu email vẫn là liên kết, kiểm tra bạn đã sửa đúng **Confirm sign up** cho lần đầu.

**Quyền công cụ:** Supabase connector dùng ở đây có thể quản lý cơ sở dữ liệu, Edge Functions và dự án, nhưng không có hành động chỉnh trực tiếp **Authentication → Email Templates** hoặc **URL Configuration**. Cấu hình dashboard phải được chủ dự án lưu. Không thể sửa hai mục này chỉ bằng commit frontend.

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

**Chưa tự động cấu hình trên Dashboard:** **cả hai** mẫu thư OTP (Confirm sign up và Magic Link / OTP), các URL chuyển hướng và GitHub OAuth Client ID/Secret. Cần thiết lập bằng chủ dự án trong Supabase Authentication; kết nối GitHub repo không tự bật đăng nhập OAuth. Khi chưa có các cấu hình này, ứng dụng không nên tuyên bố GitHub/OTP đã kiểm thử thành công từ đầu đến cuối.

Cấu hình URL: [Authentication → URL Configuration](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/url-configuration): site URL `https://trisanghy.github.io/open-iptv-pro/` và redirect URL `https://trisanghy.github.io/open-iptv-pro/**`.
GitHub: [Authentication → Providers](https://supabase.com/dashboard/project/zjbsvqryaxtafuffpifu/auth/providers); callback trên GitHub OAuth App: `https://zjbsvqryaxtafuffpifu.supabase.co/auth/v1/callback`.
