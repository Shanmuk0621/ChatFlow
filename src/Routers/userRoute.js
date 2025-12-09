import { Router } from "express";
import { getCurrentUser, loginUser, logout, refreshAccesstoken, registerUser } from "../Controllers/user.controller.js";
import {verifyJWT} from "../MiddleWares/auth.middleware.js"
import {upload} from '../MiddleWares/multer.middleware.js'


const router = Router()


router.route("/register").post(upload.fields([{name:"profilePhoto",maxCount:1}]),registerUser)
router.route("/login").post(loginUser)
router.route("/refresh-token").get(refreshAccesstoken)
router.route("/logout").get(verifyJWT,logout)
router.route("/me").get(verifyJWT,getCurrentUser)


export default router

