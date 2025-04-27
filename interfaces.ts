export interface DiaryEntryPayload {
  user_id: number;
  text: string;
  created_at: string;
  date: string;
  tags: string[];
}

interface QdrantSearchResult<Payload> {
  id: number;
  score: number;
  payload?: Payload;
  vector?: number[];
}
