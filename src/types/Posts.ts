export type Post = {
    id: number,
    title: string,
    contentMarkdown: string,
    contentHtml: string,
    imageData: string,
    isFeatured: boolean,
    createUtc: string,
    userName: string,
    avatar: string
}