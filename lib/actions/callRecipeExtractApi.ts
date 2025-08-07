import { promises as fs } from "fs";
import path from "path";

import { VertexAI, HarmCategory, HarmBlockThreshold } from "@google-cloud/vertexai";
import { getUserApiCount, addUserApiCount } from "./clerk.actions";
import { userApiCallLimit } from "./recipe.actions";

export interface AiRecipeResponse {
  recipe_name: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}

const getSystemPrompt = async (): Promise<string> => {
  const filePath = path.join(process.cwd(), "public", "prompts", "recipe_extract_prompt.txt");
  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    return fileContents;
  } catch (error) {
    console.error("Error reading the system prompt file:", error);
    throw new Error("Failed to fetch the recipe prompt.");
  }
};

export const callRecipeExtractApi = async (recipeText: string): Promise<AiRecipeResponse> => {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.GCP_LOCATION;

  const vertexai = new VertexAI({
    project: projectId!,
    location: location,
  });

  const generativeModel = vertexai.getGenerativeModel({
    model: "gemini-1.5-pro-001",
  });

  const userApiCall = await getUserApiCount();
  const apiCallLimit = await userApiCallLimit();

  if (userApiCall >= apiCallLimit!) {
    throw new Error("You have reached your API call limit. Please upgrade to a paid plan.");
  }

  const systemPrompt = await getSystemPrompt();

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
  ];

  const request = {
    contents: [
      { role: "user", parts: [{ text: recipeText }] },
      { role: "system", parts: [{ text: systemPrompt }] },
    ],
    safetySettings,
  };

  try {
    const resp = await generativeModel.generateContent(request);
    const content = resp.response.candidates![0].content.parts![0].text;
    const startIndex = content!.indexOf("{");
    const endIndex = content!.lastIndexOf("}");

    if (startIndex === -1 || endIndex === -1) {
      throw new Error("Wrong JSON format");
    }

    const json = JSON.parse(content!.substring(startIndex, endIndex + 1));

    if (json["error"]) {
      throw new Error("Irrelevant input");
    }

    await addUserApiCount();
    return json;
  } catch (e: any) {
    switch (e.message) {
      case "Wrong JSON format":
        throw new Error("AI agent failed providing a proper JSON format object");
      case "Irrelevant input":
        throw new Error("Input text doesn't seem like a valid recipe. Try again.");
      default:
        throw new Error(e.message);
    }
  }
};
