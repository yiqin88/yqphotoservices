/* global React */
const { useState: useStateKC, useMemo: useMemoKC } = React;

// ============================================================
// ACRYLIC PHOTO KEYCHAIN — gift product feature
// ============================================================
// Frame colors as a config so the configurator stays simple.
const FRAME_COLORS = [
  { id: 'none',  label: 'No frame', swatch: '#fff',    img: null },
  { id: 'blue',  label: 'Blue',     swatch: '#9CC2DE', img: 'assets/keychain-frame-blue.jpg' },
  { id: 'pink',  label: 'Pink',     swatch: '#F2C8C5', img: 'assets/keychain-frame-pink.jpg' },
  { id: 'black', label: 'Black',    swatch: '#1F1B16', img: 'assets/keychain-frame-black.jpg' },
];

function KeychainProduct({ onAddKeychain }) {
  const KEYCHAIN_PRICE = 3.90;        // per keychain
  const FRAME_PRICE = 3.90;
  const MIN_QTY = 2;

  // Per-color quantity map. Default: 2 keychains, no frame.
  const [counts, setCounts] = useStateKC({ none: 2, blue: 0, pink: 0, black: 0 });

  const totalQty = useMemoKC(
    () => Object.values(counts).reduce((a, b) => a + b, 0),
    [counts],
  );
  const framedQty = totalQty - counts.none;
  const total = KEYCHAIN_PRICE * totalQty + FRAME_PRICE * framedQty;
  const belowMin = totalQty < MIN_QTY;

  const setCount = (id, n) => {
    setCounts((prev) => ({ ...prev, [id]: Math.max(0, n) }));
  };

  const handleAdd = () => {
    if (belowMin || !onAddKeychain) return;
    // Emit one cart line per non-zero frame color so the cart shows the breakdown.
    const lines = FRAME_COLORS
      .filter((c) => counts[c.id] > 0)
      .map((c) => ({
        frame: c.id,
        qty: counts[c.id],
        unitPrice: KEYCHAIN_PRICE,
        framePrice: c.id === 'none' ? 0 : FRAME_PRICE,
      }));
    onAddKeychain({ lines, total, totalQty });
  };

  return (
    <section id="keychain" className="section" style={{ background: 'var(--cream)', borderTop: '1px solid var(--line-soft)' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 64,
          alignItems: 'center',
        }} className="kc-grid">

          {/* LEFT: imagery collage */}
          <div style={{ position: 'relative' }}>
            <div className="print-frame" style={{
              padding: '14px 14px 40px',
              transform: 'rotate(-1.2deg)',
              maxWidth: 520,
            }}>
              <img src="assets/keychain-1.jpg" alt="Acrylic photo keychains with family photos"
                   style={{ aspectRatio: '4 / 5', objectFit: 'cover', display: 'block', width: '100%' }} />
              <div style={{
                position: 'absolute', bottom: 12, left: 16, right: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span className="serif-italic" style={{ fontSize: 14, color: 'var(--muted)' }}>
                  Double-sided · 46 × 28 mm
                </span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em', color: 'var(--terracotta)', fontWeight: 600 }}>
                  KEYCHAIN
                </span>
              </div>
            </div>

            {/* Floating frame inset */}
            <div className="print-frame kc-inset" style={{
              padding: '10px 10px 30px',
              position: 'absolute',
              right: -8, bottom: -16,
              width: 200,
              transform: 'rotate(3deg)',
              boxShadow: 'var(--shadow-lg, 0 18px 40px -10px rgba(0,0,0,0.18))',
            }}>
              <img src="assets/keychain-frame.jpg" alt="Floating frame option in pink and blue"
                   style={{ aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', width: '100%' }} />
              <div style={{ position: 'absolute', bottom: 8, left: 12, right: 12 }}>
                <span className="serif-italic" style={{ fontSize: 11, color: 'var(--muted)' }}>
                  + floating frame
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: copy + configurator */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>New · Personalised gift</div>
            <h2 className="display-xl" style={{ marginBottom: 20 }}>
              Acrylic photo<br/>
              <span className="serif-italic" style={{ color: 'var(--terracotta)' }}>keychain.</span>
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--muted)', marginBottom: 28, maxWidth: 480 }}>
              A thoughtful, meaningful gift with great value. Two photos per keychain (double-sided),
              perfect for Mother's Day, Christmas, Thanksgiving, or just because.
            </p>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
              marginBottom: 32,
            }}>
              <KCSpec label="Size" value="46 × 28 mm" />
              <KCSpec label="Photos" value="2-sided" />
              <KCSpec label="Min order" value="2 pcs" />
            </div>

            {/* Configurator */}
            <div style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              padding: 28,
            }}>
              <div style={{ marginBottom: 16 }}>
                <div className="label-mono" style={{ marginBottom: 4 }}>Choose frames</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Mix &amp; match — set the quantity for each frame option.
                  <span style={{ marginLeft: 6 }}>${KEYCHAIN_PRICE.toFixed(2)} each, +${FRAME_PRICE.toFixed(2)} for a floating frame.</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {FRAME_COLORS.map((c) => (
                  <FrameRow
                    key={c.id}
                    color={c}
                    qty={counts[c.id]}
                    unitPrice={KEYCHAIN_PRICE + (c.id === 'none' ? 0 : FRAME_PRICE)}
                    onChange={(n) => setCount(c.id, n)}
                  />
                ))}
              </div>

              {/* Summary line */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 14px',
                background: 'var(--cream-deep)',
                borderRadius: 'var(--r-md, 12px)',
                marginBottom: 18,
                fontSize: 13,
              }}>
                <span style={{ color: 'var(--muted)' }}>
                  {totalQty} keychain{totalQty === 1 ? '' : 's'}
                  {framedQty > 0 && <> · {framedQty} with frame</>}
                </span>
                {belowMin && (
                  <span style={{ color: 'var(--terracotta)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                    Min 2 keychains
                  </span>
                )}
              </div>

              {/* Total + CTA */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid var(--ink)', paddingTop: 18, marginBottom: 18 }}>
                <div>
                  <div className="label-mono">Total</div>
                  <div className="serif" style={{ fontSize: 32, marginTop: 2 }}>${total.toFixed(2)}</div>
                </div>
                <button
                  onClick={handleAdd}
                  disabled={belowMin}
                  className="btn btn-terra btn-lg"
                  style={{ opacity: belowMin ? 0.5 : 1, cursor: belowMin ? 'not-allowed' : 'pointer' }}
                >
                  Add to order <window.ArrowRight />
                </button>
              </div>

              <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5 }}>
                For multiple keychains, please name your photos like{' '}
                <span style={{ fontFamily: 'var(--mono)', fontStyle: 'normal', background: 'var(--cream-deep)', padding: '2px 6px', borderRadius: 4 }}>key1-1, key1-2, key2-1, key2-2</span>{' '}
                so we know which photos pair on each keychain.
              </div>
            </div>

            {/* Shipping note */}
            <div style={{ display: 'flex', gap: 24, marginTop: 24, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
              <span>📮 SingPost mailing $1.50</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .kc-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .kc-inset { display: none; }
        }
      `}</style>
    </section>
  );
}

function KCSpec({ label, value }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--line-soft)',
      borderRadius: 'var(--r-md, 12px)',
      padding: '14px 16px',
    }}>
      <div className="label-mono" style={{ marginBottom: 4 }}>{label}</div>
      <div className="serif" style={{ fontSize: 16, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

// One row per frame color: thumbnail + label + price + qty stepper
function FrameRow({ color, qty, unitPrice, onChange }) {
  const isNone = color.id === 'none';
  const active = qty > 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '12px 14px',
      background: active ? '#fff' : 'var(--cream-deep)',
      border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
      borderRadius: 'var(--r-md, 12px)',
      transition: 'border-color 0.15s ease, background 0.15s ease',
    }}>
      {/* Swatch / preview */}
      {color.img ? (
        <img
          src={color.img}
          alt={`${color.label} frame preview`}
          style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--line)', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: 56, height: 56, borderRadius: 8,
          background: '#fff',
          border: '1.5px dashed var(--muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', flexShrink: 0,
        }}>
          plain
        </div>
      )}

      {/* Label + price */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="serif" style={{ fontSize: 16, fontWeight: 500, marginBottom: 2 }}>
          {isNone ? 'Keychain only' : `${color.label} floating frame`}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
          ${unitPrice.toFixed(2)} each
          {!isNone && <> · includes display frame</>}
        </div>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden', background: '#fff', flexShrink: 0 }}>
        <button
          onClick={() => onChange(qty - 1)}
          disabled={qty <= 0}
          aria-label={`Decrease ${color.label}`}
          style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: qty <= 0 ? 'not-allowed' : 'pointer', fontSize: 18, color: qty <= 0 ? 'var(--muted)' : 'var(--ink)', opacity: qty <= 0 ? 0.4 : 1 }}
        >−</button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={qty}
          onChange={(e) => {
            const digits = String(e.target.value).replace(/[^0-9]/g, '');
            const n = digits === '' ? 0 : Math.min(9999, parseInt(digits, 10) || 0);
            onChange(n);
          }}
          onFocus={(e) => e.target.select()}
          aria-label={`Quantity for ${color.label}`}
          style={{
            width: 44, height: 36, border: 'none', borderLeft: '1px solid var(--line)', borderRight: '1px solid var(--line)',
            textAlign: 'center', fontWeight: 600, fontSize: 15, color: active ? 'var(--ink)' : 'var(--muted)',
            background: 'transparent', outline: 'none', padding: 0, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => onChange(qty + 1)}
          aria-label={`Increase ${color.label}`}
          style={{ width: 36, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 18, color: 'var(--ink)' }}
        >+</button>
      </div>
    </div>
  );
}

Object.assign(window, { KeychainProduct });
