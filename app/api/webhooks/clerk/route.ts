import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent, clerkClient } from "@clerk/nextjs/server";

// The function that handles incoming POST requests from Clerk
export async function POST(req: Request) {
  // 1. You need a secret to verify the webhook. Get it from the Clerk Dashboard.
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // 2. Get the headers from the incoming request
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // 3. Get the body of the request
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // 4. Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // 5. Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // 6. Get the ID and type of t he event
  const { id } = evt.data;
  const eventType = evt.type;

  // If the ID is not available, return an error
  if (!id) {
    return new Response("Error: User ID not found in webhook event", {
      status: 400,
    });
  }

  // 7. Handle the 'user.created' event
  if (eventType === "user.created") {
    // This is where you set the initial metadata for a new user.
    const nextResetDate = new Date();
    // Set the reset date to one month from now
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    // CORRECTED: Directly use clerkClient.users
    await (
      await clerkClient()
    ).users.updateUserMetadata(id, {
      privateMetadata: {
        apiCallCount: 0,
        apiCountResetDate: nextResetDate.toISOString(),
      },
    });
  }

  // 8. Acknowledge receipt of the webhook
  return new Response("", { status: 200 });
}
