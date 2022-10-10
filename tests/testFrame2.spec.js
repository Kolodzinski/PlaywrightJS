import * as testData from '../testData/testData.json';
import * as config from '../config.json'

const margin = config.CSS.margin
// @ts-check
const { test, expect } = require('@playwright/test');

test.describe("Tests scenario 2", () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto(config.Url2);
  });

  test('Share button shows up', async ({ page }) => {
    const smartframe = page.locator('smart-frame');
    const mainWrapper = smartframe.locator('.main');

    await expect(mainWrapper).not.toHaveClass(/active/);
    const opacity1 = await mainWrapper.evaluate((e) => {
      return window.getComputedStyle(e).getPropertyValue("opacity")
    })
    expect(opacity1).toEqual("0");
    await smartframe.hover();
    await page.waitForTimeout(500);
    await expect(mainWrapper).toHaveClass(/active/);
    const opacity2 = await mainWrapper.evaluate((e) => {
      return window.getComputedStyle(e).getPropertyValue("opacity")
    })
    expect(opacity2).toEqual("1");
  });

  test('Share button location', async ({ page }) => {
    const smartframe = page.locator('smart-frame');
    const mainWrapper = smartframe.locator('.main');
    const shareButton = smartframe.locator('a[data-title="Share"]')
    const fullScreenButton = smartframe.locator('a[title="Fullscreen"]')

    const mainWrapperBoundingBox = await mainWrapper.boundingBox();
    const shareButtonBoundingBox = await shareButton.boundingBox();
    const fullScreenButtonBoundingBox = await fullScreenButton.boundingBox();

    // for the button to be on top the button Y should be same or little bigger the main box Y
    const Ycalclation = mainWrapperBoundingBox.y - shareButtonBoundingBox.y
    expect(Ycalclation).toBeLessThanOrEqual(10)
    //for the button to be on the right the button X should": main x + main width - button width - button x - full screen button width
    const Xcalculation = mainWrapperBoundingBox.x + mainWrapperBoundingBox.width - shareButtonBoundingBox.width - shareButtonBoundingBox.x - fullScreenButtonBoundingBox.width
    expect(Xcalculation).toBeLessThanOrEqual(2 * margin)

    const [popup] = await Promise.all([
      // It is important to call waitForEvent before click to set up waiting.
      page.waitForEvent('popup'),
      // Opens popup.
      await smartframe.hover(),
      page.locator('span', { hasText: 'SE' }).click(),
    ]);
    expect(popup.url()).toContain(testData.urls.smartFrameUrl);

  });
});