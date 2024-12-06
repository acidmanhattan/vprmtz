import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client for Cloudflare R2
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  }
});

export const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

// Utility function to get a signed URL for an object
export async function getSignedImageUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `images/${key}`,
      ResponseCacheControl: 'public, max-age=3600',
      ResponseExpires: new Date(Date.now() + 3600 * 1000),
    });
    
    const url = await getSignedUrl(r2Client, command, { expiresIn: 7200 }); // Increase to 2 hours
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return `https://vprmtz.acidmanhattan.xyz/images/${key}`;
  }
}

// Utility function to get signed URLs for multiple objects
export async function getSignedImageUrls(keys: string[]) {
  return Promise.all(keys.map(key => getSignedImageUrl(key)));
}

export async function getAssetUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `assets/${key}`,
      ResponseCacheControl: 'public, max-age=3600',
    });
    
    const url = await getSignedUrl(r2Client, command, { expiresIn: 7200 });
    return url;
  } catch (error) {
    console.error('Error generating asset URL:', error);
    return `https://vprmtz.acidmanhattan.xyz/assets/${key}`;
  }
}
