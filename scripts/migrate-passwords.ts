/**
 * Mevcut kullanıcıların şifrelerini hash'ler
 * Bu script'i sadece bir kez çalıştırın!
 * 
 * Kullanım: tsx scripts/migrate-passwords.ts
 */

import { prisma } from '../lib/prisma';
import { hashPassword, comparePassword } from '../lib/auth';

async function migratePasswords() {
  try {
    console.log('🔍 Mevcut kullanıcılar kontrol ediliyor...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    console.log(`📊 Toplam ${users.length} kullanıcı bulundu`);

    let migrated = 0;
    let alreadyHashed = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Şifre zaten hash'lenmiş mi kontrol et (bcrypt hash'leri $2a$, $2b$, $2y$ ile başlar)
        const isAlreadyHashed = user.password.startsWith('$2a$') || 
                                user.password.startsWith('$2b$') || 
                                user.password.startsWith('$2y$');

        if (isAlreadyHashed) {
          console.log(`✅ ${user.email} - Şifre zaten hash'lenmiş`);
          alreadyHashed++;
          continue;
        }

        // Şifreyi hash'le
        console.log(`🔄 ${user.email} - Şifre hash'leniyor...`);
        const hashedPassword = await hashPassword(user.password);

        // Veritabanını güncelle
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        console.log(`✅ ${user.email} - Şifre başarıyla hash'lendi`);
        migrated++;
      } catch (error) {
        console.error(`❌ ${user.email} - Hata:`, error);
        errors++;
      }
    }

    console.log('\n📊 Özet:');
    console.log(`   ✅ Hash'lendi: ${migrated}`);
    console.log(`   ⏭️  Zaten hash'li: ${alreadyHashed}`);
    console.log(`   ❌ Hata: ${errors}`);
    console.log('\n✨ Migration tamamlandı!');
  } catch (error) {
    console.error('❌ Migration hatası:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migratePasswords();

