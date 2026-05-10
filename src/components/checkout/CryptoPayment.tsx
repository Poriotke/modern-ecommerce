'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/lib/utils';
import { PAYMENT_WALLET, usdToWei, usdToUsdt } from '@/lib/web3-config';
import toast from 'react-hot-toast';

interface CryptoPaymentProps {
  total: number;
  onSuccess: (txHash: string) => void;
}

type CryptoToken = 'ETH' | 'USDT';

export default function CryptoPayment({ total, onSuccess }: CryptoPaymentProps) {
  const [selectedToken, setSelectedToken] = useState<CryptoToken>('ETH');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [txHash, setTxHash] = useState('');

  const ethPrice = 3000; // Approximate ETH/USD rate
  const ethAmount = (total / ethPrice).toFixed(6);
  const usdtAmount = total.toFixed(2);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if MetaMask is available
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
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePayment = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsPaying(true);
    try {
      if (selectedToken === 'ETH') {
        // Send ETH transaction
        const weiAmount = usdToWei(total, ethPrice);
        const txHash = await (window as any).ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: walletAddress,
            to: PAYMENT_WALLET,
            value: '0x' + weiAmount.toString(16),
          }],
        });
        setTxHash(txHash);
        toast.success('ETH payment sent!');
        onSuccess(txHash);
      } else {
        // USDT transfer via smart contract
        // In production, use wagmi's writeContract
        toast.success('USDT payment initiated!');
        // Simulated for MVP
        const mockTxHash = '0x' + Math.random().toString(16).slice(2);
        setTxHash(mockTxHash);
        onSuccess(mockTxHash);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Transaction rejected by user');
      } else {
        toast.error(error.message || 'Payment failed');
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
          className={`flex-1 p-3 rounded-xl border-2 transition-all ${
            selectedToken === 'ETH'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold">ETH</span>
          <p className="text-xs text-gray-500 mt-1">{ethAmount} ETH</p>
        </button>
        <button
          onClick={() => setSelectedToken('USDT')}
          className={`flex-1 p-3 rounded-xl border-2 transition-all ${
            selectedToken === 'USDT'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className="font-semibold">USDT</span>
          <p className="text-xs text-gray-500 mt-1">${usdtAmount} USDT</p>
        </button>
      </div>

      {/* Wallet Connection */}
      {!isConnected ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Wallet size={20} />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </motion.button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm text-green-700 font-medium">
              Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 mb-1">Send to:</p>
            <p className="text-xs font-mono text-gray-700 break-all">{PAYMENT_WALLET}</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePayment}
            disabled={isPaying}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPaying
              ? 'Processing...'
              : `Pay ${selectedToken === 'ETH' ? ethAmount + ' ETH' : '$' + usdtAmount + ' USDT'}`
            }
          </motion.button>

          {txHash && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
              <ExternalLink size={14} className="text-blue-600" />
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline break-all"
              >
                View on Etherscan: {txHash.slice(0, 20)}...
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
