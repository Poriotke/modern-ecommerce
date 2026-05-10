'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useUIStore } from '@/store/ui';
import { useCartStore } from '@/store/cart';
import { formatPrice, getDiscountPercentage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function QuickViewModal() {
  const { isQuickViewOpen, quickViewProduct, closeQuickView } = useUIStore();
  const { addItem, openCart } = useCartStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const discount = quickViewProduct.comparePrice
    ? getDiscountPercentage(quickViewProduct.price, quickViewProduct.comparePrice)
    : null;

  const handleAddToCart = () => {
    addItem(quickViewProduct, quantity);
    openCart();
    closeQuickView();
    setQuantity(1);
    toast.success(`${quickViewProduct.name} added to cart!`);
  };

  return (
    <AnimatePresence>
      {isQuickViewOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={closeQuickView}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-4xl md:max-h-[85vh] bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={closeQuickView}
              className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative p-6">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={quickViewProduct.images[selectedImage] || '/placeholder.jpg'}
                    alt={quickViewProduct.name}
                    fill
                    className="object-cover"
                  />
                  {discount && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                      -{discount}%
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {quickViewProduct.images.length > 1 && (
                  <div className="flex gap-2 mt-4">
                    {quickViewProduct.images.map((image, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImage === idx
                            ? 'border-primary-500 shadow-md'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${quickViewProduct.name} ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                {quickViewProduct.category && (
                  <span className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                    {quickViewProduct.category.name}
                  </span>
                )}

                <h2 className="mt-2 text-2xl md:text-3xl font-bold text-gray-900">
                  {quickViewProduct.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-500">(24 reviews)</span>
                </div>

                {/* Price */}
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    {formatPrice(quickViewProduct.price)}
                  </span>
                  {quickViewProduct.comparePrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(quickViewProduct.comparePrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                {/* Stock Status */}
                <div className="mt-4">
                  {quickViewProduct.stock > 0 ? (
                    <span className="text-sm text-green-600 font-medium">
                      In stock ({quickViewProduct.stock} available)
                    </span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Out of stock</span>
                  )}
                </div>

                {/* Quantity Selector */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(quickViewProduct.stock, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={quickViewProduct.stock === 0}
                  className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-6 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/25"
                >
                  <ShoppingCart size={20} />
                  Add to Cart - {formatPrice(quickViewProduct.price * quantity)}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
