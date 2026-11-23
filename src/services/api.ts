import { ENV } from '../config/env';
import {
  DEFAULT_STORE_FLYER,
  DUMMY_PRODUCTS,
  StoreFlyer,
  Product,
  Hotspot,
} from '../data/flyerData';

export interface DynamicDeal {
  id: string;
  title: string;
  details: string;
  priceText: string;
  discountPercent?: number;
  badgeText?: string;
  imageUrl: string;
  storeDistance: string;
}

/**
 * Helper to resolve API URLs into full network URIs
 */
export function resolveMediaUri(url: string | undefined): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanBase = ENV.API_BASE_URL.replace(/\/$/, '');
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Fetch all active store flyers from the backend API.
 * Gracefully falls back to local starter data if the API is unreachable.
 */
export async function getFlyers(): Promise<StoreFlyer[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ENV.API_BASE_URL}/api/v1/flyers`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      // Ensure expired flyers are hidden from shoppers
      const activeData = data.filter((item: any) => {
        if (!item.validTo) return true;
        return new Date(item.validTo) >= new Date();
      });
      return activeData.map((item: any) => ({
        id: item.id,
        storeName: item.merchant?.name || item.title,
        storeLogoInitial: item.merchant?.initial || item.title.charAt(0),
        storeLogoBg: item.merchant?.logoBg || '#075E50',
        storeLogoColor: item.merchant?.logoColor || '#FFFFFF',
        badgeText: item.badgeText || 'NEW',
        badgeVariant: item.badgeVariant || 'lime',
        flyerDate: item.subtitle || 'Weekly flyer',
        flyerImage: { uri: resolveMediaUri(item.flyerImageUrl) },
        flyerAspectRatio: item.aspectRatio || 1.7778, // Standard 9:16 vertical mobile aspect ratio
        hotspots: (item.hotspots || []).map((h: any) => ({
          id: h.id,
          productId: h.productId,
          x: h.x,
          y: h.y,
          width: h.width,
          height: h.height,
        })),
      }));
    }
  } catch (err) {
    console.warn('[API] Could not fetch live flyers, using offline fallback:', err);
  }

  // Fallback to local default flyer
  return [DEFAULT_STORE_FLYER];
}

/**
 * Fetch a single flyer by ID including all associated hotspots & products
 */
export async function getFlyerById(
  id: string
): Promise<{ flyer: StoreFlyer; products: Record<string, Product> }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ENV.API_BASE_URL}/api/v1/flyers/${id}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const item = await res.json();

    const productsMap: Record<string, Product> = {};

    const hotspots: Hotspot[] = (item.hotspots || []).map((h: any) => {
      if (h.product) {
        productsMap[h.product.id] = {
          id: h.product.id,
          name: h.product.name,
          brand: h.product.brand || '',
          description: h.product.description || '',
          regularPrice: Number(h.product.regularPrice),
          offerPrice: Number(h.product.offerPrice),
          image: { uri: resolveMediaUri(h.product.imageUrl) },
          category: h.product.category || 'General',
          unit: h.product.unit || undefined,
          sku: h.product.sku || null,
          upc: h.product.upc || null,
          options: Array.isArray(h.product.options) ? h.product.options : [],
        };
      }
      return {
        id: h.id,
        productId: h.productId,
        x: h.x,
        y: h.y,
        width: h.width,
        height: h.height,
      };
    });

    const flyer: StoreFlyer = {
      id: item.id,
      storeName: item.merchant?.name || item.title,
      storeLogoInitial: item.merchant?.initial || item.title.charAt(0),
      storeLogoBg: item.merchant?.logoBg || '#075E50',
      storeLogoColor: item.merchant?.logoColor || '#FFFFFF',
      badgeText: item.badgeText || 'NEW',
      badgeVariant: item.badgeVariant || 'lime',
      flyerDate: item.subtitle || 'Weekly flyer',
      flyerImage: { uri: resolveMediaUri(item.flyerImageUrl) },
      flyerAspectRatio: item.aspectRatio || 1.7778, // Standard 9:16 vertical mobile aspect ratio
      hotspots,
      // Store-level policy overrides fall back to the franchise defaults
      privacyPolicyUrl: item.storeLocation?.privacyPolicyUrl || item.merchant?.privacyPolicyUrl || null,
      termsUrl: item.storeLocation?.termsUrl || item.merchant?.termsUrl || null,
    };

    return { flyer, products: productsMap };
  } catch (err) {
    console.warn('[API] Could not fetch flyer by id, using offline fallback:', err);
  }

  return { flyer: DEFAULT_STORE_FLYER, products: DUMMY_PRODUCTS };
}

/**
 * Fetch deals feed
 */
export async function getDeals(): Promise<DynamicDeal[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ENV.API_BASE_URL}/api/v1/deals`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        title: d.title,
        details: d.details || '',
        priceText: d.priceText,
        discountPercent: d.discountPercent,
        badgeText: d.badgeText,
        imageUrl: resolveMediaUri(d.imageUrl),
        storeDistance: `${d.merchant?.name || 'Local Store'} · Markham · 1.5 km`,
      }));
    }
  } catch (err) {
    console.warn('[API] Could not fetch live deals, using offline fallback:', err);
  }

  return [
    {
      id: 'deal_pepsi',
      title: 'Pepsi Original',
      details: '12 × 355 mL',
      priceText: '$6.49',
      storeDistance: 'No Frills · Markham · 1.2 km',
      imageUrl: '',
    },
    {
      id: 'deal_coke',
      title: 'Coca-Cola Original',
      details: '12 × 355 mL',
      priceText: '$6.99',
      storeDistance: 'Walmart · Markham · 2.4 km',
      imageUrl: '',
    },
  ];
}
