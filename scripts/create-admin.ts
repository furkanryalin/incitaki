import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth';

async function createAdmin() {
  try {
    const email = process.argv[2] || 'admin@incitaki.com';
    const password = process.argv[3] || 'Admin123!';
    const name = process.argv[4] || 'Admin User';

    console.log('🔐 Admin kullanıcısı oluşturuluyor...\n');
    console.log(`E-posta: ${email}`);
    console.log(`Şifre: ${password}`);
    console.log(`İsim: ${name}\n`);

    // E-posta kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.isAdmin) {
        console.log('✅ Bu e-posta adresi zaten bir admin kullanıcısı!');
        await prisma.$disconnect();
        return;
      } else {
        // Normal kullanıcıyı admin yap
        const hashedPassword = await hashPassword(password);
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            isAdmin: true,
            password: hashedPassword,
          },
        });
        console.log('✅ Kullanıcı admin yapıldı ve şifre güncellendi!');
        await prisma.$disconnect();
        return;
      }
    }

    // Yeni admin kullanıcısı oluştur
    const hashedPassword = await hashPassword(password);
    const admin = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isAdmin: true,
      },
    });

    console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!\n');
    console.log(`ID: ${admin.id}`);
    console.log(`E-posta: ${admin.email}`);
    console.log(`İsim: ${admin.name}`);
    console.log(`Admin: ${admin.isAdmin}\n`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Hata oluştu:');
    console.error(error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createAdmin();

