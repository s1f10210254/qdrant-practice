import { QdrantClient } from "@qdrant/js-client-rest";
import { verify } from "crypto";

const client = new QdrantClient({ host: "localhost", port: 6333 });

async function createCollection() {
  const collectionName = "diary_entries";

  const listCollections = await client.getCollections();
  if (listCollections.collections.some((c) => c.name === collectionName)) {
    console.log(`❌ コレクション '${collectionName}' は既に存在します`);
    return;
  }

  console.log(`✅ コレクション '${collectionName}' は存在しません`);

  // コレクションを作成
  await client.createCollection(collectionName, {
    vectors: {
      size: 1536, // 使うEmbeddingに合わせてサイズを設定（例: OpenAIは1536）
      distance: "Cosine", // 類似度計算方法: Cosine, Euclidean, Dot
    },
  });

  console.log(`✅ コレクション '${collectionName}' を作成しました`);
}

// createCollection().catch(console.error);

const addVector = async () => {
  const collectionName = "diary_entries";
  const vector = Array.from(
    {
      length: 1536,
    },
    () => Math.random()
  );

  // Qdrantにデータを登録
  await client.upsert(collectionName, {
    points: [
      {
        id: 1,
        vector: vector,
        payload: {
          text: "彼氏に冷たくされて辛いです。。",
          created_at: new Date().toISOString(),
        },
      },
    ],
  });

  console.log("✅ ベクトルを追加しました");
};
// addVector().catch(console.error);

//登録できたか確認
const searchVector = async () => {
  const collectionName = "diary_entries";

  // 適当なクエリベクトル
  const queryVector = Array.from({ length: 1536 }, () => Math.random());

  const result = await client.search(collectionName, {
    vector: queryVector,
    limit: 5,
    with_payload: true,
  });

  console.log("検索結果", result);
};

// searchVector().catch(console.error);

// 複数件のベクトルを追加
const addMultipleVectors = async () => {
  const collectionName = "diary_entries";
  const diaryEntries = [
    "彼氏に冷たくされて辛いです。",
    "今日は友達と遊びました。",
    "仕事が忙しくて疲れました。",
    "新しい趣味を始めました。",
    "最近、運動不足を感じています。",
  ];

  // ベクトルデータを作成
  const points = diaryEntries.map((text, index) => ({
    id: index + 1,
    vector: Array.from({ length: 1536 }, () => Math.random()),
    payload: {
      text: text,
      tags: [""],
      created_at: new Date().toISOString(),
    },
  }));

  await client.upsert(collectionName, { points });
  console.log(`✅ ${points.length}件のベクトルを追加しました`);
};

// addMultipleVectors().catch(console.error);

//特定の状況を追加する
const searchSpecificSituation = async (user_id: number) => {
  await client.upsert("diary_entries", {
    points: [
      {
        id: 111111111,
        vector: Array.from({ length: 1536 }, () => Math.random()),
        payload: {
          text: "友達に裏切られて辛い",
          user_id: user_id,
          emotion_level: 4,
          tags: ["友人関係"],
          created_at: new Date().toISOString(),
        },
      },
    ],
  });
};

// 特定の状況を検索
const searchSimilarSituations = async (user_id: number) => {
  const queryVector = Array.from({ length: 1536 }, () => Math.random());

  const result = await client.search("diary_entries", {
    vector: queryVector,
    filter: {
      must: [
        {
          key: "user_id",
          match: {
            value: user_id,
          },
        },
        {
          key: "emotion_level",
          range: {
            gte: 1,
            lte: 5,
          },
        },
      ],
    },
    limit: 5,
    with_payload: true,
  });

  console.log("検索結果", result);
};

searchSpecificSituation(1).catch(console.error);
searchSimilarSituations(1).catch(console.error);
