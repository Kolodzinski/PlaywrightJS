import * as testData from '../testData/testData.json';
import * as config from '../config.json'

const padding = config.CSS.padding
const margin = config.CSS.margin
// @ts-check
const { test, expect } = require('@playwright/test');
test.describe("Tests scenarios", () => {

  test('Test Scenario 1', async ({ page }) => {
    await page.goto(config.Url1);
    const smartframe = page.frameLocator('iframe');
    const captionBox = smartframe.locator('.caption-box')
    const mainWrapper = smartframe.locator('.main');

    const opacity1 = await mainWrapper.evaluate((e) => {
      return window.getComputedStyle(e).getPropertyValue("opacity")
    })
    expect(opacity1).toEqual("0"); //transparent
    await expect(mainWrapper).not.toHaveClass(/active/);
    await smartframe.locator('#smartframe').hover();
    await page.waitForTimeout(500);
    await expect(mainWrapper).toHaveClass(/active/);
    const opacity2 = await mainWrapper.evaluate((e) => {
      return window.getComputedStyle(e).getPropertyValue("opacity")
    })
    expect(opacity2).toEqual("1");

    await expect(captionBox).toHaveText(testData.messages.smartFrame1);

    // main Y + main height - captionBox heigth   --  message box Y possitionning calculation
    const mainWrapperBoundingBox = await mainWrapper.boundingBox();
    const captionBoxBoundingBox = await captionBox.boundingBox();
    const expectedCaptionBoxY = mainWrapperBoundingBox.y + mainWrapperBoundingBox.height - captionBoxBoundingBox.height
    const captionBoxYCalculation = expectedCaptionBoxY - captionBoxBoundingBox.y
    //diffference between expected Y and actual Y cant be bigger then 10 because padding was set to 10
    expect(captionBoxYCalculation).toBeLessThanOrEqual(padding)
    const captionBoxXCalculation = mainWrapperBoundingBox.x - captionBoxBoundingBox.x
    expect(captionBoxXCalculation).toBeLessThanOrEqual(padding)

    const shareLayer = smartframe.locator('div[data-layer="share"]')
    const button = smartframe.locator('a[data-title="Embed"]')
    
    await expect(shareLayer).not.toHaveClass(/active/)
    await button.click()
    await expect(shareLayer).toHaveClass(/active/)

  });

  test('Test Scenario 2', async ({ page }) => {
    await page.goto(config.Url2);
    const smartframe = page.locator('smart-frame');
    const mainWrapper = smartframe.locator('.main');
    const shareButton = smartframe.locator('a[data-title="Share"]')
    const fullScreenButton = smartframe.locator('a[title="Fullscreen"]')

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
      page.locator('span', { hasText: 'SE' }).click(),
    ]);
    expect(popup.url()).toContain(testData.urls.smartFrameUrl);

  });
});