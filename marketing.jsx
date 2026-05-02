/* global React */
const { useState: useStateProd } = React;

// ============================================================
// PRODUCT GALLERY — print sizes with imagery
// ============================================================
function ProductShowcase({ onShopClick }) {
  return (
    <section id="gallery" className="section" style={{ background: 'var(--cream)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56, gap: 24, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 640 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Sample gallery</div>
            <h2 className="display-xl">
              How your prints<br/>
              <span className="serif-italic" style={{ color: 'var(--terracotta)' }}>actually arrive.</span>
            </h2>
          </div>
          <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 360 }}>
            These are prints from my own family albums, photographed straight out of the studio
            — so you can see exactly how the paper, colour and finish turn out.
          </p>
        </div>

        {/* Editorial grid */}
        <div className="gallery-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: 28,
        }}>
          <GalleryItem src="assets/photo-2.png" caption="Couple holiday · 3R" tag="3R" col="span 7" />
          <GalleryItem src="assets/photo-3.png" caption="Day out · 4R borderless" tag="4R" col="span 5" tilt={1.2} />
          <GalleryItem src="assets/photo-6.png" caption="Glamping · 8R" tag="8R" col="span 5" tilt={-1.5} />
          <GalleryItem src="assets/photo-7.png" caption="Friends reunion · A4" tag="A4" col="span 7" />
          <GalleryItem src="assets/photo-8.png" caption="Graduation portrait · A3 / 30×40cm" tag="A3" col="span 7" />
          <GalleryItem src="assets/photo-4.png" caption="Travel diaries · 4R bordered" tag="4R" col="span 5" tilt={1} />
        </div>

        <div style={{ textAlign: 'center', marginTop: 56 }}>
          <button onClick={onShopClick} className="btn btn-ink btn-lg">
            Print yours <window.ArrowRight />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px) {
          .gallery-grid > * { grid-column: span 12 !important; }
        }
      `}</style>
    </section>
  );
}

function GalleryItem({ src, caption, tag, col, tilt = 0 }) {
  return (
    <div style={{ gridColumn: col }}>
      <div className="print-frame" style={{ transform: `rotate(${tilt}deg)`, padding: '14px 14px 40px' }}>
        <img src={src} alt={caption} style={{ aspectRatio: '4 / 3', objectFit: 'cover' }} />
        <div style={{
          position: 'absolute', bottom: 12, left: 16, right: 16,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span className="serif-italic" style={{ fontSize: 14, color: 'var(--muted)' }}>{caption}</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: 10, letterSpacing: '0.06em',
            color: 'var(--terracotta)', fontWeight: 600,
          }}>{tag}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// QUALITY / WHY YQ
// ============================================================
function Quality() {
  const items = [
    {
      icon: 'paper',
      title: 'Premium resin-coated semi-gloss',
      body: 'One paper, done right. Archival rated for 100+ years under album-safe-keeping conditions. Rich colour, deep blacks, no yellowing.',
    },
    {
      icon: 'lab',
      title: 'Lab-calibrated colour',
      body: 'Every print runs through colour-matched profiles. What you see on screen is what arrives at your door.',
    },
    {
      icon: 'box',
      title: 'Hand-checked, hand-packed',
      body: 'Every order is reviewed by a human before it leaves the studio. Damaged in transit? We reprint it free.',
    },
  ];
  return (
    <section id="quality" className="section" style={{ background: 'var(--cream-soft)', position: 'relative', overflow: 'hidden' }}>
      <div className="container">
        <div style={{ maxWidth: 640, marginBottom: 56 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>The promise</div>
          <h2 className="display-xl">
            We obsess over<br/>
            <span className="serif-italic">every print.</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 28 }}>
          {items.map((it, i) => (
            <div key={i} style={{
              background: '#fff',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r-lg)',
              padding: '32px 28px',
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--cream-deep)',
                display: 'grid', placeItems: 'center',
                marginBottom: 20,
                color: 'var(--terracotta)',
              }}>
                <QualityIcon kind={it.icon} />
              </div>
              <h3 className="serif" style={{ fontSize: 22, marginBottom: 12, lineHeight: 1.2 }}>{it.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function QualityIcon({ kind }) {
  if (kind === 'paper') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
  if (kind === 'lab') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 010 18M3 12h18" />
    </svg>
  );
  if (kind === 'box') return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" /><path d="M3 7l9 4 9-4M12 11v10" />
    </svg>
  );
  return null;
}

// ============================================================
// REVIEWS
// ============================================================
function Reviews() {
  return (
    <section id="reviews" className="section">
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Word of mouth</div>
            <h2 className="display-xl">
              Real reviews,<br/>
              <span className="serif-italic">straight from Carousell.</span>
            </h2>
          </div>
          <div style={{ textAlign: 'right' }}>
            <window.Stars n={5} size={20} />
            <div className="serif" style={{ fontSize: 32, marginTop: 8 }}>5.0 / 5</div>
            <div className="label-mono">From verified Carousell buyers</div>
          </div>
        </div>

        <div className="reel">
          {window.REVIEWS.map((r, i) => (
            <div key={i} style={{
              flex: '0 0 380px',
              background: '#fff',
              border: '1px solid var(--line-soft)',
              borderRadius: 'var(--r-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', flexDirection: 'column',
            }}>
              <window.Stars n={r.rating} size={14} />
              {r.badges && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
                  {r.badges.map((b) => (
                    <span key={b} style={{
                      fontSize: 11, fontFamily: 'var(--mono)', fontWeight: 500,
                      padding: '4px 10px', borderRadius: 999,
                      background: 'var(--cream-deep)', color: 'var(--ink)',
                      border: '1px solid var(--line-soft)',
                    }}>{b}</span>
                  ))}
                </div>
              )}
              <p className="serif-light" style={{ fontSize: 18, lineHeight: 1.55, margin: '16px 0 24px', color: 'var(--ink)', flex: 1 }}>
                “{r.body}”
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line-soft)', paddingTop: 16 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>@{r.name}</div>
                  <div className="label-mono" style={{ marginTop: 2 }}>Carousell buyer</div>
                </div>
                <span className="pill pill-cream">{r.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FAQ
// ============================================================
function FAQ() {
  const [open, setOpen] = useStateProd(0);
  return (
    <section id="faq" className="section" style={{ background: 'var(--cream-soft)' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Questions</div>
          <h2 className="display-xl">Good to know.</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {window.FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderTop: '1px solid var(--line)' }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: '100%',
                    padding: '24px 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    gap: 24,
                  }}
                >
                  <span className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{f.q}</span>
                  <span style={{
                    width: 36, height: 36, borderRadius: '50%',
                    border: '1.5px solid var(--ink)',
                    display: 'grid', placeItems: 'center',
                    flexShrink: 0,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease',
                  }}>
                    <window.ChevDown size={14} />
                  </span>
                </button>
                <div style={{
                  maxHeight: isOpen ? 200 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s ease, padding 0.3s ease',
                  paddingBottom: isOpen ? 24 : 0,
                }}>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 16, lineHeight: 1.65, maxWidth: 620 }}>
                    {f.a}
                  </p>
                </div>
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid var(--line)' }}></div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer() {
  return (
    <footer style={{ background: 'var(--ink)', color: 'var(--cream)', padding: '64px 0 32px' }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))',
          gap: 48,
          marginBottom: 48,
        }} className="footer-grid">
          <div>
            <div className="serif" style={{ fontSize: 28, marginBottom: 16, letterSpacing: '-0.02em' }}>
              YQ Photo Services
            </div>
            <p style={{ color: 'rgba(251, 247, 241, 0.6)', fontSize: 14, lineHeight: 1.6, maxWidth: 320 }}>
              Premium photo printing in Singapore.
              Eight years of preserving the moments that matter.
            </p>
          </div>
          <FooterCol title="Shop" items={['All sizes', 'Discounts', 'Stickers', 'Large format']} />
          <FooterCol title="Studio" items={['About us', 'Quality promise', 'Sample gallery', 'Reviews']} />
          <FooterCol title="Help" items={['FAQ', 'Contact', 'Shipping', 'Returns']} />
        </div>
        <div style={{
          paddingTop: 32,
          borderTop: '1px solid rgba(251, 247, 241, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 12,
          color: 'rgba(251, 247, 241, 0.5)',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>© 2026 YQ Photo Services · Singapore</div>
          <div className="serif-italic">Print the moments that matter.</div>
        </div>
      </div>
      <style>{`
        @media (max-width: 720px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="label-mono" style={{ color: 'var(--peach)', marginBottom: 14 }}>{title}</div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.map((it, i) => (
          <li key={i}>
            <a href="#" style={{ color: 'rgba(251, 247, 241, 0.75)', fontSize: 14, transition: 'color 0.2s' }}>{it}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

Object.assign(window, { ProductShowcase, Quality, Reviews, FAQ, Footer });
