import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";

const client = new QdrantClient({ host: "localhost", port: 6333 });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AIにアドバイスを生成してもらう関数
export const generateAiAdviceBasedOnContext = async (
  currentConcern: string,
  pastConcerns: string[]
) => {
  try {
    const content =
      pastConcerns.length > 0
        ? `過去のあなたの悩み:\n"${pastConcerns.join("\n\n")}`
        : "過去の記録はありません。";
    const prompt = `あなたの過去の悩みは「${currentConcern}」です。\n\n${content}\n\nこの悩みに対して、AIとしてどのようなアドバイスをしますか？具体的で前向きなアドバイスをお願いします。`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error generating advice:", error);
    return "AIからのアドバイスを生成できませんでした。";
  }
};
