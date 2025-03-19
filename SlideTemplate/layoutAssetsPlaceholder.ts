import { LessonSlideAsset, SlideTemplates } from "../shared/types";
import { GlassTemplate } from "../themesTemplates/GlassTemplate";

export function getMediaTypesForCode(code: SlideTemplates): string[] {
  const template = GlassTemplate.find((t) =>
    t.some((comp) => comp.component === "meta-tag" && comp.code === code)
  );
  if (!template) return [];

  const metaTag = template.find((comp) => comp.component === "meta-tag");
  return metaTag?.elements?.media || [];
}

export function fillMissingAssets(
  slide: { assets: LessonSlideAsset[] },
  code: SlideTemplates
): LessonSlideAsset[] {
  const mediaTypes = getMediaTypesForCode(code);
  const existingAssets = new Set(
    slide.assets.map((asset) => mapAssetType(asset))
  );

  const missingAssets = mediaTypes
    .filter((media) => !existingAssets.has(media))
    .map((media) => createPlaceholder(media));

  return [...slide.assets, ...missingAssets];
}

function mapAssetType(asset: LessonSlideAsset): string {
  if (asset.assetType === "icon")
    return asset.width === asset.height ? "icon-b" : "icon-w";
  if (asset.assetType === "photo") {
    if (asset.orientation === "portrait") return "image-v";
    if (asset.orientation === "landscape") return "image-h";
    return "image-q";
  }
  if (asset.assetType === "video") {
    return asset.orientation === "portrait" ? "video-v" : "video-h";
  }
  return "";
}

function createPlaceholder(media: string): LessonSlideAsset {
  const placeholders: Record<string, LessonSlideAsset> = {
    "image-v": {
      url: "https://picsum.photos/720/1280", // Vertical image
      assetType: "photo",
      width: 720,
      height: 1280,
      orientation: "portrait",
    },
    "image-h": {
      url: "https://picsum.photos/1280/720", // Horizontal image
      assetType: "photo",
      width: 1280,
      height: 720,
      orientation: "landscape",
    },
    "image-q": {
      url: "https://picsum.photos/1000/1000", // Square image
      assetType: "photo",
      width: 1000,
      height: 1000,
      orientation: "square",
    },
    "video-v": {
      url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", // Vertical video placeholder
      assetType: "video",
      width: 720,
      height: 1280,
      orientation: "portrait",
    },
    "video-h": {
      url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", // Horizontal video placeholder
      assetType: "video",
      width: 1280,
      height: 720,
      orientation: "landscape",
    },
    "icon-b": {
      url: "https://fonts.gstatic.com/s/i/materialicons/star/v10/24px.svg", // Black icon
      assetType: "icon",
      width: 100,
      height: 100,
      orientation: "square",
    },
    "icon-w": {
      url: "https://fonts.gstatic.com/s/i/materialicons/star/v10/24px.svg", // White icon
      assetType: "icon",
      width: 150,
      height: 100,
      orientation: "landscape",
    },
  };

  return placeholders[media];
}
