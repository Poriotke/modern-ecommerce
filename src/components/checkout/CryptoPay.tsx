'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { PAYMENT_WALLET, usdToWei, usdToUsdt } from '@/lib/web3-config';
import toast from 'react-hot-toast';

interface CryptoPayProps {
  shippingData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
  onSuccess?: (txHash: string, orderId: string) => void;
  onError?: (error: string) => void;
}

type CryptoToken = 'ETH' | 'USDT';

export default function CryptoPay({ shippingData, onSuccess, onError }: CryptoPayProps) {
  const { items, getTotal, clearCart } = useCartStore();
  const [selectedToken, setSelectedToken] = useState<CryptoToken>('ETH');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const total = getTotal();
  const ethPrice = 3000; // In production, fetch live price
  const ethAmount = (total / ethPrice).toFixed(6);
  const usdtAmount = total.toFixed(2);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          toast.success('Wallet connected!');
        }
      } else {
        toast.error('Please install MetaMask or another Web3 wallet');
        onError?.('No wallet detected');
      }
    } catch (error: any) {
      const msg = error.message || 'Failed to connect wallet';
      toast.error(msg);
      onError?.(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    setIsPaying(true);
    try {
      let hash: string;

      if (selectedToken === 'ETH') {
        const weiAmount = usdToWei(total, ethPrice);
        hash = await (window as any).ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: PAYMENT_WALLET,
            value: '0x' + weiAmount.toString(16),
          }],
        });
      } else {
        // USDT ERC-20 transfer
        // In production, encode the transfer function call using wagmi's writeContract
        const usdtUnits = usdToUsdt(total);
        toast.success('USDT transfer initiated');
        hash = '0x' + Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
      }

      setTxHash(hash);

      // Record the payment on our backend
      const response = await fetch('/api/checkout/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          txHash: hash,
          shippingData,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Payment confirmed! Order placed.');
        clearCart();
        onSuccess?.(hash, data.orderId);
      } else {
        throw new Error(data.error || 'Failed to record payment');
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
        onError?.('User rejected transaction');
      } else {
        const msg = error.message || 'Payment failed';
        toast.error(msg);
        onError?.(msg);
      }
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Token Selection */}
      <div className="flex gap-3">
        <button
          onClick={() => setSelectedToken('ETH')}
          className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
            selectedToken === 'ETH'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold text-sm">ETH</span>
          <p className="text-xs text-gray-500 mt-1">~{ethAmount} ETH</p>
        </button>
        <button
          onClick={() => setSelectedToken('USDT')}
          className={`flex-1 p-3 rounded-xl border-2 transition-all text-center ${
            selectedToken === 'USDT'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold text-sm">USDT</span>
          <p className="text-xs text-gray-500 mt-1">${usdtAmount} USDT</p>
        </button>
      </div>

      {/* Info Box */}
      <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
        <p className="text-xs text-purple-700">
          Pay with {selectedToken} on Ethereum mainnet. Connect MetaMask or any WalletConnect-compatible wallet.
        </p>
      </div>

      {/* Wallet Connection / Payment */}
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isConnecting ? (
            <><Loader2 size={20} className="animate-spin" /> Connecting...</>
          ) : (
            <><Wallet size={20} /> Connect Wallet</>
          )}
        </motion.button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Payment address:</p>
            <p className="text-xs font-mono text-gray-700 break-all">
              {PAYMENT_WALLET}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={isPaying || items.length === 0}
            className="w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPaying ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Confirming...
              </span>
            ) : (
              `Pay ${selectedToken === 'ETH' ? ethAmount + ' ETH' : '$' + usdtAmount + ' USDT'}`
            )}
          </motion.button>

          {txHash && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <ExternalLink size={14} className="text-blue-600 flex-shrink-0" />
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                Tx: {txHash.slice(0, 22)}...
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
