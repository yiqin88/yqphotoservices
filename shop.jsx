/* global React */
const { useState: useStateShop, useEffect: useEffectShop, useMemo: useMemoShop } = React;

// ============================================================
// DISCOUNT TIERS — spend more, save more
// ============================================================
function DiscountTiers() {
  return (
    <section className="section-sm" style={{ background: 'var(--cream)', borderTop: '1px solid var(--line-soft)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Save more</div>
            <h2 className="display-md">Spend more,<br/><span className="serif-italic">save more.</span></h2>
          </div>
          <p style={{ maxWidth: 320, color: 'var(--muted)', fontSize: 15 }}>
            Mix and match any sizes. Discounts apply automatically at checkout — no codes needed.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {window.DISCOUNT_TIERS.map((t, i) => (
            <div key={t.threshold} style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              padding: '28px 26px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0,
                background: i === 2 ? 'var(--terracotta)' : 'var(--cream-deep)',
                color: i === 2 ? '#fff' : 'var(--ink)',
                padding: '8px 16px',
                fontFamily: 'var(--mono)',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                borderBottomLeftRadius: 12,
              }}>
                TIER {i + 1}
              </div>
              <div className="label-mono" style={{ color: 'var(--terracotta)', marginBottom: 8 }}>{t.label}</div>
              <h3 className="serif" style={{ fontSize: 56, lineHeight: 1, margin: '4px 0 8px', letterSpacing: '-0.02em' }}>
                {t.percent}<span style={{ fontSize: 28 }}>% off</span>
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{t.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SHOP / CHECKOUT FLOW
// ============================================================
function ShopFlow({ step, setStep, cart, setCart, customer, setCustomer, lastOrder, setLastOrder }) {
  return (
    <section id="shop" style={{ padding: '80px 0', background: 'var(--cream-soft)' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Place your order</div>
          <h2 className="display-lg">Order in 5 simple steps.</h2>
        </div>

        <ProgressBar step={step} />

        <div style={{
          background: '#fff',
          borderRadius: 'var(--r-xl)',
          border: '1px solid var(--line)',
          marginTop: 32,
          overflow: 'hidden',
        }}>
          {step === 1 && <Step1 cart={cart} setCart={setCart} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 cart={cart} setCart={setCart} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <Step3 cart={cart} customer={customer} setCustomer={setCustomer} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && <Step4 cart={cart} customer={customer} setCustomer={setCustomer} onBack={() => setStep(3)} onNext={(result) => { setLastOrder(result); setStep(5); }} />}
          {step === 5 && <Step5 result={lastOrder} onRestart={() => { setCart([]); setLastOrder(null); setStep(1); }} />}
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ step }) {
  const steps = ['Choose', 'Cart', 'Details', 'Payment', 'Done'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: active ? 'var(--ink)' : done ? 'var(--terracotta)' : 'var(--cream)',
                color: (active || done) ? '#fff' : 'var(--muted)',
                border: active ? 'none' : done ? 'none' : '1.5px solid var(--line)',
                display: 'grid', placeItems: 'center',
                fontSize: 13, fontWeight: 600,
                flexShrink: 0,
              }}>
                {done ? '✓' : n}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                color: active ? 'var(--ink)' : 'var(--muted)',
              }} className="step-label">{s}</span>
            </div>
            {i < 4 && <div style={{ flex: 0.5, height: 1, background: done ? 'var(--terracotta)' : 'var(--line)' }} />}
          </React.Fragment>
        );
      })}
      <style>{`
        @media (max-width: 640px) {
          .step-label { display: none; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// STEP 1 — choose prints
// ============================================================
function Step1({ cart, setCart, onNext }) {
  const [filter, setFilter] = useStateShop('all');
  const filtered = useMemoShop(() => {
    return Object.entries(window.PRICING).filter(([k, v]) => {
      if (filter === 'all') return true;
      if (filter === 'popular') return v.popular;
      return v.category === filter;
    });
  }, [filter]);

  const updateQty = (key, delta) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        const newQty = existing.qty + delta;
        if (newQty <= 0) return prev.filter((c) => c.key !== key);
        return prev.map((c) => c.key === key ? { ...c, qty: newQty } : c);
      } else if (delta > 0) {
        const data = window.PRICING[key];
        return [...prev, { key, qty: delta, price: data.price, label: key, size: data.cm }];
      }
      return prev;
    });
  };

  const setQtyExact = (key, raw) => {
    // strip non-digits, clamp, allow 0 (which removes)
    const digits = String(raw).replace(/[^0-9]/g, '');
    const n = digits === '' ? 0 : Math.min(9999, parseInt(digits, 10) || 0);
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (n <= 0) return prev.filter((c) => c.key !== key);
      if (existing) return prev.map((c) => c.key === key ? { ...c, qty: n } : c);
      const data = window.PRICING[key];
      return [...prev, { key, qty: n, price: data.price, label: key, size: data.cm }];
    });
  };

  const cartQty = (key) => cart.find((c) => c.key === key)?.qty || 0;
  const itemsTotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const remaining = Math.max(0, window.MIN_ORDER - itemsTotal);

  return (
    <div style={{ padding: 40 }}>
      <h3 className="serif" style={{ fontSize: 26, marginBottom: 8 }}>Choose your prints</h3>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
        Pick sizes and quantities. Mix and match — minimum order ${window.MIN_ORDER.toFixed(0)}.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          ['all', 'All sizes'],
          ['popular', '★ Popular'],
          ['small', 'Small (2R–4R)'],
          ['medium', 'Medium (5R–8R)'],
          ['large', 'Large (10R–A3)'],
          ['special', 'Stickers'],
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={filter === k ? '' : ''}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 500,
              background: filter === k ? 'var(--ink)' : 'transparent',
              color: filter === k ? 'var(--cream)' : 'var(--ink-soft)',
              border: filter === k ? 'none' : '1px solid var(--line)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Print size grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 14,
      }}>
        {filtered.map(([key, data]) => {
          const q = cartQty(key);
          return (
            <div key={key} style={{
              border: q > 0 ? '1.5px solid var(--ink)' : '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: 18,
              background: q > 0 ? 'var(--cream-soft)' : '#fff',
              position: 'relative',
              transition: 'all 0.2s',
            }}>
              {data.popular && (
                <div style={{
                  position: 'absolute', top: -8, left: 16,
                  background: 'var(--terracotta)', color: '#fff',
                  padding: '3px 10px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  ★ Popular
                </div>
              )}
              <div className="serif" style={{ fontSize: 22, lineHeight: 1, marginBottom: 4 }}>{key}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>
                {data.inches}{data.inches && ' · '}{data.cm}
              </div>
              <div className="serif-italic" style={{ fontSize: 12, color: 'var(--terracotta)', marginBottom: 14 }}>
                {data.bundleInfo}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>{data.priceLabel}</span>
                {q > 0 ? (
                  <div className="qty">
                    <button onClick={() => updateQty(key, -1)} aria-label="Decrease">−</button>
                    <input
                      className="qty-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={q}
                      onChange={(e) => setQtyExact(key, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      aria-label={`Quantity for ${key}`}
                    />
                    <button onClick={() => updateQty(key, 1)} aria-label="Increase">+</button>
                  </div>
                ) : (
                  <button onClick={() => updateQty(key, 1)} className="btn btn-soft btn-sm" style={{ padding: '6px 14px' }}>Add</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Keychain awareness: summary if added, promo if not */}
      {(() => {
        const kcLines = cart.filter((c) => c.key.startsWith('KC-'));
        const kcCount = kcLines.reduce((s, c) => s + c.qty, 0);
        const kcTotal = kcLines.reduce((s, c) => s + c.qty * c.price, 0);

        if (kcCount > 0) {
          // Summary card — keychains already in cart
          return (
            <div style={{
              marginTop: 24,
              padding: 18,
              background: 'var(--cream-soft)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 12, flexWrap: 'wrap', gap: 8,
              }}>
                <div className="label-mono" style={{ color: 'var(--terracotta)' }}>
                  🔑 Acrylic keychains in your order
                </div>
                <div className="serif" style={{ fontSize: 18 }}>
                  {kcCount} × ${kcTotal.toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {kcLines.map((line) => {
                  const color = line.key.slice(3); // none|blue|pink|black
                  const imgMap = {
                    none:  'assets/keychain-plain.jpg',
                    blue:  'assets/keychain-frame-blue.jpg',
                    pink:  'assets/keychain-frame-pink.jpg',
                    black: 'assets/keychain-frame-black.jpg',
                  };
                  return (
                    <div key={line.key} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 10px 6px 6px',
                      background: '#fff',
                      border: '1px solid var(--line-soft)',
                      borderRadius: 999,
                      fontSize: 13,
                    }}>
                      <img src={imgMap[color]} alt="" style={{
                        width: 28, height: 28, borderRadius: '50%',
                        objectFit: 'cover', border: '1px solid var(--line)',
                      }} />
                      <span>{line.label} × {line.qty}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--muted)' }}>
                <a href="#keychain" style={{ color: 'var(--terracotta)', textDecoration: 'underline' }}>
                  Add or modify keychains
                </a>
              </div>
            </div>
          );
        }

        // Promo card — no keychains yet
        return (
          <a href="#keychain" style={{
            display: 'flex', alignItems: 'center', gap: 16,
            marginTop: 24,
            padding: '16px 20px',
            background: 'linear-gradient(135deg, var(--cream-soft), var(--peach-soft))',
            border: '1px solid var(--peach)',
            borderRadius: 'var(--r-md)',
            textDecoration: 'none',
            color: 'inherit',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <img src="assets/keychain-plain.jpg" alt="" style={{
              width: 56, height: 56, borderRadius: 12,
              objectFit: 'cover', border: '1px solid var(--line)',
              flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                <span style={{
                  background: 'var(--terracotta)', color: '#fff',
                  padding: '2px 8px', borderRadius: 999,
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                }}>NEW</span>
                <span className="serif" style={{ fontSize: 17 }}>Acrylic photo keychain</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                Two photos per keychain · from $3.90 · floating frames available
              </div>
            </div>
            <div style={{ color: 'var(--terracotta)', fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
              See options →
            </div>
          </a>
        );
      })()}

      {/* Footer cart bar */}
      <div style={{
        marginTop: 32,
        padding: 20,
        background: 'var(--cream)',
        border: '1.5px solid var(--line)',
        borderRadius: 'var(--r-md)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="label-mono">{cart.reduce((s, c) => s + c.qty, 0)} items in cart</div>
            <div className="serif" style={{ fontSize: 28, marginTop: 4 }}>{window.fmt(itemsTotal)}</div>
            {remaining > 0 ? (
              <div style={{ fontSize: 13, color: 'var(--terracotta)', marginTop: 4 }}>
                Add {window.fmt(remaining)} more to meet minimum order
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--success)', marginTop: 4 }}>
                ✓ Minimum order met
              </div>
            )}
          </div>
          <button
            onClick={onNext}
            disabled={itemsTotal < window.MIN_ORDER}
            className="btn btn-ink btn-lg"
            style={{ opacity: itemsTotal < window.MIN_ORDER ? 0.4 : 1, cursor: itemsTotal < window.MIN_ORDER ? 'not-allowed' : 'pointer' }}
          >
            Review cart <window.ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// STEP 2 — cart review
// ============================================================
function Step2({ cart, setCart, onBack, onNext }) {
  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tier = window.getDiscountTier(subtotal);
  const discount = tier ? subtotal * (tier.percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= window.FREE_SHIP_THRESHOLD ? 0 : 3.50;
  const total = afterDiscount + shipping;
  const remaining = Math.max(0, window.FREE_SHIP_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / window.FREE_SHIP_THRESHOLD) * 100);

  // Next discount tier hint
  const nextTier = window.DISCOUNT_TIERS.find((t) => subtotal < t.threshold);
  const toNextTier = nextTier ? nextTier.threshold - subtotal : 0;

  const updateQty = (key, delta) => {
    setCart((prev) => prev.map((c) =>
      c.key === key ? { ...c, qty: c.qty + delta } : c
    ).filter((c) => c.qty > 0));
  };
  const setQtyExact = (key, raw) => {
    const digits = String(raw).replace(/[^0-9]/g, '');
    const n = digits === '' ? 0 : Math.min(9999, parseInt(digits, 10) || 0);
    setCart((prev) => {
      if (n <= 0) return prev.filter((c) => c.key !== key);
      return prev.map((c) => c.key === key ? { ...c, qty: n } : c);
    });
  };
  const removeItem = (key) => setCart((prev) => prev.filter((c) => c.key !== key));

  return (
    <div style={{ padding: 40 }}>
      <h3 className="serif" style={{ fontSize: 26, marginBottom: 24 }}>Review your cart</h3>

      {/* Next discount tier progress (instead of free shipping) */}
      {nextTier && (
        <div style={{
          background: 'var(--cream-soft)',
          padding: 16,
          borderRadius: 'var(--r-md)',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 13 }}>
            <span style={{ fontWeight: 600 }}>
              {window.fmt(toNextTier)} away from {nextTier.percent}% off
            </span>
            <span className="label-mono">${nextTier.threshold} tier</span>
          </div>
          <div style={{ height: 6, background: '#fff', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (subtotal / nextTier.threshold) * 100)}%`,
              height: '100%',
              background: 'var(--terracotta)',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}
      {tier && !nextTier && (
        <div style={{
          background: 'var(--cream-soft)',
          padding: 16,
          borderRadius: 'var(--r-md)',
          marginBottom: 24,
          fontSize: 14, fontWeight: 600,
        }}>
          🎉 You unlocked our biggest discount — {tier.percent}% off your order!
        </div>
      )}

      {/* Items */}
      <div style={{ borderTop: '1px solid var(--line)' }}>
        {cart.map((c) => {
          const data = window.PRICING[c.key];
          // Keychain rows: KC-none / KC-blue / KC-pink / KC-black
          const isKC = c.key.startsWith('KC-');
          const isSticker = c.key === 'STICKERS';
          const kcColor = isKC ? c.key.slice(3) : null; // none|blue|pink|black
          const kcImgMap = {
            none:  'assets/keychain-1.jpg',
            blue:  'assets/keychain-frame-blue.jpg',
            pink:  'assets/keychain-frame-pink.jpg',
            black: 'assets/keychain-frame-black.jpg',
          };
          const kcLabelMap = {
            none:  'Acrylic photo keychain',
            blue:  'Acrylic keychain + blue frame',
            pink:  'Acrylic keychain + pink frame',
            black: 'Acrylic keychain + black frame',
          };
          const title = isKC ? kcLabelMap[kcColor]
                       : isSticker ? 'Photo sticker sheet'
                       : `${c.key} prints`;
          const subtitle = isKC ? '46 × 28 mm · double-sided'
                          : isSticker ? 'A4 vinyl sheet'
                          : (data?.cm || c.size || '');
          const thumb = isKC ? kcImgMap[kcColor] : null;

          return (
            <div key={c.key} style={{
              display: 'grid',
              gridTemplateColumns: '64px 1fr auto auto',
              alignItems: 'center',
              gap: 16,
              padding: '20px 0',
              borderBottom: '1px solid var(--line)',
            }}>
              {thumb ? (
                <img
                  src={thumb}
                  alt={title}
                  style={{
                    width: 64, height: 64,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                  }}
                />
              ) : (
                <div style={{
                  width: 64, height: 64,
                  background: 'var(--cream-soft)',
                  borderRadius: 8,
                  display: 'grid', placeItems: 'center',
                  fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 600,
                  border: '1px solid var(--line-soft)',
                }}>{c.key}</div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 16 }}>{title}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>{subtitle}</div>
              </div>
              <div className="qty">
                <button onClick={() => updateQty(c.key, -1)} aria-label="Decrease">−</button>
                <input
                  className="qty-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={c.qty}
                  onChange={(e) => setQtyExact(c.key, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`Quantity for ${c.key}`}
                />
                <button onClick={() => updateQty(c.key, 1)} aria-label="Increase">+</button>
              </div>
              <div style={{ textAlign: 'right', minWidth: 80 }}>
                <div style={{ fontWeight: 600 }}>{window.fmt(c.qty * c.price)}</div>
                <button onClick={() => removeItem(c.key)} style={{ fontSize: 12, color: 'var(--muted)', textDecoration: 'underline', marginTop: 4 }}>Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* (Sticker upsell removed per owner) */}

      {/* Totals */}
      <div style={{ marginTop: 32, paddingTop: 24, borderTop: '2px solid var(--ink)' }}>
        <Row label="Subtotal" value={window.fmt(subtotal)} />
        {tier && (
          <Row
            label={`Discount (${tier.percent}% off — spend $${tier.threshold}+)`}
            value={`− ${window.fmt(discount)}`}
            highlight
          />
        )}
        {nextTier && (
          <div style={{ fontSize: 13, color: 'var(--terracotta)', margin: '6px 0 10px', fontStyle: 'italic' }}>
            Add {window.fmt(toNextTier)} more for {nextTier.percent}% off your order.
          </div>
        )}
        <Row label="Shipping" value="Selected next step" />
        <Row label="Subtotal so far" value={window.fmt(afterDiscount)} big />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button onClick={onBack} className="btn btn-ghost">← Back to shop</button>
        <button onClick={onNext} className="btn btn-ink btn-lg">Continue to details <window.ArrowRight /></button>
      </div>
    </div>
  );
}

function Row({ label, value, big, highlight }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: big ? '14px 0 0' : '8px 0',
    }}>
      <span style={{ fontSize: big ? 18 : 14, fontWeight: big ? 600 : 500, color: big ? 'var(--ink)' : 'var(--ink-soft)' }}>{label}</span>
      <span
        className={big ? 'serif' : ''}
        style={{
          fontSize: big ? 28 : 15,
          fontWeight: big ? 500 : 600,
          color: highlight ? 'var(--success)' : 'var(--ink)',
        }}
      >{value}</span>
    </div>
  );
}

// ============================================================
// STEP 3 — customer details
// ============================================================
function Step3({ cart, customer, setCustomer, onBack, onNext }) {
  const update = (k, v) => setCustomer((p) => ({ ...p, [k]: v }));
  const isMail = customer.delivery === 'mail';
  const valid = customer.name && customer.email && customer.phone && (!isMail || customer.address);

  // Live totals so customer sees current price for each option
  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tier = window.getDiscountTier(subtotal);
  const discount = tier ? subtotal * (tier.percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  const selfTotal = afterDiscount;
  const mailTotal = afterDiscount + 2.50;
  return (
    <div style={{ padding: 40 }}>
      <h3 className="serif" style={{ fontSize: 26, marginBottom: 8 }}>Your details</h3>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
        How would you like to receive your prints?
      </p>

      {/* Delivery method */}
      <div className="field" style={{ marginBottom: 24 }}>
        <label>Delivery method</label>
        <div style={{ display: 'grid', gap: 10 }}>
          <DeliveryOption
            id="self"
            active={customer.delivery === 'self'}
            onClick={() => update('delivery', 'self')}
            title="Self Collection"
            subtitle="📍 587 Woodlands Drive 16"
            price={subtotal > 0 ? window.fmt(selfTotal) : 'FREE'}
            priceLabel={subtotal > 0 ? 'Total' : null}
            priceColor="var(--success)"
          />
          <DeliveryOption
            id="mail"
            active={customer.delivery === 'mail'}
            onClick={() => update('delivery', 'mail')}
            title="SingPost Tracked Mailing"
            subtitle="📬 Island-wide delivery, tracked · 2–4 working days"
            price={subtotal > 0 ? window.fmt(mailTotal) : '+$2.50'}
            priceLabel={subtotal > 0 ? 'Total incl. shipping' : null}
            priceColor="var(--terracotta)"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="field">
          <label>Full name</label>
          <input className="input" value={customer.name} onChange={(e) => update('name', e.target.value)} placeholder="Jane Tan" />
        </div>
        <div className="field">
          <label>Phone</label>
          <input className="input" value={customer.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+65 9123 4567" />
        </div>
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Email</label>
          <input className="input" type="email" value={customer.email} onChange={(e) => update('email', e.target.value)} placeholder="jane@example.com" />
        </div>
        {isMail && (
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Mailing address</label>
            <textarea className="textarea" rows="3" value={customer.address} onChange={(e) => update('address', e.target.value)} placeholder="123 Orchard Road, #12-34, Singapore 238888" />
            <div style={{
              fontSize: 12, color: 'var(--muted)', marginTop: 6,
              padding: '8px 12px', background: 'var(--cream-soft)',
              borderLeft: '3px solid var(--terracotta)', borderRadius: 4,
            }}>
              📬 SingPost Tracked Mailing selected — please provide your full delivery details above.
            </div>
          </div>
        )}
        <div className="field" style={{ gridColumn: '1 / -1' }}>
          <label>Special instructions (optional)</label>
          <textarea className="textarea" rows="2" value={customer.notes} onChange={(e) => update('notes', e.target.value)} placeholder="Matte finish preferred, call before delivery…" />
        </div>
      </div>

      {/* Processing time note */}
      <div style={{
        marginTop: 20, padding: 16,
        background: 'var(--cream-soft)', borderRadius: 'var(--r-md)',
        fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>⏱️ Estimated processing time</div>
        <div>🏠 <strong>Self Collection:</strong> ready in <strong>1–2 days</strong></div>
        <div>📬 <strong>SingPost Tracked Mailing:</strong> 1–2 days processing + <strong>additional 2–4 working days</strong> for delivery (as per SingPost)</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button onClick={onBack} className="btn btn-ghost">← Back</button>
        <button onClick={onNext} disabled={!valid} className="btn btn-ink btn-lg" style={{ opacity: valid ? 1 : 0.4 }}>
          Continue to payment <window.ArrowRight />
        </button>
      </div>
    </div>
  );
}

function DeliveryOption({ active, onClick, title, subtitle, price, priceLabel, priceColor }) {
  return (
    <label onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      border: active ? '2px solid var(--ink)' : '1.5px solid var(--line)',
      borderRadius: 'var(--r-md)',
      background: active ? 'var(--cream-soft)' : '#fff',
      cursor: 'pointer',
      transition: 'border-color 0.15s ease',
    }}>
      <input type="radio" name="delivery" checked={active} onChange={() => {}} style={{ accentColor: 'var(--ink)', width: 16, height: 16 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{subtitle}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {priceLabel && (
          <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2, fontWeight: 600 }}>
            {priceLabel}
          </div>
        )}
        <div style={{ fontWeight: 700, fontSize: 16, color: priceColor }}>{price}</div>
      </div>
    </label>
  );
}

// ============================================================
// STEP 4 — PayNow + Google Drive link
// ============================================================
function Step4({ cart, customer, setCustomer, onBack, onNext }) {
  const [proof, setProof] = useStateShop(null);
  const [driveError, setDriveError] = useStateShop('');
  const [submitting, setSubmitting] = useStateShop(false);
  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tier = window.getDiscountTier(subtotal);
  const discount = tier ? subtotal * (tier.percent / 100) : 0;
  const afterDiscount = subtotal - discount;
  const isMail = customer.delivery === 'mail';
  const shipping = isMail ? 2.50 : 0;
  const total = afterDiscount + shipping;

  const updateCustomer = (k, v) => setCustomer((p) => ({ ...p, [k]: v }));

  const onProofUpload = (e) => {
    const file = (e.target.files || [])[0];
    if (file) setProof(file);
  };

  const handleConfirm = async () => {
    const link = (customer.driveLink || '').trim();
    if (!link) { setDriveError('Please paste your Google Drive folder link.'); return; }
    if (!link.includes('drive.google.com')) { setDriveError('That doesn\u2019t look like a Google Drive link.'); return; }
    if (!proof) { setDriveError('Please upload a screenshot of your PayNow payment.'); return; }
    if (customer.wantReceipt && !(customer.receivedFrom || '').trim()) {
      setDriveError('Please fill in the "Received from" details for your receipt, or uncheck "I need a receipt".');
      return;
    }
    setDriveError('');
    setSubmitting(true);

    try {
      if (!window.YQOrders) throw new Error('Order system not ready — please refresh and try again.');

      // Generate the order ID up front so the receipt PDF + Telegram both reference the same one.
      const orderId = window.YQOrders.generateOrderId();

      // Build receipt PDF if requested.
      let receipt = null;
      if (customer.wantReceipt && window.YQReceipt) {
        try {
          const lines = cart.map((c) => ({
            description: c.label || c.key,
            qty: c.qty,
            unitPrice: c.price,
          }));
          if (isMail) {
            lines.push({ description: 'SingPost Tracked Mailing', qty: 1, unitPrice: shipping });
          }
          receipt = window.YQReceipt.generate({
            orderId,
            receivedFrom: customer.receivedFrom,
            lines,
            subtotal: subtotal + shipping,
            discountPct: tier ? tier.percent : 0,
            discountAmount: discount,
            total,
          });
        } catch (rErr) {
          console.error('[YQ] receipt generation failed:', rErr);
          // non-fatal — order still goes through
        }
      }

      const result = await window.YQOrders.submit({
        orderId,
        name:           customer.name,
        carousell:      customer.carousell,
        email:          customer.email,
        phone:          customer.phone,
        delivery:       customer.delivery,
        mailingName:    customer.mailingName    || customer.name,
        mailingPhone:   customer.mailingPhone   || customer.phone,
        mailingAddress: customer.mailingAddress || customer.address,
        expectedDate:   customer.expectedDate,
        driveLink:      link,
        photoNotes:     customer.photoNotes,
        notes:          customer.notes,
        cart:           cart,
        total:          total,
        proofFile:      proof,
        receiptFile:    receipt ? receipt.blob : null,
        receiptName:    receipt ? receipt.filename : null,
      });
      // Pass receipt info forward so Step 5 can offer a download.
      onNext({ ...result, receipt });
    } catch (e) {
      console.error('[YQ] submit failed:', e);
      setDriveError('Could not submit your order: ' + e.message + ' — please try again or message us on Carousell.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h3 className="serif" style={{ fontSize: 26, marginBottom: 8 }}>Payment &amp; photos</h3>
      <p style={{ color: 'var(--muted)', marginBottom: 24, fontSize: 15 }}>
        Pay via PayNow and share your Google Drive folder so we can start printing.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }} className="step4-grid">
        <div>
          {/* PayNow QR */}
          <div className="field" style={{ marginBottom: 28 }}>
            <label>PayNow payment</label>
            <div style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-md)',
              padding: 24,
              display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
            }} className="paynow-card">
              <div style={{
                background: '#fff',
                padding: 12,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                flexShrink: 0,
              }}>
                <img src="assets/paynow-qr.jpg" alt="PayNow QR code"
                     style={{ width: 200, height: 200, display: 'block' }} />
                <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 }}>
                  Scan with your mobile banking app
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div className="label-mono" style={{ marginBottom: 8 }}>Payment details</div>
                <div style={{ fontSize: 14, lineHeight: 1.9 }}>
                  <div><strong>Phone:</strong> +65 9118 4071</div>
                  <div><strong>Name:</strong> Ong Yi Qin</div>
                  <div><strong>Amount:</strong> SGD ${total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment proof upload */}
          <div className="field" style={{ marginBottom: 28 }}>
            <label>Upload payment proof (screenshot) *</label>
            <label style={{
              display: 'block', padding: 24, border: '2px dashed var(--line)', borderRadius: 'var(--r-md)',
              textAlign: 'center', cursor: 'pointer', background: 'var(--cream-soft)',
            }}>
              <input type="file" accept="image/*" onChange={onProofUpload} style={{ display: 'none' }} />
              <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
              <div style={{ fontWeight: 600 }}>
                {proof ? `✓ ${proof.name}` : 'Click to upload payment screenshot'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>PNG, JPG, GIF up to 10 MB</div>
            </label>
          </div>

          {/* Google Drive link */}
          <div className="field" style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <label style={{ marginBottom: 0 }}>📂 Google Drive folder link *</label>
              <a href="https://yiqin88.github.io/yqphotoservices/google_drive_guide.html" target="_blank" rel="noopener"
                 style={{ fontSize: 12, fontWeight: 600, color: '#fff', background: 'var(--terracotta)',
                          padding: '6px 12px', borderRadius: 999, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                ❓ How to share my folder?
              </a>
            </div>
            <input
              className="input"
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={customer.driveLink}
              onChange={(e) => updateCustomer('driveLink', e.target.value)}
            />
            <div style={{
              fontSize: 12, color: 'var(--muted)', marginTop: 8,
              padding: '10px 14px', background: 'var(--cream-soft)',
              borderLeft: '3px solid var(--terracotta)', borderRadius: 4,
            }}>
              💡 Make sure the folder is shared with <strong>"Anyone with the link can view"</strong>.
            </div>
          </div>

          {/* Receipt request — collapsible */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-md)',
            padding: '14px 18px',
            marginBottom: 18,
          }}>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', margin: 0 }}>
              <input
                type="checkbox"
                checked={!!customer.wantReceipt}
                onChange={(e) => updateCustomer('wantReceipt', e.target.checked)}
                style={{ marginTop: 4, flexShrink: 0, width: 16, height: 16, accentColor: 'var(--terracotta)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>I need a receipt for this order</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                  PDF receipt downloadable on the next page (e.g. for company / school reimbursement).
                </div>
              </div>
            </label>
            {customer.wantReceipt && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line)' }}>
                <label style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>
                  Received from
                </label>
                <textarea
                  className="input"
                  rows="5"
                  placeholder={'Company / school / person name\nAddress line 1\nAddress line 2\nAttn: ...\nEmail: ...'}
                  value={customer.receivedFrom || ''}
                  onChange={(e) => updateCustomer('receivedFrom', e.target.value)}
                  style={{ marginTop: 8, fontFamily: 'var(--sans)', resize: 'vertical', minHeight: 110 }}
                />
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  This block is printed verbatim on the receipt under "Received from".
                </div>
              </div>
            )}
          </div>

          {/* Photo organisation guide */}
          <div style={{
            background: 'var(--cream-soft)',
            borderLeft: '4px solid var(--terracotta)',
            borderRadius: 8,
            padding: '16px 18px',
            fontSize: 13,
            color: 'var(--ink-soft)',
            lineHeight: 1.8,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--ink)' }}>📁 How to organise your photos in Google Drive</div>
            <div>If you are printing <strong>only one size</strong>, simply upload all photos into one folder.</div>
            <div style={{ marginTop: 6 }}>If you are printing <strong>more than one size</strong>, please either:</div>
            <div style={{ marginTop: 4, paddingLeft: 12 }}>• Create <strong>subfolders named by size</strong> (e.g. <em>4R</em>, <em>2R</em>, <em>A4</em>), or</div>
            <div style={{ paddingLeft: 12 }}>• <strong>Rename each photo</strong> with the size (e.g. <em>4R_photo1.jpg</em>, <em>2R_photo2.jpg</em>)</div>
            <div style={{ marginTop: 6 }}>For keychain orders, name your photos like <span style={{ fontFamily: 'var(--mono)', background: '#fff', padding: '1px 6px', borderRadius: 4 }}>key1-1, key1-2, key2-1, key2-2</span> so we know which photos pair on each keychain.</div>
          </div>

          {driveError && (
            <div style={{
              marginTop: 16, padding: 12,
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 8, fontSize: 13, color: '#991b1b',
            }}>{driveError}</div>
          )}
        </div>

        {/* Summary */}
        <div style={{
          background: 'var(--cream-soft)',
          padding: 24,
          borderRadius: 'var(--r-md)',
          alignSelf: 'start',
        }} className="step4-summary">
          <div className="label-mono" style={{ marginBottom: 12 }}>Order summary</div>
          {cart.map((c) => (
            <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span>{c.qty} × {c.key}</span>
              <span>{window.fmt(c.qty * c.price)}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid var(--line)', marginTop: 12, paddingTop: 12 }}>
            <Row label="Subtotal" value={window.fmt(subtotal)} />
            {tier && (
              <Row label={`Discount (${tier.percent}% off)`} value={`− ${window.fmt(discount)}`} highlight />
            )}
            <Row label={isMail ? 'SingPost Tracked Mailing' : 'Self Collection'} value={isMail ? window.fmt(shipping) : 'FREE'} highlight={!isMail} />
            <Row label="Total" value={window.fmt(total)} big />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button onClick={onBack} className="btn btn-ghost">← Back</button>
        <button onClick={handleConfirm} disabled={submitting} className="btn btn-terra btn-lg" style={{ opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Submitting…' : <>Submit order <window.ArrowRight /></>}
        </button>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .step4-grid { grid-template-columns: 1fr !important; }
          .paynow-card { justify-content: center !important; }
        }
      `}</style>
    </div>
  );
}

// ============================================================
// STEP 5 — confirmation
// ============================================================
function Step5({ result, onRestart }) {
  const orderId = (result && result.orderId) || '—';
  const receipt = result && result.receipt;
  const copyId = () => {
    if (navigator.clipboard && orderId !== '—') navigator.clipboard.writeText(orderId);
  };

  // Auto-download the receipt once on arrival, so the customer always has a copy.
  React.useEffect(() => {
    if (!receipt || !receipt.blob) return;
    try {
      const url = URL.createObjectURL(receipt.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = receipt.filename || `YQReceipt_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Keep the URL alive so the visible "Download receipt" button keeps working.
      // It will be GC'd when the user leaves the page.
    } catch (e) {
      console.warn('[YQ] auto-download receipt failed:', e);
    }
    // eslint-disable-next-line
  }, [receipt && receipt.filename]);

  const downloadReceipt = () => {
    if (!receipt || !receipt.blob) return;
    const url = URL.createObjectURL(receipt.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = receipt.filename || `YQReceipt_${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };
  return (
    <div style={{ padding: '60px 40px', textAlign: 'center' }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'var(--success)', color: '#fff',
        display: 'inline-grid', placeItems: 'center',
        fontSize: 36, marginBottom: 24,
      }}>✓</div>
      <h3 className="display-md" style={{ marginBottom: 12 }}>
        Order received.
      </h3>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '10px 20px', background: 'var(--terracotta)', color: '#fff', borderRadius: 999, fontWeight: 700, letterSpacing: 2, fontSize: 18 }}>
        <span>{orderId}</span>
        <button onClick={copyId} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}>COPY</button>
      </div>

      <p className="serif-italic" style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 12, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
        Thanks! We've sent a confirmation email and notified the studio. Please message us on Carousell with this order number so we can validate your payment.
      </p>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 32 }}>
        ⚠️ This is not a final receipt — YQ Photo Services will confirm once payment is verified.
      </p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {receipt && (
          <button onClick={downloadReceipt} className="btn btn-terra">
            🧾 Download receipt ({receipt.receiptNo})
          </button>
        )}
        <a href="https://www.carousell.sg/u/yiqin88" target="_blank" rel="noopener" className="btn btn-ink">Message us on Carousell</a>
        <button onClick={onRestart} className="btn btn-ghost">Place another order</button>
      </div>
    </div>
  );
}

Object.assign(window, { DiscountTiers, ShopFlow });
