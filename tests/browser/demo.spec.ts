import { test, expect } from '@playwright/test';

async function demoClue(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Find a source that knows' }).click();
  await page.getByRole('button', { name: 'Load official demo clue' }).click();
  await page.getByRole('button', { name: 'I’ve got a clue!' }).click();
}

test('child teaches through two sequential mysteries, with persistence and reset', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'My brain needs a human like you.' })).toBeVisible();
  await page.screenshot({ path: '/tmp/clumsy-new-desktop.png', fullPage: true });
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Presenter mode' }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Space A view from the Moon' }).click();
  await page.getByRole('button',{name:'Skip this challenge for now'}).click();
  await expect(page.locator('.learning-companion .robot-character')).toHaveAttribute('data-core','unsure');
  await expect(page.getByText('? NOT VERIFIED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'I’m not sure', exact: true }).click();
  await page.getByRole('button', { name: 'Let’s find out' }).click();
  await expect(page.locator('.learning-companion .robot-character')).toHaveAttribute('data-core','think');
  await page.getByRole('button', { name: 'Count the likes' }).click();
  await expect(page.getByRole('status')).toContainText('don’t show whether it’s true');
  await demoClue(page);
  await expect(page.locator('.learning-companion .robot-character')).toHaveAttribute('data-core','listen');
  await page.getByRole('button', { name: 'False', exact: true }).click();
  await page.getByLabel('What did your clue show you?').fill('NASA explains the Great Wall cannot be seen from the Moon. Lots of likes do not prove a claim true; we need evidence.');
  await page.getByRole('button', { name: 'Teach Lumo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Great Wall cannot be seen from the Moon with the unaided eye.' })).toBeVisible();
  await expect(page.locator('.learning-companion .robot-character')).toHaveAttribute('data-core','learn');
  await page.reload();
  await page.getByRole('button', { name: 'Open notebook' }).click();
  await expect(page.getByText('Popularity is not proof. Check evidence.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close notebook' }).click();
  await page.getByRole('button', { name: 'Try my new brain' }).click();
  await expect(page.getByText('Wait! You taught me', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Sounds false', exact: true }).click();
  await page.getByRole('button', { name: 'Let’s find out' }).click();
  // Presenter mode is intentionally session-only; turn it on again after reload.
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Presenter mode' }).click();
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await demoClue(page);
  await page.getByRole('button', { name: 'Use a demonstration explanation' }).click();
  await expect(page.getByRole('heading', { name: 'Lightning can strike the same place more than once.' })).toBeVisible();
  await page.getByRole('button', { name: 'See our adventure' }).click();
  await page.getByRole('button',{name:'Skip this challenge for now'}).click();
  await expect(page.getByRole('heading', { name: 'You made my brain a little brighter.' })).toBeVisible();
  await expect(page.locator('.learning-companion .robot-character')).toHaveAttribute('data-core','celebrate');
  await page.getByRole('button', { name: 'Start fresh' }).click();
  await expect(page.getByRole('heading', { name: 'My brain needs a human like you.' })).toBeVisible();
});

test('mobile themes and custom exploration stay separate from verified missions', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: '/tmp/clumsy-new-mobile.png', fullPage: true });
  await page.getByLabel('Suggest a theme').fill('Dinosaurs');
  await page.getByRole('button', { name: 'Explore my theme' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('NOT VERIFIED');
  await page.getByRole('button', { name: 'Close explorer' }).click();
  await page.getByLabel('Suggest a theme').fill('Thunderstorms');
  await page.getByRole('button', { name: 'Explore my theme' }).click();
  await page.getByRole('button',{name:'Skip this challenge for now'}).click();
  await expect(page.getByRole('heading', { name: 'Lightning never strikes the same place twice.' })).toBeVisible();
});

test('live clue search, reading, and image validation', async ({ page, request }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Space A view from the Moon' }).click();
  await page.getByRole('button',{name:'Skip this challenge for now'}).click();
  await page.getByRole('button', { name: 'Sounds true' }).click();
  await page.getByRole('button', { name: 'Let’s find out' }).click();
  await page.getByRole('button', { name: 'Find a source that knows' }).click();
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.locator('.clue-card').first()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Read this clue' }).first().click();
  await expect(page.locator('.reading')).not.toContainText('Opening our clue…', { timeout: 15000 });
  await page.getByRole('button', { name: 'I’ve got a clue!' }).click();
  await expect(page.getByLabel('What did your clue show you?')).toBeVisible();
  const invalid = await request.post('/api/vision', { data: { image: 'not-an-image' } });
  expect(invalid.status()).toBe(400);
});
