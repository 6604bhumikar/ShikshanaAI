import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    authorId: { type: String, required: true },
    authorRole: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const communitySchema = new mongoose.Schema(
  {
    teacherId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    members: [{ type: String }],
    joinRequests: [{ type: String }],
    posts: [postSchema],
  },
  { timestamps: true }
);

export const Community =
  mongoose.models.Community || mongoose.model("Community", communitySchema);
