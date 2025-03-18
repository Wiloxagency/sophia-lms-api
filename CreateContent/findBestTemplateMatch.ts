import { GlassTemplate } from "../themesTemplates/GlassTemplate";
import { MetaTag, SlideContent, TemplateComponent } from "./interfaces";

type Template = TemplateComponent[];

function countWords(text: string): number {
  return text.split(" ").length
}

function countWordsNew(text: string): number {
  // Remove content inside <s></s> tags
  const cleanedText = text.replace(/<s>.*?<\/s>/g, "");
  
  // Split by spaces and filter out empty strings
  return cleanedText.trim().split(/\s+/).filter(word => word !== "").length;
}

export function findBestTemplateMatch(slide: SlideContent, themeName: string): Template | null {
  let templates: Template[] = GlassTemplate;

  let bestMatch: Template | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const template of templates) {
    const meta = template[0] as MetaTag;
    let score = 0;

    // Check title length constraints
    const titleLen = countWords(slide.title) || 0;
    if (titleLen >= meta.elements.title.min && titleLen <= meta.elements.title.max) {
      score += 2;
    }

    // Check text length constraints
    const textLen = countWords(slide.text) || 0;
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
        const subtitleLen = countWords(slideSection.subtitle) || 0;
        const textLen = countWords(slideSection.text) || 0;

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