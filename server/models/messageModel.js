const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "userModel" },
    text: String,
    file: String,
  },
  { timestamps: true }
);
const MessageModel = mongoose.model("Message", MessageSchema);
module.exports = MessageModel;
