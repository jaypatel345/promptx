import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    // In production with Stripe SDK, verify signature using stripe.webhooks.constructEvent
    if (secret && !signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody || "{}");
    console.log("Stripe webhook received:", event?.type);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Stripe webhook error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
