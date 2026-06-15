import express from 'express';
import {getUserForSidebar, getConversationsForSidebar, getMessages, sendMessages} from '../controllers/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import {upload } from '../middleware/upload.middleware.js';

const router = express.Router();


router.use(protectRoute);

router.get("/users" ,getUserForSidebar)
router.get("/conversations" ,getConversationsForSidebar)
router.get("/:id" ,getMessages)

router.post("/send/:id", upload.single("media"), upload,sendMessages)
//todo: show this in the frotend

export default router;
