'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, Clock, CheckCircle, Truck, XCircle, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types';

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-600 bg-yellow-50', label: 'Pending' },
  CONFIRMED: { icon: CheckCircle, color: 'text-blue-600 bg-blue-50', label: 'Confirmed' },
  PROCESSING: { icon: Package, color: 'text-indigo-600 bg-indigo-50', label: 'Processing' },
  SHIPPED: { icon: Truck, color: 'text-purple-600 bg-purple-50', label: 'Shipped' },
  DELIVERED: { icon: CheckCircle, color: 'text-green-600 bg-green-50', label: 'Delivered' },
  CANCELLED: { icon: XCircle, color: 'text-red-600 bg-red-50', label: 'Cancelled' },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={18} /> Back to Shop
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <span className="text-sm text-gray-500">{orders.length} orders</span>
        </div>

        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 card"
          >
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-700">No orders yet</h2>
            <p className="mt-2 text-gray-500">Start shopping to see your orders here</p>
            <Link href="/" className="mt-6 inline-block btn-primary">
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const config = statusConfig[order.status] || statusConfig.PENDING;
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">#{order.orderNumber}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <StatusIcon size={12} />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                        {' '}&bull;{' '}
                        {order.paymentMethod === 'STRIPE' && 'Card Payment'}
                        {order.paymentMethod === 'MPESA' && 'M-Pesa'}
                        {order.paymentMethod === 'CRYPTO' && 'Crypto'}
                        {order.paymentMethod === 'WHATSAPP' && 'WhatsApp'}
                      </p>
                      {order.orderItems && (
                        <p className="text-sm text-gray-500 mt-1">
                          {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                      <span className={`text-xs font-medium ${
                        order.paymentStatus === 'COMPLETED' ? 'text-green-600' :
                        order.paymentStatus === 'FAILED' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
