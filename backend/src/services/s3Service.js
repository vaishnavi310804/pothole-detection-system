import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../config/s3.js";

const uploadToS3 = async (file) => {
  const folder = file.mimetype.startsWith("image/")
    ? "images"
    : "videos";

  const fileName = `${folder}/${Date.now()}-${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  await s3Client.send(command);

  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return {
    key: fileName,
    url: fileUrl,
    type: file.mimetype.startsWith("image/")
      ? "image"
      : "video",
  };
};

export default uploadToS3;