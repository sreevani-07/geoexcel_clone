/* GeoExcel – catalogue + site config. Edit this file to change products, prices or the payment gateway. */
window.GX = {
  config: {
    locale: 'en-IN',
    currency: 'INR',
    shippingFlat: 99,          // flat shipping per order
    freeShippingOver: 2000,    // free shipping above this subtotal
    email: 'Info@geoexcel.group',
    phone: '+91 8035110602',
    address: ['3C918, 3rd Cross, 1st Block,', 'HRBR Layout, Bangalore 560043'],
    gateway: {
      provider: 'razorpay',
      keyId: '',               // <- paste your Razorpay Key ID (rzp_test_… / rzp_live_…) to go live
      brand: 'GeoExcel'
    }
  },

  categories: [
    { id: 'rice',   name: 'Rice',               photo: 'assets/rice.jpg',   blurb: 'Long-grain, aged and clean-milled.' },
    { id: 'spices', name: 'Whole Spices',       photo: 'assets/spices.jpg', blurb: 'Whole, sun-dried, sealed for aroma.' },
    { id: 'oil',    name: 'Edible Oil & Ghee',  photo: 'assets/oil.jpg',    blurb: 'Pressed and filtered, nothing added.' },
    { id: 'iqf',    name: 'IQF Products',       photo: null,                blurb: 'Individually quick frozen at peak.' },
    { id: 'fashion',name: 'Fashion & Lifestyle',photo: null,                blurb: 'Everyday pieces, made to last.' }
  ],

  /* pack: pouch | bottle | jar | carton | tote.  photo: optional original asset shown on the pack label. */
  products: [
    { id: 'basmati-1121', cat: 'rice', name: 'Basmati 1121 Steam', short: ['Basmati', '1121 Steam'], pack: 'pouch', c1: '#c98a3b', c2: '#8f5a1c', photo: 'assets/rice.jpg',
      tag: 'Extra long grain', desc: 'Aged, extra-long grains that cook up fluffy and separate, with the classic basmati aroma. Steam processed and machine sorted.',
      sizes: [{ l: '1 kg', p: 189 }, { l: '5 kg', p: 899 }, { l: '25 kg', p: 4199 }],
      specs: [['Grain length', '8.3 mm +'], ['Processing', 'Steam'], ['Shelf life', '24 months'], ['Origin', 'India']] },
    { id: 'sona-masoori', cat: 'rice', name: 'Sona Masoori', short: ['Sona', 'Masoori'], pack: 'pouch', c1: '#7a9a5a', c2: '#4b6b35', photo: 'assets/rice.jpg',
      tag: 'Everyday staple', desc: 'Light, medium-grain rice that is soft, non-sticky and easy to digest. The everyday choice for South Indian kitchens.',
      sizes: [{ l: '5 kg', p: 429 }, { l: '10 kg', p: 829 }, { l: '25 kg', p: 1999 }],
      specs: [['Grain', 'Medium'], ['Processing', 'Raw, polished'], ['Shelf life', '18 months'], ['Origin', 'Karnataka']] },
    { id: 'parboiled-rice', cat: 'rice', name: 'Golden Sella Parboiled', short: ['Golden Sella', 'Parboiled'], pack: 'pouch', c1: '#d9a441', c2: '#a8731a', photo: 'assets/rice.jpg',
      tag: 'Export favourite', desc: 'Parboiled for firm, golden grains that hold their shape in biryani and pilaf, and stay fresh through long shipping.',
      sizes: [{ l: '5 kg', p: 549 }, { l: '25 kg', p: 2599 }, { l: '50 kg', p: 4999 }],
      specs: [['Grain length', '8.0 mm'], ['Processing', 'Parboiled'], ['Shelf life', '24 months'], ['Origin', 'India']] },

    { id: 'black-pepper', cat: 'spices', name: 'Black Pepper', short: ['Black', 'Pepper'], pack: 'pouch', c1: '#3a3a3a', c2: '#151515', photo: 'assets/spices.jpg',
      tag: 'Bold & pungent', desc: 'Whole peppercorns, sun-dried and cleaned. Sharp heat with a warm, woody finish.',
      sizes: [{ l: '100 g', p: 149 }, { l: '500 g', p: 649 }, { l: '1 kg', p: 1199 }],
      specs: [['Form', 'Whole'], ['Grade', 'Bold, cleaned'], ['Shelf life', '24 months'], ['Origin', 'Kerala']] },
    { id: 'green-cardamom', cat: 'spices', name: 'Green Cardamom', short: ['Green', 'Cardamom'], pack: 'pouch', c1: '#5f9a5a', c2: '#2f6a3a', photo: 'assets/spices.jpg',
      tag: 'Sweet & floral', desc: 'Plump green pods with an intense, perfumed aroma. For chai, sweets and slow-cooked curries.',
      sizes: [{ l: '50 g', p: 229 }, { l: '250 g', p: 1049 }, { l: '1 kg', p: 3999 }],
      specs: [['Form', 'Whole pods'], ['Grade', '7 mm +'], ['Shelf life', '18 months'], ['Origin', 'Idukki']] },
    { id: 'whole-cloves', cat: 'spices', name: 'Whole Cloves', short: ['Whole', 'Cloves'], pack: 'pouch', c1: '#a2492f', c2: '#6a2a18', photo: 'assets/spices.jpg',
      tag: 'Warm & intense', desc: 'Dark, oil-rich cloves with a deep, sweet heat. A little goes a long way.',
      sizes: [{ l: '100 g', p: 199 }, { l: '500 g', p: 899 }, { l: '1 kg', p: 1699 }],
      specs: [['Form', 'Whole'], ['Grade', 'Hand-picked'], ['Shelf life', '24 months'], ['Origin', 'South India']] },
    { id: 'turmeric-fingers', cat: 'spices', name: 'Turmeric Fingers', short: ['Turmeric', 'Fingers'], pack: 'pouch', c1: '#e8a317', c2: '#b87a08', photo: 'assets/spices.jpg',
      tag: 'Deep colour', desc: 'Whole dried turmeric rhizomes with a rich golden-orange core. Grind fresh for the brightest colour.',
      sizes: [{ l: '250 g', p: 119 }, { l: '1 kg', p: 399 }, { l: '5 kg', p: 1799 }],
      specs: [['Form', 'Whole fingers'], ['Curcumin', '3 % +'], ['Shelf life', '24 months'], ['Origin', 'Erode']] },

    { id: 'sesame-oil', cat: 'oil', name: 'Cold-Pressed Sesame Oil', short: ['Cold-Pressed', 'Sesame Oil'], pack: 'bottle', c1: '#e3b53b', c2: '#b9831a', photo: 'assets/oil.jpg',
      tag: 'Nutty & golden', desc: 'Slow-pressed from whole sesame seeds and filtered once. Rich, nutty and stable for everyday cooking.',
      sizes: [{ l: '500 ml', p: 349 }, { l: '1 L', p: 649 }, { l: '5 L', p: 3099 }],
      specs: [['Process', 'Cold-pressed'], ['Additives', 'None'], ['Shelf life', '12 months'], ['Pack', 'Glass / PET']] },
    { id: 'groundnut-oil', cat: 'oil', name: 'Groundnut Oil', short: ['Groundnut', 'Oil'], pack: 'bottle', c1: '#eec24a', c2: '#c6911f', photo: 'assets/oil.jpg',
      tag: 'High smoke point', desc: 'Light, clean-tasting oil from sorted groundnuts. Ideal for frying and high-heat cooking.',
      sizes: [{ l: '1 L', p: 289 }, { l: '5 L', p: 1349 }, { l: '15 L tin', p: 3899 }],
      specs: [['Process', 'Wood / cold-pressed'], ['Additives', 'None'], ['Shelf life', '12 months'], ['Pack', 'PET / Tin']] },
    { id: 'cow-ghee', cat: 'oil', name: 'Desi Cow Ghee', short: ['Desi', 'Cow Ghee'], pack: 'jar', c1: '#e6b94a', c2: '#c08a1c', photo: null, glyph: 'drop',
      tag: 'Slow-churned', desc: 'Traditional ghee clarified slowly for a granular texture and a warm, toasty aroma.',
      sizes: [{ l: '500 ml', p: 549 }, { l: '1 L', p: 999 }, { l: '5 L tin', p: 4699 }],
      specs: [['Source', 'Cow milk'], ['Texture', 'Granular'], ['Shelf life', '12 months'], ['Pack', 'Jar / Tin']] },

    { id: 'iqf-green-peas', cat: 'iqf', name: 'IQF Green Peas', short: ['IQF', 'Green Peas'], pack: 'carton', c1: '#3f9f6a', c2: '#217a48', photo: null, glyph: 'snow',
      tag: 'Frozen at peak', desc: 'Sweet young peas frozen individually within hours of harvest, so they pour freely and cook from frozen.',
      sizes: [{ l: '1 kg', p: 169 }, { l: '10 kg carton', p: 1499 }, { l: '20 kg carton', p: 2799 }],
      specs: [['Process', 'IQF'], ['Storage', '−18 °C'], ['Shelf life', '18 months'], ['Pack', 'Carton']] },
    { id: 'iqf-mango', cat: 'iqf', name: 'IQF Mango Chunks', short: ['IQF Mango', 'Chunks'], pack: 'carton', c1: '#f0a030', c2: '#c87614', photo: null, glyph: 'snow',
      tag: 'Alphonso-style', desc: 'Ripe mango cut into even chunks and frozen separately. Ready for smoothies, desserts and pulps.',
      sizes: [{ l: '1 kg', p: 299 }, { l: '10 kg carton', p: 2699 }],
      specs: [['Process', 'IQF'], ['Storage', '−18 °C'], ['Shelf life', '18 months'], ['Pack', 'Carton']] },
    { id: 'iqf-sweet-corn', cat: 'iqf', name: 'IQF Sweet Corn', short: ['IQF', 'Sweet Corn'], pack: 'carton', c1: '#e5c13a', c2: '#b8941a', photo: null, glyph: 'snow',
      tag: 'Free-flowing', desc: 'Golden kernels, blanched and frozen individually. No clumps, no waste.',
      sizes: [{ l: '1 kg', p: 139 }, { l: '10 kg carton', p: 1199 }],
      specs: [['Process', 'IQF'], ['Storage', '−18 °C'], ['Shelf life', '18 months'], ['Pack', 'Carton']] },

    { id: 'canvas-tote', cat: 'fashion', name: 'Everyday Canvas Tote', short: ['Everyday', 'Canvas Tote'], pack: 'tote', c1: '#2fa5a0', c2: '#e0653a', photo: null, glyph: 'logo',
      tag: 'Carry more', desc: 'Heavyweight cotton canvas with reinforced handles. Roomy, washable, and it only gets better with age.',
      sizes: [{ l: 'Standard', p: 499 }, { l: 'Large', p: 649 }],
      specs: [['Material', 'Cotton canvas'], ['Handles', 'Reinforced'], ['Care', 'Machine wash cold'], ['Made in', 'India']] },
    { id: 'handloom-stole', cat: 'fashion', name: 'Handloom Cotton Stole', short: ['Handloom', 'Cotton Stole'], pack: 'tote', c1: '#d95a4a', c2: '#2d9c8e', photo: null, glyph: 'logo',
      tag: 'Light & breathable', desc: 'Soft handloom cotton in a neutral weave with a vivid edge. Light enough for any season.',
      sizes: [{ l: 'One size', p: 799 }],
      specs: [['Material', 'Handloom cotton'], ['Size', '180 × 70 cm'], ['Care', 'Hand wash'], ['Made in', 'India']] }
  ]
};
