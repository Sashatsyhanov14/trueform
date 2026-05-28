import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.event === "payment.succeeded" && body.object) {
      const paymentId = body.object.id;
      const scanId = body.object.metadata?.scan_id;

      if (scanId) {
        // Update payments log table
        await supabase
          .from("payments")
          .update({ status: "succeeded" })
          .eq("yookassa_payment_id", paymentId);

        // Unlock scan dashboard for the user
        await supabase
          .from("scans")
          .update({ payment_status: "paid" })
          .eq("id", scanId);

        console.log(`[Yookassa Webhook] Scan ${scanId} unlocked successfully.`);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("[Yookassa Webhook Error]:", error);
    return NextResponse.json({ error: "Ошибка обработки вебхука" }, { status: 500 });
  }
}
