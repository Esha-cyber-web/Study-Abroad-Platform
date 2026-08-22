const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
console.log(`📝 Environment: ${process.env.NODE_ENV}${process.env.NODE_ENV === 'development' ? ' (Auth bypassed for dev)' : ''}`);

const required = ['JWT_SECRET'];
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
});

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
