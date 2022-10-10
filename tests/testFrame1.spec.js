import * as testData from '../testData/testData.json';
import * as config from '../config.json'

// @ts-check
const { test, expect } = require('@playwright/test');
const padding = config.CSS.padding

test.describe("Tests scenario 1", () => {

  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto(config.Url1);
  });

  test('Message component is showing up when hover', async ({ page }) => {
    const smartframe = page.frameLocator('iframe');
    const mainWrapper = smartframe.locator('.main');
    const captionBox = smartframe.locator('.caption-box')

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

  });

  test('Message component location', async ({ page }) => {
    const smartframe = page.frameLocator('iframe');
    const mainWrapper = smartframe.locator('.main');
    const captionBox = smartframe.locator('.caption-box')

    // main Y + main height - captionBox heigth   --  message box Y possitionning calculation
    const mainWrapperBoundingBox = await mainWrapper.boundingBox();
    const captionBoxBoundingBox = await captionBox.boundingBox();
    const expectedCaptionBoxY = mainWrapperBoundingBox.y + mainWrapperBoundingBox.height - captionBoxBoundingBox.height
    const captionBoxYCalculation = expectedCaptionBoxY - captionBoxBoundingBox.y
    //diffference between expected Y and actual Y cant be bigger then 10 because padding was set to 10
    expect(captionBoxYCalculation).toBeLessThanOrEqual(padding)
    const captionBoxXCalculation = mainWrapperBoundingBox.x - captionBoxBoundingBox.x
    expect(captionBoxXCalculation).toBeLessThanOrEqual(padding)
  })
  test('Check if layer opens', async ({ page }) => {  
    const smartframe = page.frameLocator('iframe');
    const shareLayer = smartframe.locator('div[data-layer="share"]')
    const button = smartframe.locator('a[data-title="Embed"]')

    await expect(shareLayer).not.toHaveClass(/active/)
    await smartframe.locator('#smartframe').hover();
    await button.click()
    await expect(shareLayer).toHaveClass(/active/)

  });
});