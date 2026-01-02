import { prisma } from '../lib/prisma';

async function resetUsers() {
  try {
    console.log('🔍 Mevcut kullanıcılar kontrol ediliyor...\n');
    
    // Mevcut kullanıcıları listele
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    console.log(`📊 Toplam ${users.length} kullanıcı bulundu:\n`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });
    
    if (users.length === 0) {
      console.log('\n✅ Zaten hiç kullanıcı yok.\n');
      await prisma.$disconnect();
      return;
    }
    
    console.log('\n⚠️  Tüm kullanıcılar silinecek...');
    console.log('   (İlişkili adresler ve şifre sıfırlama tokenları da silinecek)');
    console.log('   (Siparişler ve yorumlar korunacak, ancak kullanıcı bağlantıları kaldırılacak)\n');
    
    // Tüm kullanıcıları sil
    // Cascade sayesinde Address ve PasswordResetToken'lar da silinecek
    const result = await prisma.user.deleteMany({});
    
    console.log(`✅ ${result.count} kullanıcı başarıyla silindi.\n`);
    
    // Doğrulama
    const remainingUsers = await prisma.user.count();
    console.log(`📊 Kalan kullanıcı sayısı: ${remainingUsers}\n`);
    
    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Hata oluştu:');
    console.error(error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

resetUsers();

