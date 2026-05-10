'use client';

import Link from 'next/link';
import { Package, Github, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={18} />
              </div>
              <span className="text-xl font-bold text-white">ShopNow</span>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Your premium destination for the best products. We offer multiple payment options
              including cards, M-Pesa, crypto, and WhatsApp ordering.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-sm hover:text-white transition-colors">
                  Checkout
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm hover:text-white transition-colors">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-sm">support@shopnow.com</span>
              </li>
              <li>
                <span className="text-sm">+254 700 000 000</span>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <a href="#" className="hover:text-white transition-colors">
                  <Github size={18} />
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <Twitter size={18} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ShopNow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
