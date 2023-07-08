function createFolderInfoTable() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var folderInfo = [
   // дані з server.js

  ];

  var headers = Object.keys(folderInfo[0]);
  headers[1] = "№ фонду";
  headers[2] = "№ опису";
  headers[3] = "№ справи";

  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  var data = folderInfo.map(function(folder) {
    return headers.map(function(header) {
      return folder[header];
    });
  });

  sheet.getRange(2, 1, data.length, headers.length).setValues(data);
}