import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { initData } = await request.json();
    if (!initData) {
      return NextResponse.json({ error: "Неполные данные авторизации Telegram" }, { status: 400 });
    }

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      console.error("BOT_TOKEN is not set in environment variables");
      return NextResponse.json({ error: "Ошибка конфигурации сервера" }, { status: 500 });
    }

    // Parse initData query string
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) {
      return NextResponse.json({ error: "Отсутствует подпись" }, { status: 400 });
    }

    // Sort parameters and build data check string
    const keys = Array.from(params.keys()).filter((key) => key !== "hash").sort();
    const dataCheckString = keys.map((key) => `${key}=${params.get(key)}`).join("\n");

    // Calculate secret key using bot token
    // HMAC-SHA256 signature verification for Telegram Mini Apps
    console.log("TMA Auth Verification Request received");
    console.log("BOT_TOKEN in env:", botToken ? `Length: ${botToken.length}, prefix: ${botToken.substring(0, 5)}...` : "UNDEFINED");
    
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    console.log("Data Check String:\n" + dataCheckString);
    console.log("Computed HMAC:", hmac);
    console.log("Received Hash:", hash);

    if (hmac !== hash) {
      console.error("TMA Auth signature mismatch!");
      return NextResponse.json({ error: "Недействительная подпись авторизации Telegram" }, { status: 400 });
    }

    // Extract user info
    const userJson = params.get("user");
    if (!userJson) {
      return NextResponse.json({ error: "Данные пользователя отсутствуют" }, { status: 400 });
    }

    const user = JSON.parse(userJson);
    const userId = user.id;
    if (!userId) {
      return NextResponse.json({ error: "Недействительный ID пользователя" }, { status: 400 });
    }

    // Generate secure deterministic email and password for Supabase client sign-in
    const email = `trueform.tg.${userId}@gmail.com`;
    
    // We sign the Telegram user ID using the Bot Token to generate a strong password
    const password = crypto
      .createHmac("sha256", secretKey)
      .update(userId.toString())
      .digest("hex");

    const name = user.first_name + (user.last_name ? ` ${user.last_name}` : "");
    const username = user.username || "";

    // Perform Supabase Auth on the server to bypass frontend IP rate limits and email validation limits
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = require("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // 1. Attempt to create user via Admin API to bypass rate limits and email confirmation
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            username: username,
            name: name,
          },
        });
        
        // 2. Sign in to retrieve session
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!authError && authData?.session) {
          console.log("TMA Auth: Server-side signup/login successful for", email);
          return NextResponse.json({
            session: authData.session,
            email,
            password,
            name,
            username,
            userId
          });
        } else if (authError) {
          console.warn("TMA Auth: Server-side sign-in warning:", authError.message);
        }
      } catch (supabaseErr) {
        console.error("TMA Auth: Server-side Supabase error:", supabaseErr);
      }
    }

    // Fallback: Return credentials to frontend if server-side auth fails or service key is missing
    return NextResponse.json({
      email,
      password,
      name,
      username,
      userId
    });
  } catch (error: any) {
    console.error("Telegram auth verification error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
