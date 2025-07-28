"use server";

import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID!;

export const getNotionDatabase = async () => {
  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "영역 · 자원",
      relation: {
        contains: "16a1674257a880f29666ec466e91c953", // 요리리
      },
    },
  });
  return response.results;
};

export const getNotionPageContent = async (pageId: string) => {
  const response = await notion.blocks.children.list({
    block_id: pageId,
  });
  return response.results;
};
