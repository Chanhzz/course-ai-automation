import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  readonly sidebar: Locator;
  readonly logoutLink: Locator;
  readonly dashboardHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.sidebar = page.locator('#side-menu');
    this.logoutLink = page.locator('a[href*="authentication/logout"]');
    this.dashboardHeader = page.locator('#top-search, header, .navbar').first();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/admin\/?/);
    await expect(this.sidebar).toBeVisible({ timeout: 20_000 });
    await expect(this.page).toHaveTitle(/dashboard/i);
  }

  async logout(): Promise<void> {
    await this.page.goto('/admin/authentication/logout', { waitUntil: 'domcontentloaded' });
  }
}
