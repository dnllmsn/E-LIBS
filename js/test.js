const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function runTest() {
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().addArguments('--headless'))
    .build();

  try {
    // Navigate to the student login page
    await driver.get('file://' + __dirname.replace(/\\js$/, '') + '/student-login.html');

    // Login as a student
    await driver.findElement(By.id('email')).sendKeys('student@test.com');
    await driver.findElement(By.id('password')).sendKeys('password');
    await driver.findElement(By.css('button[type="submit"]')).click();

    // Wait for the student page to load
    await driver.wait(until.titleIs('Student View - PTC Library'), 5000);

    // Click the "Mark as Read" button
    let markAsReadButton = await driver.wait(until.elementLocated(By.css('.mark-read-btn')), 5000);
    await markAsReadButton.click();
    console.log('Successfully clicked the "Mark as Read" button.');

    // Click the "Mark as Unread" button
    let markAsUnreadButton = await driver.wait(until.elementLocated(By.css('.mark-unread-btn')), 5000);
    await markAsUnreadButton.click();
    console.log('Successfully clicked the "Mark as Unread" button.');

    // Click the "Request to Borrow" button
    let borrowButton = await driver.wait(until.elementLocated(By.css('.borrow-btn')), 5000);
    await borrowButton.click();
    console.log('Successfully clicked the "Request to Borrow" button.');

  } finally {
    await driver.quit();
  }
}

runTest().catch(console.error);
