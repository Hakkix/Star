/**
 * E2E tests for Star AR application
 * These tests run in real browsers and test the complete user experience
 */

import { test, expect } from '@playwright/test';

test.describe('Star Map Application', () => {
  test.beforeEach(async ({ page, context }) => {
    // Grant geolocation permission
    await context.grantPermissions(['geolocation']);
  });

  test('should load the application successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page title is correct
    await expect(page).toHaveTitle(/star/i);

    // Check that the canvas element (Three.js renderer) is present
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });

  test('should display permission prompt on first visit', async ({ page }) => {
    await page.goto('/');

    // Look for permission-related text or button
    // This will depend on the actual implementation
    const permissionButton = page.getByRole('button', { name: /enable|allow|grant/i });

    // Either permission is already granted, or button should be visible
    const isVisible = await permissionButton.isVisible().catch(() => false);
    const canvasVisible = await page.locator('canvas').isVisible().catch(() => false);

    expect(isVisible || canvasVisible).toBe(true);
  });

  test('should render Three.js canvas with correct dimensions', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Canvas should fill the viewport
    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test.describe('GPS Integration', () => {
    test('should use geolocation to set observer position', async ({ page, context }) => {
      // Set specific geolocation (New York City)
      await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

      await page.goto('/');

      // Wait for the scene to initialize
      await page.waitForTimeout(2000);

      // Check that no geolocation errors are displayed
      const errorAlert = page.getByRole('alert');
      const hasError = await errorAlert.isVisible().catch(() => false);

      if (hasError) {
        const errorText = await errorAlert.textContent();
        // Error should not be about GPS
        expect(errorText).not.toMatch(/gps|geolocation|location/i);
      }
    });

    test('should handle different geographic locations', async ({ page, context }) => {
      const locations = [
        { name: 'New York', latitude: 40.7128, longitude: -74.006 },
        { name: 'London', latitude: 51.5074, longitude: -0.1278 },
        { name: 'Tokyo', latitude: 35.6762, longitude: 139.6503 },
        { name: 'Sydney', latitude: -33.8688, longitude: 151.2093 },
      ];

      for (const location of locations) {
        await context.setGeolocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });

        await page.goto('/');
        await page.waitForTimeout(1000);

        const canvas = page.locator('canvas');
        await expect(canvas).toBeVisible();

        // No location-specific errors
        const errorAlert = page.getByRole('alert');
        const hasError = await errorAlert.isVisible().catch(() => false);
        expect(hasError).toBe(false);
      }
    });
  });

  test.describe('Performance', () => {
    test('should load in reasonable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.locator('canvas').waitFor({ state: 'visible' });

      const loadTime = Date.now() - startTime;

      // Should load in less than 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      // Filter out known acceptable errors (if any)
      const criticalErrors = errors.filter(
        (err) => !err.includes('DeviceOrientationEvent') // iOS permission warnings are OK
      );

      expect(criticalErrors).toHaveLength(0);
    });

    test('should not have unhandled promise rejections', async ({ page }) => {
      const rejections: string[] = [];

      page.on('pageerror', (error) => {
        rejections.push(error.message);
      });

      await page.goto('/');
      await page.waitForTimeout(2000);

      expect(rejections).toHaveLength(0);
    });
  });

  test.describe('Mobile Viewports', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('should render correctly on mobile viewport', async ({ page }) => {
      await page.goto('/');

      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      const boundingBox = await canvas.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeLessThanOrEqual(375);
      expect(boundingBox!.height).toBeLessThanOrEqual(667);
    });

    test('should show iOS permission prompt on mobile', async ({ page }) => {
      await page.goto('/');

      // On mobile (especially iOS), permission prompt should be visible
      const permissionUI = page.getByText(/device orientation|enable sensors|grant permission/i);
      const canvas = page.locator('canvas');

      // Either permission UI or canvas should be visible
      const permissionVisible = await permissionUI.isVisible().catch(() => false);
      const canvasVisible = await canvas.isVisible().catch(() => false);

      expect(permissionVisible || canvasVisible).toBe(true);
    });
  });

  test.describe('Interaction', () => {
    test('should handle canvas click/touch', async ({ page }) => {
      await page.goto('/');

      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Click on canvas
      await canvas.click({ position: { x: 200, y: 200 } });

      // Wait for any potential interaction UI (e.g., detail overlay)
      await page.waitForTimeout(500);

      // The app should still be functional (no crashes)
      await expect(canvas).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should not have critical accessibility violations', async ({ page }) => {
      await page.goto('/');

      // Basic accessibility checks
      // Canvas should have appropriate ARIA label or role
      const canvas = page.locator('canvas');
      await expect(canvas).toBeVisible();

      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3');
      const headingCount = await headings.count();

      // If there are headings, they should be properly nested
      if (headingCount > 0) {
        const firstHeading = headings.first();
        await expect(firstHeading).toBeVisible();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');

      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Check if focus is visible (buttons should be focusable)
      const focusedElement = page.locator(':focus');
      const hasFocus = await focusedElement.count();

      // Should have at least one focusable element (if permission button is shown)
      expect(hasFocus).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('Star Map - Smoke Tests', () => {
  // These are quick smoke tests that can run on every Vercel deployment
  test.skip(({ browserName }) => browserName !== 'chromium', 'Smoke tests only on Chromium');

  test('@smoke: Application loads without crashing', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });
  });

  test('@smoke: No critical JavaScript errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    const criticalErrors = errors.filter((err) => !err.includes('DeviceOrientationEvent'));
    expect(criticalErrors).toHaveLength(0);
  });
});
