"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { callRecipeExtractApi } from "./callRecipeExtractApi"; // Your existing function

export const getUserApiCount = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.privateMetadata;
  if (!metadata) {
    throw new Error("Unable to get user metadata.");
  }

  let count = metadata.apiCount as number;
  const resetDate = metadata.apiCountResetDate ? new Date(metadata.apiCountResetDate as string) : null;
  const now = new Date();

  // 1. Check if the reset date has passed
  if (!resetDate || now > resetDate) {
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    // CORRECTED: Directly use clerkClient.users
    await client.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...metadata,
        apiCount: 0,
        apiCountResetDate: nextResetDate.toISOString(),
      },
    });
  }
  return count;
};

export const addUserApiCount = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const metadata = user.privateMetadata;
  if (!metadata) {
    throw new Error("Unable to get user metadata.");
  }

  let count = metadata.apiCount as number;

  // 3. Increment the count and make the API call
  await client.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...metadata,
      apiCount: count + 1,
    },
  });
};
