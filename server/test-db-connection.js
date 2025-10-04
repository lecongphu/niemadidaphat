/**
 * Test PostgreSQL Database Connection
 * Chạy: node test-db-connection.js
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

console.log('🔍 Kiểm tra cấu hình database...\n');

// Hiển thị cấu hình (ẩn password)
console.log('📋 Cấu hình hiện tại:');
console.log(`   DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || '5432'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'niemadidaphat'}`);
console.log(`   DB_USER: ${process.env.DB_USER || 'niemadidaphat_user'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NOT SET'}`);
console.log(`   DB_SSL: ${process.env.DB_SSL || 'false'}\n`);

// Tạo connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'niemadidaphat',
  user: process.env.DB_USER || 'niemadidaphat_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? {
    rejectUnauthorized: false
  } : false
});

console.log('🔌 Đang thử kết nối...\n');

try {
  // Test query
  const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
  
  console.log('✅ KẾT NỐI THÀNH CÔNG!\n');
  console.log('⏰ Server time:', result.rows[0].current_time);
  console.log('📦 PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
  
  // Kiểm tra tables
  console.log('\n🗂️  Đang kiểm tra tables...');
  const tablesResult = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  
  if (tablesResult.rows.length > 0) {
    console.log(`✅ Tìm thấy ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });
  } else {
    console.log('⚠️  Chưa có table nào. Cần import schema.');
  }
  
  // Test một số tables quan trọng
  console.log('\n📊 Kiểm tra dữ liệu...');
  const dataChecks = [
    { table: 'products', query: 'SELECT COUNT(*) FROM products' },
    { table: 'chapters', query: 'SELECT COUNT(*) FROM chapters' },
    { table: 'user_profiles', query: 'SELECT COUNT(*) FROM user_profiles' }
  ];
  
  for (const check of dataChecks) {
    try {
      const countResult = await pool.query(check.query);
      console.log(`   ${check.table}: ${countResult.rows[0].count} rows`);
    } catch (err) {
      console.log(`   ${check.table}: ⚠️ Table không tồn tại hoặc lỗi`);
    }
  }
  
  console.log('\n✅ HOÀN THÀNH! Database đã sẵn sàng.\n');
  
} catch (error) {
  console.error('❌ LỖI KẾT NỐI DATABASE:\n');
  console.error(`   Error: ${error.message}\n`);
  
  // Hướng dẫn fix
  console.log('💡 CÁCH KHẮC PHỤC:');
  
  if (error.message.includes('pg_hba.conf')) {
    console.log('\n🔧 Lỗi pg_hba.conf - PostgreSQL không cho phép kết nối từ host này.');
    console.log('\nGiải pháp:');
    console.log('1. Kiểm tra DB_HOST trong .env (nên dùng localhost nếu cùng server)');
    console.log('2. Cấu hình pg_hba.conf:');
    console.log('   sudo nano /etc/postgresql/16/main/pg_hba.conf');
    console.log('   Thêm dòng:');
    console.log('   host    niemadidaphat   niemadidaphat_user      127.0.0.1/32    md5');
    console.log('3. Restart PostgreSQL:');
    console.log('   sudo systemctl restart postgresql');
    console.log('\nXem chi tiết: FIX_POSTGRESQL_CONNECTION.md');
  } else if (error.message.includes('password authentication failed')) {
    console.log('\n🔧 Lỗi xác thực - Password không đúng.');
    console.log('\nGiải pháp:');
    console.log('1. Kiểm tra DB_PASSWORD trong .env');
    console.log('2. Reset password nếu cần:');
    console.log('   sudo -u postgres psql');
    console.log('   ALTER USER niemadidaphat_user WITH ENCRYPTED PASSWORD \'new_password\';');
  } else if (error.message.includes('does not exist')) {
    console.log('\n🔧 Lỗi database/user không tồn tại.');
    console.log('\nGiải pháp:');
    console.log('1. Tạo database và user:');
    console.log('   Xem hướng dẫn: POSTGRESQL_SETUP.md');
  } else if (error.message.includes('ECONNREFUSED')) {
    console.log('\n🔧 Lỗi kết nối bị từ chối - PostgreSQL có thể chưa chạy.');
    console.log('\nGiải pháp:');
    console.log('1. Kiểm tra PostgreSQL đang chạy:');
    console.log('   sudo systemctl status postgresql');
    console.log('2. Start PostgreSQL nếu cần:');
    console.log('   sudo systemctl start postgresql');
  } else {
    console.log('\n   Kiểm tra:');
    console.log('   - PostgreSQL service đang chạy');
    console.log('   - Các biến DB_* trong .env đã đúng');
    console.log('   - pg_hba.conf đã cấu hình đúng');
    console.log('   - Firewall không block port 5432');
  }
  
  console.log('\n📚 Xem thêm:');
  console.log('   - FIX_POSTGRESQL_CONNECTION.md');
  console.log('   - POSTGRESQL_SETUP.md');
  console.log('   - DEPLOYMENT_UBUNTU.md\n');
  
  process.exit(1);
} finally {
  await pool.end();
}

