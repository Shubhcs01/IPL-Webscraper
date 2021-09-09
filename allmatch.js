const request = require("request");
const cheerio = require("cheerio");
const scoreCardObj = require("./scoreCard");

function getAllMatchesLink(url) {

    request(url, function (error, response, html) {

      if (error) {
        console.log(error); // Print the error if one occurred
      } else {
        extractAllLink(html); // Print the HTML for the Google homepage.
      }
    });
  }
  
  function extractAllLink(html) {

    let selTool= cheerio.load(html);
    let scoreCardElems = selTool(`a[data-hover="Scorecard"]`);

    for (let i = 0; i < scoreCardElems.length; i++) {
      let link = selTool(scoreCardElems[i]).attr("href");
      let fullLink = "https://www.espncricinfo.com" + link;
      console.log(fullLink);
      scoreCardObj.ps(fullLink);
    }
  }

  module.exports = {
      gAlmatches: getAllMatchesLink
  }