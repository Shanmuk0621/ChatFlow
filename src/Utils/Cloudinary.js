import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { extractPublicId } from 'cloudinary-build-url';



cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:true
});

const uploadOnCloudinary = async (localFilePath) =>
{
    try
    {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })

        fs.unlinkSync(localFilePath)
        return response

    }
    catch(error)
    {
        fs.unlinkSync(localFilePath) // remove the locally saved temoparary file as the upload operation got failed
        return null
    }
}


const deleteOnCloudinary = async (url)=>
{
    try
    {
        if (!url) return null

        const publicId = extractPublicId(url)

        const result = await cloudinary.uploader.destroy(publicId)
        
        if (result) return true  
    }
    catch(error)
    {
        return null
    }
}


export {uploadOnCloudinary,deleteOnCloudinary}
