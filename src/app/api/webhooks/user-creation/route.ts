import { NextRequest, NextResponse } from "next/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  const incomingRequest = (await req.json()) as WebhookEvent;

  const isUserCreationEvent =
    incomingRequest && incomingRequest.type === "user.created";

  const returnIdFromUserCreationEvent = incomingRequest.data.id;

  if (!returnIdFromUserCreationEvent)
    return NextResponse.json({ success: false }, { status: 400 });

  if (isUserCreationEvent && returnIdFromUserCreationEvent) {
    // Set default plan for new user.
    await clerkClient.users.updateUserMetadata(returnIdFromUserCreationEvent, {
      privateMetadata: {
        plan: "Hobby",
        storeId: [],
      },
    });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}