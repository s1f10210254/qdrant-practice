import { QdrantClient } from "@qdrant/js-client-rest";
import { generateEmbedding } from "./embedding";
import { DiaryEntryPayload } from "./interfaces";
import test from "node:test";

const client = new QdrantClient({ host: "localhost", port: 6333 });
const collectionName = "diary_entries";

export const saveEntryToVectorStore = async (
  userId: number,
  text: string,
  date: string,
  tags: string[] = []
) => {
  try {
    const embedding = await generateEmbedding(text);

    const point = {
      id: Date.now(),
      vector: embedding,
      payload: {
        userId: userId,
        text,
        date,
        tags,
      },
    };

    await client.upsert(collectionName, {
      points: [point],
    });
    console.log(`✅ 日記エントリを保存しました(ID: ${point.id})`);
    return point.id;
  } catch (error) {
    console.error("日記エントリの保存に失敗しました:", error);
    return null;
  }
};

// Qdrantから関連する日記内容を検索し、その内容を返す関数
export const findRelevantEntries = async (
  userId: number,
  query: string,
  tags: string[] = []
): Promise<string[]> => {
  try {
    const queryVector = await generateEmbedding(query);
    const searchResult = await client.search(collectionName, {
      vector: queryVector,
      limit: 5,
      with_payload: true,
      filter: {
        must: [
          {
            key: "userId",
            match: {
              value: userId,
            },
          },
        ],
        should: [
          {
            key: "tags",
            match: {
              value: tags,
            },
          },
        ],
      },
    });
    console.log(`✅ ${searchResult.length}件の関連エントリを見つけました`);

    //searchResultのpayloadからtextを抽出
    const result: string[] = searchResult.map(
      (result) => result.payload!.text
    ) as string[];
    return result;
  } catch (error) {
    console.error("関連するエントリの検索に失敗しました:", error);
    return [] as string[];
  }
};
