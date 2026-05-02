/* global React */
const { useState: useStateHero, useEffect: useEffectHero } = React;

// ============================================================
// HEADER
// ============================================================
function Header({ cartCount, onCartClick, onShopClick }) {
  const [scrolled, setScrolled] = useStateHero(false);
  useEffectHero(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: scrolled ? 'rgba(251, 247, 241, 0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '1px solid var(--line-soft)' : '1px solid transparent',
      transition: 'all 0.3s ease',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px' }}>
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <img
            src="assets/yq-logo.png"
            alt="YQ Photo Services"
            style={{
              width: 44, height: 44, borderRadius: '50%',
              objectFit: 'cover', display: 'block',
              border: '1px solid var(--line-soft)',
            }}
          />
          <div>
            <div className="serif" style={{ fontSize: 19, lineHeight: 1, letterSpacing: '-0.01em' }}>
              YQ Photo Services
            </div>
            <div className="label-mono" style={{ fontSize: 9, marginTop: 3 }}>
              Print studio · est. 2018
            </div>
          </div>
        </a>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="nav-links">
          <a href="#shop"     style={navLinkStyle}>Shop</a>
          <a href="#gallery"  style={navLinkStyle}>Gallery</a>
          <a href="#quality"  style={navLinkStyle}>Quality</a>
          <a href="#reviews"  style={navLinkStyle}>Reviews</a>
          <a href="#faq"      style={navLinkStyle}>FAQ</a>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onCartClick} className="btn btn-soft btn-sm" style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3h2l1.5 8.5h7L14 5H5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6.5" cy="13.5" r="1" /><circle cx="11.5" cy="13.5" r="1" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--terracotta)', color: '#fff',
                width: 20, height: 20, borderRadius: '50%',
                fontSize: 11, fontWeight: 700,
                display: 'grid', placeItems: 'center',
              }}>{cartCount}</span>
            )}
          </button>
          <button onClick={onShopClick} className="btn btn-ink btn-sm">Order prints</button>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </header>
  );
}
const navLinkStyle = {
  fontSize: 14, fontWeight: 500, color: 'var(--ink-soft)',
  letterSpacing: '0.005em',
  transition: 'color 0.2s ease',
};

// ============================================================
// HERO
// ============================================================
function Hero({ onShopClick }) {
  return (
    <section style={{
      position: 'relative',
      paddingTop: 40,
      paddingBottom: 80,
      overflow: 'hidden',
    }}>
      {/* Soft warm gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 75% 30%, rgba(245, 201, 168, 0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 20% 70%, rgba(232, 220, 198, 0.5), transparent 60%)',
        zIndex: 0,
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>

        {/* Eyebrow row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <span className="pill pill-cream">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }}></span>
            Open · Same-day printing available
          </span>
          <span className="eyebrow">Singapore · Est. 2018</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
          gap: 64,
          alignItems: 'center',
        }} className="hero-grid">

          {/* Left: copy */}
          <div>
            <h1 className="display-xxl" style={{ marginBottom: 28 }}>
              Real prints,<br />
              <span className="serif-italic" style={{ color: 'var(--terracotta)' }}>real keepsakes.</span>
            </h1>
            <p style={{
              fontSize: 19, lineHeight: 1.55, color: 'var(--ink-soft)',
              maxWidth: 540, marginBottom: 36,
            }}>
              Photo printing the way it should be — premium fade-resistant paper,
              honest pricing from <span style={{ fontWeight: 600 }}>$0.50</span> a print, and turnaround in 2–4 days.
              Eight years and tens of thousands of memories printed.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <button onClick={onShopClick} className="btn btn-ink btn-lg">
                Start your order <window.ArrowRight />
              </button>
              <a href="#gallery" className="btn btn-ghost btn-lg">See our prints</a>
            </div>

            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
              paddingTop: 32,
              borderTop: '1px solid var(--line)',
              maxWidth: 540,
            }}>
              <Stat n="50k+" label="Prints delivered" />
              <Stat n="4.9★" label="Avg. customer rating" />
              <Stat n="2–4d" label="Turnaround" />
            </div>
          </div>

          {/* Right: print collage */}
          <div style={{ position: 'relative', minHeight: 580 }} className="hero-collage">
            {/* Vertical slats faint backdrop */}
            <div style={{
              position: 'absolute',
              inset: '-40px -40px -40px -40px',
              background: `repeating-linear-gradient(to right,
                rgba(232,220,198,0.5) 0,
                rgba(232,220,198,0.5) 22px,
                rgba(244,236,221,0.5) 22px,
                rgba(244,236,221,0.5) 44px)`,
              borderRadius: 'var(--r-xl)',
              zIndex: 0,
            }} />

            {/* Big print */}
            <div className="print-frame" style={{
              position: 'absolute',
              top: 30, left: 30,
              width: '70%',
              transform: 'rotate(-2deg)',
              zIndex: 2,
            }}>
              <img src="assets/photo-5.png" alt="Family photo prints leaning on the studio backdrop" />
              <div style={{
                position: 'absolute', bottom: 8, left: 16,
                fontFamily: 'var(--serif)', fontStyle: 'italic',
                fontSize: 14, color: 'var(--muted)',
              }}>
                Tan family · Guilin, 2024
              </div>
            </div>

            {/* Smaller print */}
            <div className="print-frame tilt-r" style={{
              position: 'absolute',
              bottom: 40, right: 0,
              width: '50%',
              zIndex: 3,
            }}>
              <img src="assets/photo-1.png" alt="Beach holiday print example" />
            </div>

            {/* Floating swatch */}
            <div style={{
              position: 'absolute',
              top: 0, right: 20,
              background: 'var(--ink)',
              color: 'var(--cream)',
              padding: '14px 18px',
              borderRadius: 12,
              boxShadow: 'var(--shadow-md)',
              transform: 'rotate(4deg)',
              zIndex: 4,
            }}>
              <div className="label-mono" style={{ color: 'var(--peach)', fontSize: 10 }}>From</div>
              <div className="serif" style={{ fontSize: 28, lineHeight: 1, marginTop: 2 }}>$0.50</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>per print</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
          .hero-collage { min-height: 420px !important; }
        }
      `}</style>
    </section>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="serif" style={{ fontSize: 28, lineHeight: 1, color: 'var(--ink)' }}>{n}</div>
      <div className="label-mono" style={{ marginTop: 6 }}>{label}</div>
    </div>
  );
}

// ============================================================
// MARQUEE — quality promises bar
// ============================================================
function Marquee() {
  const items = [
    'Premium fade-resistant paper',
    'Lab-grade colour calibration',
    '2–4 day turnaround',
    'Free shipping over $30',
    '100+ year archival rating',
    'Print sizes from 2R to A3',
    'Singapore-based studio',
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      background: 'var(--ink)',
      color: 'var(--cream)',
      padding: '18px 0',
      overflow: 'hidden',
      borderTop: '1px solid #2a2520',
      borderBottom: '1px solid #2a2520',
    }}>
      <div style={{
        display: 'flex',
        gap: 56,
        whiteSpace: 'nowrap',
        animation: 'marquee 40s linear infinite',
        width: 'max-content',
      }}>
        {doubled.map((t, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 56, fontSize: 14, fontFamily: 'var(--serif)', fontStyle: 'italic', letterSpacing: '0.005em' }}>
            <span>{t}</span>
            <span style={{ opacity: 0.4 }}>✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Header, Hero, Marquee });
