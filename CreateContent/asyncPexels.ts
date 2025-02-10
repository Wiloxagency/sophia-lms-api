import { createConnection } from "../shared/mongo";
import { saveLog } from "../shared/saveLog";

// Asset type configurations
const ASSET_CONFIGS = {
    'icon-b': {
        defaultAsset: {
            preview_url: "/assets/icon-black.png",
            preview_dimensions: { width: 512, height: 512 }
        },
        assetType: "icon",
        orientation: "portrait"
    },
    'icon-w': {
        defaultAsset: {
            preview_url: "/assets/icon-white.png",
            preview_dimensions: { width: 512, height: 512 }
        },
        assetType: "icon",
        orientation: "portrait"
    },
    'video-h': {
        defaultAsset: {
            preview_url: "/assets/slide-placeholder-h.png",
            preview_dimensions: { width: 1024, height: 576 },
        },
        assetType: "video",
        orientation: "landscape",
        fallbackType: "photo"
    },
    'video-v': {
        defaultAsset: {
            preview_url: "/assets/slide-placeholder-v.png",
            preview_dimensions: { width: 576, height: 1024 },
        },
        assetType: "video",
        orientation: "portrait",
        fallbackType: "photo"
    },
    'image-h': {
        defaultAsset: {
            preview_url: "/assets/slide-placeholder-h.png",
            preview_dimensions: { width: 1024, height: 576 },
        },
        assetType: "photo",
        orientation: "landscape"
    },
    'image-v': {
        defaultAsset: {
            preview_url: "/assets/slide-placeholder-v.png",
            preview_dimensions: { width: 576, height: 1024 },
        },
        assetType: "photo",
        orientation: "portrait"
    },
    'image-q': {
        defaultAsset: {
            preview_url: "/assets/slide-placeholder-q.png",
            preview_dimensions: { width: 1024, height: 1024 },
        },
        assetType: "photo",
        orientation: "square"
    }
};

async function findPexelsAsset(pexelsCollection: any, usedAssetsCollection: any, params: any) {
    const { courseCode, sectionIndex, assetType, orientation } = params;
    const usedAssetIds = await usedAssetsCollection.distinct("asset_id");
    
    // Try with section index
    let doc = await pexelsCollection.findOne({
        courseCode,
        sectionIndex,
        assetType,
        orientation,
        asset_id: { $nin: usedAssetIds }
    });

    // Try without section index
    if (!doc) {
        doc = await pexelsCollection.findOne({
            courseCode,
            assetType,
            orientation,
            asset_id: { $nin: usedAssetIds }
        });
    }

    return doc;
}

async function processAsset(asset: string, params: any, collections: any) {
    const { pexelsCollection, usedAssetsCollection } = collections;
    const config = ASSET_CONFIGS[asset];

    if (!config) {
        await saveLog(
            `Error: Incorrect asset type for Pexels in course: ${params.courseCode}, sectionIndex ${params.sectionIndex}, slideIndex ${params.slideIndex}`,
            "Error",
            "AsyncPexelsCycle()",
            "Courses/{courseCode}/CreateContent"
        );
        return null;
    }

    // For icon types, return default asset directly
    if (config.assetType === "icon") {
        return config.defaultAsset;
    }

    // Try to find primary asset type
    let pexelsDoc = await findPexelsAsset(pexelsCollection, usedAssetsCollection, {
        ...params,
        assetType: config.assetType,
        orientation: config.orientation
    });

    // If video not found and fallback type exists, try with fallback
    if (!pexelsDoc && config.fallbackType) {
        pexelsDoc = await findPexelsAsset(pexelsCollection, usedAssetsCollection, {
            ...params,
            assetType: config.fallbackType,
            orientation: config.orientation
        });
    }

    // If no asset found, use default
    if (!pexelsDoc) {
        return config.defaultAsset;
    }

    // Register used asset
    if (pexelsDoc.asset_id) {
        await usedAssetsCollection.insertOne({ asset_id: pexelsDoc.asset_id });
    }

    return pexelsDoc;
}

function formatAssetData(pexelsDoc: any, assetType: string) {
    return {
        url: pexelsDoc.preview_url,
        assetType: assetType,
        width: pexelsDoc.preview_dimensions.width,
        height: pexelsDoc.preview_dimensions.height,
        orientation: pexelsDoc.preview_dimensions.width > pexelsDoc.preview_dimensions.height
            ? "landscape"
            : pexelsDoc.preview_dimensions.width < pexelsDoc.preview_dimensions.height
                ? "portrait"
                : "square"
    };
}

export async function AsyncPexelsCycle() {
    console.info('AsyncPexelsCycle function ran at:' + new Date().toISOString());

    const db = await createConnection();
    const collections = {
        slideCollection: db.collection("slide"),
        pexelsCollection: db.collection("pexels"),
        courseCollection: db.collection("course"),
        usedAssetsCollection: db.collection("used_assets")
    };

    const slides = await collections.slideCollection.find({ pexelsStatus: "waiting" }).toArray();

    for (const slideDoc of slides) {
        const { courseCode, sectionIndex, elementIndex, slideIndex, assets } = slideDoc;
        let assetsData = [];

        try {
            for (const asset of assets) {
                const pexelsDoc = await processAsset(
                    asset,
                    { courseCode, sectionIndex, slideIndex },
                    { pexelsCollection: collections.pexelsCollection, usedAssetsCollection: collections.usedAssetsCollection }
                );

                if (pexelsDoc) {
                    const config = ASSET_CONFIGS[asset];
                    if (!pexelsDoc.preview_dimensions) {
                        console.info(pexelsDoc)
                    }
                    assetsData.push(formatAssetData(pexelsDoc, config.assetType));
                }
            }

            const updateField = `sections.${sectionIndex}.elements.${elementIndex}.elementLesson.slides.${slideIndex}.assets`;
            
            await collections.courseCollection.updateOne(
                { code: courseCode },
                { $set: { [updateField]: assetsData } }
            );

            await collections.slideCollection.updateOne(
                { _id: slideDoc._id },
                { $set: { pexelsStatus: "created" } }
            );

        } catch (error) {
            await saveLog(
                `Error: ${error.message} getting Pexels assets from DB in course: ${courseCode}, sectionIndex ${sectionIndex}, slideIndex ${slideIndex}`,
                "Error",
                "AsyncPexelsCycle()",
                "Courses/{courseCode}/CreateContent"
            );
        }
    }

    // Cleanup used assets
    const usedAssetIds = await collections.usedAssetsCollection.distinct("asset_id");
    await collections.pexelsCollection.deleteMany({ asset_id: { $in: usedAssetIds } });
}