export const CLOUD_NAME: string = "dqm8mrtdf";

export const WORKSPACE_PHOTOS_PRESET: string = "csb_space_photos_unsigned";
export const AVATAR_PRESET: string = "csb_avatar_unsigned";
export const COVER_PRESET: string = "csb_cover_unsigned"; 
export const DOCUMENT_PRESET = 'csb_host_documents';
export const POST_PRESET = 'csb_post_documents';
export const DRINK_PRESET = 'csb_drink_documents';

export const buildCloudinaryUploadUrl = (cloudName: string): string => {
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
};

export const CLOUDINARY_UPLOAD_URL: string = buildCloudinaryUploadUrl(CLOUD_NAME);