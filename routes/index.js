var express = require('express');
var router = express.Router();
var scrape = require('website-scraper');
var PuppeteerPlugin = require('website-scraper-puppeteer');
var path = require('path');
const archiver = require('archiver');
const fs = require("fs");

var counter = 0;

router.get('/', function (req, res, next) {
  var str = req.query.url;
  var filename = str.substring(str.indexOf(".") + 1, str.lastIndexOf("."));
  filename = filename + counter;
  var filenamed = filename + "-"+ counter++ + '.zip';

  console.log("CHECK 1");

  if (str != null) {

    const options = {
      urls: [str],
      directory: path.join(__dirname, filename),
      plugins: [
        new PuppeteerPlugin({
          launchOptions: {
            headless: true,
            args: ['--no-sandbox']
          }, 
          scrollToBottom: {
            timeout: 10000,
            viewportN: 10
          } 
        })
      ]
    };
    console.log("CHECK 2");
    scrape(options).then((result) => {
      source = __dirname + "/" + filename;
      dest = path.join(__dirname, filenamed);
      console.log("CHECK 3");
      (async () => {
        console.log(dest);
        const stream = fs.createWriteStream(dest);
        const archive = archiver('zip', { zlib: { level: 9 } });
        console.log("CHECK 4");

        archive.on('error', function (err) {
          throw err;
        });

        (async function archiveIt() {
          console.log("CHECK 5");
            return await new Promise((resolve, reject) => {
            archive.pipe(stream);
            archive.directory(source, false);
            archive.on('error', err => { throw err; });
            archive.finalize();

            console.log("CHECK 6");

            stream
              .on('close', function () {
                console.log(`zipped ${archive.pointer()} total bytes.`);
                resolve();
              });
          })
        })().then(()=> {
          console.log("CHECK 7");
          res.sendFile(dest);
        })

      })();
    });

  }
});


module.exports = router;
