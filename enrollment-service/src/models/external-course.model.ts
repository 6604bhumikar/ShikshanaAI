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

const CourseSchema = new Schema(
  {
    title: String,
    status: String,
    enrollCount: Number,
  },
  { timestamps: true, strict: false }
);

export const ExternalCourse =
  contentConnection.models.Course || contentConnection.model("Course", CourseSchema);
