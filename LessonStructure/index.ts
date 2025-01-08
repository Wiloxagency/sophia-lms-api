import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { BlobServiceClient } from "@azure/storage-blob";

// Interfaces
interface Section {
    subtitle?: string;
    text?: string;
    fullText?: string;  // Added for storing complete text
}

interface Slide {
    title: string;
    text: string;
    fullText?: string;  // Added for storing complete text
    sections: Section[];
}

interface Presentation {
    slides: Slide[];
}

interface ElementConstraints {
    min: number;
    max: number;
}

interface MetaTag {
    component: string;
    code: string;
    description: string;
    elements: {
        media: string[];
        title: ElementConstraints;
        text: ElementConstraints;
        sections: {
            title: ElementConstraints;
            text: ElementConstraints;
        }[];
    };
}

interface TemplateComponent {
    component: string;
    [key: string]: any;
}

type Template = TemplateComponent[];

function getFirstSentence(text: string): { firstSentence: string, fullText: string | undefined } {
    if (!text) return { firstSentence: '', fullText: undefined };
    
    // Split by period or line break, whichever comes first
    const periodIndex = text.indexOf('.');
    const lineBreakIndex = text.indexOf('\n');
    
    let endIndex = -1;
    if (periodIndex === -1 && lineBreakIndex === -1) {
        return { firstSentence: text, fullText: undefined };
    } else if (periodIndex === -1) {
        endIndex = lineBreakIndex;
    } else if (lineBreakIndex === -1) {
        endIndex = periodIndex + 1;  // Include the period
    } else {
        endIndex = Math.min(periodIndex + 1, lineBreakIndex);
    }
    
    const firstSentence = text.substring(0, endIndex).trim();
    const fullText = firstSentence !== text ? text : undefined;
    
    return { firstSentence, fullText };
}

function processSlide(slide: Slide): Slide {
    const processedSlide: Slide = {
        title: slide.title,
        text: '',
        sections: []
    };

    // Process main text
    const { firstSentence, fullText } = getFirstSentence(slide.text);
    processedSlide.text = firstSentence;
    if (fullText) {
        processedSlide.fullText = fullText;
    }

    // Process sections
    processedSlide.sections = slide.sections.map(section => {
        const processedSection: Section = {
            subtitle: section.subtitle
        };

        if (section.text) {
            const { firstSentence, fullText } = getFirstSentence(section.text);
            processedSection.text = firstSentence;
            if (fullText) {
                processedSection.fullText = fullText;
            }
        }

        return processedSection;
    });

    return processedSlide;
}

function findBestTemplateMatch(slide: Slide, templates: Template[]): Template | null {
    let bestMatch: Template | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const template of templates) {
        const meta = template[0] as MetaTag;
        let score = 0;

        // Check title length constraints
        const titleLen = slide.title?.length || 0;
        if (titleLen >= meta.elements.title.min && titleLen <= meta.elements.title.max) {
            score += 2;
        }

        // Check text length constraints
        const textLen = slide.text?.length || 0;
        if (textLen >= meta.elements.text.min && textLen <= meta.elements.text.max) {
            score += 2;
        }

        // Check sections matching
        const slidesSections = slide.sections || [];
        const templateSections = meta.elements.sections;

        if (slidesSections.length === templateSections.length) {
            score += 3;

            // Check each section's constraints
            slidesSections.forEach((slideSection, index) => {
                const templateSection = templateSections[index];
                const subtitleLen = slideSection.subtitle?.length || 0;
                const textLen = slideSection.text?.length || 0;

                if (subtitleLen >= templateSection.title.min && 
                    subtitleLen <= templateSection.title.max) {
                    score += 1;
                }

                if (textLen >= templateSection.text.min && 
                    textLen <= templateSection.text.max) {
                    score += 1;
                }
            });
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = template;
        }
    }

    return bestMatch;
}

function fillTemplate(template: Template, slide: Slide): Template {
    return template.map(component => {
        const newComponent = { ...component };

        if ('title' in newComponent) {
            if (newComponent.title === '[title]') {
                newComponent.title = slide.title;
            } else {
                const sectionMatch = newComponent.title?.match(/\[sections\.(\d+)\.subtitle\]/);
                if (sectionMatch) {
                    const sectionIndex = parseInt(sectionMatch[1]);
                    if (slide.sections[sectionIndex]) {
                        newComponent.title = slide.sections[sectionIndex].subtitle || '';
                    }
                }
            }
        }

        if ('text' in newComponent) {
            if (newComponent.text === '[text]') {
                newComponent.text = slide.text;
            } else {
                const sectionMatch = newComponent.text?.match(/\[sections\.(\d+)\.text\]/);
                if (sectionMatch) {
                    const sectionIndex = parseInt(sectionMatch[1]);
                    if (slide.sections[sectionIndex]) {
                        newComponent.text = slide.sections[sectionIndex].text || '';
                    }
                }
            }
        }

        return newComponent;
    });
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
        const containerName = "presentations";

        if (!connectionString || !containerName) {
            throw new Error("Missing required environment variables");
        }

        // Get request body
        const presentation: Presentation = req.body?.presentation;
        const templates: Template[] = req.body?.templates;

        if (!presentation || !templates) {
            throw new Error("Missing required request body parameters");
        }

        // Process each slide
        const optimizedSlides: Template[] = [];
        for (const slide of presentation.slides) {
            // Process the slide to split text into sections if needed
            const processedSlide = processSlide(slide);
            
            // Find best matching template
            const bestTemplate = findBestTemplateMatch(processedSlide, templates);
            if (!bestTemplate) continue;

            const filledSlide = fillTemplate(bestTemplate, processedSlide);
            optimizedSlides.push(filledSlide);
        }

        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const outputFilename = `optimized_presentation_${timestamp}.json`;

        // Create blob client and upload
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(outputFilename);
        
        await blockBlobClient.upload(JSON.stringify(optimizedSlides, null, 2), 
                                   JSON.stringify(optimizedSlides, null, 2).length);

        context.res = {
            status: 200,
            body: {
                status: "success",
                message: "Presentation optimized successfully",
                filename: outputFilename
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (error) {
        context.log.error("Error processing presentation:", error);
        context.res = {
            status: 500,
            body: {
                status: "error",
                message: error instanceof Error ? error.message : "Unknown error occurred"
            },
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};

export default httpTrigger;