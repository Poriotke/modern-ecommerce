/**
 * Checkout Components - Modular Payment Integrations
 *
 * Each component handles a specific payment channel:
 * - StripeProvider: Card payments via Stripe Checkout Sessions
 * - MpesaPayment: M-Pesa STK Push via Safaricom Daraja API
 * - CryptoPay: ETH/USDT payments via MetaMask/WalletConnect
 * - WhatsAppOrder: Fallback order via WhatsApp message
 *
 * All components consume cart state from Zustand (useCartStore)
 * to ensure consistent totals across payment methods.
 */

export { default as StripeProvider } from './StripeProvider';
export { default as MpesaPayment } from './MpesaPayment';
export { default as CryptoPay } from './CryptoPay';
export { default as WhatsAppOrder } from './WhatsAppOrder';

// Utilities
export {
  initiateMpesaPayment,
  validateKenyanPhone,
  formatPhoneForMpesa,
  pollMpesaPaymentStatus,
} from './MpesaHandler';
export type { MpesaPaymentRequest, MpesaPaymentResponse } from './MpesaHandler';
