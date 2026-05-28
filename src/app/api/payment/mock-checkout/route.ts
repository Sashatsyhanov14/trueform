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
  } catch (dbErr) {
    console.error("Failed to update status in mock checkout:", dbErr);
  }

  // Redirect back to landing page with success parameters
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/?payment_success=true&scanId=${scanId}`);
}
