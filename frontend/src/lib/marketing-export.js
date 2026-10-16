// Contact-list exports for the admin Marketing dashboard: one row per person
// (deduplicated by email, then phone), ready for a mailing / ads tool.
// exceljs is loaded only when someone clicks Export.

const BRAND = { dark: 'FF1A1612', gold: 'FFC6A15B', ink: 'FF2A2420', border: 'FFE4D9C4', zebra: 'FFFBF8F2' };

const COLUMNS = [
  { header: 'Name', key: 'name', width: 24 },
  { header: 'Email', key: 'email', width: 32 },
  { header: 'Phone', key: 'phone', width: 18 },
  { header: 'Interested in', key: 'types', width: 30 },
  { header: 'Latest enquiry', key: 'interest', width: 38 },
  { header: 'Leads', key: 'count', width: 8 },
  { header: 'First seen', key: 'firstAt', width: 18 },
  { header: 'Last seen', key: 'lastAt', width: 18 },
  { header: 'Last page', key: 'lastPage', width: 38 },
  { header: 'Ad source', key: 'utmSource', width: 16 },
  { header: 'Campaign', key: 'utmCampaign', width: 20 }
];

const rowValues = (contact) => ({
  name: contact.name || '',
  email: contact.email || '',
  phone: contact.phone || '',
  types: contact.typeLabels.join(', '),
  interest: contact.interests[0] || '',
  count: contact.count,
  firstAt: contact.firstAt || null,
  lastAt: contact.lastAt || null,
  lastPage: contact.lastPage || '',
  utmSource: contact.utmSource || '',
  utmCampaign: contact.utmCampaign || ''
});

function download(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportContactsCsv({ contacts, fileName }) {
  const cell = (value) => {
    const text = value instanceof Date ? value.toISOString().slice(0, 16).replace('T', ' ') : String(value ?? '');
    return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const lines = [
    COLUMNS.map((column) => cell(column.header)).join(','),
    ...contacts.map((contact) => {
      const values = rowValues(contact);
      return COLUMNS.map((column) => cell(values[column.key])).join(',');
    })
  ];
  // BOM so Excel opens accented names correctly.
  download(new Blob([`﻿${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }), fileName);
}

export async function exportContactsXlsx({ contacts, filterLabel, fileName }) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Preva Kitchen Admin';
  workbook.created = new Date();

  const thin = { style: 'thin', color: { argb: BRAND.border } };
  const border = { top: thin, left: thin, bottom: thin, right: thin };

  const sheet = workbook.addWorksheet('Contacts', {
    views: [{ state: 'frozen', ySplit: 4 }],
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });
  sheet.columns = COLUMNS.map(({ key, width }) => ({ key, width }));
  const lastColumn = sheet.getColumn(COLUMNS.length).letter;

  sheet.mergeCells(`A1:${lastColumn}1`);
  const title = sheet.getCell('A1');
  title.value = 'Preva Kitchen — Marketing Contacts';
  title.font = { size: 18, bold: true, color: { argb: BRAND.gold } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };
  title.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(1).height = 34;

  sheet.mergeCells(`A2:${lastColumn}2`);
  const subtitle = sheet.getCell('A2');
  subtitle.value = `Exported ${new Date().toLocaleString()}  ·  ${contacts.length} contact${contacts.length === 1 ? '' : 's'}  ·  ${filterLabel}`;
  subtitle.font = { size: 10, italic: true, color: { argb: 'FFD9CBB0' } };
  subtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };
  subtitle.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(3).height = 8;

  const header = sheet.getRow(4);
  header.values = COLUMNS.map((column) => column.header);
  header.height = 26;
  header.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: BRAND.dark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.gold } };
    cell.alignment = { vertical: 'middle', indent: 1 };
    cell.border = border;
  });
  sheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: COLUMNS.length } };

  contacts.forEach((contact, index) => {
    const values = rowValues(contact);
    if (values.email) values.email = { text: values.email, hyperlink: `mailto:${values.email}` };
    if (values.lastPage) values.lastPage = { text: values.lastPage, hyperlink: values.lastPage };
    const row = sheet.addRow(values);
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = border;
      cell.alignment = { vertical: 'top', wrapText: true, indent: 1 };
      cell.font = { size: 10.5, color: { argb: BRAND.ink } };
      if (index % 2 === 1) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.zebra } };
      if (cell.value instanceof Date) cell.numFmt = 'dd mmm yyyy';
    });
    // Phone numbers stay text so Excel never shows 9.12E+09.
    row.getCell('phone').numFmt = '@';
    row.getCell('name').font = { size: 10.5, bold: true, color: { argb: BRAND.ink } };
    for (const key of ['email', 'lastPage']) {
      if (row.getCell(key).value) row.getCell(key).font = { size: 10.5, color: { argb: 'FF1D4ED8' }, underline: true };
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  download(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
}
