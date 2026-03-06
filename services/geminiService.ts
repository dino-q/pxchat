const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set.");
}

export const getSummary = async (text, userPrompt) => {
  if (!apiKey) throw new Error("API key is not configured.");

  const fullPrompt = `${userPrompt}\n\n---\n\nTEXT TO SUMMARIZE:\n\n${text}`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `請使用繁體中文回答，幫忙整理群組討論的重點內容(內容盡可能簡短)，僅以純文字+點列式呈現，請勿使用 Markdown 語法，不使用粗體字。主題以● 符號分類，人物觀點以◾標註，人物觀點下不同重點可用數字標號 1~9 順序排列。\n\n${fullPrompt}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    // Gemini 回傳格式不同於 OpenAI
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return output;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
      throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
};
