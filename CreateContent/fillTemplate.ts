import { BlobServiceClient } from '@azure/storage-blob';
import { GlassTemplate } from '../themesTemplates/GlassTemplate';
import { findBestTemplateMatch } from './findBestTemplateMatch';
import { createConnection } from '../shared/mongo';

const database = createConnection()

// Helper function to slice text based on specified delimiters and max length
function sliceText(text: string, maxLength: number, isTitle: boolean = false): string {
    // If text is within limits, return as is
    if (text.length <= maxLength) {
        return text;
    }

    // Define delimiters based on content type
    const delimiters = isTitle ? 
        ['. ', ': '] : 
        ['. '];

    let bestSlice = text.substring(0, maxLength);
    let bestEndPosition = 0;

    // Try each delimiter
    for (const delimiter of delimiters) {
        const lastIndex = text.lastIndexOf(delimiter, maxLength);
        if (lastIndex > bestEndPosition) {
            bestEndPosition = lastIndex;
            bestSlice = text.substring(0, lastIndex + 1).trim();
        }
    }

    // If no delimiter found, force cut at maxLength
    if (bestEndPosition === 0) {
        bestSlice = text.substring(0, maxLength).trim() + "...";
    }

    return bestSlice;
}

// Helper function to validate and slice content against constraints
function processContentWithConstraints(
    content: string, 
    constraints: { min: number; max: number },
    isTitle: boolean = false
): string {
    const words = content.split(' ');
    
    if (words.length < constraints.min) {
        return content; // Return as is if too short
    }
    
    if (words.length > constraints.max) {
        return sliceText(content, content.split(' ', constraints.max + 1).join(' ').length, isTitle);
    }
    
    return content;
}

export async function fillTemplate(slides: any, globalData:any, presentationName: string) {

    try {
        // Process each slide
        let processedSlides = slides.map((slide: any) => {

            const templateCode = slide.slideTemplate;
            const template = GlassTemplate.find((t: any) => 
                t[0].component === "meta-tag" && t[0].code === templateCode
            );

            if (!template) {
                throw new Error(`Template not found for code: ${templateCode}`);
            }

            // Get constraints from meta-tag
            const metaTag = template[0];
            const constraints = {
                title: metaTag.elements.title,
                text: metaTag.elements.text,
                sections: metaTag.elements.sections
            };

            // Create a deep copy of the template to modify
            const processedTemplate = JSON.parse(JSON.stringify(template));

            // Process each component in the template
            return processedTemplate.map((component: any) => {
                if (component.component === "meta-tag") {
                    return component;
                }

                // Process audio replacement
                if (component.component === "audio") {
                    component.audioUrl = slide.audioUrl
                    return component;
                }
                
                // Replace media placeholders
                // const mediaTypes = {
                //     "video-h": (assetType: string, orientation: string) => assetType == "video" && orientation == "landscape",
                //     "video-v": (assetType: string, orientation: string) => assetType == "video" && orientation == "portrait",
                //     "image-h": (assetType: string, orientation: string) => assetType == "photo" && orientation == "landscape",
                //     "image-v": (assetType: string, orientation: string) => assetType == "photo" && orientation == "portrait",
                //     "image-q": (assetType: string, orientation: string) => assetType == "photo" && orientation == "square",
                //     "icon-b": (assetType: string) => assetType == "icon",
                //     "icon-w": (assetType: string) => assetType == "icon"
                // };
                const mediaTypes = {
                    "video-h": (assetType: string, orientation: string) => assetType == "video",
                    "video-v": (assetType: string, orientation: string) => assetType == "video",
                    "image-h": (assetType: string, orientation: string) => assetType == "photo",
                    "image-v": (assetType: string, orientation: string) => assetType == "photo",
                    "image-q": (assetType: string, orientation: string) => assetType == "photo",
                    "icon-b": (assetType: string) => assetType == "icon",
                    "icon-w": (assetType: string) => assetType == "icon"
                };

                // Process media replacements
                if (component.video) {
                    const videoType = component.video.slice(1, -1);
                    const matchingAssetIndex = slide.assets.findIndex((asset: any) => 
                        asset.assetType === "video" && mediaTypes[videoType](asset.assetType, asset.orientation)
                    );
                    
                    if (matchingAssetIndex !== -1) {
                        component.video = slide.assets[matchingAssetIndex].url;
                        // Remove the asset from slide.assets
                        slide.assets.splice(matchingAssetIndex, 1);
                    }
                }

                if (component.image) {
                    const imageType = component.image.slice(1, -1);
                    const matchingAssetIndex = slide.assets.findIndex((asset: any) => 
                        asset.assetType === "photo" && mediaTypes[imageType](asset.assetType, asset.orientation)
                    );
                    
                    if (matchingAssetIndex !== -1) {
                        component.image = slide.assets[matchingAssetIndex].url;
                        // Remove the asset from slide.assets
                        slide.assets.splice(matchingAssetIndex, 1);
                    }
                }

                if (component.icon) {
                    const iconType = component.icon.slice(1, -1);
                    const matchingAssetIndex = slide.assets.findIndex((asset: any) => 
                        asset.assetType === "icon" && mediaTypes[iconType](asset.assetType)
                    );
                    
                    if (matchingAssetIndex !== -1) {
                        component.icon = slide.assets[matchingAssetIndex].url;
                        // Remove the asset from slide.assets
                        slide.assets.splice(matchingAssetIndex, 1);
                    }
                }

                // Process title with constraints
                if (component.title && component.title.startsWith("[") && component.title.endsWith("]")) {
                    if (component.title === "[title]") {
                        component.title = processContentWithConstraints(
                            slide.slideContent.title,
                            constraints.title,
                            true
                        );
                    } else if (component.title.startsWith("[sections.")) {
                        const sectionIndex = parseInt(component.title.match(/\d+/)[0]);
                        const sectionContent = slide.slideContent.sections[sectionIndex]?.subtitle || "";
                        if (constraints.sections && constraints.sections[sectionIndex]) {
                            component.title = processContentWithConstraints(
                                sectionContent,
                                constraints.sections[sectionIndex].title,
                                true
                            );
                        }
                    }
                }

                // Process text with constraints
                if (component.text && component.text.startsWith("[") && component.text.endsWith("]")) {
                    if (component.text === "[text]") {
                        component.text = processContentWithConstraints(
                            slide.slideContent.text,
                            constraints.text,
                            false
                        );
                    } else if (component.text.startsWith("[sections.")) {
                        const sectionIndex = parseInt(component.text.match(/\d+/)[0]);
                        const sectionContent = slide.slideContent.sections[sectionIndex]?.text || "";
                        if (constraints.sections && constraints.sections[sectionIndex]) {
                            component.text = processContentWithConstraints(
                                sectionContent,
                                constraints.sections[sectionIndex].text,
                                false
                            );
                        }
                    }
                }
                return component;
            });
        });

        // Add globaldata to presentation
        processedSlides.unshift(globalData);

        // Save presentation object to Azure Blob Storage
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient("presentations");
        const blobClient = containerClient.getBlockBlobClient(`${presentationName}.json`);

        await blobClient.upload(JSON.stringify(processedSlides), JSON.stringify(processedSlides).length);

        return { status: "success", message: `Presentation ${presentationName}.json created successfully` };

    } catch (error) {
        throw new Error(`Error processing template: ${error.message}`);
    }
}