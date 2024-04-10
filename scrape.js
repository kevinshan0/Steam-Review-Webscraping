import puppeteer from "puppeteer";
import * as fs from 'node:fs';

let game = {
    genre: "strategy",
    code: 394360,
    name: "hearts-of-iron4"
}

// scrape items with scroller
async function scrapeItems(page, extractItems, itemCount) {
    let items = [];
    try {
      let previousHeight;
      while (items.length < itemCount) {
        items = await page.evaluate(extractItems);
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await new Promise((resolve) => {
            setTimeout(resolve, 1200);
        });
      }
    } catch(e) { }
    return items;
}

function extractItems() {
    const extractedElements = document.querySelectorAll('.apphub_CardTextContent');
    const items = [];
    for (let element of extractedElements) {
        items.push(element.innerText.replace(/\n{2,}/g, '\n'));
    }

    console.log(items)

    return items;
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(`https://steamcommunity.com/app/${game.code}/reviews/?browsefilter=toprated&snr=1_5_100010_`, { waitUntil: "domcontentloaded" });

    const items = await scrapeItems(page, extractItems, 100);
    fs.writeFileSync(`./${game.genre}/${game.name}.txt`, items.join('\n') + '\n');

    await browser.close();
})();