import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { scanId } = await request.json();
    if (!scanId) {
      return NextResponse.json({ error: "Отсутствует ID сканирования" }, { status: 400 });
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;

    // Fallback to local simulator if Yookassa is not configured
    if (!shopId || !secretKey || shopId === "placeholder") {
      const origin = request.headers.get("origin") || "http://localhost:3000";
      const mockPaymentUrl = `${origin}/api/payment/mock-checkout?scanId=${scanId}`;
      
      // Log mock payment intent in DB
      await supabase.from("payments").insert({
        scan_id: scanId,
        yookassa_payment_id: `mock_yk_${Math.random().toString(36).substring(2)}`,
        amount: 490.00,
        status: "pending",
        payment_url: mockPaymentUrl
      });

      return NextResponse.json({ payment_url: mockPaymentUrl });
    }

    const idempotenceKey = crypto.randomUUID();
    const origin = request.headers.get("origin") || "https://trueformai.ru";

    // Call real Yookassa API
    const response = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotence-Key": idempotenceKey,
        "Authorization": "Basic " + Buffer.from(`${shopId}:${secretKey}`).toString("base64")
      },
      body: JSON.stringify({
        amount: {
          value: "490.00",
          currency: "RUB"
        },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: `${origin}/?payment_success=true&scanId=${scanId}`
        },
        description: "TrueForm: Биомеханический анализ осанки и рекомендации",
        metadata: {
          scan_id: scanId
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Yookassa payment creation failed:", errText);
      throw new Error(`Yookassa API error: ${response.statusText}`);
    }

    const ykData = await response.json();

    // Log the transaction in our database
    await supabase.from("payments").insert({
      scan_id: scanId,
      yookassa_payment_id: ykData.id,
      amount: 490.00,
      status: "pending",
      payment_url: ykData.confirmation.confirmation_url
    });

    return NextResponse.json({ payment_url: ykData.confirmation.confirmation_url });
  } catch (error: any) {
    console.error("Payment API error:", error);
    return NextResponse.json({ error: error.message || "Ошибка сервера при создании платежа" }, { status: 500 });
  }
}
