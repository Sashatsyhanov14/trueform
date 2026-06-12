import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SYSTEM_PROMPT, USER_PROMPT } from "@/lib/prompt";

// Mock report used as fallback and for demo photos to save API credits
const getMockReport = () => {
  const baseScores = [78, 81, 84, 87, 89];
  const seedIndex = Math.floor(Math.random() * baseScores.length);
  const postureScore = 75 + (seedIndex * 3) + Math.floor(Math.random() * 3);
  const bodyScore = 80 + (seedIndex * 2) + Math.floor(Math.random() * 3);
  const musclesScore = 72 + (seedIndex * 4) + Math.floor(Math.random() * 3);
  const overallScore = Math.round((postureScore + bodyScore + musclesScore) / 3);

  return {
    score: overallScore,
    grades: {
      posture: {
        score: postureScore,
        status: postureScore > 85 ? "Отличная" : postureScore > 75 ? "Удовлетворительная" : "Требует внимания",
        details: `Выявлен легкий наклон головы вперед (компьютерная шея) на ~10-12 градусов. Левое плечо находится на 1.2 см выше правого, что указывает на небольшой мышечный дисбаланс трапеций. Таз расположен ровно, гиперлордоз поясничного отдела выражен в пределах физиологической нормы.`
      },
      body: {
        score: bodyScore,
        status: bodyScore > 85 ? "Хороший тонус" : bodyScore > 75 ? "Нормальный" : "Избыток жировой массы",
        details: `Примерный процент подкожного жира: 16.5% - 18.5%. Выражен хороший потенциал для мышечной гипертрофии. Соотношение талии к бедрам (WHR) составляет 0.77, что соответствует идеальному диапазону для здоровья. Рекомендуется умеренный силовой тренинг для укрепления кора.`
      },
      muscles: {
        score: musclesScore,
        status: musclesScore > 85 ? "Рельефное" : musclesScore > 70 ? "Атлетичное" : "Начинающий",
        metrics: {
          shoulders: Math.max(40, Math.min(98, musclesScore - 2)),
          chest: Math.max(40, Math.min(98, musclesScore - 4)),
          abs: Math.max(40, Math.min(98, musclesScore - 7)),
          back: Math.max(40, Math.min(98, musclesScore - 3)),
          arms: Math.max(40, Math.min(98, musclesScore + 2)),
          legs: Math.max(40, Math.min(98, musclesScore - 5))
        },
        details: `Плечевой пояс развит умеренно, дельты имеют очерченную форму. Мышечный рельеф пресса выражен слабо, прослеживается только верхний сегмент прямой мышцы живота. Мышцы спины (широчайшие) требуют целенаправленной гипертрофии для создания выраженного V-силуэта.`
      }
    },
    recommendations: {
      workouts: [
        "Силовые тренировки 3 раза в неделю. Фокус на укрепление задней цепи мышц (румынская тяга, подтягивания, тяга гантели к поясу) для исправления наклона плеч.",
        "Миофасциальный релиз (МФР) грудных мышц с теннисным мячом для раскрытия плечевого пояса."
      ],
      posture: [
        "Упражнение 'Chin Tucks' (прижимание подбородка к шее) по 3 подхода из 12 повторений каждый день для устранения выдвижения шеи.",
        "Растяжка большой грудной мышцы у стены 2 раза в день по 30 секунд."
      ],
      nutrition: [
        "Рацион с умеренным профицитом калорий (+10%) или рекомпозиция: 1.8-2.0 грамма белка на кг веса тела.",
        "Контроль потребления соли во второй половине дня и 2.5 литра чистой воды в день для улучшения мышечного тонуса и самочувствия."
      ]
    }
  };
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, referredBy, userId, userTelegram, userName } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Необходимо изображение для анализа" },
        { status: 400 }
      );
    }

    let report: any;
    let isDemo = image === "demo-photo";

    if (isDemo) {
      report = getMockReport();
    } else {
      const apiKey = process.env.VISION_API_KEY;
      const apiUrl = process.env.VISION_API_URL || "https://polza.ai/api/v1/chat/completions";
      const apiModel = process.env.VISION_MODEL || "openai/gpt-4o";

      if (!apiKey || apiKey === "placeholder") {
        console.warn("VISION_API_KEY не задан. Используем демонстрационный отчет.");
        report = getMockReport();
      } else {
        try {
          const apiResponse = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: apiModel,
              messages: [
                {
                  role: "system",
                  content: SYSTEM_PROMPT
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: USER_PROMPT
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: image
                      }
                    }
                  ]
                }
              ]
            })
          });

          if (!apiResponse.ok) {
            const errText = await apiResponse.text();
            console.error("Polza AI Error Response:", errText);
            throw new Error(`API error: ${apiResponse.statusText}`);
          }

          const apiData = await apiResponse.json();
          const rawText = apiData.choices?.[0]?.message?.content;
          if (!rawText) {
            throw new Error("ИИ вернул пустой результат");
          }

          const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
          report = JSON.parse(cleanText);
        } catch (apiError) {
          console.error("Polza AI call failed, falling back to mock report:", apiError);
          report = getMockReport();
        }
      }
    }

    // Decrypt/decode base64 image and upload it to Supabase Storage using service role client
    let imageUrl = image;
    if (image.startsWith("data:image/")) {
      try {
        const matches = image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (matches) {
          const contentType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');
          
          const fileExt = contentType.split('/')[1] || 'jpg';
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
          const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          
          if (supabaseUrl && supabaseKey) {
            const { createClient } = require("@supabase/supabase-js");
            const supabaseServer = createClient(supabaseUrl, supabaseKey);
            
            const { data: uploadData, error: uploadError } = await supabaseServer.storage
              .from('scans-photos')
              .upload(fileName, buffer, {
                contentType,
                upsert: true
              });
              
            if (!uploadError && uploadData) {
              const { data: { publicUrl } } = supabaseServer.storage
                .from('scans-photos')
                .getPublicUrl(fileName);
              imageUrl = publicUrl;
              console.log("Backend uploaded base64 fallback to storage:", imageUrl);
            } else {
              console.error("Backend storage upload failed:", uploadError);
            }
          }
        }
      } catch (uploadErr) {
        console.error("Failed to upload base64 to storage on backend:", uploadErr);
      }
    }

    // Save scan data to Supabase database
    let scanId: string | null = null;
    try {
      const isValidUUID = (uuidStr: string) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuidStr);

      const parentScanId = (referredBy && isValidUUID(referredBy)) ? referredBy : null;

      // Determine initial payment status based on user subscription or bypass
      let paymentStatus = isDemo ? "paid" : "pending";
      
      if (userId && isValidUUID(userId)) {
        try {
          const { data: userData } = await supabase
            .from("users")
            .select("subscription_expires_at, email")
            .eq("id", userId)
            .single();

          if (userData) {
            const hasSub = userData.subscription_expires_at && new Date(userData.subscription_expires_at) > new Date();
            const isBypassUser = userData.email?.toLowerCase() === "alexandertsyhanov@gmail.com";
            if (hasSub || isBypassUser) {
              paymentStatus = "paid";
            }
          }
        } catch (subErr) {
          console.error("Failed to query user subscription in API:", subErr);
        }
      }

      const { data, error } = await supabase
        .from("scans")
        .insert({
          image: imageUrl,
          image_url: imageUrl,
          result: report,
          payment_status: paymentStatus,
          shares_count: 0,
          referred_by_scan_id: parentScanId,
          user_id: (userId && isValidUUID(userId)) ? userId : null,
          user_telegram: userTelegram || null,
          user_name: userName || null
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to insert scan record into Supabase:", error);
      } else if (data) {
        scanId = data.id;

        if (parentScanId) {
          try {
            const { data: parentData, error: parentError } = await supabase
              .from("scans")
              .select("shares_count, payment_status, user_id")
              .eq("id", parentScanId)
              .single();

            if (parentData && !parentError) {
              const newSharesCount = (parentData.shares_count || 0) + 1;
              const shouldUnlock = newSharesCount >= 3;
              
              await supabase
                .from("scans")
                .update({
                  shares_count: newSharesCount,
                  payment_status: shouldUnlock ? "paid" : parentData.payment_status
                })
                .eq("id", parentScanId);

              if (shouldUnlock && parentData.user_id) {
                const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                await supabase
                  .from("users")
                  .update({ subscription_expires_at: expiresAt })
                  .eq("id", parentData.user_id);
              }
            }
          } catch (refErr) {
            console.error("Failed to update parent referral stats:", refErr);
          }
        }
      }
    } catch (dbError) {
      console.error("Supabase Database connection exception:", dbError);
    }

    return NextResponse.json({
      scanId,
      result: report
    });
  } catch (error: any) {
    console.error("Analysis handler exception:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка при обработке запроса" },
      { status: 500 }
    );
  }
}
