require('dotenv').config();
const express = require('express');
const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeData() {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: true,
    defaultViewport: chromium.defaultViewport
  });

  const page = await browser.newPage();
  try {
    await page.goto('https://soft.riuman.com/admin/login', { waitUntil: 'networkidle2' });
    await page.type('#email', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://soft.riuman.com/admin/mygroupleads-daily/1.02/channel/ExpressDial', { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();
    return data;
  } catch (error) {
    console.error('Error scraping data:', error);
    await browser.close();
    throw new Error('Scraping failed: ' + error.message);
  }
}

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/fetch-data', async (req, res) => {
  try {
    const data = await scrapeData();
    res.json({ data });
  } catch (error) {
    console.error('Error in /fetch-data route:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
