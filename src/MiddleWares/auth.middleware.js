
import User from "../Models/user.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    console.log("middleware ", req.cookies)
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();
    console.log("access token of cookie",req.cookies?.accessToken)
    console.log("token is:",token);
    console.log(req.header("Authorization"));
    console.log(req.cookies);
    

    
    

    if (!token) {
        throw new ApiError(401, "Unauthorized request");
    }

    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
        throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    console.log("requested user",req.user);
    next();
});
