import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "mock_account_id";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "mock_access_key";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "mock_secret_key";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "swariya-jewelry-media";
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || `https://pub-${R2_ACCOUNT_ID}.r2.dev`;

// Configure S3 Client pointing to Cloudflare R2 endpoint
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

/**
 * Generate Presigned Upload URL for Cloudflare R2 (Images & 360 Videos)
 */
export const generateR2UploadUrl = async ({ fileName, fileType }) => {
  try {
    const fileKey = `jewelry-media/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: fileType
    });

    // 15 Minutes expiration for upload URL
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    const publicUrl = `${R2_PUBLIC_DOMAIN}/${fileKey}`;

    return {
      fileKey,
      uploadUrl: presignedUrl,
      publicUrl
    };
  } catch (error) {
    console.error("Cloudflare R2 Presigned URL Error:", error);
    // Development Fallback
    const fallbackKey = `jewelry-media/${Date.now()}-${fileName}`;
    return {
      fileKey: fallbackKey,
      uploadUrl: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${fallbackKey}?mock_presigned=true`,
      publicUrl: `https://pub-swariya.r2.dev/${fallbackKey}`
    };
  }
};
