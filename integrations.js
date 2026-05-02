/* ─────────────────────────────────────────────────────────────────────
 * YQ Photo Services — order integrations
 * Exposes: window.YQOrders.submit(order) → Promise<{orderId, channels}>
 *
 * Channels (each independent — one failing won't block the others):
 *   1. Telegram order text  → Cloudflare Worker /notify
 *   2. Telegram payment proof image → Cloudflare Worker /notify-photo
 *   3. Owner email          → EmailJS template_nmg5kic
 *   4. Customer email       → EmailJS template_8ml0man
 *   5. Google Sheets webhook (no-cors fire-and-forget)
 * ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const WORKER_URL        = 'https://yq-photo-worker.yiqin11nov2024.workers.dev';
  const EMAILJS_SERVICE   = 'service_zbcnj0t';
  const EMAILJS_OWNER_T   = 'template_nmg5kic';
  const EMAILJS_CUST_T    = 'template_8ml0man';
  const EMAILJS_PUBLIC    = 'kx-mDFrtVvl8HoHzW';
  const SHEETS_WEBHOOK    = 'https://script.google.com/macros/s/AKfycbxrpZK3Mq4DFUvCDiAYQ4oUXOaHJoAZ_U0hNVAchdNWgPdJ89eNo6WKXvwqoxpzmeSA/exec';
  const DELIVERY_FEE      = 2.50;

  // Init EmailJS once it loads
  function initEmailJS() {
    if (window.emailjs && typeof window.emailjs.init === 'function') {
      try { window.emailjs.init(EMAILJS_PUBLIC); console.log('[YQ] EmailJS initialised'); }
      catch (e) { console.warn('[YQ] EmailJS init failed:', e); }
    } else {
      // Try again shortly — script may still be loading
      setTimeout(initEmailJS, 250);
    }
  }
  initEmailJS();

  // YQ-YYMMDDHHSS (matches original site)
  function generateOrderId() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return 'YQ-' +
      String(now.getFullYear()).slice(-2) +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getSeconds());
  }

  function buildItemsText(cart, isMail) {
    const lines = cart.map((item) => {
      const sizeDisplay = item.sizeDisplay || item.label || item.key || item.size || 'Item';
      const sizeCode    = item.size || item.key || '';
      const lineTotal   = (item.qty * item.price).toFixed(2);
      return `${sizeDisplay} (${sizeCode}) × ${item.qty} = SGD $${lineTotal}`;
    });
    if (isMail) lines.push(`SingPost Tracked Mailing = SGD $${DELIVERY_FEE.toFixed(2)}`);
    return lines.join('\n');
  }

  function deliveryLabel(order) {
    if (order.delivery === 'mail') {
      const lines = [`SingPost Tracked Mailing (+$${DELIVERY_FEE.toFixed(2)})`];
      if (order.mailingName)    lines.push(`Name: ${order.mailingName}`);
      if (order.mailingPhone)   lines.push(`Phone: ${order.mailingPhone}`);
      if (order.mailingAddress) lines.push(`Address: ${order.mailingAddress}`);
      return lines.join('\n');
    }
    return 'Self Collection — 587 Woodlands Drive 16';
  }

  // ── 1. Telegram text ──────────────────────────────────────────
  async function sendTelegramText(order, itemsText, deliveryStr) {
    const telegramMsg =
`🎉 New YQ Photo Order!

🆔 Order: ${order.orderId}
👤 Name: ${order.name}
🛍 Carousell: ${order.carousell || '(not provided)'}
📧 Email: ${order.email}
📱 Phone: ${order.phone || 'N/A'}
🚚 Delivery: ${deliveryStr}

📦 ITEMS:
${itemsText}

💰 Total: SGD $${order.total.toFixed(2)}

📅 Expected Date: ${order.expectedDate || 'Not specified'}
🔗 Drive: ${order.driveLink || '(not provided)'}
📝 Photo Notes: ${order.photoNotes || '(not provided)'}
💬 Special Requests: ${order.notes || '(not provided)'}
📎 Payment Proof: ${order.proofFile ? 'Uploaded ✓' : 'Not uploaded'}`;

    const res = await fetch(WORKER_URL + '/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: telegramMsg }),
    });
    return res.json();
  }

  // ── 2. Telegram photo (payment proof) ─────────────────────────
  // Caption includes the full order summary — if the separate /notify
  // text message fails, this single image+caption still tells you
  // everything you need to fulfill the order.
  // Telegram caption max = 1024 chars; we trim if needed.
  async function sendTelegramPhoto(order, itemsText, deliveryStr) {
    if (!order.proofFile) return { ok: false, skipped: 'no proof file' };

    let caption =
`💳 Payment proof — ${order.orderId}

👤 ${order.name}${order.phone ? ' · ' + order.phone : ''}
🛍 Carousell: ${order.carousell || '(not provided)'}
🚚 ${deliveryStr}

📦 ${itemsText}

💰 Total: SGD $${order.total.toFixed(2)}
🔗 Drive: ${order.driveLink || '(not provided)'}`;

    // Telegram caption hard limit is 1024 chars
    if (caption.length > 1020) caption = caption.slice(0, 1017) + '...';

    const fd = new FormData();
    fd.append('photo', order.proofFile, order.proofFile.name || 'payment-proof.jpg');
    fd.append('caption', caption);
    const res = await fetch(WORKER_URL + '/notify-photo', {
      method: 'POST',
      body: fd,
    });
    return res.json();
  }

  // ── 2b. Telegram receipt PDF ─────────────────────────────────
  // Sent only when customer ticks "I need a receipt".
  // Caption includes order ID, customer details, and a forward hint.
  async function sendTelegramReceipt(order) {
    if (!order.receiptFile) return { skipped: 'no receipt' };
    try {
      const caption =
`🧾 Receipt PDF — ${order.orderId}

👤 ${order.name}${order.email ? ' · ' + order.email : ''}
💰 SGD $${order.total.toFixed(2)}

➡️ Forward this PDF to the customer for their records.`;

      const fd = new FormData();
      fd.append('document', order.receiptFile, order.receiptName || `YQReceipt_${order.orderId}.pdf`);
      fd.append('caption', caption);
      const res = await fetch(WORKER_URL + '/notify-doc', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) return { ok: false, status: res.status, hint: 'check /notify-doc endpoint on Worker' };
      return res.json();
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  // ── 3. Owner email ────────────────────────────────────────────
  async function sendOwnerEmail(order, itemsText, deliveryStr) {
    if (!window.emailjs) throw new Error('EmailJS not loaded');
    return window.emailjs.send(EMAILJS_SERVICE, EMAILJS_OWNER_T, {
      order_id:        order.orderId,
      customer_name:   order.name,
      carousell_name:  order.carousell || '(not provided)',
      customer_email:  order.email,
      phone:           order.phone || 'N/A',
      delivery_method: deliveryStr,
      items:           itemsText,
      total:           order.total.toFixed(2),
      expected_date:   order.expectedDate || 'Not specified',
      drive_link:      order.driveLink || '(not provided)',
      photo_notes:     order.photoNotes || '(not provided)',
      notes:           order.notes || '(not provided)',
    });
  }

  // ── 4. Customer email ────────────────────────────────────────
  async function sendCustomerEmail(order, itemsText, deliveryStr) {
    if (!window.emailjs) throw new Error('EmailJS not loaded');
    if (!order.email || order.email === '-') return { skipped: 'no email' };
    return window.emailjs.send(EMAILJS_SERVICE, EMAILJS_CUST_T, {
      order_id:        order.orderId,
      customer_name:   order.name,
      carousell_name:  order.carousell || '(not provided)',
      customer_email:  order.email,
      phone:           order.phone || 'N/A',
      delivery_method: deliveryStr,
      items:           itemsText,
      total:           order.total.toFixed(2),
      expected_date:   order.expectedDate || 'Not specified',
      drive_link:      order.driveLink || '(not provided)',
      photo_notes:     'Please organise your Google Drive folder with subfolders or renamed files by size.',
      notes:           order.notes || '(not provided)',
      extra_message:   'DISCLAIMER: This is NOT a final receipt. YQ Photo Services will validate your payment before confirming your order. Please message us on Carousell with your Order Number: ' + order.orderId,
    });
  }

  // ── 5. Google Sheets (no-cors fire-and-forget) ───────────────
  function logToSheets(order, itemsText, deliveryStr) {
    try {
      const sheetsData = {
        order_id:      order.orderId,
        date:          new Date().toLocaleString('en-SG', { timeZone: 'Asia/Singapore' }),
        customer_name: order.name,
        carousell:     order.carousell || '',
        email:         order.email,
        phone:         order.phone || 'N/A',
        delivery:      deliveryStr,
        items:         itemsText,
        total:         order.total.toFixed(2),
        drive_link:    order.driveLink || '(not provided)',
        expected_date: order.expectedDate || 'Not specified',
        notes:         order.notes || '',
      };
      // no-cors: response is opaque, so we can't read result — but it does fire
      fetch(SHEETS_WEBHOOK, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetsData),
      });
      return { ok: true, note: 'fire-and-forget (no-cors)' };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  // ── Public API ────────────────────────────────────────────────
  async function submit(order) {
    if (!order || typeof order !== 'object') {
      throw new Error('submit() requires an order object');
    }
    if (!order.orderId)  order.orderId = generateOrderId();
    if (typeof order.total !== 'number') {
      const subtotal = (order.cart || []).reduce((s, c) => s + c.qty * c.price, 0);
      order.total = subtotal + (order.delivery === 'mail' ? DELIVERY_FEE : 0);
    }

    const itemsText   = buildItemsText(order.cart || [], order.delivery === 'mail');
    const deliveryStr = deliveryLabel(order);
    const channels = {};

    // Run in parallel where possible — but each isolated so one failure ≠ total failure
    const tasks = [
      sendTelegramText(order, itemsText, deliveryStr)
        .then(r => channels.telegram_text   = { ok: !!(r && r.ok), data: r })
        .catch(e => channels.telegram_text  = { ok: false, error: e.message }),
      sendTelegramPhoto(order, itemsText, deliveryStr)
        .then(r => channels.telegram_photo  = { ok: !!(r && r.ok), data: r })
        .catch(e => channels.telegram_photo = { ok: false, error: e.message }),
      sendTelegramReceipt(order)
        .then(r => channels.telegram_receipt = { ok: !!(r && r.ok), data: r })
        .catch(e => channels.telegram_receipt = { ok: false, error: e.message }),
      sendOwnerEmail(order, itemsText, deliveryStr)
        .then(r => channels.owner_email     = { ok: true, status: r && r.status })
        .catch(e => channels.owner_email    = { ok: false, error: e.message }),
      sendCustomerEmail(order, itemsText, deliveryStr)
        .then(r => channels.customer_email  = { ok: true, status: r && r.status, skipped: r && r.skipped })
        .catch(e => channels.customer_email = { ok: false, error: e.message }),
    ];

    // Sheets is fire-and-forget; don't await
    channels.sheets = logToSheets(order, itemsText, deliveryStr);

    // Wait for all channels — none reject the outer promise; we return the verdict map
    await Promise.allSettled(tasks);

    console.log('[YQ] Order submitted:', order.orderId, channels);
    return { orderId: order.orderId, channels };
  }

  window.YQOrders = { submit, generateOrderId, DELIVERY_FEE };
})();
