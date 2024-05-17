import mongoose from "mongoose";
const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("Invalid environment variable: MONGODB_URI");
}

var dbConnectionState: mongoose.ConnectionStates = 0;

export const connectToMongoDB = async () => {
  try {
    if (dbConnectionState === 1) {
      return Promise.resolve(true);
    }

    const db = await mongoose.connect(MONGODB_URI);
    dbConnectionState = db.connections[0].readyState;
    if (dbConnectionState === 1) {
      return Promise.resolve(true);
    }
  } catch (error) {
    return Promise.reject(error);
  }
};
