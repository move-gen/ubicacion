const { execSync } = require('child_process');

console.log('🔍 Iniciando proceso de migración y build...');

try {
  console.log('📦 Aplicando migraciones de Prisma...');
  
  try {
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migraciones aplicadas correctamente');
  } catch (error) {
    // Si falla, intentar hacer baseline
    console.log('⚠️  Error al aplicar migraciones. Intentando baseline...');
    
    try {
      // Marcar la migración inicial como aplicada
      execSync('npx prisma migrate resolve --applied "0_init"', { stdio: 'inherit' });
      console.log('✅ Baseline completado. Reintentando migraciones...');
      
      // Reintentar migraciones
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Migraciones aplicadas después de baseline');
    } catch (baselineError) {
      console.error('❌ Error durante el proceso de baseline y migración');
      throw baselineError;
    }
  }
  
  console.log('🔄 Generando cliente de Prisma...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('🏗️  Compilando Next.js...');
  execSync('npx next build', { stdio: 'inherit' });
  
  console.log('✅ Build completado exitosamente');
} catch (error) {
  console.error('❌ Error durante el build:', error.message);
  process.exit(1);
}

