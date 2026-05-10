import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Latest gadgets and electronics',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'fashion' },
      update: {},
      create: {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Trending fashion and apparel',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-living' },
      update: {},
      create: {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Beautiful home decor and essentials',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Premium accessories for every occasion',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
      },
    }),
  ]);

  // Create products
  const products = [
    {
      name: 'Wireless Noise-Canceling Headphones',
      slug: 'wireless-nc-headphones',
      description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio. Perfect for music lovers and professionals.',
      price: 299.99,
      comparePrice: 399.99,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944',
      ],
      categoryId: categories[0].id,
      stock: 50,
      featured: true,
    },
    {
      name: 'Smart Watch Pro',
      slug: 'smart-watch-pro',
      description: 'Advanced smartwatch with health monitoring, GPS tracking, and 7-day battery life. Water-resistant up to 50m.',
      price: 449.99,
      comparePrice: 549.99,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
        'https://images.unsplash.com/photo-1546868871-af0de0ae72be',
      ],
      categoryId: categories[0].id,
      stock: 30,
      featured: true,
    },
    {
      name: 'Minimalist Leather Backpack',
      slug: 'minimalist-leather-backpack',
      description: 'Handcrafted genuine leather backpack with laptop compartment. Perfect blend of style and functionality.',
      price: 189.99,
      comparePrice: 249.99,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3',
      ],
      categoryId: categories[1].id,
      stock: 25,
      featured: true,
    },
    {
      name: 'Premium Cotton T-Shirt',
      slug: 'premium-cotton-tshirt',
      description: 'Ultra-soft 100% organic cotton t-shirt. Breathable, durable, and perfect for everyday wear.',
      price: 49.99,
      comparePrice: null,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990',
      ],
      categoryId: categories[1].id,
      stock: 100,
      featured: false,
    },
    {
      name: 'Scandinavian Desk Lamp',
      slug: 'scandinavian-desk-lamp',
      description: 'Modern minimalist desk lamp with adjustable brightness and warm/cool light modes. USB-C powered.',
      price: 79.99,
      comparePrice: 99.99,
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15',
      ],
      categoryId: categories[2].id,
      stock: 40,
      featured: true,
    },
    {
      name: 'Ceramic Plant Pot Set',
      slug: 'ceramic-plant-pot-set',
      description: 'Set of 3 handmade ceramic pots in varying sizes. Matte finish with drainage holes.',
      price: 59.99,
      comparePrice: null,
      images: [
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
        'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a',
      ],
      categoryId: categories[2].id,
      stock: 60,
      featured: false,
    },
    {
      name: 'Titanium Sunglasses',
      slug: 'titanium-sunglasses',
      description: 'Ultra-lightweight titanium frame sunglasses with polarized lenses. UV400 protection.',
      price: 199.99,
      comparePrice: 279.99,
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083',
      ],
      categoryId: categories[3].id,
      stock: 35,
      featured: true,
    },
    {
      name: 'Leather Card Holder',
      slug: 'leather-card-holder',
      description: 'Slim RFID-blocking card holder made from full-grain leather. Holds up to 8 cards.',
      price: 39.99,
      comparePrice: null,
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93',
        'https://images.unsplash.com/photo-1606503153255-59d5a90257e6',
      ],
      categoryId: categories[3].id,
      stock: 80,
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
