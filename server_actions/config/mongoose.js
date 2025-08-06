import mongoose from "mongoose";

let isConnected = false;    // to track connection status

export const connectDB = async () => {

    // if(!process.env.MONGODB_URI) return console.log("MONGODB_URI is not defined")

    if(isConnected){
        // return console.log("+> using existing database connection");
        return;
    } 

    try {
        
       await mongoose.connect(process.env.MONGODB_URI, {
           // Connection Pool Configuration
           maxPoolSize: 100,              // Maximum number of connections in the pool
           minPoolSize: 10,               // Minimum number of connections to maintain
           serverSelectionTimeoutMS: 5000, // How long to try to connect before timing out
           socketTimeoutMS: 45000,        // How long a socket stays open when idle
           
           // Additional optimizations for production
           maxIdleTimeMS: 10000,          // Close idle connections after 10 seconds
           waitQueueTimeoutMS: 5000,      // Max time to wait for a connection from pool
           
           // Connection retry logic
           retryWrites: true,             // Retry failed writes automatically
           w: 'majority',                 // Write concern for data durability
       });

       isConnected = true

       // Monitor connection pool (useful for debugging)
       mongoose.connection.on('connected', () => {
           console.log('✅ MongoDB connected with connection pooling enabled');
       });
       
       mongoose.connection.on('error', (err) => {
           console.error('❌ MongoDB connection error:', err);
           isConnected = false;
       });
       
       mongoose.connection.on('disconnected', () => {
           console.log('⚠️ MongoDB disconnected');
           isConnected = false;
       });

       // Graceful shutdown handling
       process.on('SIGINT', async () => {
           await mongoose.connection.close();
           console.log('MongoDB connection closed through app termination');
           process.exit(0);
       });


    } catch (error) {
        console.log("Failed to connect to MongoDB:", error)
        isConnected = false;
        throw error; // Re-throw to handle in calling function
    }
}