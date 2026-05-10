'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CreditCard, Smartphone, Wallet, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

type PaymentMethod = 'stripe' | 'mpesa' | 'crypto' | 'whatsapp';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCartStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [phone, setPhone] = useState('');

  const [shippingData, setShippingData] = useState({
    name: '', email: '', phone: '', address: '', city: '', country: '',
  });

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = getTotal() + shipping;

  const paymentMethods = [
    { id: 'stripe' as const, label: 'Card (Stripe)', icon: CreditCard, color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { id: 'mpesa' as const, label: 'M-Pesa', icon: Smartphone, color: 'bg-green-50 border-green-200 text-green-700' },
    { id: 'crypto' as const, label: 'Crypto (ETH/USDT)', icon: Wallet, color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { id: 'whatsapp' as const, label: 'WhatsApp Order', icon: MessageCircle, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  ];

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsLoading(true);

    try {
      switch (selectedPayment) {
        case 'stripe': {
          const res = await fetch('/api/checkout/stripe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, shippingData }),
          });
          const data = await res.json();
          if (data.url) {
            window.location.href = data.url;
          } else {
            toast.error(data.error || 'Failed to create checkout session');
          }
          break;
        }

        case 'mpesa': {
          if (!phone) {
            toast.error('Please enter your M-Pesa phone number');
            setIsLoading(false);
            return;
          }
          const res = await fetch('/api/checkout/stk-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, items, shippingData }),
          });
          const data = await res.json();
          if (data.success) {
            toast.success(data.message || 'Check your phone for M-Pesa prompt');
            clearCart();
            router.push(`/orders`);
          } else {
            toast.error(data.error || 'M-Pesa payment failed');
          }
          break;
        }

        case 'crypto': {
          toast.success('Connect your wallet to complete payment');
          // In production, this would trigger wallet connection via wagmi
          break;
        }

        case 'whatsapp': {
          const res = await fetch('/api/checkout/whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items, shippingData }),
          });
          const data = await res.json();
          if (data.whatsappUrl) {
            window.open(data.whatsappUrl, '_blank');
            clearCart();
            toast.success('Order sent to WhatsApp!');
          } else {
            toast.error(data.error || 'Failed to create WhatsApp order');
          }
          break;
        }
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Shipping Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={shippingData.name} onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })} className="input-field" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={shippingData.email} onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })} className="input-field" placeholder="you@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={shippingData.phone} onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })} className="input-field" placeholder="+254 7XX XXX XXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" value={shippingData.country} onChange={(e) => setShippingData({ ...shippingData, country: e.target.value })} className="input-field" placeholder="Kenya" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input type="text" value={shippingData.address} onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })} className="input-field" placeholder="123 Main Street" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input type="text" value={shippingData.city} onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })} className="input-field" placeholder="Nairobi" />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedPayment === method.id
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <method.icon size={24} className={selectedPayment === method.id ? 'text-primary-600' : 'text-gray-500'} />
                    <span className={`font-medium ${selectedPayment === method.id ? 'text-primary-700' : 'text-gray-700'}`}>
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* M-Pesa Phone Input */}
              {selectedPayment === 'mpesa' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">M-Pesa Phone Number</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="0712345678 or 254712345678" />
                  <p className="mt-1 text-xs text-gray-500">You will receive an STK push on this number</p>
                </motion.div>
              )}

              {/* Crypto Info */}
              {selectedPayment === 'crypto' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-700">Connect your wallet (MetaMask, WalletConnect) to pay with ETH or USDT on Ethereum mainnet.</p>
                </motion.div>
              )}

              {/* WhatsApp Info */}
              {selectedPayment === 'whatsapp' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 bg-emerald-50 rounded-xl">
                  <p className="text-sm text-emerald-700">Your order details will be sent as a WhatsApp message. Payment will be arranged directly with the seller.</p>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Right - Order Summary */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 truncate max-w-[200px]">
                      {item.product.name} x{item.quantity}
                    </span>
                    <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span><span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span><span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} disabled={isLoading} className="w-full btn-primary mt-6 disabled:opacity-50">
                {isLoading ? 'Processing...' : `Pay ${formatPrice(total)}`}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
