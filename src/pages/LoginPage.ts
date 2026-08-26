import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { Credentials } from '../data/users';

/**
 * Perfex CRM có 2 khu vực đăng nhập:
 *  - admin : /admin/authentication      -> dành cho staff (admin@example.com)
 *  - client: /authentication/login      -> portal khách hàng
 */
export type LoginArea = 'admin' | 'client';

export const LOGIN_PATHS: Record<LoginArea, string> = {
  admin: '/admin/authentication',
  client: '/authentication/login',
};

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly alertMessage: Locator;
  readonly languageSelect: Locator;

  private area: LoginArea = 'admin';

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.rememberMeCheckbox = page.locator('#remember');
    this.loginButton = page.locator('form button[type="submit"]');
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    this.languageSelect = page.locator('select[name="language"]');
    // Perfex hiển thị lỗi qua alert bootstrap hoặc toastr (tuỳ cấu hình site)
    this.alertMessage = page.locator('.alert-danger, #alerts .alert, .toast-message, label.error');
  }

  get path(): string {
    return LOGIN_PATHS[this.area];
  }

  async open(area: LoginArea = 'admin'): Promise<void> {
    this.area = area;
    await this.goto(this.path);
    await this.waitForVisible(this.emailInput);
    await this.waitForVisible(this.passwordInput);
  }

  async fillCredentials({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  /** Nhập thông tin và bấm Login. */
  async login(credentials: Credentials, options: { rememberMe?: boolean } = {}): Promise<void> {
    await this.fillCredentials(credentials);
    if (options.rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.submit();
  }

  /** Login và chờ điều hướng rời khỏi trang login (luồng thành công). */
  async loginAndWaitForRedirect(
    credentials: Credentials,
    options: { rememberMe?: boolean } = {},
  ): Promise<void> {
    const loginPath = this.path;
    await Promise.all([
      this.page.waitForURL((url) => !url.pathname.startsWith(loginPath), { timeout: 30_000 }),
      this.login(credentials, options),
    ]);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Chờ submit xử lý xong (luồng thất bại - URL không đổi). */
  async waitForSubmitSettled(timeout = 15_000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout }).catch(() => undefined);
  }

  async getErrorMessage(): Promise<string | null> {
    const alert = this.alertMessage.first();
    if (await alert.isVisible().catch(() => false)) {
      return (await alert.innerText()).trim();
    }
    return null;
  }

  async isOnLoginPage(): Promise<boolean> {
    const url = new URL(this.page.url());
    return url.pathname.startsWith(this.path);
  }

  /** Kiểm tra thực sự đã đăng nhập: gọi /admin và xem có bị đá về login không. */
  async isAuthenticated(): Promise<boolean> {
    const response = await this.page.request
      .get('/admin', { maxRedirects: 0, failOnStatusCode: false })
      .catch(() => null);
    if (!response) return false;
    const location = response.headers()['location'] ?? '';
    return response.status() === 200 || (location !== '' && !location.includes('authentication'));
  }

  async selectLanguage(language: string): Promise<void> {
    await this.languageSelect.selectOption(language);
  }

  /** Kiểm tra validate phía client (nếu field có ràng buộc HTML5). */
  async isFieldInvalid(locator: Locator): Promise<boolean> {
    return locator.evaluate((el) => !(el as HTMLInputElement).checkValidity());
  }

  async expectStillOnLoginPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path));
  }
}
