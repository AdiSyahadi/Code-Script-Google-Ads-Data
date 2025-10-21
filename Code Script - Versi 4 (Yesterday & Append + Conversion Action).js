// =================================================================
// KONFIGURASI PENTING
// =================================================================
// ⚠️ URL Google Sheet Anda
const SPREADSHEET_URL = 'Isi Dengan link Google Sheet Anda(share editor)';

// --- KONFIGURASI TANGGAL DINAMIS ---
const YESTERDAY = getYesterdayDate();
// =================================================================

// Nama sheet target yang TIDAK AKAN DIUBAH
const AD_SHEET_NAME = 'AD_PERFORMANCE';
const AGE_SHEET_NAME = 'AGE_REPORT';
const GENDER_SHEET_NAME = 'GENDER_REPORT';

// =================================================================
// FUNGSI UTAMA (MAIN)
// =================================================================
function main() {
  const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  
  Logger.log(`✅ Mode: YESTERDAY & Append. Mengambil data untuk tanggal: ${YESTERDAY}`);

  // --- 1. Laporan Performa Iklan (HEADER BARU) ---
  const adHeaders = ['Date', 'Conversion action', 'Campaign Name', 'Ad Group Name', 'Ad ID', 'Ad Name/Headline', 'Cost', 'Impressions', 'Clicks', 'Conversions'];
  const adData = fetchReport(YESTERDAY, YESTERDAY, 'ad_group_ad', 'ad', 'ad_group_ad.ad.id', 'ad_group_ad.ad.name');
  writeToSheetAppend(spreadsheet, AD_SHEET_NAME, adHeaders, adData);

  // --- 2. Laporan Rentang Usia (HEADER BARU) ---
  const ageHeaders = ['Date', 'Conversion action', 'Campaign Name', 'Ad Group Name', 'Age Range', 'Cost', 'Impressions', 'Clicks', 'Conversions'];
  const ageData = fetchReport(YESTERDAY, YESTERDAY, 'age_range_view', 'age', 'ad_group_criterion.age_range.type');
  writeToSheetAppend(spreadsheet, AGE_SHEET_NAME, ageHeaders, ageData);

  // --- 3. Laporan Gender (HEADER BARU) ---
  const genderHeaders = ['Date', 'Conversion action', 'Campaign Name', 'Ad Group Name', 'Gender', 'Cost', 'Impressions', 'Clicks', 'Conversions'];
  const genderData = fetchReport(YESTERDAY, YESTERDAY, 'gender_view', 'gender', 'ad_group_criterion.gender.type');
  writeToSheetAppend(spreadsheet, GENDER_SHEET_NAME, genderHeaders, genderData);

  Logger.log('✅ Semua Laporan Yesterday berhasil ditambahkan (append).');
}

// =================================================================
// FUNGSI PEMBANTU: MENGHITUNG TANGGAL YESTERDAY
// =================================================================
function getYesterdayDate() {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return Utilities.formatDate(yesterday, 'GMT', 'yyyy-MM-dd');
}

// =================================================================
// FUNGSI PEMBANTU: MENULIS DATA KE SHEET (MODE APPEND)
// Kode tetap sama, karena hanya menambahkan data
// =================================================================
function writeToSheetAppend(spreadsheet, sheetName, headers, data) {
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
    sheet.getRange(startRow, costColumnIndex, data.length).setNumberFormat('Rp#,##0.00');
    Logger.log(`✅ Berhasil menambahkan ${data.length} baris data ke sheet: ${sheetName}`);
  } else {
    Logger.log(`⚠️ Peringatan: Data untuk ${sheetName} tidak ditemukan.`);
  }
}

// =================================================================
// FUNGSI PEMBANTU: MENARIK LAPORAN DARI GOOGLE ADS (DIPERBARUI)
// Menambahkan segments.conversion_action_name
// =================================================================
function fetchReport(startDate, endDate, viewResource, type, segmentFieldPrimary, segmentFieldSecondary) {
  Logger.log('Menyusun Query...');
  
  let segmentFields = segmentFieldPrimary;
  if (segmentFieldSecondary) {
    segmentFields += ', ' + segmentFieldSecondary;
  }
  
  const REPORT_QUERY = 
    "SELECT " +
      "segments.date, " +
      "segments.conversion_action_name, " + // <-- FIELD BARU
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
    " ORDER BY segments.date ASC";

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
      row['segments']['conversionActionName'] || 'All Conversions', // <-- DATA BARU
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