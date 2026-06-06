import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scanId = searchParams.get("scanId");
  
  if (!scanId) {
    return NextResponse.json({ error: "Missing scanId" }, { status: 400 });
  }

  // Simulate payment processing: set payment status directly in database
  try {
    await supabase
      .from("scans")
      .update({ payment_status: "paid" })
      .eq("id", scanId);

    // Also update mock payment logs
    await supabase
      .from("payments")
      .update({ status: "succeeded" })
      .eq("scan_id", scanId)
      .eq("status", "pending");

    // Activate 30-day subscription for the user in mock
    const { data: scanData } = await supabase
      .from("scans")
      .select("user_id")
      .eq("id", scanId)
      .single();

    if (scanData?.user_id) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      await supabase
        .from("users")
        .update({ subscription_expires_at: expiresAt })
        .eq("id", scanData.user_id);
    }
  } catch (dbErr) {
    console.error("Failed to update status in mock checkout:", dbErr);
  }

  // Redirect back to landing page with success parameters
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/?payment_success=true&scanId=${scanId}`);
}
