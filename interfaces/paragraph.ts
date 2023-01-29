export interface paragraphCreation {
    context: string
    key: string
    text: string
    index: number
    maxParagraphs: number
    courseStructure: string[]
    language: string
    options?: { courseLevel: number, fromAge: number, toAge: number }
}