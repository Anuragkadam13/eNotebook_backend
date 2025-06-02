const mongoose = require("mongoose");

const connectToMongo = () => {
  console.log(
    "Attempting to connect to MongoDB with URI:",
    process.env.MONGO_URI
  );

  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true, // Add these options
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds
      connectTimeoutMS: 15000,
    })
    .then(() => {
      console.log("Connected to MongoDB successfully");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
    });
};

module.exports = connectToMongo;
