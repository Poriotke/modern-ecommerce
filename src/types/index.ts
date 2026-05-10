// Product types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  categoryId: string;
  category?: Category;
  stock: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
}

// Cart types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

// Order types
export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'STRIPE' | 'MPESA' | 'CRYPTO' | 'WHATSAPP';
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Checkout types
export interface CheckoutData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

export interface MpesaPaymentRequest {
  phone: string;
  amount: number;
  orderId: string;
}

export interface StripePaymentRequest {
  items: CartItem[];
  customerEmail: string;
}
