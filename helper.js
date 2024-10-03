const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { execSync } = require("child_process");
const os = require("os");

function getOffset(currentPage = 1, listPerPage) {
  return (currentPage - 1) * [listPerPage];
}

const formatDateForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD");
};

const formatDateTimeForDb = (date) => {
  if (typeof date === "string") date = new Date(date);
  return moment(date).format("YYYY-MM-DD HH:mm:ss");
};

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

function logToFile(log_message, location) {
  const homedir = os.homedir();
  const logsFolder = path.join(homedir, `hospital-builds/build-service/logs/`);
  const newDate = formatDateForDb(new Date());
  const fileName = `${newDate}-updates.logs`;
  const filePath = path.join(logsFolder, fileName);
  if (!fs.existsSync(filePath)) {
    execSync(`touch ${filePath}`);
  }

  const log = `${location || ""} -- ${new Date().toISOString()} - ${
    log_message || ""
  } \n`;

  fs.appendFile(filePath, log, (err) => {
    if (err) throw err;
    console.log(`Log '${log_message || ""}' written to '${filePath}'`);
  });
}

module.exports = {
  getOffset,
  emptyOrRows,
  logToFile,
  formatDateTimeForDb,
};
