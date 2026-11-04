/* ─────────────────────────────────────────────────────────────────────
 * YQ Photo Services — heart magnet designs + cross-page cart
 * Exposes window.YQMagnets
 *   config                          product constants (price, size, bleed, dpi)
 *   add({blob, thumb, qty, meta})   save a finished design (IndexedDB) → id
 *   list()                          designs, oldest first
 *   update(id, patch) / remove(id) / clear()
 *   toCartLine(design, index)       cart line for the main order page
 *   syncWithCart(cart, sinceMs)     drop designs removed from the cart, keep qty in step
 *   loadCart() / saveCart(cart) / clearCart()
 *                                   non-magnet cart lines in sessionStorage, so the
 *                                   cart survives hopping to magnet.html and back
 * ───────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const config = {
    price: 7.90,     // TODO(YQ): confirm the magnet price before going live
    widthMm: 63,     // measured ~6.3 cm wide from the ruler photo
    heightMm: 63,    // TODO(YQ): measure top to tip and confirm
    bleedMm: 2,      // image extends 2 mm past the heart edge on every side
    dpi: 300,
    label: 'Heart photo magnet',
  };

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

  async function add({ blob, thumb, qty, meta }) {
    const id = newId();
    const rec = { id, blob, thumb, qty: Math.max(1, qty | 0), meta: meta || {}, createdAt: Date.now() };
    await run('readwrite', (s) => s.put(rec));
    return id;
  }

  async function list() {
    const all = (await run('readonly', (s) => s.getAll())) || [];
    return all.sort((a, b) => a.createdAt - b.createdAt);
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

  function toCartLine(d, i) {
    const name = `${config.label} #${i + 1}`;
    return {
      key: 'MAG-' + d.id,
      qty: d.qty,
      price: config.price,
      label: name,
      sizeDisplay: name,
      size: `${config.widthMm} × ${config.heightMm} mm`,
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

  const notMagnet = (c) => c && c.key && !String(c.key).startsWith('MAG-');

  function loadCart() {
    try {
      const v = JSON.parse(sessionStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(v) ? v.filter(notMagnet) : [];
    } catch (e) { return []; }
  }
  function saveCart(cart) {
    try { sessionStorage.setItem(CART_KEY, JSON.stringify((cart || []).filter(notMagnet))); } catch (e) {}
  }
  function clearCart() {
    try { sessionStorage.removeItem(CART_KEY); } catch (e) {}
  }

  window.YQMagnets = {
    config, add, list, update, remove, clear, toCartLine, syncWithCart,
    loadCart, saveCart, clearCart,
  };
})();
