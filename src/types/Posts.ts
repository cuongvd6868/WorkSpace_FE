export type FeaturePost = {
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

export type Post = {
    id: number,
    title: string,
    contentMarkdown: string,
    contentHtml: string,
    imageData: string,
    isFeatured: boolean,
    createUtc: string,
}

export interface PostRequest {
  title?: string;
  contentMarkdown?: string;
  contentHtml?: string;
  imageData?: string;
  isFeatured: boolean;
}

export interface PostUpdateRequest extends PostRequest {
    id: number; 
}
