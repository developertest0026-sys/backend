import ImageKit from "imagekit";
import dotenv from "dotenv";

dotenv.config();

/**
 * Get dynamic ImageKit Client instance
 */
export const getImageKitClient = () => {
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!publicKey || !privateKey || !urlEndpoint) {
    console.error("❌ ImageKit Config Missing:", {
      hasPublicKey: !!publicKey,
      hasPrivateKey: !!privateKey,
      hasUrlEndpoint: !!urlEndpoint
    });
    throw new Error("ImageKit configuration missing in backend .env file");
  }

  return new ImageKit({
    publicKey: publicKey.trim(),
    privateKey: privateKey.trim(),
    urlEndpoint: urlEndpoint.trim()
  });
};

/**
 * Generate Client Authentication Parameters for Direct Uploads (Frontend/Admin Panel)
 */
export const getImageKitAuthParams = () => {
  try {
    const client = getImageKitClient();
    const authParams = client.getAuthenticationParameters();
    return {
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY?.trim(),
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT?.trim()
    };
  } catch (error) {
    console.error("ImageKit Auth Parameters Error:", error);
    throw new Error("Failed to generate ImageKit authentication parameters");
  }
};

/**
 * ImageKit High-Quality Optimization Helper
 * Appends auto-format (f-auto) & high quality (q-85) query parameters without loss of visual detail
 * @param {string} url - Original ImageKit Image URL
 * @param {Object} [options] - Optimization parameters
 * @param {number} [options.width] - Optional width transform (e.g. 800)
 * @param {number} [options.quality=85] - Visual quality level (85 = pristine clarity)
 * @param {string} [options.format='auto'] - Auto-format selection (WebP / AVIF)
 */
export const getOptimizedImageUrl = (url, { width, quality = 85, format = "auto" } = {}) => {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("ik.imagekit.io")) return url;

  // Build ImageKit real-time transformation string
  const transforms = [];
  if (format) transforms.push(`f-${format}`);
  if (quality) transforms.push(`q-${quality}`);
  if (width) transforms.push(`w-${width}`);

  const transformParam = `tr=${transforms.join(",")}`;
  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}${transformParam}`;
};

/**
 * Upload Image/Media directly from Backend Server with Optimization Flags
 * @param {Object} options - Upload parameters
 * @param {string|Buffer} options.file - Base64 string, Buffer, or image URL
 * @param {string} options.fileName - File name with extension
 * @param {string} [options.folder="/swariya-jewelry"] - Target folder in ImageKit
 * @param {Array<string>} [options.tags=["swariya", "jewelry"]] - Tags for organization
 */
export const uploadToImageKit = async ({ file, fileName, folder = "/swariya-jewelry", tags = ["swariya"] }) => {
  try {
    const client = getImageKitClient();
    const response = await client.upload({
      file,
      fileName,
      folder,
      tags,
      useUniqueFileName: true,
      responseFields: ["tags", "customCoordinates", "isPrivateFile", "metadata"]
    });

    // Generate high-resolution optimized URL (Auto WebP/AVIF + q-85)
    const optimizedUrl = getOptimizedImageUrl(response.url, { quality: 85, format: "auto" });

    return {
      ...response,
      optimizedUrl
    };
  } catch (error) {
    console.error("ImageKit Direct Upload Error:", error);
    throw error;
  }
};

/**
 * Delete Image/Media from ImageKit
 * @param {string} fileId - ImageKit File ID
 */
export const deleteFromImageKit = async (fileId) => {
  try {
    const client = getImageKitClient();
    const response = await client.deleteFile(fileId);
    return response;
  } catch (error) {
    console.error("ImageKit Delete Error:", error);
    throw error;
  }
};
