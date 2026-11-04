/* ─────────────────────────────────────────────────────────────────────
 * YQ Photo Services — personalised gifts (designs + cross-page cart)
 * Exposes window.YQMagnets
 *   products                        catalogue: magnet, ornament, puzzle
 *   heartPoints                     traced outline of YQ's heart blanks (left half, unit box)
 *   add({product, sides, thumb, qty, meta})  save a finished design (IndexedDB) → id
 *   list() / update(id, patch) / remove(id) / clear()
 *   toCartLine(design, index, all)  cart line for the main order page
 *   syncWithCart(cart, sinceMs)     drop designs removed from the cart, keep qty in step
 *   loadCart() / saveCart(cart) / clearCart()   non-design cart lines in sessionStorage
 * Cart keys for designs start with 'MAG-' (kept for every product).
 * ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const products = {
    magnet: {
      id: 'magnet', page: 'magnet.html', img: 'assets/sample-magnet.jpg',
      label: 'Heart photo magnet', short: 'Heart magnet',
      shape: 'heart', widthMm: 63, heightMm: 62, bleedMm: 2, dpi: 300,
      price: 5.90,
      sides: ['Front'],
      sizeText: '6.3 × 6.2 cm heart',
      blurb: 'Glossy fridge magnet with your photo, cut in a classic heart.',
      facts: ['Glossy finish, magnetic back', 'Printed on one side'],
      available: true,
    },
    ornament: {
      id: 'ornament', page: 'ornament.html', img: 'assets/sample-ornament.jpg',
      label: 'Round photo ornament', short: 'Round ornament',
      shape: 'circle', widthMm: 70, heightMm: 70, bleedMm: 2, dpi: 300,
      price: 7.90,
      sides: ['Front', 'Back'],
      hole: { diaMm: 4, centreFromTopMm: 5 },   // preview guide only — TODO(YQ): confirm
      sizeText: '7 cm round · printed both sides',
      blurb: 'Hang it on the tree or in the car — a different photo or message on each side.',
      facts: ['Printed front and back', 'Hanging hole at the top'],
      available: true,
    },
    puzzle: {
      id: 'puzzle', page: 'puzzle.html', img: 'assets/sample-puzzle.jpg',
      label: 'Heart photo puzzle', short: 'Heart puzzle',
      shape: 'heart', widthMm: 188, heightMm: 186, bleedMm: 3, dpi: 300,
      price: 14.90,
      sides: ['Front'],
      sizeText: '18.8 × 18.6 cm heart · magnetic',
      blurb: 'A magnetic heart-shaped jigsaw of your favourite photo — fun to build, lovely on the fridge.',
      facts: ['Magnetic backing', 'Comes as a jigsaw you assemble'],
      available: true,
    },
  };

  // Left half of the heart, traced from YQ's blank (notch → left lobe → tip), unit box.
  const heartPoints = [[0.5,0.061],[0.48,0.051],[0.46,0.041],[0.439,0.031],[0.418,0.022],[0.397,0.015],[0.374,0.009],[0.352,0.004],[0.329,0.002],[0.307,0.001],[0.284,0.002],[0.261,0.004],[0.238,0.007],[0.216,0.012],[0.194,0.018],[0.173,0.026],[0.152,0.036],[0.132,0.047],[0.113,0.059],[0.095,0.074],[0.079,0.09],[0.065,0.107],[0.052,0.126],[0.041,0.146],[0.031,0.167],[0.023,0.189],[0.016,0.21],[0.01,0.233],[0.005,0.255],[0.002,0.278],[0.001,0.301],[0.0,0.324],[0.001,0.347],[0.003,0.369],[0.006,0.392],[0.01,0.414],[0.015,0.437],[0.021,0.459],[0.029,0.48],[0.037,0.502],[0.045,0.523],[0.055,0.544],[0.065,0.564],[0.076,0.584],[0.088,0.604],[0.101,0.623],[0.115,0.641],[0.129,0.659],[0.143,0.677],[0.159,0.694],[0.174,0.711],[0.19,0.727],[0.206,0.744],[0.222,0.76],[0.239,0.776],[0.255,0.792],[0.272,0.808],[0.289,0.823],[0.306,0.838],[0.324,0.853],[0.341,0.868],[0.359,0.883],[0.376,0.898],[0.394,0.912],[0.412,0.926],[0.43,0.94],[0.449,0.954],[0.466,0.969],[0.483,0.984],[0.5,1.0]];

  const DB_NAME = 'yq-magnets';
  const STORE = 'designs';
  const CART_KEY = 'yq-cart';

  let dbPromise = null;
  function db() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!window.indexedDB) { reject(new Error('IndexedDB not available')); return; }
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }

  function run(mode, fn) {
    return db().then((d) => new Promise((resolve, reject) => {
      const t = d.transaction(STORE, mode);
      const req = fn(t.objectStore(STORE));
      t.oncomplete = () => resolve(req ? req.result : undefined);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  function newId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // Older magnet-only records stored a single blob; present them in the new shape.
  function normalise(d) {
    if (!d) return d;
    if (!d.product) d.product = 'magnet';
    if (!d.sides && d.blob) d.sides = [{ name: 'Front', blob: d.blob, ext: 'png' }];
    return d;
  }

  async function add({ product, sides, thumb, qty, meta }) {
    const id = newId();
    const rec = { id, product, sides, thumb, qty: Math.max(1, qty | 0), meta: meta || {}, createdAt: Date.now() };
    await run('readwrite', (s) => s.put(rec));
    return id;
  }

  async function list() {
    const all = (await run('readonly', (s) => s.getAll())) || [];
    return all.map(normalise).sort((a, b) => a.createdAt - b.createdAt);
  }

  function update(id, patch) {
    return run('readwrite', (s) => {
      const g = s.get(id);
      g.onsuccess = () => { if (g.result) s.put({ ...g.result, ...patch }); };
      return null;
    });
  }

  function remove(id) { return run('readwrite', (s) => s.delete(id)); }
  function clear() { return run('readwrite', (s) => s.clear()); }

  function toCartLine(d, i, all) {
    const p = products[d.product] || products.magnet;
    const same = (all || [d]).filter((x) => x.product === d.product);
    const n = same.indexOf(d) + 1 || i + 1;
    const name = `${p.label} #${n}`;
    return {
      key: 'MAG-' + d.id,
      qty: d.qty,
      price: p.price || 0,
      label: name,
      sizeDisplay: name,
      size: p.sizeText,
      thumb: d.thumb,
    };
  }

  // Only designs that existed when the page loaded can be deleted here, so a
  // design added in another tab is never wiped by a stale cart.
  async function syncWithCart(cart, sinceMs) {
    const designs = await list();
    for (const d of designs) {
      const line = (cart || []).find((c) => c.key === 'MAG-' + d.id);
      if (!line) {
        if (!sinceMs || d.createdAt <= sinceMs) await remove(d.id);
      } else if (line.qty !== d.qty) {
        await update(d.id, { qty: line.qty });
      }
    }
  }

  const notDesign = (c) => c && c.key && !String(c.key).startsWith('MAG-');

  function loadCart() {
    try {
      const v = JSON.parse(sessionStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(v) ? v.filter(notDesign) : [];
    } catch (e) { return []; }
  }
  function saveCart(cart) {
    try { sessionStorage.setItem(CART_KEY, JSON.stringify((cart || []).filter(notDesign))); } catch (e) {}
  }
  function clearCart() {
    try { sessionStorage.removeItem(CART_KEY); } catch (e) {}
  }

  window.YQMagnets = {
    products, heartPoints, config: products.magnet,
    add, list, update, remove, clear, toCartLine, syncWithCart,
    loadCart, saveCart, clearCart,
  };
})();
