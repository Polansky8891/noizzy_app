

export const cloudinaryBlur = (url, { w = 40, h = 40 } = {}) => {
  if (!url) return url;
  try {
    // Inserta transformaciones Cloudinary: c_fill,w_40,h_40,q_10,e_blur:1000
    return url.replace(
      /\/image\/upload\/(?!.*\/)/,
      `/image/upload/c_fill,w_${w},h_${h},q_10,e_blur:1000/`
    );
  } catch {
    return url;
  }
};