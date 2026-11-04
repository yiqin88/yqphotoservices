/* global React */
// ============================================================
// PERSONALISED GIFTS — links to the self-service designers
// ============================================================
function GiftsShowcase() {
  const P = (window.YQMagnets && window.YQMagnets.products) || {};
  const items = ['magnet', 'ornament', 'puzzle'].map((k) => P[k]).filter(Boolean);
  const fmt = (n) => '$' + n.toFixed(2);

  return (
    <section id="gifts" className="section" style={{
      background: 'linear-gradient(180deg, var(--cream) 0%, var(--peach-soft) 100%)',
      borderTop: '1px solid var(--line-soft)',
    }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 48 }}>
          <div style={{ maxWidth: 660 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <span className="pill pill-terra">New</span>
              <span className="eyebrow">Personalised gifts</span>
            </div>
            <h2 className="display-xl">
              Your photo,<br/>
              <span className="serif-italic" style={{ color: 'var(--terracotta)' }}>made into a keepsake.</span>
            </h2>
          </div>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 380 }}>
            Design it yourself in a minute — upload a photo, drag it into place, add a name or date.
            You see exactly what we print. Perfect for Christmas, birthdays and cruise door décor.
          </p>
        </div>

        <div className="gifts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 28 }}>
          {items.map((p) => (
            <a key={p.id} href={p.page} className="gift-card" style={{
              display: 'flex', flexDirection: 'column',
              background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)',
              overflow: 'hidden', textDecoration: 'none', color: 'inherit',
              boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              <div style={{ position: 'relative' }}>
                <img src={p.img} alt={`Example ${p.label}`} loading="lazy" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover' }} />
                <span className="pill" style={{
                  position: 'absolute', top: 14, left: 14,
                  background: 'rgba(255,255,255,0.92)', color: 'var(--ink)', fontWeight: 600,
                }}>📏 {p.sizeText}</span>
              </div>
              <div style={{ padding: '22px 24px 24px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <h3 className="serif" style={{ fontSize: 24 }}>{p.label}</h3>
                  <span className="serif" style={{ fontSize: 22, color: 'var(--terracotta)', whiteSpace: 'nowrap' }}>
                    {p.price ? fmt(p.price) : 'Soon'}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5, flex: 1 }}>{p.blurb}</p>
                <span className={p.available ? 'btn btn-ink' : 'btn btn-soft'} style={{ marginTop: 10 }}>
                  {p.available ? 'Design yours' : 'Coming soon · try the designer'} <window.ArrowRight />
                </span>
              </div>
            </a>
          ))}
        </div>

        <div className="gifts-steps" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 20, marginTop: 40,
        }}>
          {[
            ['1', 'Upload a photo', 'Straight from your phone — we warn you if it’s too small to print sharply.'],
            ['2', 'Make it yours', 'Drag, zoom and rotate inside the real shape. Add a name, date or message.'],
            ['3', 'We print & deliver', 'Pay by PayNow, mix with photo prints, self-collect or SingPost.'],
          ].map(([n, t, d]) => (
            <div key={n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div className="serif" style={{
                width: 40, height: 40, borderRadius: '50%', background: 'var(--ink)', color: 'var(--cream)',
                display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0,
              }}>{n}</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{t}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .gift-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg) !important; }
        @media (max-width: 900px) {
          .gifts-grid, .gifts-steps { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}

Object.assign(window, { GiftsShowcase });
