export const ResourceType = {
  ARTICLE: 'ARTICLE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  TWEET: 'TWEET' // For short form content like X/Weibo
} as const;

export type ResourceType = typeof ResourceType[keyof typeof ResourceType];

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  platform: string; // e.g., 'Zhihu', 'Bilibili', 'Douyin', 'X'
  contentRaw?: string; // Optional raw text or description pasted by user for AI analysis
  summary: string;
  userNotes: string;
  tags: string[];
  createdAt: number;
}

export interface AIAnalysisResult {
  summary: string;
  suggestedTags: string[];
}
