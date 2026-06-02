import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { code, redirectUri, accessToken, email: clientEmail, name: clientName, vkUserId: clientVkUserId } = await request.json();

    let vkUserId = clientVkUserId;
    let name = clientName || "VK Пользователь";
    let vkEmail = clientEmail;
    
    const clientSecret = process.env.VK_CLIENT_SECRET;
    if (!clientSecret) {
      console.error("VK_CLIENT_SECRET is not set in environment variables");
      return NextResponse.json({ error: "Ошибка конфигурации сервера (не задан секрет VK)" }, { status: 500 });
    }

    // 1. If accessToken is provided, verify it by calling VK API
    if (accessToken) {
      try {
        const userRes = await fetch(`https://api.vk.com/method/users.get?fields=first_name,last_name,email&access_token=${accessToken}&v=5.131`);
        const userData = await userRes.json();
        
        if (userData.error) {
          console.error("VK users.get error:", userData.error.error_msg);
          return NextResponse.json({ error: `Ошибка API VK: ${userData.error.error_msg}` }, { status: 400 });
        }
        
        if (userData.response && userData.response[0]) {
          const user = userData.response[0];
          vkUserId = user.id;
          name = `${user.first_name} ${user.last_name}`.trim();
          if (user.email) {
            vkEmail = user.email;
          }
        }
      } catch (apiErr) {
        console.error("Failed to verify VK access token:", apiErr);
        if (!vkUserId) {
          return NextResponse.json({ error: "Не удалось подтвердить авторизацию VK" }, { status: 400 });
        }
      }
    } else if (code) {
      // 2. Fallback to old authorization code exchange if only code is provided
      const clientId = "54619340";
      const tokenUrl = `https://oauth.vk.com/access_token?client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;
      const tokenRes = await fetch(tokenUrl);
      const tokenData = await tokenRes.json();

      if (tokenData.error) {
        console.error("VK access token exchange error:", tokenData.error_description || tokenData.error);
        return NextResponse.json({ error: `Ошибка авторизации VK: ${tokenData.error_description || tokenData.error}` }, { status: 400 });
      }

      vkUserId = tokenData.user_id;
      vkEmail = tokenData.email;

      // Fetch user name using tokenData.access_token
      try {
        const userRes = await fetch(`https://api.vk.com/method/users.get?user_ids=${vkUserId}&fields=first_name,last_name&access_token=${tokenData.access_token}&v=5.131`);
        const userData = await userRes.json();
        if (userData.response && userData.response[0]) {
          const user = userData.response[0];
          name = `${user.first_name} ${user.last_name}`.trim();
        }
      } catch (apiErr) {
        console.error("Failed to fetch VK user details:", apiErr);
      }
    } else {
      return NextResponse.json({ error: "Не указан код или токен авторизации VK" }, { status: 400 });
    }

    if (!vkUserId) {
      return NextResponse.json({ error: "Не удалось получить VK User ID" }, { status: 400 });
    }

    // Generate secure deterministic email and password for Supabase client sign-in
    const email = vkEmail || `trueform.vk.${vkUserId}@gmail.com`;
    
    // We sign the VK user ID using the client secret to generate a strong password
    const secretKey = crypto.createHash("sha256").update(clientSecret).digest();
    const password = crypto
      .createHmac("sha256", secretKey)
      .update(vkUserId.toString())
      .digest("hex");

    return NextResponse.json({
      email,
      password,
      name
    });
  } catch (error: any) {
    console.error("VK auth verification error:", error);
    return NextResponse.json({ error: "Внутренняя ошибка сервера" }, { status: 500 });
  }
}
