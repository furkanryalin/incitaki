/**
 * Bu script veritabanındaki tüm ürünlerin stok değerlerini tutarlı hale getirir.
 * Çalıştırmak için: npx tsx scripts/fix-stock-consistency.ts
 */

import { prisma } from '../lib/prisma';

async function fixStockConsistency() {
  try {
    console.log('🔄 Stok tutarlılığı düzeltiliyor...');
    
    const products = await prisma.product.findMany();
    let updatedCount = 0;
    
    for (const product of products) {
      const stockValue = product.stock ?? 0;
      const inStockValue = stockValue > 0;
      
      // Eğer stok ve inStock tutarsızsa, düzelt
      if (product.inStock !== inStockValue || product.stock !== stockValue) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: stockValue,
            inStock: inStockValue,
          },
        });
        updatedCount++;
        console.log(`✅ ${product.name}: stock=${stockValue}, inStock=${inStockValue}`);
      }
    }
    
    console.log(`\n✨ Tamamlandı! ${updatedCount} ürün güncellendi.`);
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixStockConsistency();

