'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface StripeProviderProps {
  shippingData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export default function StripeProvider({ shippingData, onSuccess, onError }: StripeProviderProps) {
  const { items, getTotal, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const total = getTotal();

  const handleStripeCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        // Redirect to Stripe Checkout
        toast.success('Redirecting to secure payment...');
        onSuccess?.(data.sessionId);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      const message = error.message || 'Payment failed. Please try again.';
      toast.error(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Payment Info */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div className="flex items-start gap-3">
          <CreditCard className="text-blue-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-800">Secure Card Payment via Stripe</p>
            <p className="text-xs text-blue-600 mt-1">
              You&apos;ll be redirected to Stripe&apos;s secure checkout page to complete your payment.
              All major cards accepted (Visa, Mastercard, Amex).
            </p>
          </div>
        </div>
      </div>

      {/* Accepted Cards */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Accepted:</span>
        <div className="flex gap-1">
          {['Visa', 'MC', 'Amex', 'Discover'].map((card) => (
            <span
              key={card}
              className="px-2 py-0.5 bg-gray-100 text-xs font-medium text-gray-600 rounded"
            >
              {card}
            </span>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStripeCheckout}
        disabled={isLoading || items.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Creating secure session...
          </>
        ) : (
          <>
            <CreditCard size={20} />
            Pay {formatPrice(total)} with Card
          </>
        )}
      </motion.button>

      {/* Security Note */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
        <ExternalLink size={12} />
        <span>Powered by Stripe &bull; 256-bit SSL encrypted</span>
      </div>
    </div>
  );
}
