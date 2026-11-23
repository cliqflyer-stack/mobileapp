import { ImageSourcePropType } from 'react-native';

export interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  regularPrice: number;
  offerPrice: number;
  image: ImageSourcePropType;
  category: string;
  unit?: string;
  sku?: string | null;
  upc?: string | null;
  options?: { label: string; value: string }[];
}

/** Legal links shown at the bottom of the product sheet (franchise default, store override). */
export interface LegalLinks {
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
}

export interface Hotspot {
  id: string;
  productId: string;
  /** Normalized 0–1 coordinates relative to flyer width and height */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoreFlyer {
  id: string;
  storeName: string;
  storeLogoInitial: string;
  storeLogoBg: string;
  storeLogoColor?: string;
  badgeText: string;
  badgeVariant?: 'lime' | 'dark' | 'red';
  flyerDate: string;
  flyerImage: any;
  flyerAspectRatio: number; // height / width
  hotspots: Hotspot[];
  privacyPolicyUrl?: string | null;
  termsUrl?: string | null;
}

/**
 * Dummy Product Catalog
 */
export const DUMMY_PRODUCTS: Record<string, Product> = {
  prod_aveeno: {
    id: 'prod_aveeno',
    name: 'Aveeno Daily Moisturizing Body Wash',
    brand: 'Aveeno',
    description: 'Nourishing body wash with soothing prebiotic oat to replenish skin natural moisture barrier. 354 mL.',
    regularPrice: 10.99,
    offerPrice: 8.79,
    image: require('../../assets/images/products/colgate.jpg'),
    category: 'Personal Care',
  },
  prod_jamieson_d3: {
    id: 'prod_jamieson_d3',
    name: 'Jamieson Vitamin D3 1000 IU',
    brand: 'Jamieson',
    description: 'High potency vitamin D3 tablets to support immune function and maintain healthy bones and teeth. 240+40 tablets.',
    regularPrice: 9.99,
    offerPrice: 6.99,
    image: require('../../assets/images/products/coca-cola.jpg'),
    category: 'Health & Vitamins',
  },
  prod_vitalux: {
    id: 'prod_vitalux',
    name: 'Vitalux Advanced Ocular Multivitamin',
    brand: 'Vitalux',
    description: 'Scientifically formulated with lutein and zeaxanthin to protect and support healthy vision. 60 caplets.',
    regularPrice: 19.99,
    offerPrice: 14.99,
    image: require('../../assets/images/products/red-bull.jpg'),
    category: 'Health & Vitamins',
  },
  prod_gravol: {
    id: 'prod_gravol',
    name: 'Gravol Ginger 500mg Lozenges',
    brand: 'Gravol',
    description: 'Non-drowsy natural certified organic ginger lozenges for effective nausea and motion sickness relief. 20 count.',
    regularPrice: 7.49,
    offerPrice: 5.49,
    image: require('../../assets/images/products/froot-loops.jpg'),
    category: 'Medicine',
  },
  prod_rub_a535: {
    id: 'prod_rub_a535',
    name: 'Rub A535 Extra Strength Cream',
    brand: 'Rub A535',
    description: 'Fast acting deep penetrating relief for sore muscles, joint pain, backache and arthritic stiffness. 100g.',
    regularPrice: 9.49,
    offerPrice: 6.99,
    image: require('../../assets/images/products/colgate.jpg'),
    category: 'Pain Relief',
  },
  prod_emergenc: {
    id: 'prod_emergenc',
    name: 'Emergen-C Immune+ Super Orange',
    brand: 'Emergen-C',
    description: 'Daily dietary supplement fizzy drink mix with 1000mg vitamin C, zinc, electrolytes and B vitamins. 24 pk.',
    regularPrice: 14.99,
    offerPrice: 10.99,
    image: require('../../assets/images/products/red-bull.jpg'),
    category: 'Vitamins & Wellness',
  },
  prod_glysomed: {
    id: 'prod_glysomed',
    name: 'Glysomed Hand Cream Regular',
    brand: 'Glysomed',
    description: 'Locks in moisture to relieve severely dry, rough hands with chamomile and glycerin formula. 50 mL.',
    regularPrice: 6.29,
    offerPrice: 4.49,
    image: require('../../assets/images/products/tide.jpg'),
    category: 'Skin Care',
  },
  prod_vaseline: {
    id: 'prod_vaseline',
    name: 'Vaseline Intensive Care Body Lotion',
    brand: 'Vaseline',
    description: 'Clinically proven to moisturize deeply within the first application for 48 hours of healthy skin. 600 mL.',
    regularPrice: 8.99,
    offerPrice: 6.29,
    image: require('../../assets/images/products/lays.jpg'),
    category: 'Skin Care',
  },
  prod_garnier: {
    id: 'prod_garnier',
    name: 'Garnier Fructis Clean & Fresh Shampoo',
    brand: 'Garnier',
    description: 'Purifying shampoo enriched with green apple extract for stronger, shinier hair. 370 mL.',
    regularPrice: 5.99,
    offerPrice: 4.19,
    image: require('../../assets/images/products/doritos.jpg'),
    category: 'Hair Care',
  },
  prod_aspirin: {
    id: 'prod_aspirin',
    name: 'Aspirin Regular Strength 325mg',
    brand: 'Bayer',
    description: 'Fast relief of headaches, fever, muscle aches, and everyday pains. 24 coated tablets.',
    regularPrice: 6.49,
    offerPrice: 4.99,
    image: require('../../assets/images/products/oreo.jpg'),
    category: 'Pain Relief',
  },
  prod_tylenol: {
    id: 'prod_tylenol',
    name: 'Tylenol Regular Strength Tablets',
    brand: 'Tylenol',
    description: 'Acetaminophen 325mg pain reliever and fever reducer that is gentle on sensitive stomachs. 24 tablets.',
    regularPrice: 7.99,
    offerPrice: 5.99,
    image: require('../../assets/images/products/coca-cola.jpg'),
    category: 'Pain Relief',
  },
  prod_tylenol_muscle: {
    id: 'prod_tylenol_muscle',
    name: 'Tylenol Muscle Aches & Body Caplets',
    brand: 'Tylenol',
    description: 'Extended release 650mg bi-layer caplets delivering tough relief for persistent muscle and joint aches. 50 count.',
    regularPrice: 12.99,
    offerPrice: 9.99,
    image: require('../../assets/images/products/red-bull.jpg'),
    category: 'Pain Relief',
  },
  prod_aleve: {
    id: 'prod_aleve',
    name: 'Aleve Liquid Gels 220mg',
    brand: 'Aleve',
    description: 'Naproxen sodium liquid gels providing up to 12 hours of continuous all-day pain relief. 20 count.',
    regularPrice: 12.99,
    offerPrice: 10.49,
    image: require('../../assets/images/products/colgate.jpg'),
    category: 'Pain Relief',
  },
  prod_advil: {
    id: 'prod_advil',
    name: 'Advil Liqui-Gels 200mg',
    brand: 'Advil',
    description: 'Fast acting solubilized ibuprofen in liquid gel capsules that absorb quickly to target pain. 32 count.',
    regularPrice: 14.49,
    offerPrice: 11.49,
    image: require('../../assets/images/products/lays.jpg'),
    category: 'Pain Relief',
  },
  prod_pepcid: {
    id: 'prod_pepcid',
    name: 'Pepcid AC Maximum Strength 20mg',
    brand: 'Pepcid',
    description: 'Prevents and relieves heartburn and acid indigestion with just one small tablet. 25 count.',
    regularPrice: 14.99,
    offerPrice: 11.49,
    image: require('../../assets/images/products/oreo.jpg'),
    category: 'Digestive Health',
  },
};

/**
 * Dummy Hotspot Coordinates for MY DRUG MART flyer
 * Normalized 0–1 coordinates matching the product layout on full_drug_mart_flyer.png
 */
export const DRUG_MART_HOTSPOTS: Hotspot[] = [
  // Row 1 (Top products)
  {
    id: 'hs_aveeno',
    productId: 'prod_aveeno',
    x: 0.05,
    y: 0.165,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_jamieson',
    productId: 'prod_jamieson_d3',
    x: 0.28,
    y: 0.165,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_vitalux',
    productId: 'prod_vitalux',
    x: 0.51,
    y: 0.165,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_gravol',
    productId: 'prod_gravol',
    x: 0.74,
    y: 0.165,
    width: 0.21,
    height: 0.075,
  },

  // Row 2
  {
    id: 'hs_rub_a535',
    productId: 'prod_rub_a535',
    x: 0.05,
    y: 0.25,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_emergenc',
    productId: 'prod_emergenc',
    x: 0.28,
    y: 0.25,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_glysomed',
    productId: 'prod_glysomed',
    x: 0.51,
    y: 0.25,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_vaseline',
    productId: 'prod_vaseline',
    x: 0.74,
    y: 0.25,
    width: 0.21,
    height: 0.075,
  },

  // Row 3
  {
    id: 'hs_garnier',
    productId: 'prod_garnier',
    x: 0.05,
    y: 0.335,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_aspirin',
    productId: 'prod_aspirin',
    x: 0.28,
    y: 0.335,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_tylenol',
    productId: 'prod_tylenol',
    x: 0.51,
    y: 0.335,
    width: 0.21,
    height: 0.075,
  },
  {
    id: 'hs_tylenol_muscle',
    productId: 'prod_tylenol_muscle',
    x: 0.74,
    y: 0.335,
    width: 0.21,
    height: 0.075,
  },

  // Lower Section (Halloween theme pharmacy deals)
  {
    id: 'hs_aleve',
    productId: 'prod_aleve',
    x: 0.06,
    y: 0.545,
    width: 0.21,
    height: 0.065,
  },
  {
    id: 'hs_advil',
    productId: 'prod_advil',
    x: 0.29,
    y: 0.545,
    width: 0.21,
    height: 0.065,
  },
  {
    id: 'hs_pepcid',
    productId: 'prod_pepcid',
    x: 0.73,
    y: 0.69,
    width: 0.21,
    height: 0.065,
  },
];

export const DEFAULT_STORE_FLYER: StoreFlyer = {
  id: 'drug_mart_oct',
  storeName: 'MY DRUG MART',
  storeLogoInitial: 'M',
  storeLogoBg: '#CC0000',
  storeLogoColor: '#FFFFFF',
  badgeText: 'MEMBER PRICING',
  flyerDate: 'Reference preview · Oct 15–21',
  flyerImage: require('../../assets/images/explore/full_drug_mart_flyer.png'),
  flyerAspectRatio: 1386 / 402, // ~3.45
  hotspots: DRUG_MART_HOTSPOTS,
};
