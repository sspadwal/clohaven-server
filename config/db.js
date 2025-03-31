import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // Load .env file

async function connectDB() {
    try {
        // Ensure the MONGO_URI environment variable is loaded
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined!');
            return;
        }

        // Connect to MongoDB with the necessary options
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Use the new URL parser
            useUnifiedTopology: true, // Use the new connection management engine
            // Removed deprecated options 'useFindAndModify' and 'useCreateIndex'
        });

        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // Exit the process with failure code in case of connection issues
    }
}

export default connectDB;