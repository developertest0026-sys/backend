import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    platform: { type: String, required: true, enum: ['Insta', 'Youtube Shorts'] },
    thumbnail: { type: String }
  },
  { timestamps: true }
);

const Video = mongoose.model('Video', videoSchema);
export default Video;
