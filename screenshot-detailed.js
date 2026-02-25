const puppeteer = require('puppeteer');

const pages = [
  { url: 'http://localhost:3000/onboarding/intro', name: 'intro' },
  { url: 'http://localhost:3000/onboarding/start', name: 'start' },
  { url: 'http://localhost:3000/onboarding/age', name: 'age' },
  { url: 'http://localhost:3000/onboarding/objectifs', name: 'objectifs' },
];

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });

  console.log('Starting page captures...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`\n========================================`);
      console.log(`📍 NAVIGATING TO: ${pageInfo.url}`);
      console.log(`========================================`);
      
      await page.goto(pageInfo.url, { waitUntil: 'networkidle2', timeout: 10000 });
      
      // Wait a bit for any animations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get page title
      const title = await page.title();
      console.log(`Page title: ${title}`);
      
      // Get background color of body
      const bgColor = await page.evaluate(() => {
        const body = document.body;
        return window.getComputedStyle(body).backgroundColor;
      });
      console.log(`Body background: ${bgColor}`);
      
      // Check for gradient backgrounds
      const hasGradient = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        for (let el of elements) {
          const bg = window.getComputedStyle(el).background;
          if (bg.includes('gradient')) {
            return {
              element: el.className,
              background: bg.substring(0, 100)
            };
          }
        }
        return null;
      });
      
      if (hasGradient) {
        console.log(`Gradient found on: ${hasGradient.element}`);
        console.log(`Gradient: ${hasGradient.background}...`);
      }
      
      // Get main text content
      const mainText = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const h2 = document.querySelector('h2');
        const buttons = Array.from(document.querySelectorAll('button, a[class*="btn"]'));
        
        return {
          h1: h1 ? h1.textContent.trim() : null,
          h2: h2 ? h2.textContent.trim() : null,
          buttons: buttons.map(b => b.textContent.trim()).filter(t => t.length > 0 && t.length < 50)
        };
      });
      
      console.log(`\nText Content:`);
      if (mainText.h1) console.log(`  H1: "${mainText.h1}"`);
      if (mainText.h2) console.log(`  H2: "${mainText.h2}"`);
      if (mainText.buttons.length > 0) {
        console.log(`  Buttons/Links: ${mainText.buttons.join(', ')}`);
      }
      
      // Check for cards
      const cards = await page.evaluate(() => {
        const cardElements = document.querySelectorAll('[class*="card"], [class*="ob-card"]');
        return Array.from(cardElements).map(card => {
          const styles = window.getComputedStyle(card);
          return {
            className: card.className,
            background: styles.backgroundColor,
            borderRadius: styles.borderRadius,
            padding: styles.padding
          };
        });
      });
      
      if (cards.length > 0) {
        console.log(`\nCards found: ${cards.length}`);
        cards.forEach((card, i) => {
          console.log(`  Card ${i + 1}: ${card.className}`);
          console.log(`    Background: ${card.background}`);
          console.log(`    Border radius: ${card.borderRadius}`);
        });
      }
      
      // Take screenshot
      const screenshotPath = `./screenshots/${pageInfo.name}-detailed.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`\n✅ Screenshot saved: ${screenshotPath}`);
      
    } catch (error) {
      console.error(`\n❌ Error capturing ${pageInfo.url}:`, error.message);
    }
  }

  await browser.close();
  console.log('\n\n✅ All page captures completed!');
})();
