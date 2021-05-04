const puppeteer = require("puppeteer");
var fs = require("fs");
const { pathToFileURL } = require("url");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on("console", (consoleObj) => console.log(consoleObj.text()));

    await page.goto("https://coinmarketcap.com/");
    const coin_urls = await page.evaluate(() => {
        const regex = /https:\/\/coinmarketcap\.com\/currencies\/[a-zA-Z0-9-_]{1,}\/$/m;

        const arr = Array.from(document.getElementsByTagName("a"))
            .filter((element) => element.href.match(regex))
            .map((el) => el.href + "historical-data")
            .filter((v, i, a) => a.indexOf(v) === i);

        return arr;
    });

    for (const url of coin_urls) {
        console.log(url);
        try {
            await page.goto(url, {"waitUntil" : "networkidle0"});
        } catch (err) {
            console.log(err);
        }
        
        await page.click('button.sc-1ejyco6-0.gQqumm')

        await page.click('[data-tippy-root] > div > div.tippy-content > div > div > div.pickers___166Od > div.predefinedRanges___1WDIZ > ul > li:nth-child(5)')

        await page.click('[data-tippy-root] > div > div.tippy-content > div > div > div.footer___12pdF > span > button')

        await new Promise((r) => setTimeout(r, 2000));

        const coin_data = await page.evaluate(() => {

            table = document.getElementsByClassName("cmc-table")[0];
            rows = table.tBodies[0].children;
            console.log(rows.length)
            var csv = [];
            for (var i = 0; i < rows.length; i++) {
                var row = [],
                    cols = rows[i].querySelectorAll("td, th");
                for (var j = 0; j < cols.length; j++) {
                    var data = cols[j].innerText
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .replace(/(\s\s)/gm, " ");

                    data = data.replace(/"/g, '""');

                    row.push('"' + data + '"');
                }
                csv.push(row.join(","));
            }
            const csv_string = csv.join("\n");
            return csv_string;
        });

        coin_name = url
            .replace("https://coinmarketcap.com/currencies/", "")
            .replace("/historical-data", "");

        if (coin_data.length > 2) {
            console.log("SUCCESS");
        } else {
            console.log("FAILURE");
        }

        // console.log(coin_name)
        // console.log(coin_data)

        filepath = `./csvs/${coin_name}.csv`;

        await fs.writeFile(filepath, coin_data, (err) => {
            if (err) console.log(err);
            console.log(`${coin_name} has been saved!`);
        });
    }

    browser.close();
    return data;
})();
