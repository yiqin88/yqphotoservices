/* ─────────────────────────────────────────────────────────────────────
 * YQ Photo Services — self-service gift designer
 * Usage on a page: <div id="app"></div><script>YQDesigner.mount('magnet')</script>
 * Products, sizes and prices live in magnet-store.js (window.YQMagnets.products).
 * ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  function mount(productId) {
    const M = window.YQMagnets;
    const P = M.products[productId];
    const BOX_W = P.widthMm + 2 * P.bleedMm;
    const BOX_H = P.heightMm + 2 * P.bleedMm;
    const MAX_SRC = 3000;
    const ZMIN = 1, ZMAX = 5;
    const isHeart = P.shape === 'heart';
    const TEXT_MIN = isHeart ? -18 : -30, TEXT_MAX = isHeart ? 30 : 34;
    const fmt = (n) => '$' + n.toFixed(2);
    const cm = (mm) => (mm / 10).toFixed(1).replace(/\.0$/, '');

    // ── markup ──────────────────────────────────────────────────
    const nav = Object.values(M.products).map((p) =>
      `<a href="${p.page}" class="${p.id === P.id ? 'on' : ''}">${p.short}</a>`).join('');
    const multi = P.sides.length > 1;
    document.getElementById('app').innerHTML = `
<header class="mg-header">
  <div class="container mg-header-in">
    <a href="index.html" class="mg-brand"><img src="assets/yq-logo.png" alt="" /><span class="serif">YQ Photo Services</span></a>
    <nav class="mg-nav">${nav}</nav>
    <a href="index.html#shop" class="btn btn-soft btn-sm" id="cartBtn">🛒 Cart</a>
  </div>
</header>
<main class="container mg-main">
  <div class="eyebrow">Personalised gifts · design it yourself</div>
  <h1 class="display-md" style="margin-top:10px">Your photo on a <span class="serif-italic">${P.label.replace('photo ', '').toLowerCase()}</span></h1>
  <p class="muted mg-lead">${P.blurb} Upload a photo, drag and zoom it to fit, add a short message, then add it to your cart — we print exactly what you see.</p>
  <div class="mg-size">📏 ${P.sizeText} · ${P.price ? fmt(P.price) + ' each' : 'price coming soon'}</div>
  <div class="mg-grid" style="margin-top:28px">
    <section class="mg-stage">
      ${multi ? `<div class="mg-tabs" id="sideTabs">${P.sides.map((s, i) => `<button type="button" data-side="${i}" class="${i ? '' : 'on'}">${s}</button>`).join('')}</div>` : ''}
      <div class="mg-canvas-wrap">
        <div class="mg-canvas-box" id="canvasBox">
          <canvas id="preview" aria-label="Design preview"></canvas>
          <label class="mg-drop" id="dropZone">
            <input type="file" id="fileInput" accept="image/*" hidden />
            <div class="mg-drop-icon">📷</div>
            <div class="mg-drop-title" id="dropTitle">Tap to upload your photo</div>
            <div class="mg-drop-sub" id="dropSub">JPG or PNG · or drag a photo here</div>
          </label>
        </div>
        <div class="mg-hint">Drag to move · pinch or use the zoom slider · actual size ${cm(P.widthMm)} × ${cm(P.heightMm)} cm</div>
      </div>
      <div class="mg-res" id="resBadge" hidden></div>
      <img class="mg-sample" src="${P.img}" alt="Example ${P.label}" loading="lazy" />
      <div class="mg-sample-cap">${P.id === 'puzzle' ? 'A real heart puzzle from our studio' : 'Example with a family photo'}</div>
    </section>
    <section>
      <div class="mg-card">
        <h2>1 · <span id="sideName">${multi ? P.sides[0] + ' photo' : 'Your photo'}</span></h2>
        ${multi ? '<p class="muted" style="font-size:13px;margin:-6px 0 12px" id="sideHelp"></p>' : ''}
        <fieldset id="photoControls" disabled>
          <div class="mg-row">
            <button type="button" class="btn btn-soft btn-sm" id="changeBtn">Change photo</button>
            <button type="button" class="btn btn-soft btn-sm" id="rotateBtn">Rotate ⟳</button>
            <button type="button" class="btn btn-soft btn-sm" id="resetBtn">Reset</button>
            ${multi ? '<button type="button" class="btn btn-soft btn-sm" id="clearSideBtn">Remove photo</button>' : ''}
          </div>
          <div class="mg-lbl"><span>Zoom</span><span id="zoomVal">100%</span></div>
          <input type="range" class="mg-range" id="zoom" min="100" max="500" value="100" />
        </fieldset>
      </div>
      <div class="mg-card">
        <h2>2 · Message <span class="muted" style="font-family:var(--sans);font-size:13px">(optional${multi ? ', per side' : ''})</span></h2>
        <fieldset id="textControls">
          <input class="input w100" id="textInput" maxlength="28" placeholder="e.g. The Tan Family · 2026" autocomplete="off" />
          <div class="mg-lbl"><span>Font</span></div>
          <div class="mg-row mg-seg" id="fontSeg">
            <button type="button" data-font="rounded" class="on">Bold</button>
            <button type="button" data-font="classic">Classic</button>
            <button type="button" data-font="script">Script</button>
          </div>
          <div class="mg-lbl"><span>Colour</span></div>
          <div class="mg-row mg-sw" id="colorSw">
            ${['#FFFFFF', '#1A1612', '#C0392B', '#E86A92', '#C8A35E'].map((c, i) => `<button type="button" data-color="${c}" style="background:${c}" class="${i ? '' : 'on'}" aria-label="${c}"></button>`).join('')}
          </div>
          <div class="mg-lbl"><span>Size</span></div>
          <input type="range" class="mg-range" id="textSize" min="4" max="14" step="0.5" value="7" />
          <div class="mg-lbl"><span>Position</span><span>top ↔ bottom</span></div>
          <input type="range" class="mg-range" id="textPos" min="${TEXT_MIN}" max="${TEXT_MAX}" value="${isHeart ? 18 : 28}" />
        </fieldset>
      </div>
      <div class="mg-card">
        <h2>3 · Add to cart</h2>
        <div class="mg-lbl" style="margin-top:0"><span>Quantity of this design</span></div>
        <div class="qty" style="display:inline-flex">
          <button type="button" id="qtyMinus" aria-label="Decrease">−</button>
          <input class="qty-input" id="qty" type="text" inputmode="numeric" value="1" aria-label="Quantity" />
          <button type="button" id="qtyPlus" aria-label="Increase">+</button>
        </div>
        <div class="mg-price"><span class="muted" id="unitPrice"></span><strong id="lineTotal"></strong></div>
        <label class="mg-rights">
          <input type="checkbox" id="rights" />
          <span>I took these photos or have permission to print them, and they don’t contain licensed characters or logos (e.g. Disney, Marvel). Orders that do will be cancelled and refunded.</span>
        </label>
        <button type="button" class="btn btn-terra btn-lg w100" id="addBtn" disabled>Add to cart</button>
        ${P.available ? '' : '<div class="mg-soon">This product launches soon — you can try the designer now. Message us on <a href="https://carousell.app.link/Mk8Vrne8D7b" target="_blank" rel="noopener">Carousell</a> to order early.</div>'}
        <div class="mg-status" id="status"></div>
        <div class="mg-done" id="donePanel">
          <p>✓ Added to your cart</p>
          <div class="mg-row">
            <button type="button" class="btn btn-ghost btn-sm" id="anotherBtn">Design another</button>
            <a class="btn btn-ink btn-sm" href="index.html#shop">Go to checkout →</a>
          </div>
        </div>
      </div>
      <div class="mg-card mg-cartbox" id="cartBox">
        <h2>In your cart</h2>
        <div id="cartSummary" class="muted" style="font-size:14px"></div>
        <div class="mg-thumbs" id="cartThumbs"></div>
        <a class="btn btn-ink w100" href="index.html#shop">Checkout · add prints too →</a>
      </div>
      <div class="mg-card mg-facts">
        <div>📏 ${P.sizeText} (${P.widthMm} × ${P.heightMm} mm)</div>
        ${P.facts.map((f) => `<div>✨ ${f}</div>`).join('')}
        <div>🖼 Anything outside the dashed line is trimmed off</div>
        <div>⏱ Usually ready in 2–4 working days</div>
        <div>💳 Pay by PayNow at checkout · mix with photo prints in one order</div>
      </div>
    </section>
  </div>
</main>`;

    const $ = (id) => document.getElementById(id);
    const cv = $('preview'), ctx = cv.getContext('2d');
    let dpr = 1;

    // ── state: one per side ─────────────────────────────────────
    const newSide = (i) => ({ img: null, srcScale: 1, rot: 0, zoom: 1, ox: 0, oy: 0,
      text: '', font: 'rounded', color: i ? '#1A1612' : '#FFFFFF', textSize: 7, textY: isHeart ? 0.18 : (i ? 0 : 0.28) });
    let sides = P.sides.map((_, i) => newSide(i));
    let cur = 0;
    let qty = 1;
    const S = () => sides[cur];

    // ── geometry ────────────────────────────────────────────────
    function shapePath(x, y, w, h) {
      const p = new Path2D();
      if (!isHeart) { p.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); return p; }
      const L = M.heartPoints;
      p.moveTo(x + L[0][0] * w, y + L[0][1] * h);
      for (let i = 1; i < L.length; i++) p.lineTo(x + L[i][0] * w, y + L[i][1] * h);
      for (let i = L.length - 2; i > 0; i--) p.lineTo(x + (1 - L[i][0]) * w, y + L[i][1] * h);
      p.closePath();
      return p;
    }
    function rotDims(s) { const w = s.img.width, h = s.img.height; return (s.rot % 2) ? [h, w] : [w, h]; }
    function coverK(s) { const [rw, rh] = rotDims(s); return Math.max(BOX_W / rw, BOX_H / rh); }
    function clampPan(s) {
      if (!s.img) return;
      const [rw, rh] = rotDims(s);
      const k = coverK(s) * s.zoom;
      const mx = Math.max(0, (rw * k - BOX_W) / 2), my = Math.max(0, (rh * k - BOX_H) / 2);
      s.ox = Math.min(mx, Math.max(-mx, s.ox));
      s.oy = Math.min(my, Math.max(-my, s.oy));
    }
    function effDpi(s) { return s.img ? (25.4 / (coverK(s) * s.zoom)) * s.srcScale : 0; }
    function fontCss(key, px) {
      if (key === 'classic') return `600 ${px}px Fraunces, Georgia, serif`;
      if (key === 'script') return `400 ${px}px Pacifico, cursive`;
      return `800 ${px}px Inter, Arial, sans-serif`;
    }
    function isLight(hex) {
      const n = parseInt(hex.slice(1), 16);
      return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) > 160;
    }
    function textMaxW(y) {   // usable width (fraction of W) at vertical offset y (fraction of H from centre)
      if (isHeart) return Math.max(0.3, 0.86 - 1.6 * Math.max(0, y));
      return Math.max(0.3, 2 * Math.sqrt(Math.max(0, 0.25 - y * y)) * 0.86);
    }

    // ── rendering (preview, print file, thumbnail) ──────────────
    function render(c2d, pxW, s, opts) {
      const ppm = pxW / BOX_W, pxH = BOX_H * ppm;
      const trim = shapePath(P.bleedMm * ppm, P.bleedMm * ppm, P.widthMm * ppm, P.heightMm * ppm);
      c2d.save();
      c2d.clearRect(0, 0, pxW, pxH);
      if (opts.clip) c2d.clip(trim);
      if (s.img) {
        c2d.save();
        c2d.translate(pxW / 2 + s.ox * ppm, pxH / 2 + s.oy * ppm);
        c2d.rotate(s.rot * Math.PI / 2);
        const k = coverK(s) * s.zoom * ppm;
        c2d.scale(k, k);
        c2d.imageSmoothingEnabled = true;
        c2d.imageSmoothingQuality = 'high';
        c2d.drawImage(s.img, -s.img.width / 2, -s.img.height / 2);
        c2d.restore();
      } else {
        c2d.fillStyle = opts.export ? '#FFFFFF' : '#F4ECDD';
        c2d.fillRect(0, 0, pxW, pxH);
      }
      const t = s.text.trim();
      if (t) {
        const sizePx = s.textSize * (P.widthMm / 63) * ppm;   // size slider is relative to the piece
        const cy = pxH / 2 + s.textY * P.heightMm * ppm;
        c2d.font = fontCss(s.font, sizePx);
        c2d.textAlign = 'center';
        c2d.textBaseline = 'middle';
        c2d.lineJoin = 'round';
        if (s.img) {
          c2d.lineWidth = sizePx * 0.16;
          c2d.strokeStyle = isLight(s.color) ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)';
          c2d.strokeText(t, pxW / 2, cy, P.widthMm * ppm * textMaxW(s.textY));
        }
        c2d.fillStyle = s.color;
        c2d.fillText(t, pxW / 2, cy, P.widthMm * ppm * textMaxW(s.textY));
      }
      if (opts.overlay) {
        const outside = new Path2D();
        outside.rect(0, 0, pxW, pxH);
        outside.addPath(trim);
        c2d.fillStyle = 'rgba(251,247,241,0.82)';
        c2d.fill(outside, 'evenodd');
        c2d.setLineDash([6 * dpr, 5 * dpr]);
        c2d.lineWidth = 2 * dpr;
        c2d.strokeStyle = '#C26A47';
        c2d.stroke(trim);
        if (P.hole) {
          c2d.setLineDash([]);
          c2d.beginPath();
          c2d.arc(pxW / 2, (P.bleedMm + P.hole.centreFromTopMm) * ppm, (P.hole.diaMm / 2) * ppm, 0, Math.PI * 2);
          c2d.fillStyle = 'rgba(26,22,18,0.75)';
          c2d.fill();
        }
      }
      c2d.restore();
    }

    function sizePreview() {
      const cssW = $('canvasBox').clientWidth;
      dpr = Math.min(3, window.devicePixelRatio || 1);
      cv.width = Math.round(cssW * dpr);
      cv.height = Math.round(cssW * BOX_H / BOX_W * dpr);
      cv.style.height = (cssW * BOX_H / BOX_W) + 'px';
      draw();
    }
    function draw() {
      render(ctx, cv.width, S(), { overlay: true });
      const b = $('resBadge'), s = S();
      if (!s.img) { b.hidden = true; return; }
      const d = effDpi(s);
      b.hidden = false;
      if (d >= 220) { b.className = 'mg-res good'; b.textContent = '✓ Great photo quality for this size'; }
      else if (d >= 150) { b.className = 'mg-res warn'; b.textContent = 'Good enough — may look slightly soft. Zoom out a little for a sharper print.'; }
      else { b.className = 'mg-res bad'; b.textContent = '⚠ Low resolution — this may print blurry. Zoom out or use a larger photo.'; }
    }

    // ── UI sync for the active side ─────────────────────────────
    function syncUI() {
      const s = S();
      $('dropZone').style.display = s.img ? 'none' : '';
      $('dropZone').classList.toggle('mini', cur > 0);
      document.body.classList.toggle('has-photo', !!sides[0].img);
      $('photoControls').disabled = !s.img;
      $('zoom').value = Math.round(s.zoom * 100);
      $('zoomVal').textContent = Math.round(s.zoom * 100) + '%';
      $('textInput').value = s.text;
      $('textSize').value = s.textSize;
      $('textPos').value = Math.round(s.textY * 100);
      [...$('fontSeg').children].forEach((x) => x.classList.toggle('on', x.dataset.font === s.font));
      [...$('colorSw').children].forEach((x) => x.classList.toggle('on', x.dataset.color === s.color));
      if (multi) {
        $('sideName').textContent = `${P.sides[cur]} photo`;
        $('sideHelp').textContent = cur === 0
          ? 'The front needs a photo.'
          : 'Optional — add a second photo, or leave it white with just a message.';
        $('dropTitle').textContent = cur === 0 ? 'Tap to upload your front photo' : 'Tap to add a back photo (optional)';
        [...$('sideTabs').children].forEach((x, i) => x.classList.toggle('on', i === cur));
      }
      refreshAdd();
      draw();
    }
    if (multi) $('sideTabs').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      cur = +b.dataset.side; syncUI();
    });

    // ── photo loading ───────────────────────────────────────────
    function status(msg, err) { const s = $('status'); s.textContent = msg || ''; s.className = 'mg-status' + (err ? ' err' : ''); }
    async function loadFile(file) {
      if (!file) return;
      status('Loading photo…');
      const url = URL.createObjectURL(file);
      try {
        const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('decode')); i.src = url; });
        const ow = img.naturalWidth, oh = img.naturalHeight;
        if (!ow || !oh) throw new Error('decode');
        const k = Math.min(1, MAX_SRC / Math.max(ow, oh));
        const c = document.createElement('canvas');
        c.width = Math.round(ow * k); c.height = Math.round(oh * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        Object.assign(S(), { img: c, srcScale: 1 / k, rot: 0, zoom: 1, ox: 0, oy: 0 });
        if (cur > 0 && S().color === '#1A1612') S().color = '#FFFFFF';
        $('donePanel').classList.remove('show');
        syncUI();
        status('');
      } catch (e) {
        status('Sorry, this photo can’t be opened in your browser. Please use a JPG or PNG (on iPhone, set Camera → Formats → Most Compatible, or screenshot the photo).', true);
      } finally { URL.revokeObjectURL(url); }
    }
    $('fileInput').addEventListener('change', (e) => { loadFile((e.target.files || [])[0]); e.target.value = ''; });
    $('changeBtn').addEventListener('click', () => $('fileInput').click());
    if (multi) $('clearSideBtn').addEventListener('click', () => { Object.assign(S(), { img: null, rot: 0, zoom: 1, ox: 0, oy: 0 }); syncUI(); });
    ['dragenter', 'dragover'].forEach((ev) => $('canvasBox').addEventListener(ev, (e) => { e.preventDefault(); $('dropZone').classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => $('canvasBox').addEventListener(ev, (e) => { e.preventDefault(); $('dropZone').classList.remove('drag'); }));
    $('canvasBox').addEventListener('drop', (e) => loadFile((e.dataTransfer.files || [])[0]));

    // ── pan / pinch / wheel ─────────────────────────────────────
    const pts = new Map();
    let gesture = null;
    const dist = (v) => Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y) || 1;
    function startGesture() {
      const v = [...pts.values()], s = S();
      if (v.length === 1) gesture = { type: 'pan', x: v[0].x, y: v[0].y, ox: s.ox, oy: s.oy };
      else if (v.length >= 2) gesture = { type: 'pinch', d: dist(v), zoom: s.zoom };
      else gesture = null;
    }
    function setZoom(z) {
      S().zoom = Math.min(ZMAX, Math.max(ZMIN, z));
      $('zoom').value = Math.round(S().zoom * 100);
      $('zoomVal').textContent = Math.round(S().zoom * 100) + '%';
    }
    cv.addEventListener('pointerdown', (e) => {
      if (!S().img) return;
      cv.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      startGesture();
    });
    cv.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId) || !gesture) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const v = [...pts.values()], s = S();
      const mmPerCss = BOX_W / cv.clientWidth;
      if (gesture.type === 'pan' && v.length === 1) {
        s.ox = gesture.ox + (v[0].x - gesture.x) * mmPerCss;
        s.oy = gesture.oy + (v[0].y - gesture.y) * mmPerCss;
      } else if (gesture.type === 'pinch' && v.length >= 2) {
        setZoom(gesture.zoom * dist(v) / gesture.d);
      }
      clampPan(s); draw();
    });
    ['pointerup', 'pointercancel'].forEach((ev) => cv.addEventListener(ev, (e) => { pts.delete(e.pointerId); startGesture(); }));
    cv.addEventListener('wheel', (e) => {
      if (!S().img) return;
      e.preventDefault();
      setZoom(S().zoom * Math.exp(-e.deltaY * 0.0015));
      clampPan(S()); draw();
    }, { passive: false });

    // ── controls ────────────────────────────────────────────────
    $('zoom').addEventListener('input', (e) => { setZoom(e.target.value / 100); clampPan(S()); draw(); });
    $('rotateBtn').addEventListener('click', () => { const s = S(); s.rot = (s.rot + 1) % 4; s.ox = 0; s.oy = 0; clampPan(s); draw(); });
    $('resetBtn').addEventListener('click', () => { const s = S(); s.rot = 0; s.ox = 0; s.oy = 0; setZoom(1); draw(); });
    $('textInput').addEventListener('input', (e) => { S().text = e.target.value; refreshAdd(); draw(); });
    $('fontSeg').addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      S().font = b.dataset.font;
      [...$('fontSeg').children].forEach((x) => x.classList.toggle('on', x === b));
      if (document.fonts) { try { await document.fonts.load(fontCss(S().font, 40)); } catch (err) {} }
      draw();
    });
    $('colorSw').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      S().color = b.dataset.color;
      [...$('colorSw').children].forEach((x) => x.classList.toggle('on', x === b));
      draw();
    });
    $('textSize').addEventListener('input', (e) => { S().textSize = +e.target.value; draw(); });
    $('textPos').addEventListener('input', (e) => { S().textY = e.target.value / 100; draw(); });

    function setQty(n) {
      qty = Math.min(99, Math.max(1, n | 0));
      $('qty').value = qty;
      $('unitPrice').textContent = P.price ? `${fmt(P.price)} each` : 'Price coming soon';
      $('lineTotal').textContent = P.price ? fmt(P.price * qty) : '';
    }
    $('qtyMinus').addEventListener('click', () => setQty(qty - 1));
    $('qtyPlus').addEventListener('click', () => setQty(qty + 1));
    $('qty').addEventListener('change', (e) => setQty(parseInt(String(e.target.value).replace(/[^0-9]/g, ''), 10) || 1));

    function refreshAdd() { $('addBtn').disabled = !(P.available && sides[0].img && $('rights').checked); }
    $('rights').addEventListener('change', refreshAdd);

    // ── add to cart ─────────────────────────────────────────────
    $('addBtn').addEventListener('click', async () => {
      if (!sides[0].img) { cur = 0; syncUI(); status('Please upload a photo for the front.', true); return; }
      const btn = $('addBtn');
      btn.disabled = true; btn.textContent = 'Saving your design…'; status('');
      try {
        if (document.fonts) { for (const s of sides) if (s.text.trim()) { try { await document.fonts.load(fontCss(s.font, 40)); } catch (err) {} } }
        const out = [];
        for (let i = 0; i < sides.length; i++) {
          const s = sides[i];
          if (i > 0 && !s.img && !s.text.trim()) continue;          // blank back side: nothing to print
          const c = document.createElement('canvas');
          c.width = Math.round(BOX_W / 25.4 * P.dpi);
          c.height = Math.round(BOX_H / 25.4 * P.dpi);
          render(c.getContext('2d'), c.width, s, { export: true });
          const blob = await new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error('export failed'))), 'image/jpeg', 0.95));
          out.push({ name: P.sides[i], blob, ext: 'jpg' });
        }
        const th = document.createElement('canvas');
        th.width = 200; th.height = Math.round(200 * BOX_H / BOX_W);
        render(th.getContext('2d'), th.width, sides[0], { clip: true });
        await M.add({ product: P.id, sides: out, thumb: th.toDataURL('image/png'), qty,
          meta: { text: sides.map((s) => s.text.trim()), dpi: sides.map((s) => Math.round(effDpi(s))) } });
        $('donePanel').classList.add('show');
        await refreshCart();
      } catch (e) {
        status('Could not save your design: ' + e.message + '. Please try again.', true);
      } finally {
        btn.textContent = 'Add to cart';
        refreshAdd();
      }
    });

    $('anotherBtn').addEventListener('click', () => {
      sides = P.sides.map((_, i) => newSide(i)); cur = 0;
      $('rights').checked = false;
      $('donePanel').classList.remove('show');
      setQty(1); syncUI(); status('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    async function refreshCart() {
      let designs = [];
      try { designs = await M.list(); } catch (e) { return; }
      const pcs = designs.reduce((s, d) => s + d.qty, 0);
      const total = designs.reduce((s, d) => s + d.qty * ((M.products[d.product] || {}).price || 0), 0);
      $('cartBtn').textContent = pcs ? `🛒 Cart (${pcs})` : '🛒 Cart';
      $('cartBox').classList.toggle('show', designs.length > 0);
      $('cartSummary').textContent = `${designs.length} design${designs.length === 1 ? '' : 's'} · ${pcs} item${pcs === 1 ? '' : 's'} · ${fmt(total)}`;
      const box = $('cartThumbs');
      box.innerHTML = '';
      designs.forEach((d) => {
        const i = document.createElement('img');
        i.src = d.thumb; i.alt = (M.products[d.product] || {}).label || 'Design'; i.title = `${i.alt} × ${d.qty}`;
        box.appendChild(i);
      });
    }

    window.addEventListener('pageshow', (e) => { if (e.persisted) refreshCart(); });
    window.addEventListener('resize', sizePreview);
    setQty(1);
    sizePreview();
    syncUI();
    refreshCart();
  }

  window.YQDesigner = { mount };
})();
