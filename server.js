require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to scrape data from the password-protected page
async function scrapeData() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the login page
    await page.goto('https://soft.riuman.com/admin/login', { waitUntil: 'networkidle2' });

    // Enter credentials and log in (adjust selectors as necessary)
    await page.type('#username', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('#login-button'); // Adjust this selector based on the actual button

    // Wait for navigation to the main data page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://soft.riuman.com/admin/mygroupleads-daily/1.02/channel/ExpressDial', { waitUntil: 'networkidle2' });

    // Scrape data from the page (adjust the data selection logic as needed)
    const data = await page.evaluate(() => {
      return document.body.innerText; // Modify to select specific content
    });

    await browser.close();
    return data;
  } catch (error) {
    console.error('Error scraping data:', error);
    await browser.close();
    throw new Error('Failed to scrape data');
  }
}

// Endpoint to fetch data
app.get('/fetch-data', async (req, res) => {
  try {
    const data = await scrapeData();
    res.json({ data });
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
