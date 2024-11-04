require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

async function scrapeData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://soft.riuman.com/admin/login', { waitUntil: 'networkidle2' });
    await page.type('#username', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('#login-button'); // Adjust selector based on the actual button

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://soft.riuman.com/admin/mygroupleads-daily/1.02/channel/ExpressDial', { waitUntil: 'networkidle2' });

    const data = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return data;
  } catch (error) {
    console.error('Error scraping data:', error);
    await browser.close();
    throw new Error('Failed to scrape data');
  }
}

app.get('/fetch-data', async (req, res) => {
  try {
    const data = await scrapeData();
    res.json({ data });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
