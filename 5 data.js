// =================================================================
// KONFIGURASI PENTING
// =================================================================
// ⚠️ GANTI DENGAN URL GOOGLE SHEET ANDA
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1cDcDxuAs2qRj0bGlWS77-Ps9wLgHiKjfBqeHgqyJP10/edit?usp=sharing';

// -----------------------------------------------------------------
// ⬇️ KONFIGURASI TANGGAL FLEKSIBEL (Ubah di sini) ⬇️
// Format harus YYYY-MM-DD
const START_DATE = '2025-01-02'; 
const END_DATE = '2025-10-20';
// -----------------------------------------------------------------

// Nama sheet target
const AD_SHEET_NAME = 'AD_PERFORMANCE'; 
const AGE_SHEET_NAME = 'AGE_REPORT'; 
const GENDER_SHEET_NAME = 'GENDER_REPORT';
const LOCATION_SHEET_NAME = 'LOCATION_REPORT';
const CONVERSION_SHEET_NAME = 'CONVERSION_REPORT'; 
// =================================================================

// =================================================================
// FUNGSI UTAMA (MAIN) - MENJALANKAN 5 LAPORAN
// =================================================================
function main() {
  const spreadsheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  
  Logger.log(`✅ Mode: Unified Daily Append. Mengambil data dari: ${START_DATE} hingga: ${END_DATE}`);

  // --- 1. AD_PERFORMANCE: AD LEVEL ---
  const adHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Ad ID', 'Ad Name/Headline', 'Clicks', 'CTR', 'Avg CPC', 'Cost'];
  const adData = fetchAdLevelReport(START_DATE, END_DATE, 'ad_group_ad', 'ad_group_ad.ad.id', 'ad_group_ad.ad.name');
  processReport(spreadsheet, AD_SHEET_NAME, adHeaders, adData);

  // --- 2. AGE_REPORT: AD GROUP LEVEL ---
  const ageHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Age Range', 'Clicks', 'CTR', 'Avg CPC', 'Cost'];
  const ageData = fetchAdGroupLevelReport(START_DATE, END_DATE, 'age_range_view', 'ad_group_criterion.age_range.type');
  processReport(spreadsheet, AGE_SHEET_NAME, ageHeaders, ageData);

  // --- 3. GENDER_REPORT: AD GROUP LEVEL ---
  const genderHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Gender', 'Clicks', 'CTR', 'Avg CPC', 'Cost'];
  const genderData = fetchAdGroupLevelReport(START_DATE, END_DATE, 'gender_view', 'ad_group_criterion.gender.type');
  processReport(spreadsheet, GENDER_SHEET_NAME, genderHeaders, genderData);

  // --- 4. LOCATION_REPORT: AD GROUP LEVEL ---
  const locationHeaders = ['Date', 'Campaign Name', 'Ad Group Name', 'Location Name', 'Location Type', 'Clicks', 'CTR', 'Avg CPC', 'Cost'];
  const locationData = fetchLocationReportWithScriptLookup(START_DATE, END_DATE);
  processReport(spreadsheet, LOCATION_SHEET_NAME, locationHeaders, locationData);

  // --- 5. CONVERSION_REPORT: KONVERSI RINGKAS PER JENIS ---
  const conversionHeaders = ['Dates', 'Conv type', 'Conversions', 'Conversions Value'];
  const conversionData = fetchSimplifiedConversionReport(START_DATE, END_DATE);
  processReport(spreadsheet, CONVERSION_SHEET_NAME, conversionHeaders, conversionData);

  Logger.log('✅ Semua 5 Laporan berhasil ditambahkan (append).');
}

// =================================================================
// FUNGSI PEMBANTU: KONVERSI ID KE NAMA LOKASI (Daftar ID Indonesia)
// =================================================================
/**
 * Melakukan lookup ID Kriteria Lokasi ke Nama Lokasi yang dapat dibaca manusia.
 */
function getLocationName(criterionId) {
  const locationMap = {
    // NEGARA
    '2360': 'Indonesia (Negara)',
    // PROVINSI (34 Entri)
    '1025547': 'Aceh (Provinsi)', '1006574': 'Sumatera Utara (Provinsi)', '1006616': 'Sumatera Barat (Provinsi)',
    '1025550': 'Riau (Provinsi)', '1025551': 'Jambi (Provinsi)', '1006584': 'Sumatera Selatan (Provinsi)',
    '1006932': 'Bengkulu (Provinsi)', '1025553': 'Lampung (Provinsi)', '1025554': 'Kepulauan Bangka Belitung (Provinsi)',
    '1025549': 'Kepulauan Riau (Provinsi)', '1025546': 'DKI Jakarta (Provinsi/Ibukota)', '1006935': 'Jawa Barat (Provinsi)',
    '1006579': 'Jawa Tengah (Provinsi)', '1025556': 'DI Yogyakarta (Provinsi)', '1006577': 'Jawa Timur (Provinsi)',
    '1006933': 'Banten (Provinsi)', '1025548': 'Bali (Provinsi)', '1006575': 'Nusa Tenggara Barat (Provinsi)',
    '1006576': 'Nusa Tenggara Timur (Provinsi)', '1025557': 'Kalimantan Barat (Provinsi)', '1025558': 'Kalimantan Tengah (Provinsi)',
    '1025559': 'Kalimantan Selatan (Provinsi)', '1006578': 'Kalimantan Timur (Provinsi)', '1025560': 'Kalimantan Utara (Provinsi)',
    '1025561': 'Sulawesi Utara (Provinsi)', '1025562': 'Sulawesi Tengah (Provinsi)', '1025563': 'Sulawesi Selatan (Provinsi)',
    '1025564': 'Sulawesi Tenggara (Provinsi)', '1025565': 'Gorontalo (Provinsi)', '1025566': 'Sulawesi Barat (Provinsi)',
    '1006580': 'Maluku (Provinsi)', '1006581': 'Maluku Utara (Provinsi)', '1006582': 'Papua (Provinsi)',
    '1006583': 'Papua Barat (Provinsi)',
    // KOTA UTAMA / IBUKOTA
    '1007871': 'Jakarta (Kota)', '1007786': 'Surabaya (Kota)', '1007901': 'Bandung (Kota)',
    '1007802': 'Medan (Kota)', '1007886': 'Semarang (Kota)', '1007873': 'Yogyakarta (Kota)',
    '1007769': 'Denpasar (Kota)', '1007798': 'Makassar (Kota)', '1007785': 'Palembang (Kota)',
    // Tambahkan ID Kabupaten/Kota/Kecamatan spesifik Anda di sini jika ada!
  };
  return locationMap[criterionId] || `ID: ${criterionId} (Perlu ditambahkan ke map)`;
}

// =================================================================
// FUNGSI UTAMA PENGENDALI PROSES (Tetap Sama)
// =================================================================
function processReport(spreadsheet, sheetName, headers, data) {
    let sheet = spreadsheet.getSheetByName(sheetName);
    let startRow = 1;

    if (!sheet) {
        sheet = spreadsheet.insertSheet(sheetName);
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold'); 
        startRow = 2;
    } else if (sheet.getLastRow() > 0) {
        startRow = sheet.getLastRow() + 1;
    }

    if (data.length > 0) {
        SpreadsheetApp.flush(); 
        sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
        
        // Logika formatting
        const costColumnIndex = headers.indexOf('Cost') + 1;
        const cpcColumnIndex = headers.indexOf('Avg CPC') + 1;
        const ctrColumnIndex = headers.indexOf('CTR') + 1;
        const valueColumnIndex = headers.indexOf('Conversions Value') + 1;
        
        // Conversions kolom mungkin membutuhkan format bilangan bulat
        const conversionIndex = headers.indexOf('Conversions') + 1;
        if (conversionIndex > 0) sheet.getRange(startRow, conversionIndex, data.length).setNumberFormat('0'); // Format bulat

        if (costColumnIndex > 0) sheet.getRange(startRow, costColumnIndex, data.length).setNumberFormat('Rp#,##0.00');
        if (cpcColumnIndex > 0) sheet.getRange(startRow, cpcColumnIndex, data.length).setNumberFormat('Rp#,##0.00');
        if (ctrColumnIndex > 0) sheet.getRange(startRow, ctrColumnIndex, data.length).setNumberFormat('0.00%');
        if (valueColumnIndex > 0) sheet.getRange(startRow, valueColumnIndex, data.length).setNumberFormat('Rp#,##0.00');

        Logger.log(`✅ Berhasil menambahkan ${data.length} baris data ke sheet: ${sheetName}`);
    } else {
        Logger.log(`⚠️ Peringatan: Data untuk rentang ini (${START_DATE} - ${END_DATE}) di sheet: ${sheetName} tidak ditemukan.`);
    }
}

// =================================================================
// FUNGSI 1: MENARIK LAPORAN AD LEVEL (AD_PERFORMANCE) 
// =================================================================
function fetchAdLevelReport(startDate, endDate, viewResource, idField, nameField) {
  Logger.log(`Menyusun Query Ad Level untuk ${viewResource}...`);
  
  const REPORT_QUERY = 
    "SELECT " +
      "segments.date, campaign.name, ad_group.name, " +
      idField + ', ' + nameField + ', ' +
      "metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.cost_micros " +
    "FROM " + viewResource +
    " WHERE segments.date BETWEEN '" + startDate + "' AND '" + endDate + "' " + 
    " ORDER BY segments.date ASC";

  const searchIterator = AdsApp.search(REPORT_QUERY); 
  const data = [];
  
  while (searchIterator.hasNext()) {
    const row = searchIterator.next();
    const cost = parseFloat(row['metrics']['costMicros']) / 1000000;
    const avgCpc = parseFloat(row['metrics']['averageCpc']) / 1000000;
    
    let adId = row['adGroupAd']['ad']['id'];
    let adName = row['adGroupAd']['ad']['name'] || 'N/A';
    
    let newRow = [
      row['segments']['date'],
      row['campaign']['name'],
      row['adGroup']['name'],
      adId,
      adName,
      parseInt(row['metrics']['clicks']), 
      parseFloat(row['metrics']['ctr']), 
      avgCpc, 
      cost
    ];
    data.push(newRow);
  }
  return data;
}

// =================================================================
// FUNGSI 2: MENARIK LAPORAN AD GROUP LEVEL (AGE/GENDER) 
// =================================================================
function fetchAdGroupLevelReport(startDate, endDate, viewResource, segmentField) {
  Logger.log(`Menyusun Query Ad Group Level untuk ${viewResource}...`);
  
  const REPORT_QUERY = 
    "SELECT " +
      "segments.date, campaign.name, ad_group.name, " +
      segmentField + ', ' +
      "metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.cost_micros " +
    "FROM " + viewResource +
    " WHERE segments.date BETWEEN '" + startDate + "' AND '" + endDate + "' " + 
    " ORDER BY segments.date ASC";

  const searchIterator = AdsApp.search(REPORT_QUERY); 
  const data = [];
  
  while (searchIterator.hasNext()) {
    const row = searchIterator.next();
    const cost = parseFloat(row['metrics']['costMicros']) / 1000000;
    const avgCpc = parseFloat(row['metrics']['averageCpc']) / 1000000;
    
    let segmentLabel = 'N/A';
    
    if (viewResource === 'age_range_view') {
      segmentLabel = row['adGroupCriterion']['ageRange']['type'].replace(/_/g, ' ');
    } else if (viewResource === 'gender_view') {
      segmentLabel = row['adGroupCriterion']['gender']['type'].replace(/_/g, ' ');
    }
    
    let newRow = [
      row['segments']['date'],
      row['campaign']['name'],
      row['adGroup']['name'],
      segmentLabel,
      parseInt(row['metrics']['clicks']), 
      parseFloat(row['metrics']['ctr']), 
      avgCpc, 
      cost
    ];
    data.push(newRow);
  }
  return data;
}

// =================================================================
// FUNGSI 3: MENARIK LAPORAN LOKASI (LOOKUP HARDCODED) 
// =================================================================
function fetchLocationReportWithScriptLookup(startDate, endDate) {
  Logger.log('Menyusun Query Location (Geographic View, Melakukan Lookup di Script)...');
  
  const REPORT_QUERY = 
    "SELECT " +
      "segments.date, " +
      "campaign.name, " +
      "ad_group.name, " +
      "geographic_view.location_type, " + 
      "geographic_view.country_criterion_id, " + 
      "metrics.clicks, metrics.ctr, metrics.average_cpc, metrics.cost_micros " +
    "FROM geographic_view " + 
    " WHERE segments.date BETWEEN '" + startDate + "' AND '" + endDate + "' " +
    " ORDER BY segments.date ASC";

  const searchIterator = AdsApp.search(REPORT_QUERY); 
  const data = [];

  while (searchIterator.hasNext()) {
    const row = searchIterator.next();
    const cost = parseFloat(row['metrics']['costMicros']) / 1000000;
    const avgCpc = parseFloat(row['metrics']['averageCpc']) / 1000000;
    
    // locationType akan berisi "LOCATION OF PRESENCE" atau "AREA OF INTEREST"
    const locationType = row['geographicView']['locationType'].replace(/_/g, ' ');
    
    const criterionId = row['geographicView']['countryCriterionId'];
    
    // Menggunakan fungsi lookup
    const locationName = getLocationName(criterionId); 

    let newRow = [
      row['segments']['date'],
      row['campaign']['name'],
      row['adGroup']['name'],
      locationName, // NAMA LOKASI DARI LOOKUP
      locationType,
      parseInt(row['metrics']['clicks']),
      parseFloat(row['metrics']['ctr']),
      avgCpc,
      cost
    ];
    
    data.push(newRow);
  }
  return data;
}


// =================================================================
// FUNGSI BARU: MENARIK LAPORAN KONVERSI RINGKAS PER JENIS
// =================================================================
function fetchSimplifiedConversionReport(startDate, endDate) {
  Logger.log('Menyusun Laporan Konversi Ringkas per Jenis (Agregasi Murni)...');

  // Query ini mengambil data dari resource 'customer' untuk memastikan agregasi di tingkat akun, 
  // sehingga hanya Date dan Conversion Action yang menjadi basis pemecahan baris data.
  const SIMPLE_CONV_QUERY =
    "SELECT " +
      "segments.date, " +
      "segments.conversion_action_name, " + 
      "metrics.conversions, metrics.conversions_value " + 
    "FROM customer " + // <--- PERUBAHAN KRITIS DI SINI (Dari 'campaign' menjadi 'customer')
    " WHERE segments.date BETWEEN '" + startDate + "' AND '" + endDate + "' " +
    " AND metrics.conversions > 0 " + 
    " ORDER BY segments.date, segments.conversion_action_name ASC";

  const searchIterator = AdsApp.search(SIMPLE_CONV_QUERY); 
  const finalData = [];
  
  while (searchIterator.hasNext()) {
    const row = searchIterator.next();
    
    // Ambil nilai konversi pecahan
    const rawConversions = parseFloat(row['metrics']['conversions']);
    
    let newRow = [
      row['segments']['date'], 
      row['segments']['conversionActionName'] || 'N/A', 
      Math.round(rawConversions), // Dibulatkan menjadi bilangan bulat
      parseFloat(row['metrics']['conversionsValue']), 
    ];
    
    finalData.push(newRow);
  }
  
  return finalData;
}
