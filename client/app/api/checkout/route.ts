import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { plan = "pro_yearly", currency = "USD" } = body;

    // Plan pricing config
    const planDetails = {
      pro_monthly: {
        amountUSD: 1200, // $12 in cents
        amountINR: 99900, // ₹999 in paise
        name: "PromptX Pro Monthly",
      },
      pro_yearly: {
        amountUSD: 9900, // $99 in cents
        amountINR: 799900, // ₹7,999 in paise
        name: "PromptX Pro Yearly",
      },
    };

    const selected = plan === "pro_monthly" ? planDetails.pro_monthly : planDetails.pro_yearly;

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (stripeKey) {
      // In production with Stripe SDK
      return NextResponse.json({
        url: `/pricing/success?session_id=stripe_demo_${Date.now()}&plan=${plan}`,
      });
    }

    // Check if Razorpay is configured
    const razorpayKey = process.env.RAZORPAY_KEY_ID;
    if (razorpayKey) {
      return NextResponse.json({
        orderId: `order_${Date.now()}`,
        currency: currency === "INR" ? "INR" : "USD",
        amount: currency === "INR" ? selected.amountINR : selected.amountUSD,
        key: razorpayKey,
        name: "PromptX",
        description: selected.name,
      });
    }

    // Fallback test mode
    return NextResponse.json({
      url: `/pricing/success?test_mode=true&plan=${plan}`,
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Failed to initiate checkout" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get("plan") || "pro_yearly";
  return NextResponse.redirect(new URL(`/pricing/success?test_mode=true&plan=${plan}`, req.url));
}
