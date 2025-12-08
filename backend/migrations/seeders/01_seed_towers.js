import { createConnection } from '../dbConnection.js';

export async function seedTowers() {
  let connection;
  
  try {
    connection = await createConnection();
    console.log('🏢 Sembrando torres...');

    await connection.query(`
      INSERT INTO tower (Tower_name) VALUES
        ('Tower A'),
        ('Tower B'),
        ('Tower C'),
        ('Tower D'),
        ('North'),
        ('South')
      ON DUPLICATE KEY UPDATE Tower_name = VALUES(Tower_name)
    `);

    console.log('   ✓ 6 torres creadas');
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando torres:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTowers().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
