// Генерація прайс-файлу Excel з фото для трьох груп товарів Termojet
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const d = require(path.join(ROOT, 'backend/seed-products.json'));
const arr = Array.isArray(d) ? d : (d.products || Object.values(d));

const byName = (n) => arr.find(p => p.name && p.name.trim() === n.trim());
const byCat = (slug) => arr.filter(p => p.categorySlug === slug);

// Три групи в порядку запиту
const groups = [
  { title: 'Зональне керування', items: byCat('zonalne-keruvannya') },
  { title: 'Сепаратори повітря та бруду', items: byCat('separatory') },
  { title: 'Кран для розширювального баку', items: [byName('Запірний кран Dn20 (3/4"M) Termojet')].filter(Boolean) },
];

function clean(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')      // прибрати HTML-теги
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveImg(p) {
  let img = (p.images && p.images[0]) || p.image || '';
  if (!img) return null;
  const rel = img.replace(/^\//, '');
  const full = path.join(PUBLIC, rel);
  if (fs.existsSync(full)) return full;
  return null;
}

(async () => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Termojet';
  const ws = wb.addWorksheet('Прайс', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { header: '№', key: 'n', width: 5 },
    { header: 'Фото', key: 'photo', width: 16 },
    { header: 'Назва', key: 'name', width: 52 },
    { header: 'Артикул', key: 'sku', width: 18 },
    { header: 'Ціна, €', key: 'price', width: 11 },
    { header: 'Опис', key: 'desc', width: 80 },
  ];

  // Стиль шапки
  const head = ws.getRow(1);
  head.height = 22;
  head.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
  head.alignment = { vertical: 'middle', horizontal: 'center' };
  head.eachCell(c => {
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } };
    c.border = { bottom: { style: 'thin', color: { argb: 'FF999999' } } };
  });

  let rowIdx = 2;
  let counter = 0;
  let imgCount = 0, missImg = 0;

  for (const g of groups) {
    // Рядок-заголовок секції
    const secRow = ws.getRow(rowIdx);
    secRow.getCell(1).value = `${g.title}  (${g.items.length} поз.)`;
    ws.mergeCells(rowIdx, 1, rowIdx, 6);
    secRow.height = 20;
    secRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF1F4E79' } };
    secRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    secRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCE6F1' } };
    rowIdx++;

    for (const p of g.items) {
      counter++;
      const row = ws.getRow(rowIdx);
      row.height = 90;
      row.getCell(1).value = counter;
      row.getCell(3).value = clean(p.name);
      row.getCell(4).value = p.sku || '';
      row.getCell(5).value = typeof p.price === 'number' ? p.price : parseFloat(p.price) || null;
      row.getCell(5).numFmt = '#,##0.0 "€"';
      row.getCell(6).value = clean(p.shortDesc || p.description).slice(0, 1000);

      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(6).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
      for (let c = 1; c <= 6; c++) {
        row.getCell(c).border = { bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } } };
      }

      // Фото
      const imgPath = resolveImg(p);
      if (imgPath) {
        try {
          const ext = path.extname(imgPath).slice(1).toLowerCase();
          const extId = ext === 'jpg' ? 'jpeg' : ext;
          const id = wb.addImage({ filename: imgPath, extension: extId });
          ws.addImage(id, {
            tl: { col: 1.1, row: rowIdx - 1 + 0.05 },
            ext: { width: 105, height: 105 },
            editAs: 'oneCell',
          });
          imgCount++;
        } catch (e) {
          missImg++;
          row.getCell(2).value = '(фото?)';
        }
      } else {
        missImg++;
        row.getCell(2).value = '(нема фото)';
      }
      rowIdx++;
    }
  }

  const out = path.join(ROOT, '_zvity', 'Termojet-прайс-зональне-сепаратори-кран.xlsx');
  await wb.xlsx.writeFile(out);
  console.log('Готово:', out);
  console.log('Товарів:', counter, '| фото вставлено:', imgCount, '| без фото:', missImg);
})();
