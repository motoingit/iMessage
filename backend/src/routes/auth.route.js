import express from "express"
import {checkAuth} from '../controllers/auth.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

//prefix to api/auth
router.get("/check", checkAuth);

export default router;
