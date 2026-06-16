import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  //! dont put commnet on schemma
  // _id auto genrated
  {
    clerkId:{
      type:String,
      required: true,
      unique: true,
    },

    email:{
      type:String,
      required: true,
      unique: true,
    },

    fullName:{
      type: String,
      required: true,
    },

    profilePic:{
      type: String,
      default: "",
    },
  },

  {timestamps: true},
  // createdAt, Modefed at
);

const User = mongoose.model("User", userSchema);
export default User;
