# course-ai-automation

Automation framework **Playwright + TypeScript** cho chức năng Login của url3
(https://crm.anhtester.com).

## Lưu ý quan trọng về URL login

Site có **2 khu vực đăng nhập**:

| Khu vực | Đường dẫn | Tài khoản |
|---|---|---|
| Admin / Staff | `/admin/authentication` | `admin@example.com` / `123456` ✅ |
| Client portal | `/authentication/login` | tài khoản khách hàng (admin **không** login được ở đây) |

Tài khoản `admin@example.com/123456` chỉ đăng nhập được ở `/admin/authentication`.
Ở `/authentication/login` server trả 303 quay lại chính trang login (không có message lỗi).
Framework hỗ trợ cả hai: `loginPage.open('admin')` hoặc `loginPage.open('client')`.

## Cấu trúc

```
├── playwright.config.ts        # config: baseURL, reporter, trace/video/screenshot, 3 browsers
├── .env / .env.example         # BASE_URL, APP_USERNAME, APP_PASSWORD, HEADLESS
├── src
│   ├── data/users.ts           # test data: valid / invalid / empty-field
│   ├── fixtures/test-fixtures.ts  # custom fixture inject Page Object
│   ├── pages
│   │   ├── BasePage.ts         # hành vi dùng chung (goto, wait, screenshot)
│   │   ├── LoginPage.ts        # Page Object trang login (admin + client)
│   │   └── DashboardPage.ts    # Page Object dashboard sau khi login
│   └── utils/logger.ts
└── tests/login.spec.ts         # 11 test case login (15 test sau khi data-driven)
```

## Cài đặt

```bash
npm install
npx playwright install --with-deps
```

Copy `.env.example` sang `.env` rồi chỉnh credentials nếu cần.

## Chạy test

```bash
npm test
```

```bash
npm run test:login
```

```bash
npm run test:headed
```

```bash
npm run test:ui
```

```bash
npm run report
```

Chạy theo tag:

```bash
npx playwright test --grep @smoke
```

## Bộ test case

| ID | Nội dung |
|---|---|
| TC01 | Hiển thị đầy đủ thành phần form login |
| TC02 | Nhập được email/password |
| TC03 | Login thành công với tài khoản hợp lệ → vào Dashboard |
| TC04 | Login thành công có tick Remember me |
| TC05 | Login thất bại: sai password / sai email / sai cả hai (data-driven) |
| TC06 | Không đăng nhập được khi bỏ trống email / password / cả hai (data-driven) |
| TC07 | Điều hướng sang trang Forgot Password |
| TC08 | Chưa login vào `/admin` bị đá về trang login |
| TC09 | Logout sau khi login thành công |
| TC10 | Form login client portal hiển thị đầy đủ |
| TC11 | Tài khoản admin không login được vào client portal |

## Đặc điểm framework

- **Page Object Model** + `BasePage` kế thừa chung.
- **Custom fixtures**: test nhận thẳng `loginPage`, `dashboardPage`, không cần `new` thủ công.
- **Data-driven**: test data tách riêng trong `src/data/users.ts`, sinh test bằng vòng lặp.
- **Xác thực thật**: `isAuthenticated()` gọi `/admin` với `maxRedirects: 0` để kiểm tra session
  thay vì chỉ dựa vào text trên UI (site demo không hiển thị message lỗi khi login sai).
- **Reporter**: list + HTML + JUnit XML (sẵn sàng cắm CI).
- **Debug artifacts**: screenshot / video / trace tự lưu khi test fail.
- **Chỉ chạy trên Chrome** (project `chromium` - Desktop Chrome).
