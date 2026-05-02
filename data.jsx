/* global React */
const { useState, useEffect, useRef } = React;

// ============================================================
// PRICING DATA (preserved from original)
// ============================================================
window.PRICING = {
  '2R':       { inches: '2.5 × 3.5 in', cm: '6 × 9 cm',        price: 0.50,  bundleInfo: '9 prints = $4.50',  priceLabel: '$0.50',  category: 'small',  popular: true },
  '3R':       { inches: '3.5 × 5 in',   cm: '9 × 13 cm',       price: 0.70,  bundleInfo: '4 prints = $2.80',  priceLabel: '$0.70',  category: 'small',  popular: true },
  '4R':       { inches: '4 × 6 in',     cm: '10 × 15 cm',      price: 0.70,  bundleInfo: 'Most ordered size', priceLabel: '$0.70',  category: 'small',  popular: true },
  '5R':       { inches: '5 × 7 in',     cm: '13 × 18 cm',      price: 2.00,  bundleInfo: 'Frame favorite',    priceLabel: '$2.00',  category: 'medium', popular: false },
  '6R':       { inches: '6 × 8 in',     cm: '15 × 20 cm',      price: 3.50,  bundleInfo: 'Display ready',     priceLabel: '$3.50',  category: 'medium', popular: false },
  '8R':       { inches: '8 × 10 in',    cm: '20 × 25 cm',      price: 4.00,  bundleInfo: 'Statement size',    priceLabel: '$4.00',  category: 'medium', popular: false },
  '10R':      { inches: '10 × 12 in',   cm: '25 × 30 cm',      price: 10.00, bundleInfo: 'Wall worthy',       priceLabel: '$10.00', category: 'large',  popular: false },
  'A4':       { inches: '8.3 × 11.7 in',cm: '21 × 29.7 cm',    price: 3.50,  bundleInfo: 'Document size',     priceLabel: '$3.50',  category: 'medium', popular: true },
  'A3':       { inches: '11.7 × 16.5 in',cm: '29.7 × 42 cm',   price: 10.50, bundleInfo: 'Poster format',     priceLabel: '$10.50', category: 'large',  popular: false },
  'STICKERS': { inches: '',             cm: 'A4 sheet',        price: 3.50,  bundleInfo: 'A4 sheet',          priceLabel: '$3.50',  category: 'special',popular: false },
  '30x40cm':  { inches: '11.8 × 15.7 in',cm: '30 × 40 cm',     price: 10.50, bundleInfo: 'Large format',      priceLabel: '$10.50', category: 'large',  popular: false },
};

window.MIN_ORDER = 5.00;
window.FREE_SHIP_THRESHOLD = 30.00;

// Tiered discounts: spend more, save more.
window.DISCOUNT_TIERS = [
  { threshold: 30,  percent: 5,  label: 'Spend $30 +', sub: '5% off entire order' },
  { threshold: 50,  percent: 7,  label: 'Spend $50 +', sub: '7% off entire order' },
  { threshold: 100, percent: 10, label: 'Spend $100 +', sub: '10% off entire order' },
];

window.getDiscountTier = (subtotal) => {
  let active = null;
  for (const t of window.DISCOUNT_TIERS) {
    if (subtotal >= t.threshold) active = t;
  }
  return active;
};

// Real Carousell reviews from YQ_Photo_Services customers.
window.REVIEWS = [
  {
    name: 'BangS', rating: 5, tag: 'Photo printing',
    badges: ['Value for money', 'Great communication', 'Above and beyond', 'High quality'],
    body: 'Service was superb 👍 Seller responded very fast and friendly! He kept updating on the progress so won\'t worry at all of process and quality. Photos quality also sooooo nice! Delivery also very fast and if you are near by, seller will deliver it with care.. Definitely request printing again! Thank you so much, seller!',
  },
  {
    name: 'baileyss', rating: 5, tag: 'Wedding prints',
    body: 'Seller deserves more than 5 stars 🥲 Printed some of my wedding photos with her and it turned out so amazing, crisp and clear. Printed my photos elsewhere and nothing can compare to this. Extremely efficient and keeps you updated about the progress as well. Highly highly recommended.',
  },
  {
    name: 'chinesesingaporeanboss', rating: 5, tag: 'Photo printing',
    body: "Trustworthy seller, strictly base on trust to make this deal happen. We're lucky to found YQ, very impress with her extra-mile service. Paid first to YQ via PayLah and collect actually product which was mentioned. Happy to do business with trusted good hearted people, highly recommend YQ service. \u611f\u6069\u8c22\u8c22\u4f60.",
  },
  {
    name: 'smiley21', rating: 5, tag: 'Photo printing',
    badges: ['Great communication', 'Knows their stuff'],
    body: 'The photos turn out very nice. Worth the price offered. He recommended which type of photo to use to get sharper and clearer printed photos. Good and would order again if need in future.',
  },
  {
    name: 'jeribombomb', rating: 5, tag: 'Acrylic keychains',
    badges: ['Unique listings', 'Above and beyond'],
    body: 'Superb quality printing, even small font was also clear! Also offered free delivery as the location was nearby. Would contact her again if I\'m looking to print similar keychains!',
  },
  {
    name: 'thecraftyfox', rating: 5, tag: 'Photo printing',
    body: 'Really good quality photos and my order was so last minute, he accommodated the order and delivered within the hour. Definitely recommend to others.',
  },
  {
    name: 'one0eightapparel', rating: 5, tag: 'Acrylic keychains',
    body: 'Swift replies and excellent service provided by the seller. Items were received in perfect condition and high quality. Thank you very much.',
  },
];

window.FAQS = [
  { q: 'How long does my order take?', a: 'Standard turnaround is 2–4 working days from upload to dispatch. We send you a tracking link the moment your prints leave the studio.' },
  { q: 'What paper do you print on?', a: 'One paper, done right — premium resin-coated semi-gloss. Fade-resistant and archival rated for 100+ years under album-safe-keeping conditions. Rich colour, deep blacks, smooth handling.' },
  { q: 'Can I order custom sizes?', a: 'Yes. Get in touch via our chat or email and we’ll quote you. Most cm-based custom sizes are no extra charge.' },
  { q: 'Is there a minimum order?', a: 'Yes — a $5 minimum to keep things sustainable. Most customers easily clear this with a small print pack.' },
  { q: 'What file formats do you accept?', a: 'JPEG, PNG, HEIC and TIFF. We recommend high-resolution originals for best results — at least 300 DPI for prints up to 8R.' },
  { q: 'Do you offer rush printing?', a: 'Same-day printing is available on request. Drop us a chat message and we’ll do our best to accommodate.' },
];

// ============================================================
// FORMAT
// ============================================================
window.fmt = (n) => '$' + n.toFixed(2);

// ============================================================
// STAR ICON
// ============================================================
window.Star = ({ filled = true, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path d="M8 1.5l2.06 4.18 4.61.67-3.34 3.25.79 4.59L8 11.97l-4.12 2.17.79-4.59L1.33 6.35l4.61-.67L8 1.5z" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

window.Stars = ({ n = 5, size = 14 }) => (
  <div style={{ display: 'inline-flex', gap: 2, color: 'var(--gold)' }}>
    {Array.from({ length: 5 }).map((_, i) => <window.Star key={i} filled={i < n} size={size} />)}
  </div>
);

// ============================================================
// CHEVRON / ARROW
// ============================================================
window.ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);
window.ChevDown = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6l5 5 5-5" />
  </svg>
);
