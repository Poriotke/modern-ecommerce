'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreditCard, Smartphone, Wallet, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { StripeProvider, MpesaPayment, CryptoPay, WhatsAppOrder } from '@/components/checkout';

type PaymentMethod = 'stripe' | 'mpesa' | 'crypto' | 'whatsapp';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getTotal } = useCartStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('stripe');

  const [shippingData, setShippingData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
  });

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = getTotal() + shipping;

  const paymentMethods = [
    { id: 'stripe' as const, label: 'Card', icon: CreditCard },
    { id: 'mpesa' as const, label: 'M-Pesa', icon: Smartphone },
    { id: 'crypto' as const, label: 'Crypto', icon: Wallet },
    { id: 'whatsapp' as const, label: 'WhatsApp', icon: MessageCircle },
  ];

  const handlePaymentSuccess = (type: string) => {
    router.push('/orders');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link href="/" className="btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} /> Back to Shop
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={shippingData.name}
                    onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={shippingData.email}
                    onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                    className="input-field"
                    placeholder="you@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    className="input-field"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={shippingData.country}
                    onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })}
                    className="input-field"
                    placeholder="Kenya"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={shippingData.address}
                    onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                    className="input-field"
                    placeholder="123 Main Street"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={shippingData.city}
                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                    className="input-field"
                    placeholder="Nairobi"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                      selectedPayment === method.id
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <method.icon
                      size={22}
                      className={selectedPayment === method.id ? 'text-primary-600' : 'text-gray-500'}
                    />
                    <span className={`text-xs font-medium ${
                      selectedPayment === method.id ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Payment Component (conditional render) */}
              <div className="min-h-[200px]">
                {selectedPayment === 'stripe' && (
                  <StripeProvider
                    shippingData={shippingData}
                    onSuccess={() => handlePaymentSuccess('stripe')}
                  />
                )}
                {selectedPayment === 'mpesa' && (
                  <MpesaPayment
                    shippingData={shippingData}
                    onSuccess={() => handlePaymentSuccess('mpesa')}
                  />
                )}
                {selectedPayment === 'crypto' && (
                  <CryptoPay
                    shippingData={shippingData}
                    onSuccess={() => handlePaymentSuccess('crypto')}
                  />
                )}
                {selectedPayment === 'whatsapp' && (
                  <WhatsAppOrder
                    shippingData={shippingData}
                    onSuccess={() => handlePaymentSuccess('whatsapp')}
                  />
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="card sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              {/* Items List */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 truncate max-w-[180px]">
                      {item.product.name} &times;{item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {['SSL Secured', 'Fast Delivery', 'Easy Returns'].map((badge) => (
                    <span key={badge} className="px-2 py-1 bg-gray-50 text-xs text-gray-500 rounded-md">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
