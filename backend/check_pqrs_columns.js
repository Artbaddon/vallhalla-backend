import { connect } from "./config/db/connectMysql.js";

async function checkPQRSColumns() {
  try {
    const [columns] = await connect.query('DESCRIBE pqrs');
    console.log('Columns in pqrs table:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPQRSColumns(); 