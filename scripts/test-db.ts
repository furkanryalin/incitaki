import { prisma } from '../lib/prisma';

async function testDatabase() {
  try {
    console.log('🔍 Veritabanı bağlantısı test ediliyor...\n');
    
    // Basit bir sorgu çalıştır
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.category.count();
    const userCount = await prisma.user.count();
    
    console.log('✅ Veritabanı bağlantısı başarılı!\n');
    console.log('📊 Veritabanı İstatistikleri:');
    console.log(`   - Ürün sayısı: ${productCount}`);
    console.log(`   - Kategori sayısı: ${categoryCount}`);
    console.log(`   - Kullanıcı sayısı: ${userCount}\n`);
    
    // Son 5 ürünü listele
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        inStock: true,
      },
    });
    
    if (recentProducts.length > 0) {
      console.log('📦 Son 5 Ürün:');
      recentProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.price}₺ ${product.inStock ? '✅' : '❌'}`);
      });
    } else {
      console.log('⚠️  Henüz ürün eklenmemiş.');
    }
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Veritabanı bağlantı hatası:');
    console.error(error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testDatabase();

