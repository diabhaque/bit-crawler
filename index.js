const puppeteer = require("puppeteer");

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://coinmarketcap.com/");
    const coin_urls = await page.evaluate(() => {
        const regex = /https:\/\/coinmarketcap\.com\/currencies\/[a-zA-Z0-9-_]{1,}\/$/m;

        const arr = Array.from(document.getElementsByTagName("a"))
            .filter((element) => element.href.match(regex))
            .map((el) => el.href + "historical-data")
            .filter((v, i, a) => a.indexOf(v) === i);

        return arr;
    });
    
    const data = coin_urls.map(async (url) =>{
        await age.goto(url)
        const coin_data = await page.evaluate(() => {
            
            table = document.getElementsByClassName('cmc-table')[0]
            // headers = table.tHead.children
            rows = table.tBodies[0].children

            var csv = [];
            for (var i = 0; i < rows.length; i++) {
                var row = [], cols = rows[i].querySelectorAll('td, th');
                for (var j = 0; j < cols.length; j++) {
                    var data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, '').replace(/(\s\s)/gm, ' ')
                    
                    data = data.replace(/"/g, '""');
                    
                    row.push('"' + data + '"');
                }
                csv.push(row.join(','));
            }

            const csv_string = csv.join('\n');

            var link = document.createElement('a');
            // link.style.display = 'none';
            // link.setAttribute('target', '_blank');
            // link.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv_string));
            // link.setAttribute('download', filename);
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);

            return csv_string
        });

        return coin_data
    })

    browser.close();
    return data;
})();


