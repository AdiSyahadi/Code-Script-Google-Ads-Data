// =================================================================
// KONFIGURASI PENTING
// =================================================================
// ⚠️ URL Google Sheet Anda: HARUS diakses oleh akun Google Ads yang menjalankan script.
const SPREADSHEET_URL = 'Isi Dengan link Google Sheet Anda(share editor)';

// --- KONFIGURASI TANGGAL (Format: YYYY-MM-DD) ---
// **CATATAN:** START_DATE awal hanya digunakan saat sheet kosong.
const INITIAL_START_DATE = '2023-09-10'; // Tanggal awal historis Anda
const TARGET_END_DATE = '2025-10-20'; // Tanggal target akhir (misalnya, hari ini)
// =================================================================

// Jangka waktu data yang ditarik per eksekusi (misalnya, 30 hari)
const BATCH_DAYS = 30;


// =================================================================
// FUNGSI UTAMA (MAIN)
// =================================================================
function main() {
  const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  
  // Proses Tiga Laporan secara berurutan
  // Nama sheet akan menjadi: AD_PERFORMANCE, AGE_REPORT, GENDER_REPORT
  processReport(spreadsheet, 'AD_PERFORMANCE', 'ad_group_ad', 'ad', 
    ['Date', 'Campaign Name', 'Ad Group Name', 'Ad ID', 'Ad Name/Headline', 'Cost', 'Impressions', 'Clicks', 'Conversions'],
    'ad_group_ad.ad.id', 'ad_group_ad.ad.name');

  processReport(spreadsheet, 'AGE_REPORT', 'age_range_view', 'age', 
    ['Date', 'Campaign Name', 'Ad Group Name', 'Age Range', 'Cost', 'Impressions', 'Clicks', 'Conversions'],
    'ad_group_criterion.age_range.type');

  processReport(spreadsheet, 'GENDER_REPORT', 'gender_view', 'gender', 
    ['Date', 'Campaign Name', 'Ad Group Name', 'Gender', 'Cost', 'Impressions', 'Clicks', 'Conversions'],
    'ad_group_criterion.gender.type');

  Logger.log('✅ Semua Laporan historis berhasil diproses.');
}

// =================================================================
// FUNGSI UTAMA PENGENDALI PROSES
// =================================================================
function processReport(spreadsheet, sheetName, viewResource, type, headers, segmentFieldPrimary, segmentFieldSecondary = null) {
  Logger.log(`\n--- Memproses Sheet: ${sheetName} ---`);
  
  // 1. Tentukan Tanggal Mulai dan Akhir untuk Batch ini
  const dates = getBatchDates(spreadsheet, sheetName);
  const currentStartDate = dates.startDate;
  const currentEndDate = dates.endDate;
  
  if (currentStartDate > TARGET_END_DATE) {
    Logger.log(`Skip: Sheet ${sheetName} sudah mencapai tanggal target (${TARGET_END_DATE}).`);
    return;
  }
  Logger.log(`Mengambil data dari ${currentStartDate} sampai ${currentEndDate}`);
  
  // 2. Ambil Data
  const reportData = fetchReport(viewResource, type, currentStartDate, currentEndDate, segmentFieldPrimary, segmentFieldSecondary);
  
  // 3. Tulis Data (Append-Only)
  writeToSheet(spreadsheet, sheetName, headers, reportData, currentStartDate);
}

// =================================================================
// FUNGSI PEMBANTU: MENENTUKAN RENTANG TANGGAL UNTUK BATCH
// =================================================================
function getBatchDates(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  let startDate = INITIAL_START_DATE;
  
  if (sheet && sheet.getLastRow() > 1) {
    // Jika sheet sudah ada dan memiliki data, ambil tanggal terakhir
    const lastDateString = sheet.getRange(sheet.getLastRow(), 1).getDisplayValue();
    
    // Hitung tanggal berikutnya (LastDate + 1 hari)
    const lastDate = new Date(lastDateString);
    lastDate.setDate(lastDate.getDate() + 1);
    startDate = Utilities.formatDate(lastDate, 'GMT', 'yyyy-MM-dd');
  }

  // Tentukan tanggal akhir (startDate + BATCH_DAYS)
  const tempEndDate = new Date(startDate);
  tempEndDate.setDate(tempEndDate.getDate() + BATCH_DAYS - 1);
  let endDate = Utilities.formatDate(tempEndDate, 'GMT', 'yyyy-MM-dd');
  
  // Pastikan End Date tidak melebihi TARGET_END_DATE
  if (endDate > TARGET_END_DATE) {
    endDate = TARGET_END_DATE;
  }
  
  return { startDate, endDate };
}

// =================================================================
// FUNGSI PEMBANTU: MENULIS DATA KE SHEET (MODE APPEND)
// =================================================================
function writeToSheet(spreadsheet, sheetName, headers, data, reportStartDate) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  let startRow = 1;

  if (!sheet) {
    // Jika sheet belum ada, buat baru dan tulis header
    sheet = spreadsheet.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold'); 
    startRow = 2;
  } else if (sheet.getLastRow() > 0) {
    // Jika sheet sudah ada, mulai menulis di baris berikutnya
    startRow = sheet.getLastRow() + 1;
  }

  // Tulis Data
  if (data.length > 0) {
    SpreadsheetApp.flush(); 
    sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
    
    // Format kolom Cost
    const costColumnIndex = headers.indexOf('Cost') + 1;
    const totalRows = startRow + data.length - 1;
    sheet.getRange(startRow, costColumnIndex, data.length).setNumberFormat('Rp#,##0.00');
    
    Logger.log(`✅ Berhasil menambahkan ${data.length} baris data (dari ${reportStartDate}) ke sheet: ${sheetName}`);
  } else {
    Logger.log(`⚠️ Peringatan: Data tidak ditemukan untuk periode ini (${reportStartDate}) di sheet: ${sheetName}.`);
  }
}

// =================================================================
// FUNGSI PEMBANTU: MENARIK LAPORAN DARI GOOGLE ADS
// *Diubah untuk menerima START_DATE & END_DATE dari fungsi getBatchDates*
// =================================================================
function fetchReport(viewResource, type, startDate, endDate, segmentFieldPrimary, segmentFieldSecondary) {
  Logger.log('Menyusun Query...');
  
  let segmentFields = segmentFieldPrimary;
  if (segmentFieldSecondary) {
    segmentFields += ', ' + segmentFieldSecondary;
  }
  
  const REPORT_QUERY = 
    "SELECT " +
      "segments.date, " +
      "campaign.name, " +
      "ad_group.name, " +
      segmentFields + ', ' +
      "metrics.cost_micros, " +
      "metrics.impressions, " +
      "metrics.clicks, " +
      "metrics.conversions " +
    "FROM " + viewResource +
    " WHERE " +
      "segments.date BETWEEN '" + startDate + "' AND '" + endDate + "' " + 
    " ORDER BY segments.date ASC"; // Ubah ke ASC agar data terurut dari tanggal terlama

  const searchIterator = AdsApp.search(REPORT_QUERY); 
  const data = [];
  
  while (searchIterator.hasNext()) {
    const row = searchIterator.next();
    const cost = parseFloat(row['metrics']['costMicros']) / 1000000;
    
    let segmentLabelPrimary = 'N/A';
    let segmentLabelSecondary = null;
    
    if (type === 'ad') {
      segmentLabelPrimary = row['adGroupAd']['ad']['id'];
      segmentLabelSecondary = row['adGroupAd']['ad']['name'] || 'N/A';
    } else if (type === 'age') {
      segmentLabelPrimary = row['adGroupCriterion']['ageRange']['type'].replace(/_/g, ' ');
    } else if (type === 'gender') {
      segmentLabelPrimary = row['adGroupCriterion']['gender']['type'].replace(/_/g, ' ');
    }
    
    let newRow = [
      row['segments']['date'],
      row['campaign']['name'],
      row['adGroup']['name'],
      segmentLabelPrimary,
    ];
    
    if (segmentFieldSecondary) {
      newRow.push(segmentLabelSecondary);
    }

    newRow.push(
      cost, 
      parseInt(row['metrics']['impressions']),
      parseInt(row['metrics']['clicks']),
      parseFloat(row['metrics']['conversions'])
    );
    
    data.push(newRow);
  }
  
  return data;
}