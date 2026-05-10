'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Truck, CreditCard, Smartphone } from 'lucide-react';
import ProductGallery from '@/components/products/ProductGallery';
import { Product, Category } from '@/types';

// Static product data for MVP demo (in production, fetched from API)
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

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full mb-4">
                New Arrivals 2024
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Shop the Future,{' '}
                <span className="text-gradient">Pay Your Way</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-lg">
                Discover premium products with flexible payment options. Pay with card, M-Pesa, 
                cryptocurrency, or simply order via WhatsApp.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link href="#features" className="btn-secondary inline-flex items-center gap-2 text-center justify-center">
                  Learn More
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-3xl opacity-20 blur-3xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {products.slice(0, 4).map((product, i) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="bg-gray-50 rounded-xl p-3 text-center"
                      >
                        <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2" />
                        <p className="text-xs font-medium text-gray-700 truncate">{product.name}</p>
                        <p className="text-xs text-primary-600 font-bold">${product.price}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: CreditCard, title: 'Card Payments', desc: 'Secure Stripe integration' },
              { icon: Smartphone, title: 'M-Pesa', desc: 'Instant STK Push payments' },
              { icon: Shield, title: 'Crypto Pay', desc: 'ETH/USDT accepted' },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-5 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:shadow-md transition-all"
              >
                <div className="p-3 bg-primary-100 rounded-xl">
                  <feature.icon className="text-primary-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Gallery */}
      <ProductGallery products={products} categories={categories} />
    </div>
  );
}
