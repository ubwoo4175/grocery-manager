// app/api/webhooks/clerk/route.ts

import { clerkClient } from "@clerk/nextjs/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // ... (Webhook validation code from Clerk docs)

  const { id } = evt.data;
  const eventType = evt.type;

  // If it's a new user, set their initial metadata
  if (eventType === "user.created") {
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    await clerkClient.users.updateUserMetadata(id, {
      privateMetadata: {
        apiCallCount: 0,
        apiCountResetDate: nextResetDate.toISOString(),
      },
    });
  }

  return new Response("", { status: 200 });
}
