export function cloudinaryWebP(url: string, width?: number): string {
  if (!url || !url.includes("cloudinary.com")) return url;

  const params = ["f_webp", "q_auto"];
  if (width) params.push(`w_${width}`);

  return url.replace("/upload/", `/upload/${params.join(",")}/`);
}
