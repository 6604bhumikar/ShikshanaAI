import mongoose, { Schema } from "mongoose";

const externalConnections = new Map<string, mongoose.Connection>();

const getExternalConnection = (uri: string) => {
  const existing = externalConnections.get(uri);
  if (existing) return existing;

  const connection = mongoose.createConnection(uri);
  externalConnections.set(uri, connection);
  return connection;
};

const authConnection = getExternalConnection(
  process.env.AUTH_MONGO_URI || "mongodb://localhost:27017/auth-db"
);

const ExternalUserSchema = new Schema(
  {
    name: String,
    email: String,
    role: String,
    isVerified: Boolean,
  },
  { timestamps: true, strict: false }
);

export const ExternalUser =
  authConnection.models.User || authConnection.model("User", ExternalUserSchema);
