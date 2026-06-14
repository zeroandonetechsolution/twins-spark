window.PRODUCTS = [
  { 
    id: 1, 
    name: 'Celestial Watch', 
    realPrice: '₹3,999', 
    offerPrice: '₹2,999', 
    category: 'Accessories', 
    images: [], 
    videos: [],
    description: 'A stunning timepiece inspired by the cosmos, featuring a starry night dial and premium leather strap.',
    trending: true,
    reviews: [
      { id: 1, name: 'Sarah M.', rating: 5, photo: '', video: '', text: 'Absolutely beautiful watch! The starry dial is mesmerizing.', date: '2025-05-15' },
      { id: 2, name: 'Mike R.', rating: 4, photo: '', video: '', text: 'Great quality, exceeded my expectations!', date: '2025-04-22' }
    ]
  },
  { 
    id: 2, 
    name: 'Nebula Glass Pen', 
    realPrice: '₹599', 
    offerPrice: '₹449', 
    category: 'Gifts', 
    images: [], 
    videos: [],
    description: 'Handcrafted glass pen with swirling nebula patterns, perfect for any writing enthusiast.',
    trending: true,
    reviews: [
      { id: 1, name: 'Emily K.', rating: 5, photo: '', video: '', text: 'Such a unique and elegant gift!', date: '2025-06-01' }
    ]
  },
  { 
    id: 3, 
    name: 'Cosmic Teddy', 
    realPrice: '₹499', 
    offerPrice: '₹349', 
    category: 'Toys', 
    images: [], 
    videos: [],
    description: 'Soft, cuddly teddy bear with constellation embroidery, perfect for stargazers of all ages.',
    trending: true,
    reviews: [
      { id: 1, name: 'Lisa T.', rating: 5, photo: '', video: '', text: 'My daughter loves it! Super soft and well made.', date: '2025-03-10' }
    ]
  },
  { 
    id: 4, 
    name: 'Star-Dusted Hoodie', 
    realPrice: '₹1,199', 
    offerPrice: '₹899', 
    category: 'Clothing', 
    images: [], 
    videos: [],
    description: 'Cozy hoodie with subtle star dust print, perfect for casual cosmic style.',
    trending: false,
    reviews: []
  },
  { 
    id: 5, 
    name: 'Galactic Cufflinks', 
    realPrice: '₹1,599', 
    offerPrice: '₹1,199', 
    category: 'Accessories', 
    images: [], 
    videos: [],
    description: 'Elegant cufflinks featuring miniature galaxy designs, perfect for formal occasions.',
    trending: true,
    reviews: [
      { id: 1, name: 'David W.', rating: 5, photo: '', video: '', text: 'Got lots of compliments at the wedding!', date: '2025-02-28' }
    ]
  },
  { 
    id: 6, 
    name: 'Astro-Bot Figure', 
    realPrice: '₹1,999', 
    offerPrice: '₹1,499', 
    category: 'Toys', 
    images: [], 
    videos: [],
    description: 'Collectible robotic figure with glowing eyes and articulated limbs, a must-have for space fans.',
    trending: true,
    reviews: []
  }
];

window.HERO_CATEGORIES = [
  { slug: 'gifts', label: 'Gifts', page: 'gifts.html', desc: 'Elegance in every detail', tint: 'gifts' },
  { slug: 'toys', label: 'Toys', page: 'toys.html', desc: 'Play among the stars', tint: 'toys' },
  { slug: 'accessories', label: 'Accessories', page: 'accessories.html', desc: 'Complete your cosmic look', tint: 'accessories' }
];

window.CATEGORY_MAP = {
  gifts: 'Gifts',
  accessories: 'Accessories',
  toys: 'Toys',
  clothing: 'Clothing'
};
