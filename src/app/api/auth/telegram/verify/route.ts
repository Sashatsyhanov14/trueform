import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { authData } = await request.json();
    if (!authData || !authData.hash || !authData.id) {
      return NextResponse.json({ error: "Неполные данные авторизации Telegram" }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error("BOT_TOKEN is not set in environment variables");
      return NextResponse.json({ error: "Ошибка конфигурации сервера" }, { status: 500 });
    }

    // Verify Telegram signature
    const { hash, ...dataToVerify } = authData;
    const dataCheckArr = Object.keys(dataToVerify)
      .sort()
      .map((key) => `${key}=${dataToVerify[key]}`);
    const dataCheckString = dataCheckArr.join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    if (hmac !== hash) {
      return NextResponse.json({ error: "Недействительная подпись авторизации Telegram" }, { status: 400 });
    }

    // Generate secure deterministic email and password for Supabase client sign-in
    const email = `trueform.tg.${authData.id}@gmail.com`;
    
    // We sign the Telegram user ID using the Bot Token to generate a strong password
    const password = crypto
      .createHmac("sha256", secretKey)
      .update(authData.id.toString())
      .digest("hex");

    const name = authData.first_name + (authData.last_name ? ` ${authData.last_name}` : "");
    const username = authData.username || "";

    return NextResponse.json({
      email,
      password,
      name,
      username
    });
  } catch (error: any) {
    console.error("Telegram auth verification error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
