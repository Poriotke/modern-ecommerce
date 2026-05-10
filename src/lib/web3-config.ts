// Web3 Configuration for Crypto Payments
// Uses wagmi for wallet connection and viem for contract interactions

import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';

// Wagmi config for wallet connections
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// Payment wallet address (receives crypto payments)
export const PAYMENT_WALLET = process.env.NEXT_PUBLIC_PAYMENT_WALLET_ADDRESS || '0x0000000000000000000000000000000000000000';

// USDT contract on Ethereum mainnet
export const USDT_CONTRACT = process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS || '0xdAC17F958D2ee523a2206206994597C13D831ec7';

// ERC20 ABI for USDT transfers
export const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'decimals',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// Convert USD amount to wei (ETH) using approximate rate
export function usdToWei(usdAmount: number, ethPrice: number = 3000): bigint {
  const ethAmount = usdAmount / ethPrice;
  return BigInt(Math.floor(ethAmount * 1e18));
}

// Convert USD to USDT units (6 decimals)
export function usdToUsdt(usdAmount: number): bigint {
  return BigInt(Math.floor(usdAmount * 1e6));
}
