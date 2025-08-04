"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { callRecipeExtractApi } from "./callRecipeExtractApi"; // Your existing function

const getApiLimitForUser = (user: { privateMetadata: { [key: string]: unknown } }): number => {
  // This logic can be based on their subscription plan, which you can also store in metadata
  // For now, let's assume a simple limit. You can expand this with your Clerk features.
  return 100; // Example: 100 calls per month for a standard user
};

export const callMeteredApi = async (recipeText: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated.");
  }

  const clerk = await clerkClient();

  const user = await clerk.users.getUser(userId);
  const metadata = user.privateMetadata || {};

  let count = (metadata.apiCallCount as number) || 0;
  const resetDate = metadata.apiCountResetDate ? new Date(metadata.apiCountResetDate as string) : null;
  const now = new Date();

  // 1. Check if the reset date has passed
  if (!resetDate || now >= resetDate) {
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    await clerk.users.updateUserMetadata(userId, {
      privateMetadata: {
        ...metadata,
        apiCallCount: 1, // Reset to 1 for the current call
        apiCountResetDate: nextResetDate.toISOString(),
      },
    });

    return await callRecipeExtractApi(recipeText);
  }

  // 2. Check if user is within their limit
  const limit = getApiLimitForUser(user);
  if (count >= limit) {
    throw new Error("You have exceeded your monthly API call limit.");
  }

  // 3. Increment the count and make the API call
  await clerk.users.updateUserMetadata(userId, {
    privateMetadata: {
      ...metadata,
      apiCallCount: count + 1,
    },
  });

  return await callRecipeExtractApi(recipeText);
};
