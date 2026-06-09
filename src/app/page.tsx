"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import * as analytics from "@/lib/analytics";
import Script from "next/script";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Share2, 
  ArrowRight, 
  Info, 
  RefreshCw, 
  CreditCard,
  Check,
  User,
  Activity,
  Zap,
  ShieldCheck,
  Menu,
  X,
  TrendingUp,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Download
} from "lucide-react";

type AppState = "landing" | "upload" | "scanning" | "register" | "paywall" | "results";

interface AnalysisResult {
  score: number;
  grades: {
    posture: { score: number; status: string; details: string };
    body: { score: number; status: string; details: string };
    muscles: { 
      score: number; 
      status: string; 
      metrics?: {
        shoulders: number;
        chest: number;
        abs: number;
        back: number;
        arms: number;
        legs: number;
      };
      details: string; 
    };
  };
  recommendations: {
    workouts: string[];
    posture: string[];
    nutrition: string[];
  };
}

interface UmaxSliderProps {
  label: string;
  score: number | string | null;
  percentPosition: number | null;
  minLabel: string;
  midLabel: string;
  maxLabel: string;
  valueSuffix?: string;
  trackGradientClass?: string;
  isBodyFat?: boolean;
}

function UmaxSlider({
  label,
  score,
  percentPosition,
  minLabel,
  midLabel,
  maxLabel,
  valueSuffix = "%",
  trackGradientClass = "bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500",
  isBodyFat = false
}: UmaxSliderProps) {
  const isNotAvailable = score === null || score === undefined || score === "н/д";
  const [pos, setPos] = useState(0);
  const numScore = !isNotAvailable ? (typeof score === "number" ? score : parseFloat(String(score))) : NaN;
  const potentialScore = !isNaN(numScore) ? Math.min(98, numScore + 12) : 0;
  const potentialPosition = !isNaN(numScore) && percentPosition !== null ? Math.min(97, percentPosition + 12) : 0;
  const [potentialPos, setPotentialPos] = useState(0);

  useEffect(() => {
    if (isNotAvailable || percentPosition === null) return;
    const t1 = setTimeout(() => setPos(percentPosition), 150);
    const t2 = setTimeout(() => setPotentialPos(potentialPosition), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [percentPosition, potentialPosition, isNotAvailable]);

  let badgeColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (isNotAvailable) {
    badgeColorClass = "text-slate-500 bg-white/5 border-white/10";
  } else if (!isNaN(numScore)) {
    if (isBodyFat) {
      if (numScore < 10 || (numScore >= 18 && numScore < 22)) {
        badgeColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      } else if (numScore >= 22) {
        badgeColorClass = "text-red-400 bg-red-500/10 border-red-500/20";
      }
    } else {
      if (numScore < 60) {
        badgeColorClass = "text-red-400 bg-red-500/10 border-red-500/20";
      } else if (numScore < 80) {
        badgeColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
      }
    }
  }

  const clampedPosition = Math.max(3, Math.min(97, pos));

  return (
    <div className="space-y-1 py-1">
      <div className="flex justify-between items-center text-[11px]">
        <span className="text-slate-300 font-semibold">{label}</span>
        <span className={`font-bold px-1.5 py-0.5 rounded-md border text-[10px] ${badgeColorClass}`}>
          {isNotAvailable ? "Не видно на фото" : `${score}${valueSuffix}`}
        </span>
      </div>
      
      <div className="relative pt-1 pb-1.5">
        {/* Track Container */}
        <div className={`h-1.5 w-full rounded-full ${isNotAvailable ? "bg-white/5" : trackGradientClass} opacity-90 relative overflow-hidden`}>
          {/* Subtle separators */}
          {!isNotAvailable && (
            <>
              <div className="absolute left-[33%] top-0 w-[1.5px] h-full bg-[#0c0c0e]/30" />
              <div className="absolute left-[66%] top-0 w-[1.5px] h-full bg-[#0c0c0e]/30" />
            </>
          )}
        </div>
        
        {/* Potential Indicator (Dashed Ring) */}
        {!isBodyFat && !isNotAvailable && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 rounded-full border-2 border-dashed border-emerald-400 bg-emerald-950/30 flex items-center justify-center transition-all duration-1000 ease-out"
            style={{ left: `${Math.max(3, Math.min(97, potentialPos))}%` }}
          >
            <span className="text-[7px] text-emerald-400 font-black">P</span>
          </div>
        )}

        {/* Current Score Pin/Thumb */}
        {!isNotAvailable && (
          <div 
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 rounded-full bg-white border-2 border-[#09090b] shadow-[0_0_10px_rgba(255,255,255,1)] flex items-center justify-center transition-all duration-1000 ease-out z-10"
            style={{ left: `${clampedPosition}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
        )}
      </div>
      
      <div className="flex justify-between text-[8px] text-slate-500 font-medium">
        <span>{minLabel}</span>
        <span>{midLabel}</span>
        <span>{maxLabel}</span>
      </div>

      {/* Potential Helper Subtitle */}
      {!isBodyFat && !isNotAvailable && (
        <div className="text-[8px] text-slate-500 text-right mt-0.5 font-medium leading-none">
          Ваш потенциал: <span className="text-emerald-400 font-bold">{potentialScore}{valueSuffix}</span> с программой
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [image, setImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const triggerToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanProgress, setScanProgress] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "posture" | "body" | "muscles">("general");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [regName, setRegName] = useState("");
  const [regTelegram, setRegTelegram] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false);
  const [isTelegramLoggingIn, setIsTelegramLoggingIn] = useState(false);
  const [isDetectingTg, setIsDetectingTg] = useState(true);
  const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
  const [isFreePreviewState, setIsFreePreviewState] = useState(false);
  const hasActiveSubscription = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();
  const isFreePreview = isFreePreviewState && !hasActiveSubscription && regEmail?.toLowerCase() !== "alexandertsyhanov@gmail.com";
  const setIsFreePreview = (val: boolean) => {
    setIsFreePreviewState(val);
  };
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [checklistTs, setChecklistTs] = useState(0); // forces checklist re-render
  const [mainTab, setMainTab] = useState<"rating" | "plan" | "progress" | "profile">("rating");
  const [isDev, setIsDev] = useState(false);
  const [vkidLoaded, setVkidLoaded] = useState(false);
  const authSuccessRunning = useRef(false);

  // Shared helper: recover pending scan from localStorage and transition to results
  const recoverPendingScan = async (session?: any) => {
    const pendingScan = localStorage.getItem("trueform_pending_scan_id");
    if (!pendingScan) return false;

    // Immediately transition so parallel calls don't reset state
    setAppState("results");
    setScanId(pendingScan);
    localStorage.removeItem("trueform_pending_scan_id");

    try {
      // Link the anonymous scan to the logged-in user
      if (session?.user?.id) {
        // Fetch user's subscription status first
        const { data: userData } = await supabase
          .from("users")
          .select("subscription_expires_at")
          .eq("id", session.user.id)
          .single();

        const hasSub = userData?.subscription_expires_at && new Date(userData.subscription_expires_at) > new Date();
        const isBypassUser = session.user.email?.toLowerCase() === "alexandertsyhanov@gmail.com";
        const shouldUnlock = hasSub || isBypassUser;

        // Fetch scan status
        const { data: scanData } = await supabase
          .from("scans")
          .select("payment_status")
          .eq("id", pendingScan)
          .single();

        const isPaid = scanData?.payment_status === "paid" || shouldUnlock;

        await supabase
          .from("scans")
          .update({ 
            user_id: session.user.id,
            ...(shouldUnlock ? { payment_status: "paid" } : {})
          })
          .eq("id", pendingScan);

        if (isPaid && !hasSub && !isBypassUser) {
          // If this scan was paid, and they don't have an active subscription yet, grant 30 days!
          const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          await supabase
            .from("users")
            .update({ subscription_expires_at: expiresAt })
            .eq("id", session.user.id);
          setSubscriptionExpiresAt(expiresAt);
        }
      }

      const { data: scanData } = await supabase
        .from("scans")
        .select("*")
        .eq("id", pendingScan)
        .single();

      if (scanData?.result) {
        setResult(scanData.result);
        if (scanData.image_url) {
          setImage(scanData.image_url);
        }
        setIsFreePreview(!(scanData.payment_status === "paid" || scanData.payment_status === "shared"));
      } else {
        setAppState("upload");
      }
    } catch (fetchErr) {
      console.error("Failed to recover scan after OAuth:", fetchErr);
      setAppState("upload");
    }
    return true;
  };

  // Helper function to handle successful authentication (from onAuthStateChange / checkSession)
  const handleAuthSuccess = async (session?: any) => {
    // Guard against concurrent/duplicate calls
    if (authSuccessRunning.current) return;
    authSuccessRunning.current = true;

    try {
      setIsRegistered(true);
      const name = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || "Пользователь";
      const email = session?.user?.email || "";
      setRegName(name);
      setRegEmail(email);
      if (session?.user?.id) {
        setUserId(session.user.id);
        localStorage.setItem("trueform_user_id", session.user.id);
      }
      localStorage.setItem("trueform_user_registered", "true");
      localStorage.setItem("trueform_user_name", name);
      localStorage.setItem("trueform_user_email", email);
      // Fetch subscription status from public.users table
      try {
        const { data: userData } = await supabase
          .from("users")
          .select("subscription_expires_at")
          .eq("id", session.user.id)
          .single();
        if (userData?.subscription_expires_at) {
          setSubscriptionExpiresAt(userData.subscription_expires_at);
        } else {
          setSubscriptionExpiresAt(null);
        }
      } catch (err) {
        console.error("Failed to fetch user subscription:", err);
      }
      // Clean URL query parameters if they contain auth code to prevent reuse on refresh
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("code") && params.get("state") !== "vk") {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }

      // Recover pending scan if exists
      const recovered = await recoverPendingScan(session);
      if (!recovered) {
        if (!result && session?.user?.id) {
          // Attempt to fetch the user's most recent scan
          const { data: latestScan } = await supabase
            .from("scans")
            .select("*")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (latestScan?.result) {
            setScanId(latestScan.id);
            setResult(latestScan.result);
            if (latestScan.image_url) {
              setImage(latestScan.image_url);
            }
            setIsFreePreview(!(latestScan.payment_status === "paid" || latestScan.payment_status === "shared"));
            setAppState("results");
            return;
          }
        }

        if (result) {
          setAppState("results");
        } else if (appState === "register" || appState === "results") {
          setAppState("upload");
        }
      }
    } finally {
      authSuccessRunning.current = false;
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDev(
        window.location.search.includes("dev=true") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      );

      const performTelegramAutoLogin = async (initData: string) => {
        try {
          setIsTelegramLoggingIn(true);
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            await handleAuthSuccess(currentSession);
            return;
          }

          console.log("TMA: Initiating automatic login...");
          const response = await fetch("/api/auth/telegram/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ initData }),
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error("TMA auth verification failed:", errText);
            try {
              const errJson = JSON.parse(errText);
              triggerToast(`Ошибка авторизации: ${errJson.error || errText}`);
            } catch {
              triggerToast(`Ошибка авторизации: ${errText.substring(0, 100)}`);
            }
            return;
          }

          const credentials = await response.json();
          if (credentials.error) {
            console.error("TMA credentials error:", credentials.error);
            triggerToast(`Ошибка верификации: ${credentials.error}`);
            return;
          }

          // If server-side signup/login already succeeded and returned a session, use it!
          if (credentials.session) {
            console.log("TMA: Server-side login successful!");
            const { error: sessionErr } = await supabase.auth.setSession({
              access_token: credentials.session.access_token,
              refresh_token: credentials.session.refresh_token,
            });
            if (!sessionErr) {
              await handleAuthSuccess(credentials.session);
              return;
            } else {
              console.warn("setSession error, falling back to manual signIn:", sessionErr.message);
            }
          }

          const { email, password, name, username } = credentials;

          // Try signing in
          let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          // If user does not exist, sign them up
          if (signInError) {
            console.log("TMA: Registering new Telegram user...");
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: name,
                  username: username,
                }
              }
            });

            if (signUpError) {
              console.error("TMA signUp error:", signUpError);
              triggerToast(`Ошибка регистрации: ${signUpError.message}`);
              return;
            }

            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (retryError) {
              console.error("TMA retry sign-in error:", retryError);
              triggerToast(`Ошибка входа: ${retryError.message}`);
              return;
            }
            signInData = retryData;
          }

          if (signInData?.session) {
            console.log("TMA: Login successful!");
            await handleAuthSuccess(signInData.session);
          }
        } catch (err: any) {
          console.error("TMA auto-login exception:", err);
          triggerToast(`Ошибка приложения: ${err?.message || err}`);
        } finally {
          setIsTelegramLoggingIn(false);
        }
      };

      let attempts = 0;
      const detectTelegram = () => {
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.initData) {
          console.log("TMA: Telegram WebApp detected on attempt", attempts);
          try {
            tg.ready();
            tg.expand();
          } catch (e) {
            console.warn("Error initializing Telegram WebApp API:", e);
          }
          setIsTelegramMiniApp(true);
          setIsDetectingTg(false);
          performTelegramAutoLogin(tg.initData);
          return true;
        }
        return false;
      };

      let interval: any = null;

      // Try immediate detection
      if (!detectTelegram()) {
        interval = setInterval(() => {
          attempts++;
          if (detectTelegram() || attempts >= 20) {
            if (interval) clearInterval(interval);
            if (attempts >= 20) {
              console.log("TMA: Telegram WebApp not detected after 20 attempts.");
              setIsDetectingTg(false);
            }
          }
        }, 50);
      }

      // Check for Supabase session and recover state from OAuth
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await handleAuthSuccess(session);
        }
      };
      
      checkSession();
      
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          await handleAuthSuccess(session);
        }
      });

      return () => {
        if (interval) clearInterval(interval);
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).VKIDSDK) {
      setVkidLoaded(true);
    }
  }, []);

  const initVkIdSdk = () => {
    if (typeof window === "undefined") return null;
    const VKID = (window as any).VKIDSDK;
    if (!VKID) return null;

    // Use current origin to support both trueformai.ru and www.trueformai.ru subdomains dynamically
    const currentOrigin = typeof window !== "undefined" ? window.location.origin + "/" : "https://trueformai.ru/";

    VKID.Config.init({
      app: 54619340,
      redirectUrl: currentOrigin,
      responseMode: VKID.ConfigResponseMode.Callback,
      source: VKID.ConfigSource.LOWCODE,
      scope: 'email',
    });

    return VKID;
  };

  const decodeJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Failed to decode JWT:", e);
      return null;
    }
  };

  const handleVkSdkAuthSuccess = async (data: any) => {
    const accessToken = data.access_token;
    const idToken = data.id_token;
    
    if (!accessToken) {
      triggerToast("Ошибка: токен VK не получен");
      return;
    }

    let email = "";
    let name = "VK Пользователь";
    let vkUserId = "";

    if (idToken) {
      const decoded = decodeJwt(idToken);
      if (decoded) {
        vkUserId = decoded.sub || "";
        email = decoded.email || "";
        name = decoded.name || decoded.given_name || `${decoded.first_name || ""} ${decoded.last_name || ""}`.trim() || "VK Пользователь";
      }
    }

    triggerToast("Авторизация через VK...");
    try {
      // Save pending scan if exists
      if (scanId) {
        localStorage.setItem("trueform_pending_scan_id", scanId);
      }

      const res = await fetch("/api/auth/vk/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, email, name, vkUserId }),
      });

      const resData = await res.json();
      if (resData.error) {
        triggerToast(`Ошибка VK: ${resData.error}`);
        return;
      }

      // If backend successfully authenticated with Supabase, try setSession first
      if (resData.session) {
        const { error } = await supabase.auth.setSession({
          access_token: resData.session.access_token,
          refresh_token: resData.session.refresh_token,
        });
        if (!error) {
          triggerToast("Успешный вход!");
          setIsRegistered(true);
          localStorage.setItem("trueform_user_registered", "true");
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          const recovered = await recoverPendingScan(currentSession);
          if (!recovered) {
            if (result) {
              setIsFreePreview(true);
              setAppState("results");
            } else {
              setAppState("upload");
            }
          }
          return;
        }
        // setSession failed — fall through to password-based auth below
        console.warn("setSession failed, falling back to signInWithPassword:", error.message);
      }

      // Fallback: client-side authentication
      const { email: finalEmail, password, name: finalName } = resData;

      // 1. Try to sign in
      const signInRes = await supabase.auth.signInWithPassword({ email: finalEmail, password });
      let authError = signInRes.error;
      let sessionData = signInRes.data?.session;

      // 2. If user doesn't exist, sign up
      if (authError) {
        const signUpRes = await supabase.auth.signUp({
          email: finalEmail,
          password,
          options: {
            data: {
              full_name: finalName,
              name: finalName,
            },
          },
        });
        authError = signUpRes.error;
        sessionData = signUpRes.data?.session;
      }

      if (authError) {
        triggerToast(`Ошибка входа Supabase: ${authError.message}`);
      } else {
        triggerToast("Успешный вход!");
        setIsRegistered(true);
        localStorage.setItem("trueform_user_registered", "true");
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const recovered = await recoverPendingScan(currentSession);
        if (!recovered) {
          if (result) {
            setIsFreePreview(true);
            setAppState("results");
          } else {
            setAppState("upload");
          }
        }
      }
    } catch (err) {
      console.error("VK ID authentication failed:", err);
      triggerToast("Ошибка авторизации VK");
    }
  };

  useEffect(() => {
    if (appState === "register" && vkidLoaded) {
      const timer = setTimeout(() => {
        const container = document.getElementById("VkIdSdkOneTap");
        if (container) {
          container.innerHTML = "";
          
          try {
            const VKID = initVkIdSdk();
            if (!VKID) return;

            const oneTap = new VKID.OneTap();

            oneTap.render({
              container: container,
              scheme: VKID.Scheme.DARK,
              showAlternativeLogin: true,
              styles: {
                borderRadius: 12,
                height: 44
              }
            })
            .on(VKID.WidgetEvents.ERROR, (error: any) => {
              console.error("VK ID Widget Error:", error);
            })
            .on(VKID.OneTapInternalEvents.LOGIN_SUCCESS, function (payload: any) {
              const code = payload.code;
              const deviceId = payload.device_id;

              VKID.Auth.exchangeCode(code, deviceId)
                .then((data: any) => {
                  handleVkSdkAuthSuccess(data);
                })
                .catch((error: any) => {
                  console.error("VKID Exchange Error:", error);
                  triggerToast("Ошибка обмена кодом VK ID");
                });
            });
          } catch (e) {
            console.error("Failed to render VK ID OneTap:", e);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [appState, vkidLoaded]);

  // Custom logging text simulation during analysis
  useEffect(() => {
    if (appState !== "scanning") return;

    setScanLogs([]);
    setScanProgress(0);
    
    // Start real analysis concurrently with fake loading UI
    fetchAnalysis();

    const logs = [
      "⚡ Инициализация сверточной нейросети ResNet-50...",
      "📷 Загрузка и нормализация снимка...",
      "👤 Построение скелетного графа тела (17 ключевых суставов)...",
      "📐 Измерение симметрии плеч и угла наклона головы...",
      "🧬 Оценка плотности и распределения мышечных групп по биометрическому силуэту...",
      "📊 Расчет примерного процента подкожного жира по индексу плотности...",
      "📝 Расчет персональной программы тренировок и рекомендаций...",
      "🔒 Шифрование отчета и формирование результатов..."
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setScanLogs((prev) => [...prev, logs[currentLogIndex]]);
        setScanProgress((prev) => Math.min(prev + 12.5, 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [appState]);

  const fetchAnalysis = async () => {
    try {
      const referredBy = localStorage.getItem("trueform_referred_by");
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: image,
          referredBy: referredBy,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      if (!data || !data.result) {
        throw new Error("Invalid or empty response from API");
      }

      setResult(data.result);
      analytics.trackScanComplete(data.result?.score || 0);
      if (data.scanId) {
        setScanId(data.scanId);
        // Save pending scan ID immediately so it's guaranteed to be in localStorage before auth
        localStorage.setItem("trueform_pending_scan_id", data.scanId);
      }
      
      // Save last scan date for 7-day reminder
      localStorage.setItem("trueform_last_scan_date", Date.now().toString());

      // Save scan to history for progress chart
      try {
        const historyRaw = localStorage.getItem("trueform_scan_history");
        const history = historyRaw ? JSON.parse(historyRaw) : [];
        history.push({
          date: new Date().toISOString(),
          score: data.result.score,
          posture: data.result.grades.posture.score,
          body: data.result.grades.body.score,
          muscles: data.result.grades.muscles.score,
        });
        // Keep last 30 scans max
        if (history.length > 30) history.splice(0, history.length - 30);
        localStorage.setItem("trueform_scan_history", JSON.stringify(history));
      } catch {}

      const registered = localStorage.getItem("trueform_user_registered") === "true";
      const hasSub = subscriptionExpiresAt && new Date(subscriptionExpiresAt) > new Date();
      const isBypassUser = regEmail?.toLowerCase() === "alexandertsyhanov@gmail.com";

      if (!registered) {
        setIsFreePreview(true);
        setAppState("register");
      } else {
        setIsFreePreview(!(hasSub || isBypassUser));
        setAppState("results");
      }
    } catch (e) {
      console.error("Analysis failed:", e);
      triggerToast("Ошибка при анализе тела. Пожалуйста, попробуйте еще раз.");
      setAppState("upload");
    }
  };

  // Load registration state on mount, check referrals and payment redirect
  useEffect(() => {
    const reg = localStorage.getItem("trueform_user_registered") === "true";
    setIsRegistered(reg);
    if (reg) {
      setRegName(localStorage.getItem("trueform_user_name") || "");
      setRegEmail(localStorage.getItem("trueform_user_email") || "");
      setUserId(localStorage.getItem("trueform_user_id") || null);
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      // Capture referral link
      const ref = params.get("ref");
      if (ref) {
        // Validate if it is a uuid
        const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(ref);
        if (isValidUUID) {
          localStorage.setItem("trueform_referred_by", ref);
        }
      }

      // Check if returning from successful payment
      if (params.get("payment_success") === "true") {
        const pScanId = params.get("scanId");
        if (pScanId) {
          setScanId(pScanId);
          setIsFreePreview(false);
          
          // Fetch the scan details from database
          const fetchScanAfterPayment = async () => {
            try {
              const { data, error } = await supabase
                .from("scans")
                .select("result, shares_count")
                .eq("id", pScanId)
                .single();

              if (data && !error) {
                setResult(data.result);
                setSharesCount(data.shares_count || 0);
                setAppState("results");
                triggerToast("Подписка успешно активирована! Добро пожаловать.");
              }
            } catch (fetchErr) {
              console.error("Failed to fetch scan results after payment:", fetchErr);
            }
          };
          fetchScanAfterPayment();
        }
      }

      // Check if returning from VK authorization redirect
      const vkCode = params.get("code");
      const vkState = params.get("state");
      if (vkCode && vkState === "vk") {
        // Clear query params to make URL clean
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
        handleVkAuthCallback(vkCode);
      }
    }
  }, []);

  // Poll for scan payment_status updates (e.g. if unlocked via referral or webhook)
  useEffect(() => {
    if (!scanId || appState !== "results" || !isFreePreview) return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase
          .from("scans")
          .select("payment_status, shares_count")
          .eq("id", scanId)
          .single();

        if (data && !error) {
          if (data.shares_count !== undefined) {
            setSharesCount(data.shares_count);
          }
          if (data.payment_status === "paid" || data.payment_status === "shared") {
            setIsFreePreview(false);
            triggerToast("Ура! Ваш отчет полностью разблокирован!");
          }
        }
      } catch (err) {
        console.error("Failed to poll scan status:", err);
      }
    }, 5000); // check every 5 seconds

    return () => clearInterval(interval);
  }, [scanId, appState]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    analytics.trackRegistration("email_form");
    localStorage.setItem("trueform_user_registered", "true");
    localStorage.setItem("trueform_user_name", regName);
    localStorage.setItem("trueform_user_email", regEmail);
    setIsRegistered(true);

    if (scanId && result) {
      try {
        await supabase
          .from("scans")
          .update({
            user_name: regName,
            user_email: regEmail,
            result: {
              ...result,
              user_details: {
                name: regName,
                email: regEmail
              }
            }
          })
          .eq("id", scanId);
      } catch (dbErr) {
        console.error("Failed to update user details in supabase scan:", dbErr);
      }
    }

    setIsFreePreview(true); // Always locked until payment/invites
    setAppState("results");
  };

  const handleSocialRegister = async (provider: "google" | "vk") => {
    analytics.trackSocialLogin(provider);
    
    // Save pending scan if exists
    if (scanId) {
      localStorage.setItem("trueform_pending_scan_id", scanId);
    }

    if (provider === "vk") {
      triggerToast("Перенаправление в VK...");
      const vkClientId = "54619340";
      const redirectUri = window.location.origin + window.location.pathname;
      window.location.href = `https://oauth.vk.com/authorize?client_id=${vkClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email&state=vk`;
      return;
    }

    triggerToast(`Перенаправление на ${provider}...`);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}`
      }
    });

    if (error) {
      console.error(error);
      triggerToast(`Ошибка входа: ${error.message}`);
    }
  };

  const handleVkAuthCallback = async (code: string) => {
    analytics.trackSocialLogin("vk");
    triggerToast("Авторизация через VK...");

    try {
      const redirectUri = window.location.origin + window.location.pathname;
      const res = await fetch("/api/auth/vk/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirectUri }),
      });

      const data = await res.json();
      if (data.error) {
        triggerToast(`Ошибка VK: ${data.error}`);
        return;
      }

      const { email, password, name, session: serverSession } = data;
      let authError = null;

      if (serverSession) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: serverSession.access_token,
          refresh_token: serverSession.refresh_token,
        });
        authError = sessionError;
      } else {
        // 1. Try to sign in with password
        const signInRes = await supabase.auth.signInWithPassword({ email, password });
        authError = signInRes.error;

        // 2. If user doesn't exist, sign up
        if (authError) {
          const signUpRes = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                name: name,
              },
            },
          });
          authError = signUpRes.error;
        }
      }

      if (authError) {
        console.error("VK Authentication failed:", authError);
        triggerToast(`Ошибка входа VK: ${authError.message}`);
      } else {
        triggerToast("Успешный вход через VK!");
        setIsRegistered(true);
        setRegName(name);
        setRegEmail(email);
        localStorage.setItem("trueform_user_registered", "true");
        localStorage.setItem("trueform_user_name", name);
        localStorage.setItem("trueform_user_email", email);

        // Explicitly recover pending scan and go to results
        // (don't rely on onAuthStateChange which may race or not fire)
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const recovered = await recoverPendingScan(currentSession);
        if (!recovered) {
          // No pending scan but user is authed — send to upload
          if (result) {
            setIsFreePreview(true);
            setAppState("results");
          } else {
            setAppState("upload");
          }
        }
      }
    } catch (err) {
      console.error("VK auth failed:", err);
      triggerToast("Не удалось войти через VK. Попробуйте еще раз.");
    }
  };


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Supabase signOut error:", e);
    }
    
    // Always clear local state
    setIsRegistered(false);
    setRegName("");
    setRegEmail("");
    setUserId(null);
    setSubscriptionExpiresAt(null);
    localStorage.removeItem("trueform_user_registered");
    localStorage.removeItem("trueform_user_name");
    localStorage.removeItem("trueform_user_email");
    localStorage.removeItem("trueform_user_id");
    triggerToast("Вы вышли из аккаунта");
    setAppState("landing");
  };


  const compressImage = (file: File, maxDimension = 1200, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    analytics.trackPhotoUpload();
    setIsUploadingImage(true);

    try {
      let uploadPayload: Blob | File = file;
      let uploadFileName = file.name;

      if (file.type.startsWith('image/')) {
        try {
          const compressedBlob = await compressImage(file);
          uploadPayload = compressedBlob;
          uploadFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.jpg`;
          
          // Generate compressed base64 for preview and API fallback immediately
          const compressedReader = new FileReader();
          const compressedBase64Promise = new Promise<string>((resolve) => {
            compressedReader.onloadend = () => resolve(compressedReader.result as string);
          });
          compressedReader.readAsDataURL(compressedBlob);
          const compressedBase64 = await compressedBase64Promise;
          setImage(compressedBase64);
        } catch (compressionErr) {
          console.error("Compression failed, using original file:", compressionErr);
          const fileExt = file.name.split('.').pop();
          uploadFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          
          const originalReader = new FileReader();
          const originalBase64Promise = new Promise<string>((resolve) => {
            originalReader.onloadend = () => resolve(originalReader.result as string);
          });
          originalReader.readAsDataURL(file);
          const originalBase64 = await originalBase64Promise;
          setImage(originalBase64);
        }
      } else {
        const fileExt = file.name.split('.').pop();
        uploadFileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      }

      // Race upload with a timeout to prevent UI freeze on network hang
      const uploadPromise = supabase.storage
        .from('scans-photos')
        .upload(uploadFileName, uploadPayload, {
          contentType: file.type.startsWith('image/') ? 'image/jpeg' : file.type,
          upsert: true
        });

      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Storage upload timeout (8s)")), 8000)
      );

      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]) as any;

      if (error) {
        console.error("Storage upload failed, using local base64 fallback:", error);
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('scans-photos')
          .getPublicUrl(uploadFileName);
        setImage(publicUrl);
      }
    } catch (err) {
      console.error("Storage upload exception, using local preview fallback:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const startScanning = () => {
    if (!image) return;
    analytics.trackScanStart();
    setAppState("scanning");
  };

  const handlePayment = async () => {
    analytics.trackPaymentInit();
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });

      const data = await res.json();

      if (data.payment_url) {
        // Redirect user to YooKassa checkout page
        window.location.href = data.payment_url;
      } else {
        triggerToast(data.error || "Ошибка при создании платежа");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment request failed:", err);
      triggerToast("Не удалось подключиться к платёжной системе. Попробуйте позже.");
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    analytics.trackShareLink();
    const shareUrl = scanId && typeof window !== "undefined"
      ? `${window.location.origin}?ref=${scanId}` 
      : "https://trueformai.ru";

    const shareData = {
      title: "TrueForm AI",
      text: "🔥 Прохожу биомеханический анализ осанки и физической формы в TrueForm! Мой отчет готов на 97%, нужно поделиться ссылкой с 3 друзьями, чтобы открыть его бесплатно. Попробуй сам:",
      url: shareUrl,
    };

    const textForClipboard = `${shareData.text} ${shareData.url}`;
    let shared = false;

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (err) {
        console.log("Web Share cancelled or failed, falling back to clipboard:", err);
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(textForClipboard);
        triggerToast("Ссылка скопирована! Отправьте её 3 друзьям в любой мессенджер.");
        shared = true;
      } catch (err) {
        console.error("Clipboard copy failed:", err);
        triggerToast("Пожалуйста, скопируйте ссылку из адресной строки вручную.");
        shared = false;
      }
    }

    if (shared) {
      triggerToast("Отправьте ссылку 3 друзьям. Ваш прогресс обновится, когда они пройдут сканирование!");
      
      // Optionally poll database to see if friends actually signed up
      const checkStatusInterval = setInterval(async () => {
        if (!scanId) return;
        try {
          const { data } = await supabase.from("scans").select("shares_count, payment_status").eq("id", scanId).single();
          if (data) {
            setSharesCount(data.shares_count || 0);
            if (data.shares_count >= 3 || data.payment_status === "paid" || data.payment_status === "shared") {
              clearInterval(checkStatusInterval);
              setIsFreePreview(false);
              setShowPaywallModal(false);
              setAppState("results");
              triggerToast("Ура! Отчет разблокирован через реферальную программу.");
            }
          }
        } catch (e) {
          // silent
        }
      }, 5000);
      
      // Stop polling after 5 minutes to save resources
      setTimeout(() => clearInterval(checkStatusInterval), 300000);
    }
  };

  const handleBypass = async () => {
    if (scanId) {
      try {
        await supabase
          .from("scans")
          .update({ payment_status: "paid" })
          .eq("id", scanId);
      } catch (e) {
        console.error("Failed to update bypass state in DB:", e);
      }
    }
    setIsFreePreview(false); // Unlock content!
    setShowPaywallModal(false); // Close checkout modal if open
    setAppState("results");
  };

  const resetAll = () => {
    setImage(null);
    setScanId(null);
    setAppState("landing");
    setSharesCount(0);
    setResult(null);
    setIsFreePreview(false);
    setShowPaywallModal(false);
  };

  const showBlockScreen = !isTelegramMiniApp && !isDetectingTg && !isDev && !(typeof window !== "undefined" && window.location.search.includes("dev=true"));

  if (isDetectingTg) {
    return (
      <div className="min-h-screen bg-[#020203] text-white flex flex-col items-center justify-center p-6 font-body">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
        <div className="text-xs text-slate-400 font-semibold">Инициализация TrueForm...</div>
      </div>
    );
  }

  if (showBlockScreen) {
    return (
      <div className="min-h-screen bg-[#020203] text-white flex flex-col items-center justify-center p-6 font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none -z-10" style={{ background: 'oklch(0.72 0.08 175 / 0.04)' }}></div>
        <div className="w-full max-w-sm text-center bg-[#09090b]/80 border border-white/5 p-8 rounded-3xl glow-card space-y-6">
          <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-pulse">
            <svg className="w-10 h-10 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.89 8.08-2.05 8.78-.06.28-.21.57-.46.7-.24.13-.53.11-.75-.05-.33-.24-5.3-3.48-5.75-3.87-.4-.35-.06-.57.17-.79.52-.49 4.56-4.27 4.96-4.66.19-.19.08-.29-.14-.15-.3.2-5.46 3.56-5.94 3.88-.45.3-.87.21-1.12.04-1.01-.67-2.02-1.35-3.03-2.02-.27-.18-.46-.43-.37-.77.09-.34.45-.53.79-.66 4.39-1.74 13.1-5.15 13.92-5.48.5-.2.95-.21 1.25.04.28.24.38.63.31.98z"/>
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
              TrueForm AI
            </h1>
            <h2 className="text-base font-semibold text-cyan-400">
              Биомеханический анализ тела
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed pt-2">
              Данный сервис доступен исключительно внутри нашего официального Telegram Mini App. Пожалуйста, перейдите в Telegram-бота для проведения анализа.
            </p>
          </div>

          <a
            href="https://t.me/trueformai_bot"
            className="block w-full text-center bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-6 rounded-xl transition duration-200 shadow-[0_4px_14px_rgba(6,182,212,0.3)] active:scale-[0.98] cursor-pointer"
          >
            Открыть в Telegram
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen text-[var(--text-primary)] antialiased overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      {/* Subtle ambient glow — single, restrained */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[160px] pointer-events-none -z-10 animate-pulse-subtle" style={{ background: 'oklch(0.72 0.08 175 / 0.06)' }}></div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl px-4 py-3 sm:px-6" style={{ background: 'rgba(0, 0, 0, 0.85)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={resetAll}>
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" className="w-full h-full object-cover" style={{ filter: 'hue-rotate(-140deg) brightness(1.2)' }} alt="TrueForm Logo" />
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif' }}>
              True<span style={{ color: 'var(--accent)' }}>Form</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {appState === "landing" && (
              isRegistered ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)] font-semibold max-w-[100px] truncate">{regName}</span>
                  <button 
                    onClick={handleLogout}
                    className="relative z-50 text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition cursor-pointer border hover:bg-red-500/10 active:scale-95"
                    style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}
                  >
                    Выйти
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setAppState("register")}
                  className="text-xs font-extrabold flex items-center gap-1 px-4 py-1.5 rounded-full transition cursor-pointer"
                  style={{ color: '#000000', background: '#ffffff' }}
                >
                  Войти
                </button>
              )
            )}
            {appState !== "landing" && (
              <button 
                onClick={resetAll}
                className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full transition cursor-pointer"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Сбросить
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-start pt-6 p-4 sm:p-6 sm:justify-center w-full max-w-md mx-auto z-10">
        
        {/* TELEGRAM LOADING STATE */}
        {isTelegramLoggingIn && (
          <div className="w-full flex-1 flex flex-col items-center justify-center text-center py-12 animate-pulse">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Авторизация через Telegram...</h2>
            <p className="text-sm text-slate-400">Пожалуйста, подождите, мы входим в ваш аккаунт.</p>
          </div>
        )}

        {/* LANDING STATE */}
        {!isTelegramLoggingIn && appState === "landing" && (
          <div className="w-full flex flex-col items-center text-center py-8 animate-fade-in">


            {/* Badge — static, no pulse */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6" style={{ background: 'var(--accent-muted)', color: 'var(--accent)', border: '1px solid oklch(0.72 0.14 175 / 0.15)' }}>
              <Zap className="w-3 h-3" />
              Анализ осанки и тела по фото
            </div>

            {/* Heading — solid color, no gradient text */}
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4" style={{ fontFamily: 'var(--font-display), Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
              Узнай состояние{'\u00A0'}своего тела
              <br />
              <span style={{ color: 'var(--accent)' }}>за 60 секунд</span>
            </h1>

            <p className="text-sm sm:text-base leading-relaxed mb-10 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Загрузи одно фото, и ИИ оценит осанку, тонус мышц и пропорции. Анонимно и бесплатно.
            </p>

            {/* Features — inline list, not cards */}
            <div className="w-full space-y-3 mb-10 text-left max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Осанка и баланс</span>
                  <span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Наклоны, перекосы, сутулость</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <User className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Тонус и пропорции</span>
                  <span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Мышечный баланс, симметрия</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <ShieldCheck className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Полная конфиденциальность</span>
                  <span className="text-xs block" style={{ color: 'var(--text-tertiary)' }}>Фото удаляется сразу после анализа</span>
                </div>
              </div>
            </div>

            {/* CTA — solid accent, no gradient, no glow */}
            <div className="w-full max-w-sm flex flex-col gap-3">
              <button
                onClick={() => setAppState("upload")}
                className="relative z-20 w-full font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-base cursor-pointer active:scale-[0.98]"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)', touchAction: 'manipulation' }}
              >
                Начать анализ
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </button>

              {isRegistered && (
                <button
                  onClick={async () => {
                    if (result) {
                      setAppState("results");
                      setMainTab("profile");
                    } else {
                      setIsProcessing(true);
                      const { data: { session } } = await supabase.auth.getSession();
                      if (session?.user?.id) {
                        const { data: latestScan } = await supabase
                          .from("scans")
                          .select("*")
                          .eq("user_id", session.user.id)
                          .order("created_at", { ascending: false })
                          .limit(1)
                          .single();
                        
                        if (latestScan?.result) {
                          setScanId(latestScan.id);
                          setResult(latestScan.result);
                          if (latestScan.image_url) setImage(latestScan.image_url);
                          setIsFreePreview(!(latestScan.payment_status === "paid" || latestScan.payment_status === "shared"));
                          setAppState("results");
                          setMainTab("profile");
                        } else {
                          triggerToast("У вас еще нет сохраненных сканирований. Сделайте первый скан!");
                        }
                      } else {
                        triggerToast("Ошибка сессии. Пожалуйста, войдите заново.");
                      }
                      setIsProcessing(false);
                    }
                  }}
                  disabled={isProcessing}
                  className={`w-full bg-[#18181b] hover:bg-[#202025] text-slate-300 border border-white/10 font-semibold py-3.5 px-6 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer active:scale-95 ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <User className="w-4 h-4" />
                  {isProcessing ? "Загрузка..." : "Мой профиль"}
                </button>
              )}
            </div>

            {/* Social proof — minimal */}
            <div className="mt-6 flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                Бесплатно
              </span>
              <span>•</span>
              <span>10,482 анализа сегодня</span>
            </div>
          </div>
        )}

        {/* UPLOAD STATE */}
        {appState === "upload" && (
          <div className="w-full flex flex-col py-2">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Шаг 1: Загрузка фото</h2>
              <p className="text-xs text-slate-500">
                Загрузите 1 фотографию (селфи или в полный рост). Снимки анализируются ИИ и автоматически удаляются.
              </p>
            </div>

            {/* Single Upload Zone */}
            <div className="mb-6">
              <div 
                className={`relative border border-dashed rounded-3xl p-8 transition duration-300 flex flex-col items-center justify-center text-center bg-[#09090b]/80 min-h-[220px] ${
                  image 
                    ? "border-emerald-500/40 bg-emerald-950/5" 
                    : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
                }`}
              >
                {!image ? (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer py-4">
                    <div className="p-4 rounded-full bg-white/5 text-emerald-400 mb-4 animate-pulse-ring">
                      <Camera className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-semibold text-white mb-1">Выберите фото или перетащите сюда</span>
                    <span className="text-xs text-slate-500 px-6 leading-normal">
                      Поддерживаются портреты, селфи и фото тела в полный рост при хорошем освещении
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                  </label>
                ) : (
                  <div className="w-full flex flex-col items-center">
                    {image ? (
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-black/40 mb-4 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={image} 
                          alt="Uploaded preview" 
                          className={`w-full h-full object-contain ${isUploadingImage ? 'blur-sm opacity-50' : ''}`} 
                        />
                        {isUploadingImage && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45 backdrop-blur-[1px]">
                            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-[10px] text-emerald-400 font-semibold tracking-wide">Загрузка на сервер...</span>
                          </div>
                        )}
                      </div>
                    ) : null}
                    
                    <div className="flex gap-2">
                      <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition text-slate-200">
                        Заменить
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleFileUpload} 
                        />
                      </label>
                      <button 
                        onClick={() => setImage(null)} 
                        className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl text-xs font-semibold transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Guide checklist card */}
            <div className="bg-[#09090b]/80 border border-white/5 p-4 rounded-2xl mb-6 text-left space-y-2.5">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Как получить точный результат:</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> В полный рост или по пояс
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Хорошее освещение
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Спина ровно, взгляд прямо
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span> Одежда не скрывает силуэт
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3">
              {image && (
                <button
                  onClick={startScanning}
                  disabled={isUploadingImage}
                  className={`w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-bold py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition transform active:scale-95 flex items-center justify-center gap-2 text-base ${isUploadingImage ? 'opacity-50 cursor-not-allowed animate-pulse' : 'cursor-pointer'}`}
                >
                  {isUploadingImage ? "Загрузка изображения..." : "Запустить биомеханический анализ"}
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </button>
              )}
              
              <button
                onClick={() => setAppState("landing")}
                className="w-full bg-transparent text-slate-500 font-semibold py-2 rounded-xl text-xs hover:text-slate-400 transition"
              >
                Вернуться назад
              </button>
            </div>
          </div>
        )}

        {/* SCANNING STATE */}
        {appState === "scanning" && (
          <div className="w-full flex flex-col items-center text-center py-8">
            {/* Hologram Scanner Box */}
            <div className="relative w-40 h-52 bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden glow-primary mb-8 flex items-center justify-center">
              
              {/* Cyber Mesh SVG inside scanner */}
              <svg className="w-32 h-44 text-emerald-500/20 stroke-1" viewBox="0 0 100 120" fill="none">
                <path d="M50 10 V110 M20 60 H80 M30 30 L70 90 M70 30 L30 90" stroke="currentColor" strokeDasharray="3 3" />
                <circle cx="50" cy="20" r="10" stroke="currentColor" className="animate-pulse" />
                <circle cx="50" cy="55" r="22" stroke="currentColor" />
                <circle cx="50" cy="95" r="15" stroke="currentColor" />
                {/* Joints dots */}
                <circle cx="50" cy="20" r="2" fill="#10b981" />
                <circle cx="35" cy="40" r="2" fill="#10b981" />
                <circle cx="65" cy="40" r="2" fill="#10b981" />
                <circle cx="38" cy="70" r="2" fill="#10b981" />
                <circle cx="62" cy="70" r="2" fill="#10b981" />
              </svg>

              {/* Scanning neon laser line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scanline"></div>
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Сканирование тела... {Math.round(scanProgress)}%
            </h3>
            
            <div className="w-full bg-white/5 border border-white/10 h-2.5 rounded-full overflow-hidden mb-8">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>

            {/* Rolling Terminal Logs */}
            <div className="w-full bg-black/80 border border-white/5 rounded-2xl p-4 text-left font-mono text-[10px] sm:text-xs text-slate-400 space-y-2 h-44 overflow-y-auto no-scrollbar">
              {scanLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 animate-fade-in">
                  <span className="text-emerald-500 shrink-0">✓</span>
                  <span className="leading-relaxed">{log}</span>
                </div>
              ))}
              {scanProgress < 100 && (
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <span className="animate-pulse">●</span>
                  <span className="animate-pulse">Вычисление...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REGISTER STATE */}
        {appState === "register" && (
          <div className="w-full flex flex-col py-2 animate-fade-in max-w-sm mx-auto">
            {/* Header info */}
            <div className="text-center mb-5">
              {scanId ? (
                <>
                  <span className="inline-flex bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold mb-3">
                    🎉 Анализ завершен на 100%
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">Результат готов!</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Создайте бесплатный аккаунт, чтобы сохранить снимок и получить доступ к вашей оценке тела.
                  </p>
                </>
              ) : (
                <>
                  <span className="inline-flex bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full text-purple-400 text-xs font-bold mb-3">
                    🔐 Безопасная авторизация
                  </span>
                  <h2 className="text-2xl font-extrabold text-white">Вход в TrueForm</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Войдите, чтобы посмотреть историю ваших сканирований и динамику прогресса.
                  </p>
                </>
              )}
            </div>

            {/* Quick social registration buttons */}
            {!isTelegramMiniApp && (
              <div className="bg-[#09090b]/80 border border-white/5 p-5 rounded-3xl space-y-4 glow-card mt-4">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Авторизация</div>
                <div className="flex flex-col gap-3">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleSocialRegister("google")}
                    className="w-full bg-white hover:bg-slate-100 text-black py-3.5 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    Войти через Google
                  </button>

                  {/* VK OneTap Button */}
                  <div id="VkIdSdkOneTap" className="w-full flex justify-center min-h-[44px] mt-1" />
                </div>
                <div className="text-center text-[10px] text-slate-500 mt-4 leading-tight">
                  Авторизуясь, вы соглашаетесь с Политикой конфиденциальности и Пользовательским соглашением
                </div>
              </div>
            )}

            {isTelegramMiniApp && (
              <div className="bg-[#09090b]/80 border border-white/5 p-5 rounded-3xl space-y-4 glow-card mt-4 flex flex-col items-center justify-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs text-slate-400 font-semibold mt-2">
                  Авторизация через Telegram...
                </div>
              </div>
            )}

            <button
              onClick={resetAll}
              className="mt-6 text-slate-500 hover:text-slate-400 text-xs font-semibold py-1 transition text-center cursor-pointer"
            >
              Сбросить и вернуться назад
            </button>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === "results" && result && (
          <div className="w-full flex flex-col py-2 animate-fade-in max-w-lg pb-32">

            {/* ===== MAIN TAB: RATING (Оценка) ===== */}
            {mainTab === "rating" && (
              <div className="space-y-6">
            
            {/* Top Score Bento Circle */}
            <div className="flex items-center gap-5 bg-[#09090b]/80 border border-white/5 p-4 rounded-3xl mb-6 glow-primary">
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" className="stroke-white/5 stroke-4" fill="transparent" />
                  <circle 
                    cx="40" 
                    cy="40" 
                    r="34" 
                    className="stroke-emerald-400 stroke-4 transition-all duration-1000" 
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={2 * Math.PI * 34 * (1 - result.score / 100)}
                  />
                </svg>
                <span className="text-2xl font-black text-white">{result.score}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Общий рейтинг формы</span>
                <h2 className="text-xl font-extrabold text-white">Отличный потенциал!</h2>
                <p className="text-xs text-emerald-400">Форма лучше, чем у 84% ровесников</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/5 mb-6 overflow-x-auto no-scrollbar">
              {[
                { id: "general", label: "Общая оценка" },
                { id: "posture", label: "Осанка" },
                { id: "body", label: "Тело" },
                { id: "muscles", label: "Мышцы" }
              ].map((tab) => {
                const isLocked = isFreePreview && tab.id !== "general";
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      if (isLocked) {
                        setShowPaywallModal(true);
                      } else {
                        setActiveTab(tab.id as any);
                      }
                    }}
                    className={`py-2.5 px-4 font-semibold text-xs border-b-2 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      activeTab === tab.id 
                        ? "border-emerald-500 text-emerald-400" 
                        : isLocked
                          ? "border-transparent text-slate-600 hover:text-slate-500"
                          : "border-transparent text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                    {isLocked && <Lock className="w-3 h-3 text-pink-500/80" />}
                  </button>
                );
              })}
            </div>

            {/* Tab content boxes */}
            <div className="bg-[#09090b]/80 border border-white/5 rounded-3xl p-5 mb-6 glow-card">
              
              {/* TAB 1: POSTURE */}
              {activeTab === "posture" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-slate-400 font-semibold text-sm">Оценка плечевого пояса и шеи</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                      {result.grades.posture.score}% ({result.grades.posture.status})
                    </span>
                  </div>

                  {/* Posture stick figure visualisation */}
                  <div className="h-44 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    <svg className="w-28 h-40 text-emerald-400 stroke-[1.5]" viewBox="0 0 100 120" fill="none">
                      {/* Grid lines */}
                      <path d="M0 60 H100 M50 0 V120" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                      
                      {/* Head contour */}
                      <circle cx="50" cy="22" r="9" stroke="currentColor" fill="none" />
                      
                      {/* Tilted Neck Line */}
                      <line x1="50" y1="31" x2="52" y2="40" stroke="currentColor" />
                      
                      {/* Tilted Shoulders (showing minor imbalance) */}
                      <line x1="33" y1="41" x2="67" y2="39" stroke="currentColor" />
                      
                      {/* Spine Spine */}
                      <path d="M52 40 Q50 60 51 75" stroke="currentColor" />
                      
                      {/* Tilted Hips */}
                      <line x1="36" y1="75" x2="64" y2="75" stroke="currentColor" />
                      
                      {/* Limbs */}
                      <line x1="33" y1="41" x2="31" y2="65" stroke="currentColor" />
                      <line x1="67" y1="39" x2="69" y2="65" stroke="currentColor" />
                      <line x1="36" y1="75" x2="35" y2="108" stroke="currentColor" />
                      <line x1="64" y1="75" x2="65" y2="108" stroke="currentColor" />

                      {/* Error indicators */}
                      <circle cx="33" cy="41" r="3" fill="#ef4444" />
                      <circle cx="50" cy="31" r="2.5" fill="#ef4444" />
                      
                      <text x="5" y="15" fill="#ef4444" fontSize="6" fontFamily="sans-serif">Шея: наклон ~12°</text>
                      <text x="5" y="25" fill="#ef4444" fontSize="6" fontFamily="sans-serif">Плечи: наклон ~1.5°</text>
                    </svg>
                  </div>

                  {/* Umax-style sliders for Posture */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-3">
                    <UmaxSlider 
                      label="Положение головы и шеи"
                      score={Math.max(40, Math.min(98, result.grades.posture.score - 4))}
                      percentPosition={Math.max(40, Math.min(98, result.grades.posture.score - 4))}
                      minLabel="Выдвижение (вперед)"
                      midLabel="Небольшой наклон"
                      maxLabel="Ровно"
                    />
                    <UmaxSlider 
                      label="Симметрия плечевого пояса"
                      score={Math.max(40, Math.min(98, result.grades.posture.score + 2))}
                      percentPosition={Math.max(40, Math.min(98, result.grades.posture.score + 2))}
                      minLabel="Асимметрия"
                      midLabel="В пределах нормы"
                      maxLabel="Симметрично"
                    />
                  </div>

                  {isFreePreview ? (
                    <div className="relative pb-4">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {result.grades.posture.details.split(".")[0]}.
                      </p>
                      <p className="text-xs text-slate-500/20 select-none filter blur-[3.5px] leading-relaxed mt-1 select-none pointer-events-none">
                        {result.grades.posture.details.split(".").slice(1).join(".")}
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#09090b]/80 to-transparent flex items-end justify-center pb-1">
                        <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1 bg-[#18181b] border border-purple-500/20 px-2 py-0.5 rounded-full shadow-lg">
                          <Lock className="w-2.5 h-2.5" /> Подробный разбор заблокирован
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {result.grades.posture.details}
                    </p>
                  )}

                  <div className="border-t border-white/5 pt-3">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Исправление осанки:</h4>
                    <ul className="space-y-1.5">
                      {result.recommendations.posture.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 2: BODY */}
              {activeTab === "body" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-slate-400 font-semibold text-sm">Пропорции и мышечный тонус</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                      {result.grades.body.score}% ({result.grades.body.status})
                    </span>
                  </div>

                  {/* Umax-style sliders for Body */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-3">
                    <UmaxSlider 
                      label="Процент подкожного жира"
                      score="17.2"
                      percentPosition={45} // maps to athletic range on track
                      minLabel="Низкий (8%)"
                      midLabel="Атлетичный (15%)"
                      maxLabel="Высокий (>22%)"
                      valueSuffix="%"
                      trackGradientClass="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-500"
                      isBodyFat={true}
                    />
                    <UmaxSlider 
                      label="Мышечный тонус"
                      score={Math.max(40, Math.min(98, result.grades.body.score - 2))}
                      percentPosition={Math.max(40, Math.min(98, result.grades.body.score - 2))}
                      minLabel="Слабый"
                      midLabel="Хороший тонус"
                      maxLabel="Рельефный"
                      trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-purple-500"
                    />
                    <UmaxSlider 
                      label="Пропорции тела (V-Shape / WHR)"
                      score={Math.max(40, Math.min(98, result.grades.body.score + 3))}
                      percentPosition={Math.max(40, Math.min(98, result.grades.body.score + 3))}
                      minLabel="Диспропорция"
                      midLabel="Гармоничные"
                      maxLabel="Идеальные"
                    />
                  </div>

                  {isFreePreview ? (
                    <div className="relative pb-4">
                      <p className="text-xs text-slate-300 leading-relaxed mt-2">
                        {result.grades.body.details.split(".")[0]}.
                      </p>
                      <p className="text-xs text-slate-500/20 select-none filter blur-[3.5px] leading-relaxed mt-1 select-none pointer-events-none">
                        {result.grades.body.details.split(".").slice(1).join(".")}
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#09090b]/80 to-transparent flex items-end justify-center pb-1">
                        <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1 bg-[#18181b] border border-purple-500/20 px-2 py-0.5 rounded-full shadow-lg">
                          <Lock className="w-2.5 h-2.5" /> Подробный разбор заблокирован
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {result.grades.body.details}
                    </p>
                  )}

                  <div className="border-t border-white/5 pt-3">
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Питание:</h4>
                    <ul className="space-y-1.5">
                      {result.recommendations.nutrition.map((rec, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="text-purple-400 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* TAB 3: MUSCLES */}
              {activeTab === "muscles" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-slate-400 font-semibold text-sm">Рельеф и развитие мускулатуры</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                      {result.grades.muscles.score}% ({result.grades.muscles.status})
                    </span>
                  </div>

                  {/* Umax-style sliders for Muscles */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-3">
                    <UmaxSlider 
                      label="Плечи / Дельты"
                      score={result.grades.muscles.metrics?.shoulders === null ? null : (result.grades.muscles.metrics?.shoulders ?? Math.max(40, Math.min(98, result.grades.muscles.score - 2)))}
                      percentPosition={result.grades.muscles.metrics?.shoulders === null ? null : (result.grades.muscles.metrics?.shoulders ?? Math.max(40, Math.min(98, result.grades.muscles.score - 2)))}
                      minLabel="Слабые"
                      midLabel="В тонусе"
                      maxLabel="Округлые"
                    />
                    <UmaxSlider 
                      label="Грудные мышцы"
                      score={result.grades.muscles.metrics?.chest === null ? null : (result.grades.muscles.metrics?.chest ?? Math.max(40, Math.min(98, result.grades.muscles.score - 4)))}
                      percentPosition={result.grades.muscles.metrics?.chest === null ? null : (result.grades.muscles.metrics?.chest ?? Math.max(40, Math.min(98, result.grades.muscles.score - 4)))}
                      minLabel="Плоские"
                      midLabel="Развитые"
                      maxLabel="Атлетичные"
                    />
                    <UmaxSlider 
                      label="Пресс / Абдоминальные"
                      score={result.grades.muscles.metrics?.abs === null ? null : (result.grades.muscles.metrics?.abs ?? Math.max(40, Math.min(98, result.grades.muscles.score - 7)))}
                      percentPosition={result.grades.muscles.metrics?.abs === null ? null : (result.grades.muscles.metrics?.abs ?? Math.max(40, Math.min(98, result.grades.muscles.score - 7)))}
                      minLabel="Гладкий"
                      midLabel="Визуальный"
                      maxLabel="Рельефный"
                      trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-purple-500"
                    />
                    <UmaxSlider 
                      label="Спина / Широчайшие"
                      score={result.grades.muscles.metrics?.back === null ? null : (result.grades.muscles.metrics?.back ?? Math.max(40, Math.min(98, result.grades.muscles.score - 3)))}
                      percentPosition={result.grades.muscles.metrics?.back === null ? null : (result.grades.muscles.metrics?.back ?? Math.max(40, Math.min(98, result.grades.muscles.score - 3)))}
                      minLabel="Узкая"
                      midLabel="Атлетичная"
                      maxLabel="V-силуэт"
                    />
                    <UmaxSlider 
                      label="Руки / Бицепс и Трицепс"
                      score={result.grades.muscles.metrics?.arms === null ? null : (result.grades.muscles.metrics?.arms ?? Math.max(40, Math.min(98, result.grades.muscles.score + 2)))}
                      percentPosition={result.grades.muscles.metrics?.arms === null ? null : (result.grades.muscles.metrics?.arms ?? Math.max(40, Math.min(98, result.grades.muscles.score + 2)))}
                      minLabel="Тонкие"
                      midLabel="Развитые"
                      maxLabel="Мощные"
                    />
                    <UmaxSlider 
                      label="Ноги / Квадрицепсы"
                      score={result.grades.muscles.metrics?.legs === null ? null : (result.grades.muscles.metrics?.legs ?? Math.max(40, Math.min(98, result.grades.muscles.score - 5)))}
                      percentPosition={result.grades.muscles.metrics?.legs === null ? null : (result.grades.muscles.metrics?.legs ?? Math.max(40, Math.min(98, result.grades.muscles.score - 5)))}
                      minLabel="Начальные"
                      midLabel="Развитые"
                      maxLabel="Сильные"
                    />
                  </div>

                  {isFreePreview ? (
                    <div className="relative pb-4">
                      <p className="text-xs text-slate-300 leading-relaxed mt-2">
                        {result.grades.muscles.details.split(".")[0]}.
                      </p>
                      <p className="text-xs text-slate-500/20 select-none filter blur-[3.5px] leading-relaxed mt-1 select-none pointer-events-none">
                        {result.grades.muscles.details.split(".").slice(1).join(".")}
                      </p>
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#09090b]/80 to-transparent flex items-end justify-center pb-1">
                        <span className="text-[10px] text-purple-400 font-semibold flex items-center gap-1 bg-[#18181b] border border-purple-500/20 px-2 py-0.5 rounded-full shadow-lg">
                          <Lock className="w-2.5 h-2.5" /> Подробный разбор заблокирован
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed mt-2">
                      {result.grades.muscles.details}
                    </p>
                  )}
                </div>
              )}

              {/* TAB 0: GENERAL ASSESSMENT */}
              {activeTab === "general" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-slate-400 font-semibold text-sm">Результаты экспресс-сканирования</span>
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg text-xs font-bold">
                      ИИ-Вердикт готов
                    </span>
                  </div>

                  {/* 7-day Rescan Reminder Banner */}
                  {(() => {
                    const lastScan = localStorage.getItem("trueform_last_scan_date");
                    const sevenDays = 7 * 24 * 60 * 60 * 1000;
                    const show = lastScan && (Date.now() - parseInt(lastScan)) >= sevenDays;
                    if (!show) return null;
                    return (
                      <div className="flex items-center justify-between gap-3 p-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">⏰</span>
                          <div>
                            <p className="text-[11px] font-bold text-amber-300">Прошло 7 дней!</p>
                            <p className="text-[10px] text-amber-400/70">Сделай новый скан — отследи прогресс</p>
                          </div>
                        </div>
                        <button
                          onClick={resetAll}
                          className="shrink-0 text-[10px] font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1.5 rounded-xl hover:bg-amber-500/25 transition-colors cursor-pointer"
                        >
                          Новый скан
                        </button>
                      </div>
                    );
                  })()}

                  {/* High-level Sliders Block */}
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 space-y-3">
                    {/* Main rating (emphasized styling) */}
                    <div className="border-b border-white/5 pb-2 mb-1">
                      <UmaxSlider 
                        label="Общий рейтинг формы"
                        score={result.score}
                        percentPosition={result.score}
                        minLabel="Критический"
                        midLabel="Хороший"
                        maxLabel="Атлетичный"
                        trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
                      />
                    </div>
                    
                    {/* 5 Secondary Sliders */}
                    <div className="relative">
                      <div className={`space-y-3 pt-1 transition-all duration-300 ${isFreePreview ? "blur-[5px] select-none pointer-events-none opacity-40" : ""}`}>
                        <UmaxSlider 
                          label="Осанка"
                          score={result.grades.posture.score}
                          percentPosition={result.grades.posture.score}
                          minLabel="Сутулость"
                          midLabel="Сглаженная"
                          maxLabel="Прямая"
                          trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
                        />
                        <UmaxSlider 
                          label="Мышечная масса"
                          score={result.grades.muscles.score}
                          percentPosition={result.grades.muscles.score}
                          minLabel="Начальная"
                          midLabel="Спортивная"
                          maxLabel="Массивная"
                          trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-purple-500"
                        />
                        <UmaxSlider 
                          label="Процент жира"
                          score={Math.max(8, Math.min(32, Math.round(34 - (result.grades.body.score / 100) * 22)))}
                          percentPosition={Math.max(8, Math.min(32, Math.round(34 - (result.grades.body.score / 100) * 22)))}
                          minLabel="Сухой"
                          midLabel="Норма"
                          maxLabel="Избыток"
                          trackGradientClass="bg-gradient-to-r from-sky-400 via-emerald-400 to-amber-500"
                          isBodyFat={true}
                        />
                        <UmaxSlider 
                          label="Пропорции тела"
                          score={result.grades.body.score}
                          percentPosition={result.grades.body.score}
                          minLabel="Прямоугольник"
                          midLabel="Атлетичные"
                          maxLabel="V-силуэт"
                          trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
                        />
                        <UmaxSlider 
                          label="Симметрия тела"
                          score={Math.round((result.grades.posture.score + 94) / 2)}
                          percentPosition={Math.round((result.grades.posture.score + 94) / 2)}
                          minLabel="Дисбаланс"
                          midLabel="Норма"
                          maxLabel="Идеальная"
                          trackGradientClass="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-500"
                        />
                      </div>

                      {isFreePreview && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <div className="bg-[#18181b]/95 border border-purple-500/20 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-1.5 max-w-[260px] glow-primary">
                            <Lock className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Подробные метрики закрыты</span>
                            <span className="text-[9px] text-slate-400 leading-normal">
                              Осанка, тонус мышц, жир и пропорции доступны только по подписке.
                            </span>
                            <button
                              onClick={() => setShowPaywallModal(true)}
                              className="mt-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl text-[10px] transition cursor-pointer"
                            >
                              Разблокировать отчет за 490 ₽
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* CTAs */}
            <div className="space-y-3">
              <button
                onClick={() => setMainTab("plan")}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 active:scale-[0.98] text-black font-black py-4 px-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer shadow-lg shadow-emerald-500/30 border border-emerald-400/20 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-[9px] font-black uppercase tracking-wider text-black/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/80 animate-ping inline-block" />
                  Рекомендации готовы
                </span>
                <span className="text-sm font-black flex items-center gap-1.5 text-black">
                  Как улучшить форму? <Zap className="w-4 h-4 fill-black text-black" />
                </span>
              </button>

              <button
                onClick={async () => {
                  const shareData = {
                    title: "TrueForm AI",
                    text: `📊 Мой ИИ-рейтинг тела в TrueForm составил ${result.score}/100! Посмотри свою осанку и форму бесплатно:`,
                    url: "https://trueformai.ru",
                  };
                  
                  let shared = false;
                  if (navigator.share) {
                    try {
                      await navigator.share(shareData);
                      shared = true;
                    } catch (err) {
                      console.log("Web Share failed:", err);
                    }
                  }
                  if (!shared) {
                    try {
                      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                      triggerToast("Ссылка скопирована! Поделитесь с друзьями.");
                    } catch (err) {
                      triggerToast("Не удалось скопировать. Скопируйте ссылку из адресной строки.");
                    }
                  }
                }}
                className="w-full bg-[#18181b] hover:bg-[#202025] text-slate-300 border border-white/10 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Поделиться результатом
              </button>

              <button
                onClick={resetAll}
                className="w-full text-slate-500 hover:text-slate-400 font-semibold py-2 transition text-xs cursor-pointer"
              >
                Сделать новый тест
              </button>
            </div>
              </div>
            )}


            {/* ===== MAIN TAB: PLAN (План) ===== */}
            {mainTab === "plan" && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center gap-3 bg-[#09090b]/80 border border-white/5 p-4 rounded-3xl mb-6 glow-primary">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">План тренировок</h3>
                    <p className="text-[10px] text-slate-500">Персональные рекомендации на основе биомеханического анализа</p>
                  </div>
                </div>

                {/* Summary Text Card */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Заключение кинезиолога
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Физическая форма находится в хорошем тонусе (рейтинг {result.score}%). Выявлен небольшой наклон плеч (~1.5°) и наклон головы вперед на ~10-12°. Рекомендуется целенаправленная гипертрофия мышц спины и дельтовидных для создания симметричного и мощного V-силуэта.
                  </p>
                </div>

                {/* Daily Checklist — Umax retention loop */}
                {(() => {
                  const today = new Date().toISOString().slice(0, 10);
                  const storageKey = `trueform_checklist_${today}`;

                  const habits = [
                    { id: "workout", icon: "🏋️", label: "Тренировка" },
                    { id: "protein",  icon: "🥩", label: "Белок 2г/кг веса" },
                    { id: "water",   icon: "💧", label: "Вода 2 литра" },
                    { id: "stretch", icon: "🧘", label: "Растяжка 10 мин" },
                    { id: "sleep",   icon: "😴", label: "Сон 8 часов" },
                  ];

                  // Read checked state from localStorage
                  let checked: Record<string, boolean> = {};
                  try {
                    const stored = localStorage.getItem(storageKey);
                    if (stored) checked = JSON.parse(stored);
                  } catch {}

                  const doneCount = habits.filter(h => checked[h.id]).length;

                  // Streak: count consecutive days with at least 1 check
                  let streak = 0;
                  for (let i = 1; i <= 30; i++) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const k = `trueform_checklist_${d.toISOString().slice(0, 10)}`;
                    try {
                      const s = localStorage.getItem(k);
                      if (s && Object.values(JSON.parse(s)).some(Boolean)) streak++;
                      else break;
                    } catch { break; }
                  }

                  const toggle = (id: string) => {
                    const next = { ...checked, [id]: !checked[id] };
                    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
                    // Force re-render via a timestamp state trick
                    setChecklistTs(Date.now());
                  };

                  return (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">🔥</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ежедневный протокол</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {streak > 0 && (
                            <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-full">
                              🔥 {streak} {streak === 1 ? "день" : streak < 5 ? "дня" : "дней"} подряд
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-slate-500">{doneCount}/5</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${(doneCount / 5) * 100}%` }}
                        />
                      </div>

                      {/* Habit rows */}
                      <div className="space-y-1.5 pt-1">
                        {habits.map(h => {
                          const done = !!checked[h.id];
                          return (
                            <button
                              key={h.id}
                              onClick={() => toggle(h.id)}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                                done
                                  ? "bg-emerald-500/8 border-emerald-500/20 hover:bg-emerald-500/12"
                                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                              }`}
                            >
                              {/* Checkbox */}
                              <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                done ? "bg-emerald-500 border-emerald-500" : "border-white/20"
                              }`}>
                                {done && (
                                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                              <span className="text-sm shrink-0">{h.icon}</span>
                              <span className={`text-[11px] font-semibold transition-all ${
                                done ? "line-through text-slate-500" : "text-slate-300"
                              }`}>
                                {h.label}
                              </span>
                              {done && <span className="ml-auto text-emerald-400 text-[10px] font-bold">✓</span>}
                            </button>
                          );
                        })}
                      </div>

                      {/* Completion message */}
                      {doneCount === 5 && (
                        <div className="text-center py-1 text-[11px] font-bold text-emerald-400">
                          🏆 Отлично! Все задачи выполнены сегодня!
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* What to do next — Umax style */}
                {(() => {
                  const postureScore = result.grades.posture.score;
                  const muscleScore = result.grades.muscles.score;
                  const bodyScore = result.grades.body.score;

                  const allActions = [
                    {
                      priority: "ВЫСОКИЙ",
                      priorityColor: "text-red-400 bg-red-500/10 border-red-500/20",
                      dotColor: "bg-red-500",
                      icon: "🧍",
                      title: "Исправь осанку",
                      desc: "Ежедневно: тяга к лицу, подтягивания, растяжка грудных мышц — 15 мин.",
                      condition: postureScore < 75,
                    },
                    {
                      priority: "ВЫСОКИЙ",
                      priorityColor: "text-red-400 bg-red-500/10 border-red-500/20",
                      dotColor: "bg-red-500",
                      icon: "💪",
                      title: "Набор мышечной массы",
                      desc: "Базовые упражнения: жим, тяга, приседания. Профицит калорий +200–300 ккал.",
                      condition: muscleScore < 70,
                    },
                    {
                      priority: "СРЕДНИЙ",
                      priorityColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      dotColor: "bg-amber-400",
                      icon: "🔥",
                      title: "Снижение % жира",
                      desc: "Дефицит калорий -300 ккал + кардио 3×/нед. Цель: потеря 0.5 кг/нед.",
                      condition: bodyScore < 70,
                    },
                    {
                      priority: "СРЕДНИЙ",
                      priorityColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                      dotColor: "bg-amber-400",
                      icon: "⚖️",
                      title: "Улучши пропорции",
                      desc: "Акцент на плечи и спину: жим над головой, тяги блока, разводки.",
                      condition: bodyScore < 80,
                    },
                    {
                      priority: "ХОРОШИЙ",
                      priorityColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      dotColor: "bg-emerald-500",
                      icon: "🎯",
                      title: "Поддерживай форму",
                      desc: "3–4 тренировки в неделю. Следи за сном (8ч) и белком (2г/кг веса).",
                      condition: true,
                    },
                  ];

                  const topActions = allActions.filter(a => a.condition).slice(0, 3);

                  return (
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        Что делать дальше
                      </div>
                      {topActions.map((action, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-colors"
                        >
                          <div className="text-base shrink-0 mt-0.5">{action.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="text-[11px] font-bold text-white">{action.title}</span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${action.priorityColor}`}>
                                {action.priority}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed">{action.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* AI Plan Lock Teaser */}
                {isFreePreview && (
                  <div className="border border-purple-500/20 rounded-2xl p-4 bg-purple-500/5 text-center space-y-2">
                    <p className="text-xs text-purple-300 font-bold flex items-center justify-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Полный план тренировок заблокирован
                    </p>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Чтобы получить пошаговую программу тренировок под ваши углы осанки и дисбалансы, откройте полный отчет.
                    </p>
                    <button
                      onClick={() => setShowPaywallModal(true)}
                      className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
                    >
                      Открыть полный план
                    </button>
                  </div>
                )}
              </div>
            )}


            {/* ===== MAIN TAB: PROGRESS (Прогресс) ===== */}
            {mainTab === "progress" && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Прогресс
                </h3>
                {(() => {
                  let history: { date: string; score: number; posture: number; body: number; muscles: number }[] = [];
                  try { const raw = localStorage.getItem("trueform_scan_history"); if (raw) history = JSON.parse(raw); } catch {}
                  if (history.length === 0) return (
                    <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <TrendingUp className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-xs text-slate-500">Пока нет данных</p>
                    </div>
                  );
                  const W = 320, H = 140, PAD = 30;
                  const scores = history.map(h => h.score);
                  const minS = Math.max(0, Math.min(...scores) - 10);
                  const maxS = Math.min(100, Math.max(...scores) + 10);
                  const rangeS = maxS - minS || 1;
                  const points = history.map((h, i) => ({
                    x: PAD + (i / Math.max(1, history.length - 1)) * (W - PAD * 2),
                    y: H - PAD - ((h.score - minS) / rangeS) * (H - PAD * 2), ...h
                  }));
                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
                  return (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
                        {[0.25, 0.5, 0.75].map(f => (<line key={f} x1={PAD} x2={W-PAD} y1={H-PAD-f*(H-PAD*2)} y2={H-PAD-f*(H-PAD*2)} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />))}
                        {[0, 0.5, 1].map(f => (<text key={f} x={PAD-5} y={H-PAD-f*(H-PAD*2)+3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="7">{Math.round(minS + f * rangeS)}</text>))}
                        <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (<g key={i}><circle cx={p.x} cy={p.y} r="4" fill="#10b981" stroke="#030303" strokeWidth="2" /><text x={p.x} y={p.y-8} textAnchor="middle" fill="#10b981" fontSize="7" fontWeight="bold">{p.score}</text></g>))}
                        {points.filter((_,i) => i===0 || i===points.length-1).map((p,i) => (<text key={i} x={p.x} y={H-5} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="6">{new Date(p.date).toLocaleDateString("ru-RU",{day:"numeric",month:"short"})}</text>))}
                      </svg>
                    </div>
                  );
                })()}
                {/* Before/After */}
                {(() => {
                  let history: { date: string; score: number; posture: number; body: number; muscles: number }[] = [];
                  try { const raw = localStorage.getItem("trueform_scan_history"); if (raw) history = JSON.parse(raw); } catch {}
                  if (history.length < 2) return <div className="text-center py-6 bg-white/[0.02] border border-white/5 rounded-2xl"><p className="text-[11px] text-slate-500">2+ скана для Before/After</p></div>;
                  const prev = history[history.length - 2], curr = history[history.length - 1];
                  const diff = curr.score - prev.score;
                  const metrics = [{ label: "Общий", prev: prev.score, curr: curr.score }, { label: "Осанка", prev: prev.posture, curr: curr.posture }, { label: "Тело", prev: prev.body, curr: curr.body }, { label: "Мышцы", prev: prev.muscles, curr: curr.muscles }];
                  return (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Before → After</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${diff > 0 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : diff < 0 ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-slate-400 bg-white/5 border-white/10"}`}>{diff > 0 ? "+" : ""}{diff}</span>
                      </div>
                      {metrics.map((m, i) => { const d = m.curr - m.prev; return (
                        <div key={i} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{m.label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 w-8 text-right">{m.prev}%</span>
                            <ArrowRight className="w-3 h-3 text-slate-600" />
                            <span className="text-white font-bold w-8">{m.curr}%</span>
                            <span className={`text-[9px] font-bold w-8 text-right ${d > 0 ? "text-emerald-400" : d < 0 ? "text-red-400" : "text-slate-500"}`}>{d > 0 ? `+${d}` : d}</span>
                          </div>
                        </div>
                      ); })}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ===== MAIN TAB: PROFILE (ЛК) ===== */}
            {mainTab === "profile" && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2"><User className="w-4 h-4 text-pink-400" /> Личный кабинет</h3>
                
                {isRegistered && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Вы вошли как</p>
                    <p className="text-xs font-bold text-white">{regName || "Пользователь"}</p>
                    {regEmail && <p className="text-[10px] text-slate-400">{regEmail}</p>}
                  </div>
                )}

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-white">Подписка</p>
                    <p className={`text-[10px] font-semibold ${isFreePreview ? "text-amber-400" : "text-emerald-400"}`}>
                      {isFreePreview 
                        ? "Бесплатный просмотр" 
                        : regEmail?.toLowerCase() === "alexandertsyhanov@gmail.com"
                          ? "✓ Premium Доступ"
                          : subscriptionExpiresAt 
                            ? `✓ Активна до ${new Date(subscriptionExpiresAt).toLocaleDateString("ru-RU")}`
                            : "✓ Активна"}
                    </p>
                  </div>
                  {isFreePreview && (
                    <button 
                      onClick={() => setShowPaywallModal(true)} 
                      className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-500/20 transition"
                    >
                      Активировать
                    </button>
                  )}
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                  <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90"><circle cx="28" cy="28" r="24" className="stroke-white/5 stroke-[3]" fill="transparent" /><circle cx="28" cy="28" r="24" className="stroke-emerald-400 stroke-[3]" fill="transparent" strokeDasharray={2*Math.PI*24} strokeDashoffset={2*Math.PI*24*(1-result.score/100)} /></svg>
                    <span className="text-lg font-black text-white">{result.score}</span>
                  </div>
                  <div><p className="text-[11px] font-bold text-white">Текущий рейтинг</p><p className="text-[10px] text-slate-500">Лучше чем у 84% пользователей</p></div>
                </div>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">История сканов</p>
                  {(() => { let h: {date:string;score:number}[] = []; try { const r = localStorage.getItem("trueform_scan_history"); if(r) h=JSON.parse(r); } catch{} if(!h.length) return <p className="text-[10px] text-slate-600">Нет записей</p>; return h.slice(-5).reverse().map((s,i) => (<div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0"><span className="text-[10px] text-slate-400">{new Date(s.date).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}</span><span className="text-[11px] font-bold text-emerald-400">{s.score}%</span></div>)); })()}
                </div>

                <div className="space-y-3 pb-8">
                  <button onClick={resetAll} className="w-full bg-[#18181b] hover:bg-[#202025] text-slate-300 border border-white/10 font-semibold py-4 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Новый скан</button>
                  {isRegistered ? (
                    <button onClick={handleLogout} className="w-full bg-red-950/20 hover:bg-red-950/40 text-red-400 border border-red-900/30 font-semibold py-4 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer relative z-50">Выйти из аккаунта</button>
                  ) : (
                    <button onClick={() => setAppState("register")} className="w-full bg-white hover:bg-slate-100 text-black font-semibold py-4 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer relative z-50">Войти / Зарегистрироваться</button>
                  )}
                  <button onClick={() => { localStorage.clear(); resetAll(); triggerToast("Данные сброшены"); }} className="w-full text-slate-600 hover:text-red-400 text-[10px] font-semibold py-2 transition cursor-pointer relative z-50">Сбросить локальные данные</button>
                  <p className="text-center pt-2 text-[9px] text-slate-600">Поддержка: <a href="mailto:alexandertsyhanov@gmail.com" className="text-emerald-500 hover:underline relative z-50">alexandertsyhanov@gmail.com</a></p>
                </div>
              </div>
            )}

            {/* ===== BOTTOM NAVIGATION BAR ===== */}
            <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0b]/95 backdrop-blur-md border-t border-white/5">
              <div className="max-w-lg mx-auto flex items-center justify-around py-2">
                {([
                  { id: "rating" as const, icon: Activity, label: "Оценка" },
                  { id: "plan" as const, icon: Zap, label: "План" },
                  { id: "progress" as const, icon: TrendingUp, label: "Прогресс" },
                  { id: "profile" as const, icon: User, label: "ЛК" },
                ] as const).map((tab) => (
                  <button key={tab.id} onClick={() => setMainTab(tab.id)} className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all cursor-pointer ${mainTab === tab.id ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}`}>
                    <tab.icon className="w-5 h-5" />
                    <span className="text-[9px] font-bold">{tab.label}</span>
                    {mainTab === tab.id && <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Paywall Checkout Modal */}
        {showPaywallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <button
                onClick={() => setShowPaywallModal(false)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-10 h-10 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-extrabold text-white">Активировать TrueForm Premium</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Получите полный неограниченный доступ ко всем анализам осанки, пропорциям тела и персональной программе тренировок на 30 дней.
                </p>
              </div>

              <div className="space-y-4">
                {/* METHOD 1: PAY */}
                <div className="border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-2xl p-4 bg-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition duration-300 flex flex-col gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                    Скидка 50%
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Способ 1: Подписка на 1 месяц</h4>
                      <p className="text-[9px] text-slate-500">СБП / Карты РФ. Доступ на 30 дней</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs line-through text-slate-500 block">990 ₽</span>
                      <span className="text-xs font-black text-emerald-400">490 ₽</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-black font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Активация подписки...
                      </>
                    ) : showPaymentSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
                        Подписка активна! Открываем...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        Оформить подписку за 490 ₽
                      </>
                    )}
                  </button>
                  <p className="text-[8px] text-slate-500 text-center leading-normal">
                    *Доступ на 30 дней. Автосписания отсутствуют — платите только когда пользуетесь.
                  </p>
                </div>

                {/* METHOD 2: VIRAL FREE */}
                <div className="border border-white/10 rounded-2xl p-4 bg-white/5 hover:border-purple-500/30 transition flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">Способ 2: Бесплатно за репосты</h4>
                      <p className="text-[9px] text-slate-500">Поделись ссылкой с 3 друзьями в мессенджерах</p>
                    </div>
                    <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-lg">
                      {sharesCount} / 3
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${(sharesCount / 3) * 100}%` }}
                    ></div>
                  </div>

                  <button
                    onClick={handleShare}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Поделиться ссылкой
                  </button>
                </div>

                {/* Bypass button */}
                {isDev && (
                  <button
                    onClick={handleBypass}
                    className="w-full text-slate-500 hover:text-slate-300 text-[10px] font-semibold py-1 transition text-center cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    Пропустить (Тест)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 text-xs font-medium px-4 py-3 rounded-xl backdrop-blur-md flex items-center gap-2 animate-fade-in" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--accent)' }}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 px-4 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-md mx-auto text-center space-y-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
          <p>© 2026 TrueForm AI. Все права защищены. Сделано в РФ.</p>
          <p className="px-6 leading-relaxed">
            Пользуясь сервисом, вы соглашаетесь с условиями оферты. Все фотографии зашифрованы и автоматически удаляются в течение 10 минут после окончания анализа.
          </p>
        </div>
      </footer>

      {/* VK ID Web SDK */}
      <Script
        src="https://unpkg.com/@vkid/sdk@2.6.5/dist-sdk/umd/index.js"
        strategy="afterInteractive"
        onLoad={() => {
          setVkidLoaded(true);
        }}
      />
    </div>
  );
}
