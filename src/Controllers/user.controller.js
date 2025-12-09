import User from "../Models/user.model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";

const registerUser =  asyncHandler(async (req,res)=>
{
    const {email,fullName,phoneNumber,userName,password} = req.body

    if (!email && !userName &&  !phoneNumber && !password && !fullName  )
    {
        throw new ApiError(400,"All fields are required")
    }

    const isUserExists = await User.findOne({
        $or : [{userName},{email},{phoneNumber}]
    })


    if (isUserExists) throw new ApiError(401,"User already existed with that email or userName or phoneNumber ")



    let profilePhotoLocalPath   

    if (req.files && Array.isArray(req.files.profilePhoto) && req.files.profilePhoto.length > 0 )
    {
        profilePhotoLocalPath = req.files.profilePhoto[0].path
    }

    const profilePhoto = await uploadOnCloudinary(profilePhotoLocalPath)

    const creatingUser = await User.create(
        {
            userName:userName,
            fullName:fullName,
            email:email,
            phoneNumber:phoneNumber,
            profilePhoto:profilePhoto?.url || "",
            password:password

        }
    )

    const createdUser = await User.findById(creatingUser._id)
    .select("-password -refreshToken")

    if (!createdUser ) throw new ApiError(404,"Unable to create a user")

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            createdUser,
            "successfully registered a user"
        )
    )
    
})

const generateAccessRefreshToken = async (userId)=>
{
    try
    {
        const user = await User.findById(userId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
    }
    catch(error)
    {
        throw new ApiError(500,"something went wrong while generating access and refresh token")
    }
}

const loginUser = asyncHandler(async (req,res)=>
{
    console.log("calling login user controller");
    
    console.log(req.body);
    
    const {phoneNumber="",email="",password="",userName=""} = req.body

    // if (!phoneNumber && !email && !password && !userName) 
    // {
    //     throw new ApiError(401,"all fields are required")
    // }
    
    

    const isUserExists = await User.findOne(
        {
            $or:
            [
                {email},
                {userName},
                {phoneNumber}
            ]
        }
    )


    if (!isUserExists) throw new ApiError(403,"user does not exists")

    const isPasswordValid = await isUserExists.isPasswordCorrect(password)

    if (!isPasswordValid)
    {
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken} = await generateAccessRefreshToken(isUserExists._id)

    const loggedInUser = await User.findById(isUserExists._id)
    .select("-password -refershToken")

    const options = {
        httpOnly:true,
        // secure:true,
        maxAge :  1000 * 60 * 60 * 24 * 7 
    }

    console.log("from login ",accessToken,refreshToken);

    

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "user logged in successfully"
        )
    )

})

const logout = asyncHandler(async (req,res)=>
{
    console.log("log out is called so its working");
    
    const id = req.user._id

    await User.findByIdAndUpdate(
        id,
        {
            $set:
            {
                refreshToken:undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
    }

    res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(
            200,
            {},
            "successfully logged out"
        )
    )
})

const refreshAccesstoken = asyncHandler( async(req , res) =>{
    const token = req.cookies.refreshToken || req.body.refreshToken

    try {
        if(!token) throw new ApiError(401 , "unauthorized user");
    
        const decodedtoken =  jwt.verify(token , process.env.REFRESH_TOKEN_SECRET);
    
        if(!decodedtoken) throw new ApiError(401 , "unauthorized user");
    
        const user = await User.findById(decodedtoken._id);
    
        if(!user) throw new ApiError(401 , "invalid refresh token");
    
        if(user.refreshToken != token) throw new ApiError(401 , "refresh token is expired");
    
        const options = { httpOnly: true, secure: true, sameSite: 'None' };
    
        const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res.status(200).cookie("refreshToken" , refreshToken , options).cookie("accessToken" , accessToken , options)
        .json(new ApiResponse(200 , {accessToken , refreshToken} , "access token refreshed"))

    } catch (error) {
        throw new ApiError(500 , "something went wrong");
    }
})

const getCurrentUser = asyncHandler((req, res)=>{
    res.status(200).json(
        new ApiResponse(200 , {user:req?.user} , "data fetched Successfully" )
    )
})




export 
{registerUser,
    loginUser,
    logout,
    refreshAccesstoken,
    getCurrentUser
}

