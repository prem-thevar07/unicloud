import mongoose from "mongoose";

const cloudAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    provider: {
      type: String,
      required: true // "google"
    },
    accessToken: String,
    refreshToken: String,
    scope: [String],
    connectedAt: Date,
    storageUsed: Number,
    storageTotal: Number
  },
  { timestamps: true }
);

export default mongoose.model("CloudAccount", cloudAccountSchema);
