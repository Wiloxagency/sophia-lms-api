/**
 * Computes a type to make it more readable.
 * @see https://www.totaltypescript.com/concepts/the-prettify-helper
 */
type Prettify<T> = {
  [K in keyof T]: T[K] extends Record<PropertyKey, unknown>
    ? Prettify<T[K]>
    : T[K];
} & {};

/** @see https://github.com/sindresorhus/type-fest/blob/main/source/primitive.d.ts */
type Primitive = null | undefined | string | number | boolean | symbol | bigint;

/** @see https://github.com/sindresorhus/type-fest/blob/main/source/primitive.d.ts */
type BuiltIns = Primitive | void | Date | RegExp;

/**
 * Create a deeply immutable version of an object/Map/Set/Array type.
 *
 * @see https://github.com/sindresorhus/type-fest/blob/main/source/readonly-deep.d.ts
 */
export type ReadonlyDeep<T> = T extends BuiltIns
  ? T
  : T extends ReadonlyArray<infer TArrItem>
  ? ReadonlyArray<ReadonlyDeep<TArrItem>>
  : T extends ReadonlyMap<infer TMapKey, infer TMapValue>
  ? ReadonlyMap<ReadonlyDeep<TMapKey>, ReadonlyDeep<TMapValue>>
  : T extends ReadonlySet<infer TSetItem>
  ? ReadonlySet<ReadonlyDeep<TSetItem>>
  : T extends object
  ? { readonly [TKey in keyof T]: ReadonlyDeep<T[TKey]> }
  : unknown;

/**
 *  Create a deeply mutable version of an
 * `object`/`ReadonlyMap`/`ReadonlySet`/`ReadonlyArray` type. The inverse of
 * `ReadonlyDeep<T>`.
 *
 * @see https://github.com/sindresorhus/type-fest/blob/main/source/writable-deep.d.ts
 */
export type WritableDeep<T> = T extends BuiltIns
  ? T
  : T extends ReadonlyArray<infer TArrItem>
  ? Array<WritableDeep<TArrItem>>
  : T extends ReadonlyMap<infer TMapKey, infer TMapValue>
  ? Map<WritableDeep<TMapKey>, WritableDeep<TMapValue>>
  : T extends ReadonlySet<infer TSetItem>
  ? Set<WritableDeep<TSetItem>>
  : T extends object
  ? { -readonly [TKey in keyof T]: WritableDeep<T[TKey]> }
  : unknown;

/** This type does not represent the whole object, but only the properties that
are directly used in the functions of this API route. */
export type LessonParagraph = { content: string };

/** This type does not represent the whole object, but only the properties that
are directly used in the functions of this API route. */
export type Slide = {
  canvasElements: (
    | { type: "text"; text: string }
    | { type: "image" | "video" | "rect" }
  )[];
  lessonParagraphIndex?: number;
};

/** This type does not represent the whole object, but only the properties that
are directly used in the functions of this API route. */
export type SlideshowLesson = ReadonlyDeep<{
  elementLesson: {
    paragraphs: LessonParagraph[];
    slideshow?: {
      slides: Slide[];
      isOutdated: boolean;
    };
  };
}>;

export type SlideshowLessonWithExternalInfoFromDatabase = Prettify<
  SlideshowLesson &
    ReadonlyDeep<{
      organizationCode: string;
      courseCover: string;
      sectionTitle: string;
      colorThemeName?: string;
      backgroundMusicUrl?: string | null;
      shouldUseOrganizationLogo?: boolean;
    }>
>;

export type SlideshowLessonWithExternalInfoResponse = Prettify<
  Omit<
    SlideshowLessonWithExternalInfoFromDatabase,
    "organizationCode" | "elementLesson" | "shouldUseOrganizationLogo"
  > &
    ReadonlyDeep<{
      elementLesson: Omit<SlideshowLesson["elementLesson"], "slideshow">;
      organizationLogoUrl?: string | null;
    }>
>;
