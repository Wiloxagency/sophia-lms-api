import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';

export async function fillTemplate(slides: any, presentationName: string) {
    try {
        // Load GlassTemplate
        const glassTemplatePath = path.join(__dirname, '../themesTemplates/GlassTemplate.ts');
        const GlassTemplate = require(glassTemplatePath).GlassTemplate;

        // Process each slide
        const processedSlides = slides.slides.map((slide: any) => {
            // Find matching template in GlassTemplate
            const templateCode = slide.slideTemplate;
            const template = GlassTemplate.find((t: any) => 
                t[0].component === "meta-tag" && t[0].code === templateCode
            );

            if (!template) {
                throw new Error(`Template not found for code: ${templateCode}`);
            }

            // Create a deep copy of the template to modify
            const processedTemplate = JSON.parse(JSON.stringify(template));

            // Process each component in the template
            return processedTemplate.map((component: any) => {
                if (component.component === "meta-tag") {
                    return component;
                }

                // Replace media placeholders
                const mediaTypes = {
                    "video-h": (assetType: string, orientation: string) => assetType == "video" && orientation == "landscape",
                    "video-v": (assetType: string, orientation: string) => assetType == "video" && orientation == "portrait",
                    "image-h": (assetType: string, orientation: string) => assetType == "photo" && orientation == "landscape",
                    "image-v": (assetType: string, orientation: string) => assetType == "photo" && orientation == "portrait",
                    "image-q": (assetType: string, orientation: string) => assetType == "photo" && orientation == "square",
                    "icon-b": (assetType: string) => assetType == "icon",
                    "icon-w": (assetType: string) => assetType == "icon"
                };

                // Replace video placeholders
                if (component.video) {
                    const videoType = component.video.slice(1, -1); // Remove brackets
                    const matchingAsset = slide.assets.find((asset: any) => 
                        asset.assetType === "video" && mediaTypes[videoType](asset.assetType, asset.orientation)
                    );
                    if (matchingAsset) {
                        component.video = matchingAsset.url;
                    }
                }

                // Replace image placeholders
                if (component.image) {
                    const imageType = component.image.slice(1, -1);
                    const matchingAsset = slide.assets.find((asset: any) => 
                        asset.assetType === "photo" && mediaTypes[imageType](asset.assetType, asset.orientation)
                    );
                    if (matchingAsset) {
                        component.image = matchingAsset.url;
                    }
                }

                // Replace icon placeholders
                if (component.icon) {
                    const iconType = component.icon.slice(1, -1);
                    const matchingAsset = slide.assets.find((asset: any) => 
                        asset.assetType === "icon" && mediaTypes[iconType](asset.assetType)
                    );
                    if (matchingAsset) {
                        component.icon = matchingAsset.url;
                    }
                }

                // Replace title placeholder
                if (component.title && component.title.startsWith("[") && component.title.endsWith("]")) {
                    if (component.title === "[title]") {
                        component.title = slide.slideContent.title;
                    } else if (component.title.startsWith("[sections.")) {
                        const sectionIndex = parseInt(component.title.match(/\d+/)[0]);
                        component.title = slide.slideContent.sections[sectionIndex]?.subtitle || "";
                    }
                }

                // Replace text placeholder
                if (component.text && component.text.startsWith("[") && component.text.endsWith("]")) {
                    if (component.text === "[text]") {
                        component.text = slide.slideContent.text;
                    } else if (component.text.startsWith("[sections.")) {
                        const sectionIndex = parseInt(component.text.match(/\d+/)[0]);
                        component.text = slide.slideContent.sections[sectionIndex]?.text || "";
                    }
                }

                return component;
            });
        });

        // Create the final presentation object
        const presentation = {
            slides: processedSlides
        };

        // Save to Azure Blob Storage
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient("presentations");
        const blobClient = containerClient.getBlockBlobClient(`${presentationName}.json`);

        await blobClient.upload(JSON.stringify(presentation), JSON.stringify(presentation).length);

        return { status: "success", message: `Presentation ${presentationName}.json created successfully` };

    } catch (error) {
        throw new Error(`Error processing template: ${error.message}`);
    }
}