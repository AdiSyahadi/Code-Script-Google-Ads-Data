// =================================================================
// KONFIGURASI PENTING
// =================================================================
// ⚠️ URL Google Sheet Anda
const SPREADSHEET_URL = 'Isi Dengan link Google Sheet Anda(share editor)';

// --- KONFIGURASI RENTANG TANGGAL MANUAL ---
// UBAH TANGGAL SESUAI KEBUTUHAN ANDA (Format: YYYY-MM-DD)
const START_DATE = '2025-08-07'; 
const END_DATE = '2025-10-19'; 
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
  
  Logger.log(`✅ Mode: Manual Range & Append. Mengambil data dari ${START_DATE} hingga ${END_DATE}`);

  // --- 1. Laporan Performa Iklan ---
  const adHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Ad ID', 'Ad Name/Headline', 'Cost', 'Impressions', 'Clicks', 'Conversions'];
  // Perhatikan: Fetch Report sekarang menggunakan ORDER BY ASC
  const adData = fetchReport(START_DATE, END_DATE, 'ad_group_ad', 'ad', 'ad_group_ad.ad.id', 'ad_group_ad.ad.name');
  writeToSheetAppend(spreadsheet, AD_SHEET_NAME, adHeaders, adData);

  // --- 2. Laporan Rentang Usia ---
  const ageHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Age Range', 'Cost', 'Impressions', 'Clicks', 'Conversions'];
  const ageData = fetchReport(START_DATE, END_DATE, 'age_range_view', 'age', 'ad_group_criterion.age_range.type');
  writeToSheetAppend(spreadsheet, AGE_SHEET_NAME, ageHeaders, ageData);

  // --- 3. Laporan Gender ---
  const genderHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Gender', 'Cost', 'Impressions', 'Clicks', 'Conversions'];
  const genderData = fetchReport(START_DATE, END_DATE, 'gender_view', 'gender', 'ad_group_criterion.gender.type');
  writeToSheetAppend(spreadsheet, GENDER_SHEET_NAME, genderHeaders, genderData);

  Logger.log('✅ Semua Laporan Manual Range berhasil ditambahkan (append).');
}

// =================================================================
// FUNGSI PEMBANTU: MENULIS DATA KE SHEET (MODE APPEND)
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
// FUNGSI PEMBANTU: MENARIK LAPORAN DARI GOOGLE ADS (ORDER BY ASC)
// =================================================================
function fetchReport(startDate, endDate, viewResource, type, segmentFieldPrimary, segmentFieldSecondary) {
  Logger.log('Menyusun Query...');
  
  let segmentFields = segmentFieldPrimary;
  if (segmentFieldSecondary) {
    segmentFields += ', ' + segmentFieldSecondary;
  }
  
  const REPORT_QUERY = 
    "SELECT " +
      "segments.date, campaign.name, ad_group.name, " +
      segmentFields + ', ' +
      "metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions " +
    "FROM " + viewResource +
    " WHERE segments.date BETWEEN '" + startDate + "' AND '" + endDate + "' " + 
    " ORDER BY segments.date ASC"; // <--- PERUBAHAN KRUSIAL: ASC

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

    newRow.push(cost, parseInt(row['metrics']['impressions']), parseInt(row['metrics']['clicks']), parseFloat(row['metrics']['conversions']));
    data.push(newRow);
  }
  return data;
}