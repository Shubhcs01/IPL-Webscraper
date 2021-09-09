const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");



function processScorecard(url) {
  request(url, cb);
}

function cb(error, response, html) {
  if (error) {
    console.error("error:", error);
  } else {
    handleHtml(html);
  }
}

function handleHtml(html) {
  let selTool = cheerio.load(html);

  let descp = selTool(".match-header-info .description");
  let result = selTool(".match-info-MATCH.match-info-MATCH .status-text");
  let innings = selTool(
    ".card.content-block.match-scorecard-table .Collapsible"
  );

  let textarr = selTool(descp).text().split(",");
  let venue = textarr[1];
  let date = textarr[2];
  result = result.text().trim();

  for (let i = 0; i < innings.length; i++) {
    let teamName = selTool(innings[i])
      .find("h5")
      .text()
      .split("INNINGS")[0]
      .trim();
    let opponentIndex = i == 0 ? 1 : 0;
    let opponentName = selTool(innings[opponentIndex])
      .find("h5")
      .text()
      .split("INNINGS")[0]
      .trim();
    // console.log(teamName);
    // console.log(opponentName);

    let allRows = selTool(innings[i]).find(".table.batsman tbody tr");
    for (let j = 0; j < allRows.length; j++) {
      let allcols = selTool(allRows[j]).find("td");
      let reqcol = selTool(allcols[0]).hasClass("batsman-cell");

      if (reqcol) {
        //shi jagah ho sb nikal lo
        let playerName = selTool(allcols[0]).text().trim();
        let runs = selTool(allcols[2]).text().trim();
        let balls = selTool(allcols[3]).text().trim();
        let fours = selTool(allcols[5]).text().trim();
        let sixes = selTool(allcols[6]).text().trim();
        let sr = selTool(allcols[7]).text().trim();

        console.log(`${playerName} | ${runs} | ${balls} | ${fours} | ${sixes} | ${sr}`);
        processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result);
      }
    }
  }
}

// Folder Creation
function processPlayer(teamName, playerName, runs, balls, fours, sixes, sr, opponentName, venue, date, result) {
  let teamPath = path.join(__dirname, "ipl", teamName);
  dirCreator(teamPath);
  let filePath = path.join(teamPath, playerName + ".xlsx");
  let content = excelReader(filePath, playerName); // give JSON
  let playerObj = {
    teamName,
    playerName,
    runs, balls, fours,
    sixes, sr, opponentName,
    venue, date, result
  }

  content.push(playerObj);
  excelWriter(filePath, content, playerName);
}

function dirCreator(filePath) {
  if (fs.existsSync(filePath) == false) {
    fs.mkdirSync(filePath);
  }
}

function excelWriter(filePath, json, sheetName) {
  let newWB = xlsx.utils.book_new();
  let newWS = xlsx.utils.json_to_sheet(json);
  xlsx.utils.book_append_sheet(newWB, newWS, sheetName);
  xlsx.writeFile(newWB, filePath);
}

function excelReader(filePath, sheetName) {
  if (fs.existsSync(filePath) == false) {
    return [];
  }
  let wb = xlsx.readFile(filePath);
  let excelData = wb.Sheets[sheetName];
  let ans = xlsx.utils.sheet_to_json(excelData);
  return ans;
}

module.exports = {
  ps: processScorecard
}
