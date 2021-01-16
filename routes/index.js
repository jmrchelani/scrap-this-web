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
  //var filename = str.substring(str.indexOf(".") + 1, str.lastIndexOf("."));
  if(str == null) res.redirect('https://github.com/jmrchelani/scrap-this-web');
  var filename = extractRootDomain(str);
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

function extractRootDomain(url) {
  var domain = extractHostname(url),
      splitArr = domain.split('.'),
      arrLen = splitArr.length;

  //extracting the root domain here
  //if there is a subdomain 
  if (arrLen > 2) {
      domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
      //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
      if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
          //this is using a ccTLD
          domain = splitArr[arrLen - 3] + '.' + domain;
      }
  }
  return domain;
}

function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("//") > -1) {
      hostname = url.split('/')[2];
  }
  else {
      hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  return hostname;
}

module.exports = router;
