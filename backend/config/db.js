const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Mongodb is Connected");
  } catch (err) {
    console.log("Mongodb Connection Error:", err);
    throw err;
  }
};

module.exports = connectDB;