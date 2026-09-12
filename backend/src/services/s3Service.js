import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3Client from "../config/s3.js";

export const getPresignedMediaUrl = async (key) => {
  if (!key) return null;
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });
    // Generate presigned URL valid for 7 days (604800 seconds)
    return await getSignedUrl(s3Client, command, { expiresIn: 604800 });
  } catch (err) {
    console.error("Presigned URL generation error:", err);
    return null;
  }
};

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

  const presignedUrl = await getPresignedMediaUrl(fileName);
  const fallbackUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

  return {
    key: fileName,
    url: presignedUrl || fallbackUrl,
    type: file.mimetype.startsWith("image/")
      ? "image"
      : "video",
  };
};

export default uploadToS3;