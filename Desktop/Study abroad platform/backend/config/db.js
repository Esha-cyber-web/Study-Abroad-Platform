const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ MONGO_URI is not defined in .env file!');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    process.env.DB_CONNECTED = 'true';
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    process.env.DB_CONNECTED = 'false';
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;