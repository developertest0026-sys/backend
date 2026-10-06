import Video from "../models/Video.js";

const parseYouTubeEmbedUrl = (url) => {
  if (!url) return url;
  if (url.includes("youtube.com/embed/")) return url;

  // Shorts link
  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  // Watch link
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // Youtu.be short link
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return url;
};

const getYouTubeThumbnail = (url, customThumbnail) => {
  if (customThumbnail && customThumbnail.trim() && !customThumbnail.includes("unsplash")) {
    return customThumbnail;
  }
  if (!url) return "";

  const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);

  const id = (shortsMatch && shortsMatch[1]) || (watchMatch && watchMatch[1]) || (shortMatch && shortMatch[1]) || (embedMatch && embedMatch[1]);
  if (id) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }

  return customThumbnail || "";
};

/**
 * Get Video Reels
 * GET /api/v1/videos
 */
export const getVideos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Video.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const videos = await Video.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Format for frontend embed compatibility and official video thumbnail
    const formatted = videos.map(vid => ({
      ...vid,
      thumbnail: getYouTubeThumbnail(vid.url, vid.thumbnail),
      embedUrl: parseYouTubeEmbedUrl(vid.url)
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    console.error("Get Videos Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Create Video Reel
 * POST /api/v1/videos
 */
export const createVideo = async (req, res) => {
  try {
    const { title, url, platform, thumbnail } = req.body;

    if (!title || !url) {
      return res.status(400).json({ success: false, message: "Title and URL are required" });
    }

    const finalThumbnail = getYouTubeThumbnail(url, thumbnail);

    const newVideo = await Video.create({
      title,
      url,
      platform: platform || "Insta",
      thumbnail: finalThumbnail
    });

    return res.status(201).json({
      success: true,
      message: "Video reel added successfully",
      data: newVideo
    });
  } catch (error) {
    console.error("Create Video Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

/**
 * Update Video Reel
 * PUT /api/v1/videos/:id
 */
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Video.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Video updated successfully",
      data: updated
    });
  } catch (error) {
    console.error("Update Video Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Delete Video Reel
 * DELETE /api/v1/videos/:id
 */
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Video.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully"
    });
  } catch (error) {
    console.error("Delete Video Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
