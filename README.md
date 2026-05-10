# ShopNow - Modern E-Commerce MVP

A high-performance, full-stack e-commerce application built with Next.js 14, featuring multi-channel payment integration.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion
- **State Management**: Zustand with localStorage persistence
- **Backend/Auth**: NextAuth.js (Google + Credentials)
- **Database**: Prisma with PostgreSQL
- **Payments**: Stripe, M-Pesa (Daraja API), Crypto (wagmi/ethers), WhatsApp

## Features

- Dynamic Product Gallery with category filtering and Quick View modal
- Advanced Shopping Cart (side-drawer) with real-time totals and local persistence
- Multi-Channel Checkout:
  - **Stripe** - Card payments
  - **M-Pesa** - STK Push via Daraja API
  - **Crypto** - ETH/USDT via MetaMask (wagmi)
  - **WhatsApp** - Pre-filled order message
- User Authentication (Google OAuth + Email/Password)
- My Orders Dashboard

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Stripe account
- M-Pesa Daraja API credentials (for M-Pesa payments)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Set up database
npx prisma generate
npx prisma db push
npx prisma db seed

# Run development server
npm run dev
```

### Environment Variables

See `.env.example` for all required environment variables.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth + registration
│   │   ├── checkout/      # Stripe, M-Pesa, Crypto, WhatsApp
│   │   ├── orders/        # Order management
│   │   └── products/      # Product API
│   ├── auth/              # Sign in/up pages
│   ├── checkout/          # Checkout page
│   ├── orders/            # Orders dashboard
│   └── products/          # Products page
├── components/
│   ├── cart/              # CartDrawer
│   ├── checkout/          # CryptoPayment
│   ├── layout/            # Navbar, Footer, Providers
│   └── products/          # ProductCard, ProductGallery, QuickViewModal
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── prisma.ts          # Prisma client
│   ├── utils.ts           # Utility functions
│   └── web3-config.ts     # Crypto payment config
├── store/
│   ├── cart.ts            # Zustand cart store
│   └── ui.ts             # UI state store
└── types/
    └── index.ts           # TypeScript types
```

## Payment Integration Details

### Stripe
- Full Stripe Checkout Session integration
- Webhook handler for payment confirmations
- Supports card payments globally

### M-Pesa (Daraja API)
- STK Push for instant mobile payments
- Callback handler for payment verification
- Phone number formatting (Kenyan numbers)

### Crypto (Web3)
- MetaMask wallet connection
- ETH direct transfers
- USDT ERC-20 token transfers
- On-chain transaction verification

### WhatsApp
- Pre-filled order message with cart summary
- Direct link to seller's WhatsApp
- Order tracking via order number

## License

MIT
