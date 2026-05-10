/**
 * M-Pesa STK Push Handler (Client-side utility)
 *
 * Interfaces with /api/checkout/stk-push API route to initiate
 * Lipa Na M-Pesa Online (STK Push) payments via the Daraja API.
 *
 * Environment Variables Required (server-side):
 * - MPESA_CONSUMER_KEY
 * - MPESA_CONSUMER_SECRET
 * - MPESA_PASSKEY
 * - MPESA_SHORTCODE
 * - MPESA_CALLBACK_URL
 */

import { CartItem } from '@/types';

export interface MpesaPaymentRequest {
  phone: string;
  items: CartItem[];
  shippingData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
}

export interface MpesaPaymentResponse {
  success: boolean;
  message?: string;
  orderId?: string;
  orderNumber?: string;
  checkoutRequestId?: string;
  error?: string;
  details?: string;
}

/**
 * Validates a Kenyan phone number format.
 * Accepts: 0712345678, +254712345678, 254712345678, 712345678
 */
export function validateKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

  // Match patterns: 07XXXXXXXX, +2547XXXXXXXX, 2547XXXXXXXX, 7XXXXXXXX
  const patterns = [
    /^0[17]\d{8}$/,        // 07XXXXXXXX or 01XXXXXXXX
    /^\+254[17]\d{8}$/,    // +2547XXXXXXXX or +2541XXXXXXXX
    /^254[17]\d{8}$/,      // 2547XXXXXXXX or 2541XXXXXXXX
    /^[17]\d{8}$/,         // 7XXXXXXXX or 1XXXXXXXX
  ];

  return patterns.some((pattern) => pattern.test(cleaned));
}

/**
 * Formats a phone number to the 254XXXXXXXXX format required by Daraja API.
 */
export function formatPhoneForMpesa(phone: string): string {
  let formatted = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');

  if (formatted.startsWith('0')) {
    formatted = '254' + formatted.substring(1);
  } else if (formatted.length === 9) {
    formatted = '254' + formatted;
  }

  return formatted;
}

/**
 * Initiates an M-Pesa STK Push payment by calling the API route.
 * The server handles Daraja API authentication and STK push logic.
 */
export async function initiateMpesaPayment(
  request: MpesaPaymentRequest
): Promise<MpesaPaymentResponse> {
  try {
    const response = await fetch('/api/checkout/stk-push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'M-Pesa payment initiation failed',
        details: data.details,
      };
    }

    return {
      success: true,
      message: data.message,
      orderId: data.orderId,
      orderNumber: data.orderNumber,
      checkoutRequestId: data.checkoutRequestId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error. Please check your connection.',
    };
  }
}

/**
 * Polls order status after STK Push initiation.
 * In production, this would check the order payment status via the API.
 */
export async function pollMpesaPaymentStatus(
  orderId: string,
  maxAttempts: number = 10,
  intervalMs: number = 3000
): Promise<{ completed: boolean; status: string }> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`);
      const data = await response.json();

      if (data.paymentStatus === 'COMPLETED') {
        return { completed: true, status: 'COMPLETED' };
      }

      if (data.paymentStatus === 'FAILED') {
        return { completed: false, status: 'FAILED' };
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    } catch {
      // Continue polling on error
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return { completed: false, status: 'TIMEOUT' };
}
