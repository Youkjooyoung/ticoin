import { test, expect } from '@playwright/test';

test.describe('ticoin smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('ticoin.theme', 'light');
      localStorage.setItem('ticoin.lang', 'ko');
    });
  });

  test('home page loads with feed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'ticoin' })).toBeVisible();
    await expect(page.getByText('내 자산을 한번에')).toBeVisible();
  });

  test('settings page shows theme + language toggles', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: '설정' })).toBeVisible();
    await expect(page.getByRole('button', { name: /라이트/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /다크/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /한국어/ })).toBeVisible();
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
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await expect(page.getByText('All your assets in one place')).toBeVisible();
  });

  test('profile page renders stats grid and news section', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText('팔로워')).toBeVisible();
    await expect(page.getByText('최신 크립토 뉴스')).toBeVisible();
  });

  test('login page shows provider buttons', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('ticoin')).toBeVisible();
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/Kakao/)).toBeVisible();
  });
});
