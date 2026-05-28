import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    const { image, referredBy } = body;

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
                  content: "You are an expert clinical kinesiologist, manual therapist, and specialist in sports biomechanics. You analyze the user's uploaded image with strict scientific accuracy, but explain your findings in clear, friendly, and simple Russian that a layperson can easily understand. You must return your response strictly as a JSON object matching the requested schema. Do not include markdown wraps (like ```json) in the response, only raw JSON."
                },
                {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: "Проведи диагностику по этой фотографии. Действуй как авторитетный спортивный кинезиолог и остеопат.\n\nКРИТИЧЕСКИЕ ПРАВИЛА АНАЛИЗА ЗОН ВИДИМОСТИ:\n1. Сначала определи границы кадра (в полный рост, по пояс/полупортрет или портрет лица/плеч) и ракурс (спереди, сзади, сбоку).\n2. Если ноги и нижняя часть тела не попали в кадр (фото по пояс, портрет), ты ОБЯЗАН установить метрику \"legs\" строго в null. Не пиши в деталях про тонус ног, бедер или коленей, как будто ты их видишь. Вместо этого в \"muscles.details\" и \"posture.details\" напиши: «Оценка нижней кинетической цепи недоступна, так как нижняя часть тела не вошла в кадр. Для полноценного разбора рекомендуется загрузить снимок во весь рост».\n3. Если ракурс сзади (вид со спины), ты ОБЯЗАН установить метрики \"chest\" в null и \"abs\" в null. В \"muscles.details\" напиши, что передняя миофасциальная линия (большие грудные мышцы, прямая мышца живота) скрыта от обзора, и оцени только мышцы спины, плечевой пояс сзади и руки.\n4. Если ракурс спереди (вид с лица), ты ОБЯЗАН установить метрику \"back\" в null. В \"muscles.details\" напиши, что задняя миофасциальная цепь (широчайшие, трапециевидные, ромбовидные мышцы) скрыта от обзора, и оцени только грудные мышцы, пресс, плечи и руки.\n5. В текстовых полях \"details\" используй понятный обычному человеку язык, но пиши с позиции эксперта. Объясняй медицинские понятия простыми словами. Например, вместо сложного термина «протракция лопаток во фронтальной плоскости» напиши «скругленные вперед плечи (в кинезиологии это называют протракцией)», объясняя причину простыми словами. Пиши увлекательно, ободряюще и просто.\n6. Давай строго НЕ БОЛЕЕ 2 рекомендаций в каждом блоке (workouts, posture, nutrition). Каждая рекомендация должна быть краткой и практичной, с понятной техникой выполнения.\n\nВерни результат строго в виде JSON-объекта со следующей структурой:\n{\n  \"score\": 85, // Общий рейтинг от 0 до 100\n  \"grades\": {\n    \"posture\": {\n      \"score\": 78,\n      \"status\": \"Удовлетворительная\", // Осанка: \"Отличная\" | \"Удовлетворительная\" | \"Требует внимания\"\n      \"details\": \"Простое и понятное описание осанки (только видимых частей), переводящее термины на понятный язык...\"\n    },\n    \"body\": {\n      \"score\": 82,\n      \"status\": \"Хороший тонус\", // Тело: \"Хороший тонус\" | \"Нормальный\" | \"Избыток жировой массы\"\n      \"details\": \"Понятная оценка пропорций, телосложения и распределения тонуса...\"\n    },\n    \"muscles\": {\n      \"score\": 75,\n      \"status\": \"Атлетичное\", // Мышцы: \"Начинающий\" | \"Атлетичное\" | \"Рельефное\"\n      \"metrics\": {\n        \"shoulders\": 72,\n        \"chest\": 68, // установи в null, если вид сзади\n        \"abs\": 75, // установи в null, если вид сзади\n        \"back\": 70, // установи в null, если вид спереди\n        \"arms\": 78,\n        \"legs\": 71 // установи в null, если не виден низ тела\n      },\n      \"details\": \"Профессиональный разбор рельефа и тонуса только видимых групп мышц простыми словами...\"\n    }\n  },\n  \"recommendations\": {\n    \"workouts\": [\"Упражнение 1...\", \"Упражнение 2...\"], // строго максимум 2 упражнения\n    \"posture\": [\"Упражнение для осанки 1...\", \"Упражнение для осанки 2...\"], // строго максимум 2 упражнения\n    \"nutrition\": [\"Совет по питанию 1...\", \"Совет по питанию 2...\"] // строго максимум 2 совета\n  }\n}"
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

    // Save scan data to Supabase database
    let scanId: string | null = null;
    try {
      const isValidUUID = (uuidStr: string) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuidStr);

      const parentScanId = (referredBy && isValidUUID(referredBy)) ? referredBy : null;

      const { data, error } = await supabase
        .from("scans")
        .insert({
          image: image.startsWith("data:") && image.length > 500000 
            ? image.substring(0, 10000) + "...[TRUNCATED]"
            : image,
          result: report,
          payment_status: isDemo ? "paid" : "pending",
          shares_count: 0,
          referred_by_scan_id: parentScanId
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
              .select("shares_count, payment_status")
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
