import { QdrantClient } from "@qdrant/js-client-rest";

const client = new QdrantClient({ host: "localhost", port: 6333 });

// async function createCollection() {
//   const collectionName = "diary_entries";

//   await client.createCollection(collectionName, {
//     vectors: {
//       size: 1536, // 使うEmbeddingに合わせてサイズを設定（例: OpenAIは1536）
//       distance: "Cosine", // 類似度計算方法: Cosine, Euclidean, Dot
//     },
//   });

//   console.log(`✅ コレクション '${collectionName}' を作成しました`);
// }

// createCollection().catch(console.error);

async function listCollections() {
  const res = await client.getCollections();
  console.log("📦 コレクション一覧:", res.collections);
}

listCollections().catch(console.error);
