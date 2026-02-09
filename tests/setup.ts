import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Increase timeout for database operations
jest.setTimeout(30000);

// Connect to MongoDB before all tests
beforeAll(async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined");
        }

        await mongoose.connect(mongoUri);
        console.log("✅ Connected to MongoDB for testing");
    } catch (error) {
        console.error("❌ Failed to connect to MongoDB:", error);
        throw error;
    }
});

// Clean up after all tests
afterAll(async () => {
    try {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log("✅ MongoDB connection closed");
    } catch (error) {
        console.error("❌ Error closing connections:", error);
    }
});

// Log test file being run
beforeEach(() => {
    const testName = expect.getState().currentTestName;
    if (testName) {
        console.log(`\n🧪 Running: ${testName}`);
    }
});
