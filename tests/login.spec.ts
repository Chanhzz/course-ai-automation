import { test, expect } from '../src/fixtures/test-fixtures';
import { VALID_USER, INVALID_USERS, EMPTY_FIELD_CASES } from '../src/data/users';

test.describe('Login - Perfex CRM (Anh Tester Demo)', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open('admin');
  });

  test('TC01 - Hiển thị đầy đủ các thành phần trên form login @smoke', async ({ loginPage }) => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.rememberMeCheckbox).toBeAttached();
    await expect(loginPage.loginButton).toBeEnabled();
    await expect(loginPage.forgotPasswordLink).toBeVisible();
  });

  test('TC02 - Nhập được email/password vào form @smoke', async ({ loginPage }) => {
    await loginPage.fillCredentials(VALID_USER);

    await expect(loginPage.emailInput).toHaveValue(VALID_USER.email);
    await expect(loginPage.passwordInput).toHaveValue(VALID_USER.password);
  });

  test('TC03 - Login thành công với tài khoản hợp lệ @smoke @critical', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAndWaitForRedirect(VALID_USER);

    expect(await loginPage.isOnLoginPage()).toBeFalsy();
    await dashboardPage.expectLoaded();
  });

  test('TC04 - Login thành công có tick Remember me @critical', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAndWaitForRedirect(VALID_USER, { rememberMe: true });

    await dashboardPage.expectLoaded();
  });

  for (const data of INVALID_USERS) {
    test(`TC05 - Login thất bại: ${data.title} @negative`, async ({ loginPage }) => {
      await loginPage.login({ email: data.email, password: data.password });
      await loginPage.waitForSubmitSettled();

      expect(await loginPage.isOnLoginPage()).toBeTruthy();
      expect(await loginPage.isAuthenticated()).toBeFalsy();
    });
  }

  for (const data of EMPTY_FIELD_CASES) {
    test(`TC06 - Không đăng nhập được khi ${data.title} @negative`, async ({ loginPage }) => {
      await loginPage.login({ email: data.email, password: data.password });
      await loginPage.waitForSubmitSettled();

      expect(await loginPage.isOnLoginPage()).toBeTruthy();
      expect(await loginPage.isAuthenticated()).toBeFalsy();
    });
  }

  test('TC07 - Điều hướng sang trang Forgot Password', async ({ page, loginPage }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page).toHaveURL(/forgot_password|forgot/i);
  });

  test('TC08 - Chưa login mà vào /admin thì bị đá về trang login @negative', async ({ page, loginPage }) => {
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('TC09 - Logout sau khi login thành công @critical', async ({ loginPage, dashboardPage }) => {
    await loginPage.loginAndWaitForRedirect(VALID_USER);
    await dashboardPage.logout();

    expect(await loginPage.isAuthenticated()).toBeFalsy();
  });
});

test.describe('Login - Client portal (/authentication/login)', () => {
  test('TC10 - Form login của client portal hiển thị đầy đủ @smoke', async ({ loginPage }) => {
    await loginPage.open('client');

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
  });

  test('TC11 - Tài khoản admin không đăng nhập được vào client portal @negative', async ({ loginPage }) => {
    await loginPage.open('client');
    await loginPage.login(VALID_USER);
    await loginPage.waitForSubmitSettled();

    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });
});
