'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import {
  initiateMpesaPayment,
  validateKenyanPhone,
  formatPhoneForMpesa,
  MpesaPaymentResponse,
} from './MpesaHandler';
import toast from 'react-hot-toast';

interface MpesaPaymentProps {
  shippingData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  onSuccess?: (orderId: string, orderNumber: string) => void;
  onError?: (error: string) => void;
}

export default function MpesaPayment({ shippingData, onSuccess, onError }: MpesaPaymentProps) {
  const { items, getTotal, clearCart } = useCartStore();
  const [phone, setPhone] = useState(shippingData.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isPushSent, setIsPushSent] = useState(false);
  const [error, setError] = useState('');

  const total = getTotal();
  const amountInKES = Math.ceil(total * 130); // Approximate USD to KES

  const handlePayment = async () => {
    setError('');

    if (!phone.trim()) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    if (!validateKenyanPhone(phone)) {
      setError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      const result: MpesaPaymentResponse = await initiateMpesaPayment({
        phone: formatPhoneForMpesa(phone),
        items,
        shippingData,
      });

      if (result.success) {
        setIsPushSent(true);
        toast.success(result.message || 'Check your phone for the M-Pesa prompt!');
        clearCart();
        onSuccess?.(result.orderId!, result.orderNumber!);
      } else {
        const errorMsg = result.error || 'M-Pesa payment failed';
        setError(errorMsg);
        toast.error(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err: any) {
      const msg = err.message || 'Something went wrong';
      setError(msg);
      toast.error(msg);
      onError?.(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPushSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 bg-green-50 border border-green-200 rounded-xl text-center"
      >
        <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
        <h3 className="font-semibold text-green-800">STK Push Sent!</h3>
        <p className="text-sm text-green-700 mt-2">
          Check your phone for the M-Pesa payment prompt. Enter your PIN to complete the payment.
        </p>
        <p className="text-xs text-green-600 mt-3">
          Amount: KES {amountInKES.toLocaleString()}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* M-Pesa Info */}
      <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
        <div className="flex items-start gap-3">
          <Smartphone className="text-green-600 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-green-800">M-Pesa STK Push</p>
            <p className="text-xs text-green-600 mt-1">
              Enter your Safaricom number. You&apos;ll receive a payment prompt on your phone.
              Confirm with your M-Pesa PIN to complete.
            </p>
          </div>
        </div>
      </div>

      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          M-Pesa Phone Number
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
            +254
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError('');
            }}
            placeholder="712 345 678"
            className="w-full pl-14 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 mt-2"
          >
            <AlertCircle size={14} className="text-red-500" />
            <span className="text-xs text-red-600">{error}</span>
          </motion.div>
        )}
      </div>

      {/* Amount Display */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
        <span className="text-sm text-gray-600">Amount (KES)</span>
        <span className="font-bold text-gray-900">
          KES {amountInKES.toLocaleString()}
        </span>
      </div>

      {/* Pay Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePayment}
        disabled={isLoading || items.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-600/25"
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Sending STK Push...
          </>
        ) : (
          <>
            <Smartphone size={20} />
            Pay KES {amountInKES.toLocaleString()} via M-Pesa
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-gray-400">
        Powered by Safaricom Daraja API
      </p>
    </div>
  );
}
