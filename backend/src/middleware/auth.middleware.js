import {getAuth} from '@clerk/express' ;
import User from "../models/user.model.js";

// next is the next method we call after checks
export async function protectRoute(req, res, next) {
  try {
    const {userId} = getAuth(req);
    
    if(!userId){
      res.status(401).json({message: "Unautorized"});
      return;
    }
    
    const user = await User.findOne({clerkId: userId});
    if(!user){
      res.status(404).json({message: "User Profile is not Sync Yet"});
      return;
    }

    req.user = user;
    next()

  } catch (error) {
    console.error("Error in Protect Route middleware:", error.message)
  }
}
