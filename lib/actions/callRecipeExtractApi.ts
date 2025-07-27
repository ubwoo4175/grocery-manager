export interface AiRecipeResponse {
  recipe_name: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

const getSystemPrompt = async (): Promise<string> => {
  const response = await fetch('/prompts/recipe_extract_prompt.txt');
  
  if (!response.ok) {
    throw new Error('Failed to fetch the recipe prompt.');
  }
  return response.text();
};

export const callRecipeExtractApi = async (recipeText: string): Promise<AiRecipeResponse> => {
  if (!process.env.NEXT_PUBLIC_OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is not configured in .env.local");
  }

  const systemPrompt = await getSystemPrompt();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "model": "qwen/qwen3-235b-a22b-2507:free",
      "messages": [
        { "role": "system", "content": systemPrompt },
        { "role": "user", "content": recipeText }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    const startIndex = content.indexOf('{');
    const endIndex = content.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("No valid JSON object found in the AI response.");
    }
    const jsonString = content.substring(startIndex, endIndex + 1);

    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", content);
    throw new Error("The AI returned data in an invalid format.");
  }
};