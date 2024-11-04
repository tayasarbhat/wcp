require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Function to scrape data from the password-protected page
async function scrapeData() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Ensure compatibility with serverless environments
  });
  const page = await browser.newPage();

  try {
    // Navigate to the login page
    await page.goto('https://soft.riuman.com/admin/login', { waitUntil: 'networkidle2' });

    // Enter credentials and log in (adjust selectors as necessary)
    await page.type('#username', process.env.USERNAME);
    await page.type('#password', process.env.PASSWORD);
    await page.click('#login-button'); // Adjust this selector based on the actual login button

    // Wait for navigation to the main data page
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto('https://soft.riuman.com/admin/mygroupleads-daily/1.02/channel/ExpressDial', { waitUntil: 'networkidle2' });

    // Scrape data from the page (adjust the data selection logic as needed)
    const data = await page.evaluate(() => {
      return document.body.innerText; // Modify this to scrape specific elements if needed
    });

    await browser.close();
    return data;
  } catch (error) {
    console.error('Error scraping data:', error);
    await browser.close();
    throw new Error('Scraping failed: ' + error.message);
  }
}

// Route for the root of the app
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Route to fetch data
app.get('/fetch-data', async (req, res) => {
  try {
    const data = await scrapeData();
    res.json({ data });
  } catch (error) {
    console.error('Error in /fetch-data route:', error);
    res.status(500).send('Internal Server Error: ' + error.message);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
