const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" }); // Ensure the path is correct

// import the uri from the .env file
const MONGODB_URI = process.env.MONGODB_URI;

const connectToDatabase = async () => {
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    });
    console.log(`Database connected successfully`);
    return connection;
  } catch (error) {
    console.error(`Error connecting to database:`, error);
    throw error;
  }
};

module.exports = connectToDatabase;
