'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart';
import { useUIStore } from '@/store/ui';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    openCart();
    toast.success(`${product.name} added to cart!`);
  };

  const handleQuickView = () => {
    openQuickView(product);
  };

  const discount = product.comparePrice
    ? getDiscountPercentage(product.price, product.comparePrice)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.images[0] || '/placeholder.jpg'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discount}%
          </div>
        )}

        {/* Stock Badge */}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Only {product.stock} left
          </div>
        )}

        {/* Hover Actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleQuickView}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-colors"
            aria-label="Quick view"
          >
            <Eye size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddToCart}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-primary-500 hover:text-white transition-colors"
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors"
            aria-label="Add to wishlist"
          >
            <Heart size={20} />
          </motion.button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {product.category && (
          <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
            {product.category.name}
          </span>
        )}
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Mobile Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="mt-3 w-full py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors md:hidden"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
