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
    promptStatus?: string;  
    dalleStatus?: string;
    prompts?: any[];
    assetStatus?: string;
    pexelsStatus?: string;
  }
  