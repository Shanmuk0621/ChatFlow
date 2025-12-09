import { Router } from "express";
import { deleteMessage, editMessage, getAllMessagesOfUser, getAllusers, sendMessage } from "../Controllers/message.controller.js";
import {verifyJWT} from "../MiddleWares/auth.middleware.js"
import exp from "constants";

const router = Router()

router.route("/getAllUsers").get(verifyJWT,getAllusers)
router.route("/get-messages/:id").get(verifyJWT,getAllMessagesOfUser)
router.route("/send-message/:id").post(verifyJWT,sendMessage)
router.route("/edit-message/:id").post(editMessage)
router.route("/delete-message/:id").get(verifyJWT,deleteMessage)

export default router