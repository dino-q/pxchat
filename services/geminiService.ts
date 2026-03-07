export const getSummary = async (text, userPrompt) => {
  const fullPrompt = `${userPrompt}\n\n---\n\nTEXT TO SUMMARIZE:\n\n${text}`;

  try {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `請使用繁體中文回答，幫忙整理群組討論的重點內容(內容盡可能簡短)，僅以純文字+點列式呈現，請勿使用 Markdown 語法，不使用粗體字。主題以● 符號分類，人物觀點以◾標註，人物觀點下不同重點可用數字標號 1~9 順序排列。\n\n${fullPrompt}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || "";
    return output;
  } catch (error) {
    console.error("Error calling Groq API:", error);
    if (error instanceof Error) {
      throw new Error(`Groq API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Groq API.");
  }
};
