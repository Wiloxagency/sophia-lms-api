import { LanguageCode, LanguageName } from "./languages";

export type CourseData = {
  code: string;
  details: {
    title: string;
    summary: string;
    longSummary?: string;
    cover: string;
    categories?: string[];
  };
  sections: CourseSection[];
  /**
   * @format `'<hours> h <minutes> m'`
   * @example '1 h 20 m'
   */
  duration?: string;
  approvalStatus: "Pending approval" | "Approved" | "Under review";
  /**
   * When the course is not approved, this property can be both an empty string
   * or `undefined`
   */
  approvedBy?: string;
  /** Only courses with content have this property */
  language?: LanguageCode;
  /** Only courses with content have this property */
  languageName?: LanguageName;
  /** Only courses with content have this property */
  voice?: string;
  slideshowColorThemeName?: (typeof slideshowColorThemeNames)[number];
  slideshowBackgroundMusicUrl?: string | null;
  slideshowShouldUseOrganizationLogo?: boolean;
  slideshowGlobalAssetsSource?: string | null;
  /** UUID */
  author_code: string;
  /** The name of the instructor who created the course */
  createdBy: string;
  /** UUID */
  organizationCode: string;
  /**
   * An ISO string
   * @format `'yyyy-mm-dd'`
   */
  dateCreated: string;
  isNewSlideStructure?: boolean;
  titleFont?: string;
  textFont?: string;
};

export type CourseSection = {
  title: string;
  elements: CourseElement[];
};

export type CourseElement =
  | LessonElement
  | CompletionElement
  | FileElement
  | HtmlElement
  | QuizElement
  | ShortAnswerElement
  | TrueOrFalseElement
  | VideoUrlElement;

export type LessonElement = {
  type: "Lección Engine";
  title: string;
  elementCode: string;
  elementLesson: {
    lessonTheme: string;
    paragraphs?: LessonParagraph[];
    slides?: LessonSlide[];
  };
};

export type CompletionElement = {
  type: "completion";
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    quizz_list: {
      question: `Frase principal: ${string}\nPalabra extraída: ${string}`;
    }[];
    isAICreated: boolean;
    isSectionQuiz?: boolean;
  };
};

export type FileElement = {
  type: "file";
  title: string;
  /** UUID */
  elementCode: string;
  elementFile: {
    name: string;
    url: string;
  };
};

export type HtmlElement = {
  type: "html";
  title: string;
  /** UUID */
  elementCode: string;
  elementText: {
    title: string;
    /** Cover image URL */
    cover: string;
    content: string;
  };
};

export type QuizElement = {
  type: "quizz";
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    isAICreated: boolean;
    isSectionQuiz?: boolean;
    quizz_list: [
      statement: string,
      correctAnswer: string,
      ...otherAnswers: string[]
    ][];
  };
};

export type ShortAnswerElement = {
  type: "shortAnswer";
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    quizz_list: { question: string; source?: string }[];
    isAICreated: boolean;
    isSectionQuiz?: boolean;
  };
};

export type TrueOrFalseElement = {
  type: "trueOrFalse";
  title: string;
  /** UUID */
  quizCode: string;
  /** UUID */
  elementCode: string;
  elementQuiz: {
    isAICreated: boolean;
    isSectionQuiz?: boolean;
    quizz_list: {
      /** A false statement */
      true: string;
      /** A true statement */
      false: string;
      source: string;
    }[];
  };
};

export type VideoUrlElement = {
  type: "video_url";
  title: string;
  /** UUID */
  elementCode: string;
  elementVideo: {
    url: string;
  };
};

export type LessonParagraph = {
  content: string;
  audioScript: string;
  splitAudioScript?: string;
  audioUrl: string;
  alternativePronunciations?: {
    source: string;
    pronunciation: string;
  }[];
  translatedTitleAI?: string;
  titleAI?: string;
  // TODO: Add correct type instead of unknown
  srt?: {
    transcriptionJobStatus: string;
    transcriptionJobUrl: string;
    transcriptionResult: {
      display: string;
      displayWords: any[];
    };
  };
  /* TODO: Remove these sizes (width and height) */
  imageData?: {
    thumb: {
      url: string;
      width: number;
      height: number;
    };
    finalImage: {
      url: string;
      width: number;
      height: number;
    };
    /**
     * This a URL search images for the course using Bing, but it's is
     * not used anywhere, it's just saved when generating a slides
     * lesson for no reason. Therefore, it should **NOT** defined when
     * updating `imageData`
     */
    urlBing?: string;
  };
  keyPhrases?: string[];
  /* TODO: Remove these sizes (width and height) */
  videoData?: {
    thumb: {
      url: string;
      width: number;
      height: number;
    };
    finalVideo: {
      url: string;
      width: number;
      height: number;
    };
  };
  flags?: {
    isImageOnly?: {
      /** @default false */
      enabled: boolean;
      /** If the slide doesn't have a generated audio, it will always be
       * `false`. Otherwise, it can be `true` or `false`, but defaults
       * to `true`. */
      useGeneratedAudio?: boolean;
      /** If using the generated audio (i.e. `useGeneratedAudio` is
       * `true`), defaults to the duration of the audio, otherwise,
       * defaults to 2 seconds. */
      slideDuration?: number;
    };
    /** @default false */
    isVideoOnly?: boolean;
  };
};

export const templates = [
  '00-00',
  '00-01',
  '00-02',
  '00-03',
  '00-04',
  '01-00',
  '01-01',
  '01-02',
  '01-03',
  '01-04',
  '02-00',
  '02-01',
  '02-02',
  '02-03',
  '02-04',
  '02-05',
  '03-00',
  '03-01',
  '03-02',
  '03-03',
  '03-04',
  '04-00',
  '04-01',
  '04-02',
  '04-03',
  '04-04',
  'layout1',
  'layout2',
  'PO-00',
] as const;

export type SlideTemplates = (typeof templates)[number];

export type LessonSlide = {
  slideTemplate: SlideTemplates;
  slideContent: SlideContent;
  audioScript: string;
  audioUrl: string;
  assets: LessonSlideAsset[];
  alternativePronunciations?: {
    source: string;
    pronunciation: string;
  }[];
  isFullscreenAsset?: boolean;
  indexFullscreenAsset?: number;
  isVideoAudioUsed?: boolean;
  isBackgroundMusicKept?: boolean;
  isSlideDurationManuallySet?: boolean;
  slideDuration?: number;
};

export type LessonSlideAsset = {
  url: string;
  assetType: "icon" | "photo" | "video";
  width: number;
  height: number;
  orientation: "square" | "landscape" | "portrait";
};

export type SlideContent = {
  title: string;
  text: string;
  sections: SlideBlock[];
};

export type SlideBlock = {
  subtitle: string;
  text: string;
};

export const slideshowColorThemeNames = [
  "default",
  "oxford",
  "twilight",
  "pastel",
  "vintage",
  "earthy",
  "royalTwilight",
  "boldContrast",
  "seaBreeze",
  "grupoDatco",
  "amuch",
] as const;
