import sharp from "sharp";

export const readImageOpacity = async (file) => {
  const image = sharp(file);
  const metadata = await image.metadata();
  if (!metadata.hasAlpha) return { metadata, fullyOpaque: true };

  const stats = await image.stats();
  const alpha = stats.channels.at(-1);
  return {
    metadata,
    fullyOpaque: alpha?.min === 255 && alpha.max === 255,
  };
};
