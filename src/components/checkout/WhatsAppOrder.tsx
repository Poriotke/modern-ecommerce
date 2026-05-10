'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface WhatsAppOrderProps {
  shippingData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  onSuccess?: (orderId: string) => void;
  onError?: (error: string) => void;
}

export default function WhatsAppOrder({ shippingData, onSuccess, onError }: WhatsAppOrderProps) {
  const { items, getTotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const total = getTotal();

  const handleWhatsAppOrder = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, shippingData }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create WhatsApp order');
      }

      if (data.whatsappUrl) {
        toast.success('Opening WhatsApp...');
        window.open(data.whatsappUrl, '_blank');
        clearCart();
        onSuccess?.(data.orderId);
      } else {
        throw new Error('No WhatsApp URL received');
      }
    } catch (error: any) {
      const msg = error.message || 'Something went wrong';
      toast.error(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* WhatsApp Info */}
      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <div className="flex items-start gap-3">
          <MessageCircle className="text-emerald-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-emerald-800">Order via WhatsApp</p>
            <p className="text-xs text-emerald-600 mt-1">
              Your order details will be sent as a WhatsApp message. Payment can be arranged
              directly with the seller (cash on delivery, bank transfer, etc.).
            </p>
          </div>
        </div>
      </div>

      {/* Order Preview */}
      <div className="p-3 bg-gray-50 rounded-xl space-y-2">
        <p className="text-xs font-medium text-gray-500 uppercase">Message Preview:</p>
        <div className="text-xs text-gray-700 space-y-1">
          {items.slice(0, 3).map((item) => (
            <p key={item.id}>
              &bull; {item.product.name} x{item.quantity} ({formatPrice(item.product.price * item.quantity)})
            </p>
          ))}
          {items.length > 3 && (
            <p className="text-gray-500">...and {items.length - 3} more items</p>
          )}
          <p className="font-semibold mt-2 pt-2 border-t border-gray-200">
            Total: {formatPrice(total)}
          </p>
        </div>
      </div>

      {/* Order Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleWhatsAppOrder}
        disabled={isLoading || items.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/25"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Preparing order...
          </>
        ) : (
          <>
            <MessageCircle size={20} />
            Complete Order via WhatsApp
          </>
        )}
      </motion.button>

      <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
        <ExternalLink size={12} />
        <span>Opens in WhatsApp &bull; No online payment required</span>
      </div>
    </div>
  );
}
