import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/');
  await page.evaluate(() => {
    document.body.classList.add('theme-lcars');
  });
  
  const styles = await page.evaluate(() => {
     const h2 = document.querySelector('h2'); // The "NEW IDENTITY" or similar header
     if(!h2) return 'no h2';
     const computedVars = {
       themePrimary: getComputedStyle(document.body).getPropertyValue('--theme-primary'),
       colorCyberPrimary: getComputedStyle(document.body).getPropertyValue('--color-cyber-primary'),
       h2Color: getComputedStyle(h2).color,
       h2ThemePrimary: getComputedStyle(h2).getPropertyValue('--theme-primary'),
     };
     return computedVars;
  });
  console.log(styles);
  await browser.close();
})();
