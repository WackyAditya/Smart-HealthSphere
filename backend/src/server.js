import dotenv from 'dotenv';
// Trigger restart now
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5006;

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Error: Port ${PORT} is already in use.`);
    console.error(`💡 Solution: Run 'taskkill /F /IM node.exe' in your terminal and restart.\n`);
    process.exit(1);
  }
});

// Graceful shutdown logic (critical for Windows/Nodemon)
const gracefulShutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Connect to MongoDB
connectDB();
