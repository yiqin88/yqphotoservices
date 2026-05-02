/* global React, ReactDOM */
const { useState, useEffect } = React;

function App() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [customer, setCustomer] = useState({
    name: '', email: '', phone: '', address: '', notes: '',
    delivery: 'self', // 'self' | 'mail'
    driveLink: '', expectedDate: '',
  });
  const [tweaks, setTweaks] = window.useTweaks ? window.useTweaks(window.TWEAK_DEFAULTS) : [{}, () => {}];

  // Apply theme tweaks to :root
  useEffect(() => {
    const root = document.documentElement;
    const t = tweaks || {};
    if (t.theme === 'mono') {
      root.style.setProperty('--cream', '#FAFAFA');
      root.style.setProperty('--cream-soft', '#F0F0F0');
      root.style.setProperty('--cream-deep', '#E0E0E0');
      root.style.setProperty('--ink', '#0A0A0A');
      root.style.setProperty('--terracotta', '#0A0A0A');
      root.style.setProperty('--peach', '#E0E0E0');
      root.style.setProperty('--peach-soft', '#F0F0F0');
      root.style.setProperty('--line', '#D6D6D6');
      root.style.setProperty('--line-soft', '#E8E8E8');
    } else if (t.theme === 'dark') {
      root.style.setProperty('--cream', '#15110D');
      root.style.setProperty('--cream-soft', '#1F1A14');
      root.style.setProperty('--cream-deep', '#2A2520');
      root.style.setProperty('--ink', '#FBF7F1');
      root.style.setProperty('--ink-soft', '#E8DCC6');
      root.style.setProperty('--muted', '#A89888');
      root.style.setProperty('--line', '#3A322A');
      root.style.setProperty('--line-soft', '#2A2520');
    } else {
      // warm (default)
      root.style.setProperty('--cream', '#FBF7F1');
      root.style.setProperty('--cream-soft', '#F4ECDD');
      root.style.setProperty('--cream-deep', '#E8DCC6');
      root.style.setProperty('--ink', '#1A1612');
      root.style.setProperty('--ink-soft', '#3A322A');
      root.style.setProperty('--muted', '#6B5F52');
      root.style.setProperty('--terracotta', 'oklch(0.62 0.13 40)');
      root.style.setProperty('--peach', '#F5C9A8');
      root.style.setProperty('--peach-soft', '#FBE5D6');
      root.style.setProperty('--line', '#E0D4BF');
      root.style.setProperty('--line-soft', '#EFE6D4');
    }
  }, [tweaks?.theme]);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const scrollToShop = () => {
    // Defer to next frame so any pending React re-render commits before we
    // measure the target. Without this, iOS Safari smooth scroll uses the
    // pre-render layout and can overshoot past #shop when the cart update
    // changes Step 1 height (e.g. the keychains-in-order summary card).
    // Also subtract sticky header height so the section header is not
    // hidden behind the nav bar.
    requestAnimationFrame(() => {
      const el = document.getElementById('shop');
      if (!el) return;
      const headerOffset = 80;
      const top = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  };

  return (
    <>
      <window.Header cartCount={cartCount} onCartClick={scrollToShop} onShopClick={scrollToShop} />
      <window.Hero onShopClick={scrollToShop} />
      <window.Marquee />
      <window.ProductShowcase onShopClick={scrollToShop} />
      <window.DiscountTiers />
      <window.KeychainProduct onAddKeychain={(kc) => {
        setCart((prev) => {
          let next = [...prev];
          (kc.lines || []).forEach((line) => {
            const key = `KC-${line.frame}`;
            const label = line.frame === 'none'
              ? 'Acrylic keychain'
              : `Acrylic keychain + ${line.frame} frame`;
            const unit = line.unitPrice + line.framePrice;
            const existing = next.find((c) => c.key === key);
            if (existing) {
              next = next.map((c) => c.key === key ? { ...c, qty: c.qty + line.qty } : c);
            } else {
              next = [...next, { key, qty: line.qty, price: unit, label, size: '46 × 28 mm' }];
            }
          });
          return next;
        });
        scrollToShop();
      }} />
      <window.ShopFlow
        step={step} setStep={setStep}
        cart={cart} setCart={setCart}
        customer={customer} setCustomer={setCustomer}
        lastOrder={lastOrder} setLastOrder={setLastOrder}
      />
      <window.Quality />
      <window.Reviews />
      <window.FAQ />
      <window.Footer />

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <window.TweaksPanel>
          <window.TweakSection title="Theme">
            <window.TweakRadio
              label="Color theme"
              value={tweaks.theme}
              onChange={(v) => setTweaks('theme', v)}
              options={[
                { value: 'warm', label: 'Warm' },
                { value: 'mono', label: 'Mono' },
                { value: 'dark', label: 'Dark' },
              ]}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
