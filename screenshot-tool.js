const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const pages = [
  'http://localhost:3000/onboarding/intro',
  'http://localhost:3000/onboarding/start',
  'http://localhost:3000/onboarding/age',
  'http://localhost:3000/onboarding/genre',
  'http://localhost:3000/onboarding/objectifs',
  'http://localhost:3000/onboarding/demo',
  'http://localhost:3000/onboarding/personnalite',
  'http://localhost:3000/onboarding/profil-pret',
  'http://localhost:3000/onboarding/fonctionnalites',
  'http://localhost:3000/onboarding/comparaison',
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 }); // iPhone X viewport

  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const url of pages) {
    try {
      console.log(`Visiting ${url}...`);
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
      
      const pageName = url.split('/').pop();
      const screenshotPath = path.join(outputDir, `${pageName}.png`);
      
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (error) {
      console.error(`Error capturing ${url}:`, error.message);
    }
  }

  await browser.close();
  console.log('All screenshots completed!');
})();
