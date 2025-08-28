import mongoose from "mongoose";

let isConnected = false;    // to track connection status


export const connectDB = async () => {

    // ENHANCED: Proper error handling for missing MONGODB_URI
    if(!process.env.MONGODB_URI) {
        const errorMessage = "MONGODB_URI is not defined. Database connection cannot be established.";
        console.error(`❌ CRITICAL DATABASE ERROR: ${errorMessage}`);
        throw new Error(errorMessage);
    }

    if(isConnected){
        // return console.log("+> using existing database connection");
        return;
    } 

    try {
        
       await mongoose.connect(process.env.MONGODB_URI, {
           // M10-Optimized Connection Pool Configuration
           maxPoolSize: 400,              // Use 27% of M10's 1,490 connections (was 100)
           minPoolSize: 20,               // Maintain warm connections (was 10)
           
           // M10-Specific Timeouts (account for CPU throttling)
           serverSelectionTimeoutMS: 10000,  // Longer timeout for M10 (was 5000)
           socketTimeoutMS: 60000,            // Account for M10 performance delays (was 45000)
           connectTimeoutMS: 10000,           // Initial connection timeout
           
           // M10 Performance Optimizations
           maxIdleTimeMS: 15000,              // Keep connections alive longer (was 10000)
           waitQueueTimeoutMS: 15000,         // Longer wait for M10 connection pool (was 5000)
           heartbeatFrequencyMS: 10000,       // Monitor connection health
           
           // Utilize Secondary Nodes for Reads (KEY M10 OPTIMIZATION)
           readPreference: 'secondaryPreferred', // Leverage 2,980 secondary connections
           readConcern: { level: 'local' },       // Faster reads for M10
           
           // Write Optimizations for M10
           retryWrites: true,                     // Retry failed writes automatically
           writeConcern: { w: 'majority', j: false }, // Optimized write concern for M10
           
           // M10-Appropriate Buffer Settings
           bufferCommands: true,
       });

       isConnected = true

       // Monitor connection pool (useful for debugging)
       mongoose.connection.on('connected', () => {
           console.log('✅ MongoDB connected successfully - Database:', mongoose.connection.db.databaseName);
       });
       
       mongoose.connection.on('error', (err) => {
           console.error('❌ MongoDB connection error:', err);
           isConnected = false;
       });
       
       mongoose.connection.on('disconnected', () => {
        //    console.log('⚠️ MongoDB disconnected');
           isConnected = false;
       });

       // Graceful shutdown handling
       process.on('SIGINT', async () => {
           await mongoose.connection.close();
        //    console.log('MongoDB connection closed through app termination');
           process.exit(0);
       });


    } catch (error) {
        console.log("Failed to connect to MongoDB:", error)
        isConnected = false;
        throw error; // Re-throw to handle in calling function
    }
}