import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  //  _id is defualt

  senderId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  receiverId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text:{
    type: String,
  },
  image:{
    type: String,
  },
  video:{
    type: String,
  }

},{timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;
