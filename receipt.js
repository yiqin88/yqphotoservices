/* ─────────────────────────────────────────────────────────────────────
 * YQ Photo Services — receipt PDF generator
 * Exposes: window.YQReceipt.generate(opts) → { blob, filename, dataUrl }
 *
 * Format mirrors the existing NTU receipt:
 *   - "PAID" stamp + brand header + studio address
 *   - Receipt No: RCP-<orderId suffix>   (e.g. RCP-2604121234)
 *   - Receipt Date: today
 *   - Ref Invoice: INV-<orderId suffix>
 *   - Payment Method: PayNow / Bank Transfer
 *   - Received From: customer-supplied multi-line block
 *   - Line items table + subtotal / discount / total
 *   - Thank-you footer
 * ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const A4 = { w: 210, h: 297 }; // mm
  const M  = 18;                 // outer margin
  const ACCENT = [200, 95, 50];  // terracotta-ish RGB
  const INK    = [26, 22, 18];
  const SOFT   = [120, 105, 90];
  const LINE   = [210, 200, 180];

  function todayString() {
    const d = new Date();
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function suffixFromOrderId(orderId) {
    // YQ-2604121234 → 2604121234
    return String(orderId || '').replace(/^YQ-/, '');
  }

  // ── Public API ────────────────────────────────────────────────
  function generate(opts) {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      throw new Error('jsPDF not loaded — cannot generate receipt');
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });

    const orderId   = opts.orderId || 'YQ-UNKNOWN';
    const suffix    = suffixFromOrderId(orderId);
    const receiptNo = `RCP-${suffix}`;
    const invoiceNo = `INV-${suffix}`;
    const receivedFrom = (opts.receivedFrom || '').trim() || '(not provided)';
    const lines        = opts.lines || [];      // [{ description, qty, unitPrice }]
    const subtotal     = +opts.subtotal || 0;
    const discountPct  = +opts.discountPct || 0;
    const discountAmt  = +opts.discountAmount || 0;
    const total        = +opts.total || 0;

    let y = M;

    // ── Top bar: brand on left, PAID stamp on right ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...INK);
    doc.text('YQ PHOTO SERVICES', M, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...SOFT);
    doc.text('R E C E I P T', M, y + 11);

    // PAID stamp (rotated, terracotta outlined)
    doc.saveGraphicsState && doc.saveGraphicsState();
    doc.setDrawColor(...ACCENT);
    doc.setTextColor(...ACCENT);
    doc.setLineWidth(0.8);
    const stampX = A4.w - M - 28;
    const stampY = y + 2;
    doc.roundedRect(stampX, stampY, 28, 12, 1.5, 1.5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PAID', stampX + 14, stampY + 8.5, { align: 'center' });
    doc.restoreGraphicsState && doc.restoreGraphicsState();

    y += 18;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, y, A4.w - M, y);
    y += 6;

    // ── Studio address block ──
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text('YQ Photo Services', M, y);
    y += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SOFT);
    doc.setFontSize(9);
    doc.text('587 Woodlands Drive 16, Singapore 730587', M, y);
    y += 4;
    doc.text('Email: yiqin88@outlook.com', M, y);
    y += 10;

    // ── Meta grid: receipt no / date / invoice / payment method ──
    const labelStyle = () => { doc.setFont('helvetica', 'bold');   doc.setFontSize(8);  doc.setTextColor(...SOFT); };
    const valueStyle = () => { doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...INK); };

    const colW = (A4.w - 2 * M) / 2;
    const drawMetaRow = (l1, v1, l2, v2) => {
      labelStyle();  doc.text(l1, M, y);                doc.text(l2, M + colW, y);
      valueStyle();  doc.text(v1, M, y + 4.5);          doc.text(v2, M + colW, y + 4.5);
      y += 11;
    };
    drawMetaRow('RECEIPT NO.', receiptNo,            'RECEIPT DATE',   todayString());
    drawMetaRow('REF. INVOICE', invoiceNo,           'PAYMENT METHOD', 'PayNow / Bank Transfer');

    y += 2;

    // ── Received From ──
    labelStyle();
    doc.text('RECEIVED FROM', M, y);
    y += 5;
    valueStyle();
    doc.setFontSize(10);
    const recLines = doc.splitTextToSize(receivedFrom, A4.w - 2 * M);
    doc.text(recLines, M, y);
    y += recLines.length * 4.7 + 6;

    // ── Payment For (line items table) ──
    labelStyle();
    doc.text('PAYMENT FOR', M, y);
    y += 5;

    // Table header
    const colNo  = M;
    const colDesc = M + 10;
    const colQty = A4.w - M - 60;
    const colUnit = A4.w - M - 38;
    const colAmt = A4.w - M;

    doc.setFillColor(245, 240, 230);
    doc.rect(M, y, A4.w - 2 * M, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text('No.', colNo + 1, y + 5.3);
    doc.text('Description', colDesc, y + 5.3);
    doc.text('Qty', colQty, y + 5.3, { align: 'right' });
    doc.text('Unit Price (SGD)', colUnit, y + 5.3, { align: 'right' });
    doc.text('Amount (SGD)', colAmt, y + 5.3, { align: 'right' });
    y += 9;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    lines.forEach((line, idx) => {
      const amt = (line.qty * line.unitPrice).toFixed(2);
      doc.text(String(idx + 1), colNo + 1, y + 4.5);
      const descLines = doc.splitTextToSize(line.description, colQty - colDesc - 4);
      doc.text(descLines, colDesc, y + 4.5);
      doc.text(String(line.qty),               colQty, y + 4.5, { align: 'right' });
      doc.text(line.unitPrice.toFixed(2),      colUnit, y + 4.5, { align: 'right' });
      doc.text(amt,                            colAmt, y + 4.5, { align: 'right' });
      const rowH = Math.max(7, descLines.length * 4.7 + 2);
      y += rowH;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.15);
      doc.line(M, y, A4.w - M, y);
    });

    y += 4;

    // ── Totals (right-aligned) ──
    const drawTotalRow = (label, value, opts2 = {}) => {
      doc.setFont('helvetica', opts2.bold ? 'bold' : 'normal');
      doc.setFontSize(opts2.big ? 11 : 10);
      doc.setTextColor(...(opts2.accent ? ACCENT : INK));
      doc.text(label, A4.w - M - 50, y, { align: 'right' });
      doc.text(value, A4.w - M, y, { align: 'right' });
      y += opts2.big ? 7 : 5.5;
    };
    drawTotalRow('Subtotal',   `SGD ${subtotal.toFixed(2)}`);
    if (discountAmt > 0) {
      drawTotalRow(`Discount (${discountPct}%)`, `− SGD ${discountAmt.toFixed(2)}`, { accent: true });
    }
    y += 1;
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.4);
    doc.line(A4.w - M - 60, y, A4.w - M, y);
    y += 5;
    drawTotalRow('Total Paid', `SGD ${total.toFixed(2)}`, { bold: true, big: true });

    y += 14;

    // ── Footer ──
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text('Thank you for your order!', M, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...SOFT);
    doc.text('This receipt confirms that the above payment has been received in full.', M, y);
    y += 4;
    doc.text('For any enquiries, please contact us at yiqin88@outlook.com.', M, y);

    const blob = doc.output('blob');
    const filename = `YQReceipt_${suffix}.pdf`;
    return { blob, filename, receiptNo, invoiceNo };
  }

  window.YQReceipt = { generate, suffixFromOrderId };
})();
