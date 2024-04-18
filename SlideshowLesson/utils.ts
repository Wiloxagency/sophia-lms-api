import type {
  LessonParagraph,
  ReadonlyDeep,
  Slide,
  WritableDeep,
} from "./types";

/**
 * Creates a mutable deep copy of an object. **Only works with plain objects,
 * arrays and primitives.**
 */
export function createMutableDeepCopy<T>(object: T): WritableDeep<T> {
  return JSON.parse(JSON.stringify(object)) as WritableDeep<T>;
}

/**
 * Mutates the array of slides, adding the correct indexes to each slide that
 * should have one. If it's not possible to determine the correct indexes, it
 * returns `false` and reverses the changes made by the function. Otherwise, it
 * returns `true`.
 */
export function addIndexesToSlides(
  lessonParagraphs: ReadonlyDeep<LessonParagraph[]>,
  slides: Slide[]
) {
  /** Reverts the changes made by `addIndexesToSlides()`. Should be used in case
   * it's not possible to determine the correct indexes of the slides. */
  function revertAddIndexesToSlides() {
    for (const slide of slides) {
      slide.lessonParagraphIndex = undefined;
    }
  }

  if (!lessonParagraphs[0]) return false;

  let paragraphContent = lessonParagraphs[0].content.trim();
  let paragraphIndex = 0;

  /* Skip the first slide, which is the cover (the one that uses the course
  cover and section title) */
  const slidesExceptCover = slides.slice(1);
  for (const slide of slidesExceptCover) {
    type TextElement = Extract<
      (typeof slide.canvasElements)[number],
      { type: "text" }
    >;

    const textElements = slide.canvasElements.filter(
      (element): element is TextElement => element.type === "text"
    );
    // Skip the first text element, which is the title
    const textElementsExceptTitle = textElements.slice(1);

    for (const textElement of textElementsExceptTitle) {
      const slideElementText = textElement.text.trim();

      const indexOfText = paragraphContent.indexOf(slideElementText);
      /* If the text is not found or it is not in the start of the paragraph
      content, then it's not possible to know the correct index of each slide,
      so just return false. This should never happen, but it's better to be
      safe. */
      if (indexOfText !== 0) {
        revertAddIndexesToSlides();
        return false;
      }

      slide.lessonParagraphIndex = paragraphIndex;
      const remainingText = paragraphContent.slice(slideElementText.length);
      paragraphContent = remainingText.trim();

      const passedThroughAllContentOfParagraph = paragraphContent === "";
      if (passedThroughAllContentOfParagraph) {
        const isLastParagraph = paragraphIndex === lessonParagraphs.length - 1;
        if (isLastParagraph) return true;

        paragraphIndex++;
        const nextLessonParagraph = lessonParagraphs[paragraphIndex]!;
        paragraphContent = nextLessonParagraph.content.trim();
      }
    }
  }

  /* At this point, it should have passed through all the content of the
  paragraph, so the variable should be empty. Otherwise, some piece of text was
  not found in the slides, so just return false. */
  if (paragraphContent !== "") {
    revertAddIndexesToSlides();
    return false;
  }

  return true;
}
