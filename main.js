const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";

const request = require("request");
const cheerio = require("cheerio");
const AllMatchobj = require("./allmatch")

// Folder Creation ipl
const fs = require("fs");
const path = require("path");
const iplPath = path.join(__dirname, "ipl");
dirCreator(iplPath);

request(url, cb);
function cb(err, response, html) {
  if (err) {
    console.log(err);
  } else {
    // console.log(html);
    extractLink(html);
  }
}

function extractLink(html) {
  let $ = cheerio.load(html);
  let anchorElem = $(`a[data-hover="View All Results"]`);
  let link = anchorElem.attr("href");
  let fullLink = "https://www.espncricinfo.com" + link;
  AllMatchobj.gAlmatches(fullLink);
}

function dirCreator(filePath) {
  if (fs.existsSync(filePath) == false) {
    fs.mkdirSync(filePath);
  }
}
