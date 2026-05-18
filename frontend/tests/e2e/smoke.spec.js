import { test, expect } from '@playwright/test';

test.describe('ticoin smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (!localStorage.getItem('ticoin.theme')) localStorage.setItem('ticoin.theme', 'light');
      if (!localStorage.getItem('ticoin.lang')) localStorage.setItem('ticoin.lang', 'ko');
    });
  });

  test('home page loads trading shell', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'ticoin' })).toBeVisible();
    await expect(page.getByText('업비트 기반 실시간 투자 대시보드')).toBeVisible();
    await expect(page.getByText('커뮤니티 피드')).toBeVisible();
  });

  test('settings page shows theme and language controls', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.locator('main h1', { hasText: '설정' })).toBeVisible();
    await expect(page.getByRole('button', { name: /라이트/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /다크/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /English/ })).toBeVisible();
  });

  test('theme toggle persists', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /다크/ }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('language toggle switches to English', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: /English/ }).click();
    await expect(page.locator('main h1', { hasText: 'Settings' })).toBeVisible();
    await expect(page.getByText('Manage theme, language, alerts, and account preferences.')).toBeVisible();
  });

  test('login page shows provider buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('ticoin')).toBeVisible();
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/Kakao/)).toBeVisible();
  });
});
