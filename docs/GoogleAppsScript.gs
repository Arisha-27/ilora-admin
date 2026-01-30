/**
 * Google Apps Script for handling CRUD operations with Google Sheets
 * Deploy this as a Web App with permissions for "Anyone" to access
 */

function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheetName = e.parameter.sheet;
    
    if (action === 'getAllData') {
      return ContentService.createTextOutput(JSON.stringify(getAllSheetsData())).setMimeType(ContentService.MimeType.JSON);
    } else if (action === 'getSheetData' && sheetName) {
      return ContentService.createTextOutput(JSON.stringify(getSheetData(sheetName))).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({error: 'Invalid action'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const sheetName = requestData.sheet;
    
    let result;
    
    switch (action) {
      case 'addRow':
        result = addRowToSheet(sheetName, requestData.rowData);
        break;
      case 'updateRow':
        result = updateRowInSheet(sheetName, requestData.rowIndex, requestData.rowData);
        break;
      case 'deleteRow':
        result = deleteRowFromSheet(sheetName, requestData.rowIndex);
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
    
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getAllSheetsData() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  const allData = {};
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    allData[sheetName] = getSheetDataBySheet(sheet);
  });
  
  return allData;
}

function getSheetData(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  
  return getSheetDataBySheet(sheet);
}

function getSheetDataBySheet(sheet) {
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) {
    return [];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });
}

function addRowToSheet(sheetName, rowData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  
  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Create row array based on headers
  const newRow = headers.map(header => rowData[header] || '');
  
  // Add the row
  sheet.appendRow(newRow);
  
  return { success: true, message: 'Row added successfully' };
}

function updateRowInSheet(sheetName, rowIndex, rowData) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  
  // Get headers
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Convert rowIndex to actual sheet row (add 2 because index is 0-based and we skip header row)
  const actualRow = rowIndex + 2;
  
  // Update each column
  headers.forEach((header, index) => {
    if (rowData.hasOwnProperty(header)) {
      sheet.getRange(actualRow, index + 1).setValue(rowData[header]);
    }
  });
  
  return { success: true, message: 'Row updated successfully' };
}

function deleteRowFromSheet(sheetName, rowIndex) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    throw new Error('Sheet not found: ' + sheetName);
  }
  
  // Convert rowIndex to actual sheet row (add 2 because index is 0-based and we skip header row)
  const actualRow = rowIndex + 2;
  
  // Delete the row
  sheet.deleteRow(actualRow);
  
  return { success: true, message: 'Row deleted successfully' };
}