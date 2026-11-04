/* ─────────────────────────────────────────────────────────────────────
 * YQ Photo Services — A4 sublimation sheets
 * Packs every printed side of every personalised-gift design (× quantity)
 * onto A4 pages at ACTUAL SIZE, mirrored for sublimation transfer, with
 * crop marks at each piece's bleed corners. Output: one A4 PDF per sheet,
 * so the Mac prints it at 100% (no "scale to fit" surprises).
 *
 *   YQSheets.build(items, { orderId }) → [{ blob, name, caption }]
 *   items: [{ blob, wMm, hMm, label }]   (blob = full-bleed JPEG/PNG at any dpi)
 *   YQSheets.itemsFromOrder(cart, designs, products) → items
 * Needs window.jspdf (already loaded on index.html).
 * ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const A4_W = 210, A4_H = 297;     // mm, portrait
  const MARGIN = 8;                 // keep clear of the printer's unprintable edge
  const FOOTER = 7;                 // space for the sheet label at the bottom
  const GAP = 6;                    // room between pieces for crop marks
  const DPI = 300;
  const px = (mm) => Math.round(mm / 25.4 * DPI);

  function itemsFromOrder(cart, designs, products) {
    const items = [];
    (cart || []).filter((c) => String(c.key).startsWith('MAG-')).forEach((line, i) => {
      const d = designs.find((x) => 'MAG-' + x.id === line.key);
      if (!d || !d.sides) return;
      const p = products[d.product] || products.magnet;
      d.sides.forEach((side) => {
        for (let q = 0; q < line.qty; q++) {
          items.push({
            blob: side.blob,
            wMm: p.widthMm + 2 * p.bleedMm,
            hMm: p.heightMm + 2 * p.bleedMm,
            label: `${p.label} #${i + 1}${p.sides.length > 1 ? ' ' + side.name.toUpperCase() : ''}`,
          });
        }
      });
    });
    return items;
  }

  // Shelf packing, tallest first. Returns pages of placements in mm (unmirrored coordinates).
  function pack(items) {
    const right = A4_W - MARGIN, bottom = A4_H - MARGIN - FOOTER;
    const order = items.map((it, i) => ({ ...it, i })).sort((a, b) => b.hMm - a.hMm || b.wMm - a.wMm);
    const pages = [];
    let page = null, x = 0, y = 0, shelfH = 0;
    const newPage = () => { page = []; pages.push(page); x = MARGIN; y = MARGIN; shelfH = 0; };
    newPage();
    for (const it of order) {
      if (it.wMm > right - MARGIN || it.hMm > bottom - MARGIN) throw new Error(`${it.label} is larger than A4`);
      if (x + it.wMm > right) { x = MARGIN; y += shelfH + GAP; shelfH = 0; }
      if (y + it.hMm > bottom) newPage();
      page.push({ ...it, x, y });
      x += it.wMm + GAP;
      shelfH = Math.max(shelfH, it.hMm);
    }
    return pages.filter((p) => p.length);
  }

  async function bitmap(blob) {
    if (window.createImageBitmap) return createImageBitmap(blob);
    return new Promise((res, rej) => {
      const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(blob);
    });
  }

  async function build(items, { orderId }) {
    const JsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!JsPDF) throw new Error('jsPDF not loaded');
    const pages = pack(items);
    const out = [];
    for (let n = 0; n < pages.length; n++) {
      const c = document.createElement('canvas');
      c.width = px(A4_W); c.height = px(A4_H);
      const g = c.getContext('2d');
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, c.width, c.height);
      g.imageSmoothingQuality = 'high';
      for (const it of pages[n]) {
        const bm = await bitmap(it.blob);
        const mx = A4_W - it.x - it.wMm;              // mirrored x position
        g.save();
        g.translate(px(mx + it.wMm), px(it.y));
        g.scale(-1, 1);                                // mirror for sublimation
        g.drawImage(bm, 0, 0, px(it.wMm), px(it.hMm));
        g.restore();
        // crop marks just outside the bleed box corners
        g.strokeStyle = '#000'; g.lineWidth = px(0.2);
        const L = px(3), o = px(1);
        const x0 = px(mx), y0 = px(it.y), x1 = px(mx + it.wMm), y1 = px(it.y + it.hMm);
        g.beginPath();
        [[x0, y0, -1, -1], [x1, y0, 1, -1], [x0, y1, -1, 1], [x1, y1, 1, 1]].forEach(([cx, cy, sx, sy]) => {
          g.moveTo(cx + sx * o, cy); g.lineTo(cx + sx * (o + L), cy);
          g.moveTo(cx, cy + sy * o); g.lineTo(cx, cy + sy * (o + L));
        });
        g.stroke();
      }
      // footer label (readable, not mirrored)
      g.fillStyle = '#888';
      g.font = `${px(2.6)}px Arial, sans-serif`;
      g.fillText(`${orderId} · sheet ${n + 1}/${pages.length} · MIRRORED for sublimation · print at 100% (actual size) on A4`,
        px(MARGIN), px(A4_H - MARGIN + 1));

      const pdf = new JsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      pdf.addImage(c.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, A4_W, A4_H);
      const blob = pdf.output('blob');
      const counts = {};
      pages[n].forEach((it) => { counts[it.label] = (counts[it.label] || 0) + 1; });
      const lines = Object.entries(counts).map(([l, k]) => `• ${l} ×${k}`).join('\n');
      out.push({
        blob,
        name: `${orderId}_A4_sheet${n + 1}of${pages.length}_mirrored.pdf`,
        caption: `🖨 ${orderId} — A4 sheet ${n + 1}/${pages.length}\nMirrored · actual size · print at 100%\n${lines}`,
      });
    }
    return out;
  }

  window.YQSheets = { build, pack, itemsFromOrder };
})();
