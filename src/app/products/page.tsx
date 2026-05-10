'use client';

import ProductGallery from '@/components/products/ProductGallery';
import { Product, Category } from '@/types';

// Same demo data as homepage (in production, fetched via API)
const categories: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', description: 'Latest gadgets', image: null },
  { id: '2', name: 'Fashion', slug: 'fashion', description: 'Trending apparel', image: null },
  { id: '3', name: 'Home & Living', slug: 'home-living', description: 'Home decor', image: null },
  { id: '4', name: 'Accessories', slug: 'accessories', description: 'Premium accessories', image: null },
];

const products: Product[] = [
  {
    id: '1', name: 'Wireless Noise-Canceling Headphones', slug: 'wireless-nc-headphones',
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.',
    price: 299.99, comparePrice: 399.99, images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
    categoryId: '1', category: categories[0], stock: 50, featured: true, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '2', name: 'Smart Watch Pro', slug: 'smart-watch-pro',
    description: 'Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life.',
    price: 449.99, comparePrice: 549.99, images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
    categoryId: '1', category: categories[0], stock: 30, featured: true, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '3', name: 'Minimalist Leather Backpack', slug: 'minimalist-leather-backpack',
    description: 'Handcrafted genuine leather backpack with laptop compartment.',
    price: 189.99, comparePrice: 249.99, images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
    categoryId: '2', category: categories[1], stock: 25, featured: true, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '4', name: 'Premium Cotton T-Shirt', slug: 'premium-cotton-tshirt',
    description: 'Ultra-soft 100% organic cotton t-shirt. Breathable and durable.',
    price: 49.99, comparePrice: null, images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    categoryId: '2', category: categories[1], stock: 100, featured: false, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '5', name: 'Scandinavian Desk Lamp', slug: 'scandinavian-desk-lamp',
    description: 'Modern minimalist desk lamp with adjustable brightness and warm/cool modes.',
    price: 79.99, comparePrice: 99.99, images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
    categoryId: '3', category: categories[2], stock: 40, featured: true, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '6', name: 'Ceramic Plant Pot Set', slug: 'ceramic-plant-pot-set',
    description: 'Set of 3 handmade ceramic pots in varying sizes with matte finish.',
    price: 59.99, comparePrice: null, images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500'],
    categoryId: '3', category: categories[2], stock: 60, featured: false, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '7', name: 'Titanium Sunglasses', slug: 'titanium-sunglasses',
    description: 'Ultra-lightweight titanium frame sunglasses with polarized lenses. UV400 protection.',
    price: 199.99, comparePrice: 279.99, images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500'],
    categoryId: '4', category: categories[3], stock: 35, featured: true, active: true, createdAt: '', updatedAt: '',
  },
  {
    id: '8', name: 'Leather Card Holder', slug: 'leather-card-holder',
    description: 'Slim RFID-blocking card holder made from full-grain leather.',
    price: 39.99, comparePrice: null, images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=500'],
    categoryId: '4', category: categories[3], stock: 80, featured: false, active: true, createdAt: '', updatedAt: '',
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <ProductGallery products={products} categories={categories} />
    </div>
  );
}
