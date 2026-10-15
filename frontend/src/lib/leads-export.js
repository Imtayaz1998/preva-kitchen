// Styled .xlsx export for the admin Leads page. exceljs is loaded only when
// someone clicks Export, so it never weighs down the admin bundle.

const BRAND = { dark: 'FF1A1612', gold: 'FFC6A15B', goldSoft: 'FFF6EEDD', ink: 'FF2A2420', muted: 'FF8A7F70', border: 'FFE4D9C4', zebra: 'FFFBF8F2' };

const TYPE_COLORS = {
  contact: 'FFDCEAF5',
  reservation: 'FFF7EBCF',
  event: 'FFF0E0F5',
  career: 'FFDDF1E3',
  newsletter: 'FFFBE4D5',
  vip: 'FFFBF0CC',
  'guest-list': 'FFE6EBF2'
};

const STATUS_COLORS = { NEW: 'FFB45309', READ: 'FF2563EB', CONFIRMED: 'FF15803D', ARCHIVED: 'FF6B7280', HIRED: 'FF15803D', PASSED: 'FF6B7280' };

// The only form extras worth a line in the sheet. Everything else a form sends
// (dates, guests, event type, role…) is already in "Interest / summary", and
// internal fields (reference, use case, SLA dates) are left out.
const EXTRA_FIELDS = [
  ['details.companyName', 'Company'],
  ['details.eventFormat', 'Event format'],
  ['details.avNeeds', 'AV needs'],
  ['details.underTwentyOne', 'Guests under 21'],
  ['details.showerType', 'Shower type'],
  ['details.barArrangement', 'Bar'],
  ['availability', 'Availability'],
  ['startDate', 'Can start'],
  ['utm.utm_source', 'Ad source'],
  ['utm.utm_campaign', 'Campaign']
];

const readable = (value) => String(value).replace(/_/g, ' ').replace(/^./, (letter) => letter.toUpperCase());

const thin = { style: 'thin', color: { argb: BRAND.border } };
const border = { top: thin, left: thin, bottom: thin, right: thin };

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export async function exportLeadsXlsx({ leads, flatten, filterLabel, fileName }) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Preva Kitchen Admin';
  workbook.created = new Date();

  const extrasFor = (lead) => {
    const flat = flatten(lead.details);
    return EXTRA_FIELDS
      .filter(([key]) => flat[key] !== undefined && flat[key] !== '')
      .map(([key, label]) => `${label}: ${typeof flat[key] === 'boolean' ? (flat[key] ? 'Yes' : 'No') : readable(flat[key])}`)
      .join('\n');
  };

  const columns = [
    { header: 'Received', key: 'received', width: 19 },
    { header: 'Lead type', key: 'type', width: 19 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 17 },
    { header: 'Interest / summary', key: 'subject', width: 36 },
    { header: 'Message', key: 'message', width: 44 },
    { header: 'Page URL', key: 'pageUrl', width: 38 },
    { header: 'CV file', key: 'cv', width: 22 },
    { header: 'Extra details', key: 'extras', width: 30 }
  ];

  const sheet = workbook.addWorksheet('Leads', {
    views: [{ state: 'frozen', ySplit: 4 }],
    properties: { defaultRowHeight: 20 },
    pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 }
  });
  sheet.columns = columns.map(({ key, width }) => ({ key, width }));
  const lastColumn = sheet.getColumn(columns.length).letter;

  // Title band.
  sheet.mergeCells(`A1:${lastColumn}1`);
  const title = sheet.getCell('A1');
  title.value = 'Preva Kitchen — Website Leads';
  title.font = { name: 'Calibri', size: 18, bold: true, color: { argb: BRAND.gold } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };
  title.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(1).height = 34;

  sheet.mergeCells(`A2:${lastColumn}2`);
  const subtitle = sheet.getCell('A2');
  subtitle.value = `Exported ${new Date().toLocaleString()}  ·  ${leads.length} lead${leads.length === 1 ? '' : 's'}  ·  ${filterLabel}`;
  subtitle.font = { size: 10, italic: true, color: { argb: 'FFD9CBB0' } };
  subtitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };
  subtitle.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(2).height = 20;
  sheet.getRow(3).height = 8;

  // Header row.
  const header = sheet.getRow(4);
  header.values = columns.map((column) => column.header);
  header.height = 26;
  header.eachCell((cell) => {
    cell.font = { bold: true, size: 11, color: { argb: BRAND.dark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.gold } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
    cell.border = border;
  });
  sheet.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4, column: columns.length } };

  leads.forEach((lead, index) => {
    const values = {
      received: toDate(lead.createdAt),
      type: lead.typeLabel,
      status: String(lead.status || '').replaceAll('_', ' '),
      name: lead.name || '',
      email: lead.email ? { text: lead.email, hyperlink: `mailto:${lead.email}` } : '',
      phone: lead.phone || '',
      subject: lead.subject || '',
      message: lead.message || '',
      pageUrl: lead.pageUrl ? { text: lead.pageUrl, hyperlink: lead.pageUrl } : '',
      cv: lead.resume?.name || '',
      extras: extrasFor(lead)
    };

    const row = sheet.addRow(values);
    const zebra = index % 2 === 1;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = border;
      cell.alignment = { vertical: 'top', wrapText: true, indent: 1 };
      cell.font = { size: 10.5, color: { argb: BRAND.ink } };
      if (zebra) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.zebra } };
      if (cell.value instanceof Date) cell.numFmt = 'dd mmm yyyy, hh:mm';
    });
    // Phone numbers stay text so Excel never shows 9.12E+09.
    row.getCell('phone').numFmt = '@';

    const typeCell = row.getCell('type');
    typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TYPE_COLORS[lead.type] || BRAND.goldSoft } };
    typeCell.font = { size: 10.5, bold: true, color: { argb: BRAND.ink } };

    const statusCell = row.getCell('status');
    statusCell.font = { size: 10.5, bold: true, color: { argb: STATUS_COLORS[lead.status] || BRAND.ink } };

    row.getCell('name').font = { size: 10.5, bold: true, color: { argb: BRAND.ink } };
    for (const key of ['email', 'pageUrl']) {
      if (row.getCell(key).value) row.getCell(key).font = { size: 10.5, color: { argb: 'FF1D4ED8' }, underline: true };
    }
  });

  // Summary sheet: counts by type and status.
  const summary = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
  summary.columns = [{ width: 26 }, { width: 12 }, { width: 4 }, { width: 22 }, { width: 12 }];
  summary.mergeCells('A1:E1');
  const summaryTitle = summary.getCell('A1');
  summaryTitle.value = 'Leads summary';
  summaryTitle.font = { size: 16, bold: true, color: { argb: BRAND.gold } };
  summaryTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.dark } };
  summaryTitle.alignment = { vertical: 'middle', indent: 1 };
  summary.getRow(1).height = 30;

  const tally = (pick) => Object.entries(leads.reduce((counts, lead) => ({ ...counts, [pick(lead)]: (counts[pick(lead)] || 0) + 1 }), {})).sort((a, b) => b[1] - a[1]);
  const writeTable = (startColumn, heading, rows) => {
    const headRow = summary.getRow(3);
    [heading, 'Leads'].forEach((text, offset) => {
      const cell = headRow.getCell(startColumn + offset);
      cell.value = text;
      cell.font = { bold: true, color: { argb: BRAND.dark } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.gold } };
      cell.border = border;
      cell.alignment = { indent: 1 };
    });
    [...rows, ['Total', leads.length]].forEach(([label, count], offset) => {
      const row = summary.getRow(4 + offset);
      const isTotal = offset === rows.length;
      [label, count].forEach((value, column) => {
        const cell = row.getCell(startColumn + column);
        cell.value = value;
        cell.border = border;
        cell.alignment = { indent: 1 };
        cell.font = { bold: isTotal, color: { argb: BRAND.ink } };
        if (isTotal) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND.goldSoft } };
      });
    });
  };
  writeTable(1, 'Lead type', tally((lead) => lead.typeLabel));
  writeTable(4, 'Status', tally((lead) => String(lead.status || '').replaceAll('_', ' ')));

  const buffer = await workbook.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
