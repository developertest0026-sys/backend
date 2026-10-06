import Product from "../models/Product.js";
import { generateR2UploadUrl } from "../utils/r2.util.js";
import { getImageKitAuthParams, uploadToImageKit } from "../utils/imagekit.util.js";

/**
 * Get ImageKit Authentication Parameters for Client Direct Upload (Frontend / Admin)
 */
export const getImageKitAuth = async (req, res) => {
  try {
    const authParams = getImageKitAuthParams();
    return res.status(200).json({
      success: true,
      data: authParams
    });
  } catch (error) {
    console.error("Get ImageKit Auth Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate ImageKit authentication parameters" });
  }
};

/**
 * Upload Image/Media directly via Backend to ImageKit
 */
export const uploadImageKitFile = async (req, res) => {
  try {
    const { file, fileName, folder, tags } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({ success: false, message: "file (base64/URL) and fileName are required" });
    }

    const result = await uploadToImageKit({
      file,
      fileName,
      folder: folder || "/swariya-jewelry",
      tags: tags || ["swariya"]
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded to ImageKit successfully",
      data: {
        fileId: result.fileId,
        name: result.name,
        url: result.optimizedUrl || result.url,
        rawUrl: result.url,
        thumbnailUrl: result.thumbnailUrl,
        height: result.height,
        width: result.width,
        size: result.size,
        filePath: result.filePath
      }
    });
  } catch (error) {
    console.error("Upload to ImageKit Error:", error);
    const errMsg = error.message || "Image upload failed";
    if (errMsg.includes("authenticated") || error?.help) {
      return res.status(401).json({
        success: false,
        message: "ImageKit Authentication Error: Invalid Private Key or Public Key in backend/.env file. Please check your ImageKit Developer Dashboard (https://imagekit.io/dashboard/developer/api-keys)."
      });
    }
    return res.status(500).json({ success: false, message: errMsg });
  }
};

/**
 * Generate Direct Upload URL for Cloudflare R2 (HD Jewelry Video / Image)
 */
export const generateUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, mediaType, productId } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, message: "fileName and fileType are required" });
    }

    const { fileKey, uploadUrl, publicUrl } = await generateR2UploadUrl({ fileName, fileType });

    return res.status(200).json({
      success: true,
      data: {
        fileKey,
        uploadUrl,
        publicUrl,
        mediaType: mediaType || (fileType.startsWith("video/") ? "VIDEO" : "IMAGE"),
        productId: productId || null
      }
    });
  } catch (error) {
    console.error("Generate Upload URL Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Confirm Upload & Attach Media to Product
 */
export const confirmMediaUpload = async (req, res) => {
  try {
    const { productId, mediaType, url, thumbnailUrl, isPrimary } = req.body;

    if (!productId || !url) {
      return res.status(400).json({ success: false, message: "productId and url are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const newMedia = {
      mediaType: mediaType || "VIDEO",
      url,
      thumbnailUrl: thumbnailUrl || (mediaType === "VIDEO" ? `${url}-thumb.jpg` : undefined),
      isPrimary: isPrimary || false
    };

    product.media.push(newMedia);
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Media attached to product successfully",
      data: product
    });
  } catch (error) {
    console.error("Confirm Media Upload Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
