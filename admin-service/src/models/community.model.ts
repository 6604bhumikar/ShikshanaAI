import mongoose, { Schema } from "mongoose";

const externalConnections = new Map<string, mongoose.Connection>();

const getExternalConnection = (uri: string) => {
  const existing = externalConnections.get(uri);
  if (existing) return existing;

  const connection = mongoose.createConnection(uri);
  externalConnections.set(uri, connection);
  return connection;
};

const contentConnection = getExternalConnection(
  process.env.CONTENT_MONGO_URI || "mongodb://localhost:27017/content-db"
);

const communitySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    teacherId: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    members: [{ type: String }],
    joinRequests: [{ type: String }],
  },
  { timestamps: true, strict: false }
);

export const Community =
  contentConnection.models.Community ||
  contentConnection.model("Community", communitySchema);
