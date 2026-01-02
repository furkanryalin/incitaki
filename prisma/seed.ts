import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Kategoriler artık admin panelinden eklenebilir, seed'de sadece ürünler ekleniyor
  // İsterseniz buraya örnek kategoriler ekleyebilirsiniz, ama zorunlu değil

  // Products from data/products.ts
  const { products } = await import('../data/products');
  
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        images: product.images ? JSON.stringify(product.images) : null,
        category: product.category,
        inStock: product.inStock,
        stock: product.stock ?? 10,
        rating: product.rating,
        reviews: product.reviews,
      },
    });
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

