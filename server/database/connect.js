import mongoose from "mongoose";

export async function connectToDatabase() {
  try {
    const conn = await mongoose.connect(process.env.ATLAS_URI);

    console.log(`Connected to MongoDB: ${conn.connection.host}\n`);
  } catch (error) {
    console.log(`Failed to connect to MongoDB ${error}\n`);

    process.exit(1);
  }
}
