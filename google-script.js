/**
 * Google Apps Script for Telematics Dashboard (Google Drive Folder Version)
 * 
 * This script reads CSV log files from a specific Google Drive folder.
 * Each file in the folder is treated as a "Device" or "Log".
 */

function doGet(e) {
  try {
    var action = e.parameter.action;
    
    // --- CONFIGURATION ---
    // IMPORTANT: Replace the folderId below with your own Google Drive Folder ID
    // You can find it in the URL of your folder: https://drive.google.com/drive/u/0/folders/YOUR_FOLDER_ID
    var folderId = "1FtWJBFS9MiJB7y5pYf8PWCky0rkGFXce"; 
    var folder = DriveApp.getFolderById(folderId);
    
    // 1. LIST DEVICES (FILES IN FOLDER)
    if (action === 'devices') {
      var files = folder.getFiles();
      var devices = [];
      
      while (files.hasNext()) {
        var file = files.next();
        var fileName = file.getName();
        
        // Only include .csv, .txt or .trc files
        if (fileName.toLowerCase().endsWith('.csv') || fileName.toLowerCase().endsWith('.txt') || fileName.toLowerCase().endsWith('.trc')) {
          devices.push({
            id: fileName,
            status: 'Stored Log',
            location: 'Google Drive',
            size: (file.getSize() / 1024).toFixed(2) + ' KB'
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify(devices))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 2. FETCH TELEMETRY FROM A SPECIFIC FILE
    if (action === 'telemetry') {
      var fileName = e.parameter.deviceId;
      var files = folder.getFilesByName(fileName);
      
      if (!files.hasNext()) {
        return ContentService.createTextOutput(JSON.stringify({ error: 'File not found: ' + fileName }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      
      var file = files.next();
      var fileContent = file.getBlob().getDataAsString();
      var isTrc = fileName.toLowerCase().endsWith('.trc');
      var csvData = isTrc ? [] : Utilities.parseCsv(fileContent);
      
      if (isTrc) {
        csvData.push(['timestamp', 'id', 'dlc', 'b0', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'cycle', 'latitude', 'longitude']);
        var lines = fileContent.split('\n');
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (line && !line.startsWith(';') && line.includes(')')) {
            var parts = line.split(/\s+/).filter(function(p) { return p !== ''; });
            // Handle both formats:
            // 1) 2026-04-06 09:55:12.488 ... (Length 16)
            // 1) 1234.567 2026-04-06 09:55:12.488 ... (Length 17)
            
            var hasRelativeMs = parts[1] && !parts[1].includes('-');
            var offset = hasRelativeMs ? 1 : 0;
            
            if (parts.length >= (16 + offset)) {
              var row = [];
              row[0] = parts[1 + offset] + ' ' + parts[2 + offset]; // Timestamp (Date + Time)
              row[1] = parts[3 + offset]; // ID
              row[2] = parts[4 + offset]; // DLC
              for (var j = 0; j < 8; j++) row[3 + j] = parts[5 + offset + j];
              row[11] = parts[13 + offset]; // Cycle
              row[12] = parts[14 + offset]; // Lat
              row[13] = parts[15 + offset]; // Lng
              csvData.push(row);
            }
          }
        }
      }
      
      var data = {
        header: {
          time: file.getLastUpdated().toLocaleString(),
          obdStatus: "File Loaded",
          odometer: "N/A",
          speed: "N/A",
          ignition: "N/A",
          latitude: null,
          longitude: null
        },
        details: [
          { label: "File Name", value: fileName },
          { label: "Last Modified", value: file.getLastUpdated().toLocaleString() }
        ],
        rawMessages: []
      };
      
      // Process CSV rows (Skip header row if it exists)
      // Expected Format: Time, ID, DLC, B0, B1, B2, B3, B4, B5, B6, B7
      // OR a more complex format with Latitude/Longitude
      var headers = csvData[0].map(function(h) { return String(h).toLowerCase().trim(); });
      
      function findHeader(possibleNames) {
        for (var i = 0; i < possibleNames.length; i++) {
          var idx = headers.indexOf(possibleNames[i]);
          if (idx !== -1) return idx;
        }
        return -1;
      }

      var latIdx = findHeader(['latitude', 'lat', 'gps_latitude', 'latitude_deg']);
      var lngIdx = findHeader(['longitude', 'lng', 'lag', 'gps_longitude', 'longitude_deg']);
      var speedIdx = findHeader(['speed', 'velocity', 'gps_speed']);
      var timeIdx = findHeader(['time', 'timestamp', 'date']);
      var idIdx = findHeader(['id', 'can_id', 'message_id']);
      var dlcIdx = findHeader(['dlc', 'length']);
      
      var startRow = 1; // Assume row 0 is header
      
      // If the file is huge, only take the last 200 rows to prevent timeout
      var maxRows = 200;
      var totalRows = csvData.length;
      var actualStart = Math.max(startRow, totalRows - maxRows);

      for (var i = actualStart; i < totalRows; i++) {
        var row = csvData[i];
        if (row.length < 3) continue;

        // Try to extract location from the last row processed
        if (latIdx !== -1 && lngIdx !== -1) {
          var lat = parseFloat(row[latIdx]);
          var lng = parseFloat(row[lngIdx]);
          if (!isNaN(lat) && !isNaN(lng)) {
            data.header.latitude = lat;
            data.header.longitude = lng;
          }
        }
        
        if (speedIdx !== -1) {
          var speed = row[speedIdx];
          if (speed) data.header.speed = speed + " km/h";
        }

        var id = idIdx !== -1 ? String(row[idIdx]) : String(row[1]);
        if (id && !id.startsWith('0x') && id.match(/^[0-9A-Fa-f]+$/)) {
          id = '0x' + id;
        }
        
        var dlc = dlcIdx !== -1 ? parseInt(row[dlcIdx]) : (parseInt(row[2]) || 8);
        var dataBytes = [];
        
        // Columns D to K (indices 3 to 10) if using standard format
        // If using named columns, we might need a different approach, but let's stick to indices for bytes for now
        // unless we find specific byte columns
        var byteStartIdx = 3;
        if (idIdx !== -1) {
           // If we have named columns, bytes are usually B0, B1...
           var b0Idx = headers.indexOf('b0');
           if (b0Idx !== -1) byteStartIdx = b0Idx;
        }

        for (var j = 0; j < 8; j++) {
          var cellValue = String(row[byteStartIdx + j] || "");
          if (cellValue !== "") {
            var parts = cellValue.trim().split(/\s+/);
            for (var k = 0; k < parts.length; k++) {
              var byteVal = parts[k];
              if (byteVal.length === 1 && byteVal.match(/^[0-9A-Fa-f]$/)) byteVal = "0" + byteVal;
              if (byteVal.match(/^[0-9A-Fa-f]{2}$/)) dataBytes.push(byteVal);
            }
          }
        }
        
        while (dataBytes.length < dlc) dataBytes.push("00");
        if (dataBytes.length > dlc) dataBytes = dataBytes.slice(0, dlc);

        data.rawMessages.push({
          timestamp: timeIdx !== -1 ? (new Date(row[timeIdx]).getTime() / 1000 || 0) : (new Date(row[0]).getTime() / 1000 || 0),
          id: id || "0x000",
          dlc: dlc,
          data: dataBytes
        });
      }
      
      return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 3. SEARCH REPORTS (FILES IN FOLDER)
    if (action === 'reports') {
      var deviceId = e.parameter.deviceId;
      var startDate = e.parameter.startDate;
      var endDate = e.parameter.endDate;
      
      var files = folder.getFiles();
      var foundFiles = [];
      
      while (files.hasNext()) {
        var file = files.next();
        var fileName = file.getName();
        
        // Check if filename contains deviceId and matches .trc or .csv
        var isMatch = fileName.toLowerCase().includes(deviceId.toLowerCase()) && 
                     (fileName.toLowerCase().endsWith('.trc') || fileName.toLowerCase().endsWith('.csv'));
        
        if (isMatch) {
          // Optional: Filter by date if present in filename
          // For now, return all matches for the device
          var scriptUrl = ScriptApp.getService().getUrl();
          foundFiles.push({
            id: file.getId(),
            name: fileName,
            date: file.getLastUpdated().toLocaleDateString(),
            size: (file.getSize() / 1024).toFixed(2) + ' KB',
            content: file.getBlob().getDataAsString().substring(0, 5000), // Preview content
            downloadUrl: scriptUrl + "?action=download&fileId=" + file.getId()
          });
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        found: foundFiles.length > 0,
        files: foundFiles,
        isMock: false
      }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // 4. DOWNLOAD FULL FILE CONTENT
    if (action === 'download') {
      var fileId = e.parameter.fileId;
      var file = DriveApp.getFileById(fileId);
      var content = file.getBlob().getDataAsString();
      
      return ContentService.createTextOutput(content)
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
