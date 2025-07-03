import { connect } from "../config/db/connectMysql.js";

async function addPaymentColumns() {
  try {
    console.log('Adding new columns to payment table...');
    
    // Add Payment_type column
    await connect.query(`
      ALTER TABLE payment 
      ADD COLUMN Payment_type VARCHAR(50) NOT NULL DEFAULT 'Regular',
      ADD COLUMN Payment_description TEXT NULL
    `);

    // Make Payment_method nullable since it's only set when payment is processed
    await connect.query(`
      ALTER TABLE payment 
      MODIFY COLUMN Payment_method VARCHAR(30) NULL
    `);

    console.log('✅ Successfully added new columns to payment table');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

// Run the script
addPaymentColumns()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 