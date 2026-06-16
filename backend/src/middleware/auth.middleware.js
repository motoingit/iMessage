import {getAuth} from '@clerk/express' ;
import User from "../models/user.model.js";

// next is the next method we call after checks
export async function protectRoute(req, res, next) {
  try {
    const {userId} = getAuth(req);
    
    if(!userId){
      res.status(401).json({message: "Unauthorized"});
      return;
    }
    
    const user = await User.findOne({clerkId: userId});
    if(!user){
      res.status(404).json({message: "User Profile is not Sync Yet"});
      return;
    }

    req.user = user;
    next()

  }catch (error) {
    console.error("[AuthMiddleware] Error in protectRoute:", error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
}
