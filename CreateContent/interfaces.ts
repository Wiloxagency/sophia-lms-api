export interface Payload {
    timestamp: Date;
    courseName: string;
    courseCode: string;
    sectionIndex: number;
    elementIndex: number;
    slideIndex: number;
    paragraph: string;
    language: string;
    voice: string;
    ttsStatus: string;
    titleStatus: string;
    assets?: string[];
    promptStatus?: string;  
    dalleStatus?: string;
    prompts?: any[];
    assetStatus?: string;
    pexelsStatus?: string;
  }
  
  // Types for input structure
  export interface InputSection {
    subtitle: string;
    text: string;
  }
  
  export interface InputSlide {
    title: string;
    text: string;
    sections: InputSection[];
  }
  
  export interface InputData {
    slides: InputSlide[];
  }
  
  // Types for output structure
  export interface OutputSection {
    subtitle: string;
    text: string;
  }
  
  export interface SlideContent {
    title: string;
    text: string;
    sections: OutputSection[];
  }
  
  export interface OutputSlide {
    slideTemplate: string;
    slideContent: SlideContent;
    audioScript: string;
    audioUrl: string;
    assets: Array<never>;  // Changed from never[] to Array<never>
  }
  
  export interface OutputData {
    slides: OutputSlide[];
  }
  
  export interface Section {
    subtitle?: string;
    text?: string;
    fullText?: string;  // Added for storing complete text
  }
  
  export interface ElementConstraints {
    min: number;
    max: number;
  }
  
  export interface MetaTag {
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
  
  export interface TemplateComponent {
    component: string;
    [key: string]: any;
  }