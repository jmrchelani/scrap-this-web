var express = require('express');
var router = express.Router();
var scrape = require('website-scraper');
var PuppeteerPlugin = require('website-scraper-puppeteer');
var path = require('path');
const archiver = require('archiver');

router.get('/', function (req, res, next) {
  var str = req.params.url;
  var filename = str.substring(str.indexOf(".") + 1, str.lastIndexOf("."));
  var filenamed = filename + '.zip';
  
  if (str != null) {
    (async () => {
      await scrape( {
        urls: [str],
        directory: path.resolve(__dirname, filename),
        plugins: [
          new PuppeteerPlugin({
            launchOptions: {
              headless: true
            }, 
            scrollToBottom: {
              timeout: 10000,
              viewportN: 10
            } 
          })
        ]
      });
    })();
  }

  source = __dirname +"/"+ filename;
  dest = path.join(__dirname, filenamed);
  (async (source, dest) => {
    const stream = fs.createWriteStream(dest);
    const archive = archiver('zip', { zlib: { level: 9 } });
  
    archive.on('error', function(err) {
    throw err;
    });
  
    await new Promise((resolve, reject) => {
      archive.pipe(stream);
      archive.directory(source, false);
      archive.on('error', err => {throw err;});
      archive.finalize();
  
      stream
          .on('close', function() {
          console.log(`zipped ${archive.pointer()} total bytes.`);
          resolve();
          });
    })
  })();

  res.sendFile(dest);

});


module.exports = router;
