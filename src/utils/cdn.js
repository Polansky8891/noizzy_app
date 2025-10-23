export function clThumb(url) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/w_60,q_10,blur:100,f_auto/");
}

export function clCover(url, width = 320) {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto:eco,f_auto/`);
}
