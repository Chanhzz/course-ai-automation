import { Page, Locator, expect } from '@playwright/test';

/** Lớp cha cho mọi Page Object: gom các hành vi dùng chung. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  async currentUrl(): Promise<string> {
    return this.page.url();
  }

  async title(): Promise<string> {
    return this.page.title();
  }

  async waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async screenshot(name: string): Promise<Buffer> {
    return this.page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true });
  }
}
