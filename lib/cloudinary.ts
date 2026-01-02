import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(fileBuffer: Buffer, fileName: string) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      public_id: fileName,
      folder: 'incitaki',
      resource_type: 'image',
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }).end(fileBuffer);
  });
}
