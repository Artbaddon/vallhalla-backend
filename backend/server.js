import app from './app/app.js';
import dotenv from "dotenv";
import connectMongoDB from './config/db/connectMongoDB.js';

dotenv.config();

// Initialize MongoDB connection
const initializeDatabase = async () => {
  try {
    await connectMongoDB();
    console.log('✅ Database connections established');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 3000;

// Start server after database connection
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📦 Package Delivery API available at: http://localhost:${PORT}/api/packages`);
  });
};

startServer().catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
