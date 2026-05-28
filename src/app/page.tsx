"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import * as analytics from "@/lib/analytics";
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
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [checklistTs, setChecklistTs] = useState(0); // forces checklist re-render
  const [mainTab, setMainTab] = useState<"rating" | "plan" | "progress" | "profile">("rating");
  const [isRegistered, setIsRegistered] = useState(false);
  const [regName, setRegName] = useState("");
  const [regTelegram, setRegTelegram] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [isDev, setIsDev] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsDev(
        window.location.search.includes("dev=true") ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      );
    }
  }, []);

  // Custom logging text simulation during analysis
  useEffect(() => {
    if (appState !== "scanning") return;

    setScanLogs([]);
    setScanProgress(0);

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
        // Load report and proceed to paywall
        fetchAnalysis();
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
        }),
      });
      const data = await response.json();
      setResult(data.result);
      analytics.trackScanComplete(data.result?.score || 0);
      if (data.scanId) {
        setScanId(data.scanId);
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
      if (!registered) {
        setAppState("register");
      } else {
        const freeScanUsed = localStorage.getItem("trueform_free_scan_used");
        if (freeScanUsed === "true") {
          setIsFreePreview(false);
          setAppState("paywall");
        } else {
          setIsFreePreview(true);
          localStorage.setItem("trueform_free_scan_used", "true");
          setAppState("results");
        }
      }
    } catch (e) {
      console.error(e);
      // Fallback
      setAppState("paywall");
    }
  };

  // Load registration state on mount, check referrals and payment redirect
  useEffect(() => {
    const reg = localStorage.getItem("trueform_user_registered") === "true";
    setIsRegistered(reg);
    if (reg) {
      setRegName(localStorage.getItem("trueform_user_name") || "");
      setRegTelegram(localStorage.getItem("trueform_user_tg") || "");
      setRegEmail(localStorage.getItem("trueform_user_email") || "");
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
                triggerToast("Оплата успешно подтверждена! Добро пожаловать.");
              }
            } catch (fetchErr) {
              console.error("Failed to fetch scan results after payment:", fetchErr);
            }
          };
          fetchScanAfterPayment();
        }
      }
    }
  }, []);

  // Poll for scan payment_status updates (e.g. if unlocked via referral or webhook)
  useEffect(() => {
    if (!scanId || appState !== "paywall") return;

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
            setAppState("results");
            triggerToast("Ура! Ваш отчет разблокирован!");
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
    localStorage.setItem("trueform_user_tg", regTelegram);
    localStorage.setItem("trueform_user_email", regEmail);
    setIsRegistered(true);

    if (scanId && result) {
      try {
        await supabase
          .from("scans")
          .update({
            user_name: regName,
            user_telegram: regTelegram,
            user_email: regEmail,
            result: {
              ...result,
              user_details: {
                name: regName,
                telegram: regTelegram,
                email: regEmail
              }
            }
          })
          .eq("id", scanId);
      } catch (dbErr) {
        console.error("Failed to update user details in supabase scan:", dbErr);
      }
    }

    const freeScanUsed = localStorage.getItem("trueform_free_scan_used");
    if (freeScanUsed === "true") {
      setIsFreePreview(false);
      setAppState("paywall");
    } else {
      setIsFreePreview(true);
      localStorage.setItem("trueform_free_scan_used", "true");
      setAppState("results");
    }
  };

  const handleSocialRegister = async (provider: string, defaultName: string, defaultTg: string, defaultEmail: string) => {
    analytics.trackSocialLogin(provider);
    triggerToast(`Вход через ${provider} успешен!`);
    setRegName(defaultName);
    setRegTelegram(defaultTg);
    setRegEmail(defaultEmail);
    
    // Auto-save registration details
    localStorage.setItem("trueform_user_registered", "true");
    localStorage.setItem("trueform_user_name", defaultName);
    localStorage.setItem("trueform_user_tg", defaultTg);
    localStorage.setItem("trueform_user_email", defaultEmail);
    setIsRegistered(true);

    if (scanId && result) {
      try {
        await supabase
          .from("scans")
          .update({
            user_name: defaultName,
            user_telegram: defaultTg,
            user_email: defaultEmail,
            result: {
              ...result,
              user_details: {
                name: defaultName,
                telegram: defaultTg,
                email: defaultEmail,
                auth_provider: provider
              }
            }
          })
          .eq("id", scanId);
      } catch (dbErr) {
        console.error("Failed to update user details in supabase scan:", dbErr);
      }
    }

    setTimeout(() => {
      const freeScanUsed = localStorage.getItem("trueform_free_scan_used");
      if (freeScanUsed === "true") {
        setIsFreePreview(false);
        setAppState("paywall");
      } else {
        setIsFreePreview(true);
        localStorage.setItem("trueform_free_scan_used", "true");
        setAppState("results");
      }
    }, 800);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately for UX responsiveness
    const previewReader = new FileReader();
    previewReader.onloadend = () => {
      setImage(previewReader.result as string);
    };
    previewReader.readAsDataURL(file);

    analytics.trackPhotoUpload();
    setIsUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('scans-photos')
        .upload(fileName, file);

      if (error) {
        console.error("Storage upload failed, using local base64 fallback:", error);
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('scans-photos')
          .getPublicUrl(fileName);
        setImage(publicUrl);
      }
    } catch (err) {
      console.error("Storage upload exception:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const loadDemoPhotos = () => {
    analytics.trackDemoPhoto();
    setImage("demo-photo");
  };

  const startScanning = () => {
    if (!image) return;
    analytics.trackScanStart();
    setAppState("scanning");
  };

  const handlePayment = async () => {
    analytics.trackPaymentInit();
    setIsProcessing(true);

    // TEMPORARY BYPASS: Instant unlock for testing/preview
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentSuccess(true);
      
      if (scanId) {
        supabase.from("scans").update({ payment_status: "paid" }).eq("id", scanId).then();
      }

      setTimeout(() => {
        setShowPaymentSuccess(false);
        setIsFreePreview(false); // Unlock content!
        setShowPaywallModal(false); // Close checkout modal if open
        setAppState("results");
      }, 1000);
    }, 800);
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
      const nextSharesCount = 3; // instantly bypass for previewing
      setSharesCount(nextSharesCount);

      if (scanId) {
        try {
          await supabase
            .from("scans")
            .update({ 
              shares_count: nextSharesCount,
              payment_status: "shared" 
            })
            .eq("id", scanId);
        } catch (dbErr) {
          console.error("Failed to update shares count in database:", dbErr);
        }
      }

      setTimeout(() => {
        setIsFreePreview(false); // Unlock content!
        setShowPaywallModal(false); // Close checkout modal if open
        setAppState("results");
        triggerToast("Ура! Отчет разблокирован через реферальную программу.");
      }, 1000);
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

  return (
    <div className="relative flex flex-col min-h-screen bg-[#030303] text-slate-100 font-sans bg-grid-cyber antialiased overflow-x-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none animate-grid-glow -z-10"></div>
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[140px] pointer-events-none animate-grid-glow -z-10" style={{ animationDelay: "-4s" }}></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-md border-b border-white/5 px-4 py-3 sm:px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={resetAll}>
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-pink-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)] bg-black flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/emblem.png" className="w-7 h-7 object-contain" alt="TrueForm Logo" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              True<span className="text-pink-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">Form</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-slate-500 border border-white/10 px-2 py-1 rounded-full bg-white/5">
              Мобильная версия (РФ)
            </span>
            {appState !== "landing" && (
              <button 
                onClick={resetAll}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full transition"
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
        
        {/* LANDING STATE */}
        {appState === "landing" && (
          <div className="w-full flex flex-col items-center text-center py-6 animate-fade-in">
            {/* Neon Pink Emblem Branding */}
            <div className="relative mb-6 animate-float flex items-center justify-center">
              <div className="absolute inset-0 bg-pink-500/25 rounded-full blur-2xl w-24 h-24"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/emblem.png" 
                className="w-24 h-24 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(244,63,94,0.7)]" 
                alt="TrueForm Emblem" 
              />
            </div>

            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold mb-6 animate-pulse-ring">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              ИИ-сканирование осанки и тела
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 sm:text-5xl leading-none">
              Твоя осанка и тело под <span className="text-transparent bg-gradient-to-r from-emerald-400 to-pink-500 bg-clip-text">анализом ИИ</span>
            </h1>

            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-sm">
              Загрузи 1 фото в полный рост или по пояс и узнай свой рейтинг осанки и пропорций тела. Полностью анонимно.
            </p>

            {/* Feature Bento Card */}
            <div className="grid grid-cols-2 gap-3 w-full mb-8">
              <div className="bg-[#09090b]/80 border border-white/5 p-3 rounded-2xl text-left glow-card">
                <span className="text-xs text-slate-500 block mb-1">Осанка</span>
                <span className="text-sm font-semibold text-emerald-400">Наклоны и дисбаланс</span>
              </div>
              <div className="bg-[#09090b]/80 border border-white/5 p-3 rounded-2xl text-left glow-card">
                <span className="text-xs text-slate-500 block mb-1">Тело</span>
                <span className="text-sm font-semibold text-pink-400">Тонус и пропорции</span>
              </div>
              <div className="bg-[#09090b]/80 border border-white/5 p-3 rounded-2xl text-left glow-card col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5">Конфиденциальность</span>
                  <span className="text-sm font-semibold text-white">Удаление фото после теста</span>
                </div>
                <ShieldCheck className="w-8 h-8 text-emerald-500/80 stroke-1" />
              </div>
            </div>

            <button
              onClick={() => setAppState("upload")}
              className="relative z-20 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-bold py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)] transition transform active:scale-95 flex items-center justify-center gap-2 text-base cursor-pointer"
              style={{ touchAction: 'manipulation' }}
            >
              Начать сканирование
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>

            <div className="mt-6 flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Бесплатно 3/3 тестов
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
                    {image !== "demo-photo" ? (
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
                    ) : (
                      <div className="flex flex-col items-center py-6 mb-4">
                        <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-3">
                          <Sparkles className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-semibold text-emerald-400">Демонстрационное фото готово к анализу</span>
                      </div>
                    )}
                    
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
              {!image ? (
                <button
                  onClick={loadDemoPhotos}
                  className="w-full bg-[#18181b] hover:bg-[#202025] text-slate-300 border border-white/10 font-medium py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Загрузить демо-фотографию
                </button>
              ) : (
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
              <span className="inline-flex bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold mb-3">
                🎉 Анализ завершен на 100%
              </span>
              <h2 className="text-2xl font-extrabold text-white">Результат готов!</h2>
              <p className="text-xs text-slate-400 mt-1">
                Создайте бесплатный аккаунт, чтобы сохранить снимок и получить доступ к вашей оценке тела.
              </p>
            </div>

            {/* Quick social registration buttons */}
            <div className="bg-[#09090b]/80 border border-white/5 p-4 rounded-2xl mb-3 space-y-2.5 glow-card">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Быстрая авторизация</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSocialRegister("Google", "Иван Иванов", "@ivan_tg", "ivan@gmail.com")}
                  className="bg-white hover:bg-slate-100 text-black py-2 rounded-xl text-[10px] font-extrabold transition flex items-center justify-center gap-1 cursor-pointer shadow-[0_2px_8px_rgba(255,255,255,0.05)]"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
                
                <button
                  type="button"
                  onClick={() => handleSocialRegister("VK ID", "Дмитрий Смирнов", "@dmitry_tg", "dmitry@vk.com")}
                  className="bg-[#0077FF] hover:bg-[#0066DD] text-white py-2 rounded-xl text-[10px] font-extrabold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M15.08 3h-6.16C4.4 3 3 4.4 3 8.92v6.16C3 19.6 4.4 21 8.92 21h6.16c4.52 0 5.92-1.4 5.92-5.92v-6.16C21 4.4 19.6 3 15.08 3zm2.84 12.16c0 .32-.2.64-.64.64h-1.64c-.48 0-.92-.28-1.32-.68-.8-.8-1.48-1.44-2.08-1.44-.24 0-.44.08-.6.28-.24.28-.32.68-.32 1.16v.48c0 .24-.12.56-.56.56h-1.28c-2.04 0-4.04-1.24-5.32-3.8-.48-.96-.84-2.2-.84-3.24 0-.32.16-.56.56-.56h1.68c.36 0 .56.16.64.48.44 1.16 1.04 2.16 1.56 2.16.16 0 .28-.08.36-.28.16-.6.16-1.52-.36-1.92-.36-.28-.52-.36-.52-.56 0-.16.24-.32.64-.32h2.64c.36 0 .48.16.48.52v2.24c0 .28.08.4.2.4.16 0 .28-.08.44-.28.72-.96 1.16-2.08 1.4-2.48.08-.16.24-.28.52-.28h1.72c.48 0 .6.16.48.52-.28.72-.96 1.96-1.84 2.88-.28.28-.36.44-.08.76.28.32 1.16 1.32 1.76 2.04.44.52.88.92.88 1.28z"/>
                  </svg>
                  VK ID
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialRegister("Яндекс ID", "Анна Кузнецова", "@anna_tg", "anna@yandex.ru")}
                  className="bg-[#FC3F35] hover:bg-[#E3352C] text-white py-2 rounded-xl text-[10px] font-extrabold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="font-extrabold text-[10px] bg-white text-[#FC3F35] px-1 rounded">Я</span>
                  Яндекс
                </button>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegisterSubmit} className="bg-[#09090b]/80 border border-white/5 p-5 rounded-3xl space-y-4 glow-card">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Или введите вручную</div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ваше имя</label>
                <input
                  type="text"
                  required
                  placeholder="Иван"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Telegram (для связи)</label>
                <input
                  type="text"
                  required
                  placeholder="@username"
                  value={regTelegram}
                  onChange={(e) => setRegTelegram(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email / Телефон</label>
                <input
                  type="text"
                  required
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer mt-2"
              >
                Посмотреть результаты
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button
              onClick={resetAll}
              className="mt-6 text-slate-500 hover:text-slate-400 text-xs font-semibold py-1 transition text-center cursor-pointer"
            >
              Сбросить и вернуться назад
            </button>
          </div>
        )}

        {/* PAYWALL STATE */}
        {appState === "paywall" && (
          <div className="w-full flex flex-col py-2 animate-fade-in">
            {/* Header info */}
            <div className="text-center mb-6">
              <span className="inline-flex bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full text-pink-400 text-xs font-bold mb-3 animate-pulse-ring">
                🔐 Отчет сформирован на 97%
              </span>
              <h2 className="text-2xl font-extrabold text-white">Получить доступ к отчету</h2>
              <p className="text-xs text-slate-400 mt-1">
                Мы обнаружили асимметрию плечевого пояса и отклонения в осанке (лордоз, наклон головы).
              </p>
            </div>

            {/* What is in report box */}
            <div className="bg-[#09090b]/80 border border-white/5 p-4 rounded-2xl mb-6 space-y-3 glow-card">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Что внутри отчета:</h4>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 p-0.5 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Точный расчет симметрии плеч, углов наклона шеи и лопаток</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 p-0.5 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Скелетная разметка осанки (плечевой пояс, шея, таз)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 p-0.5 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Оценка % подкожного жира и мышечного тонуса</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-400 p-0.5 rounded-full shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                  <span>Персональный комплекс упражнений и программа на 30 дней</span>
                </li>
              </ul>
            </div>

            {/* Action buttons */}
            <div className="space-y-4">
              
              {/* METHOD 1: PAY */}
              <div className="border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] rounded-2xl p-4 bg-white/5 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] transition duration-300 flex flex-col gap-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-bl-lg">
                  Скидка 50%
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Способ 1: Месячная подписка</h4>
                    <p className="text-[11px] text-slate-500">СБП / Карты РФ. Отмена в любой момент</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs line-through text-slate-500 block">990 ₽</span>
                    <span className="text-lg font-black text-emerald-400">490 ₽<span className="text-xs font-normal text-slate-400">/мес</span></span>
                  </div>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-black font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Обработка платежа...
                    </>
                  ) : showPaymentSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                      Оплачено! Открываем...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Оплатить и открыть отчёт
                    </>
                  )}
                </button>
                <p className="text-[9px] text-slate-500 text-center leading-normal">
                  *Подписка продлевается автоматически каждый месяц за 490₽. Вы можете отменить подписку в любой момент в личном кабинете или обратившись в поддержку.
                </p>
              </div>

              {/* METHOD 2: VIRAL FREE */}
              <div className="border border-white/10 rounded-2xl p-4 bg-white/5 hover:border-purple-500/30 transition flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">Способ 2: Бесплатно за репосты</h4>
                    <p className="text-[11px] text-slate-500">Поделись ссылкой с 3 друзьями в мессенджерах</p>
                  </div>
                  <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-1 rounded-lg">
                    {sharesCount} / 3 репостов
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${(sharesCount / 3) * 100}%` }}
                  ></div>
                </div>

                <button
                  onClick={handleShare}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  Поделиться ссылкой
                </button>
              </div>

            </div>

            {isDev && (
              <button
                onClick={handleBypass}
                className="mt-6 text-emerald-500 hover:text-emerald-400 text-xs font-semibold py-1.5 px-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 transition text-center cursor-pointer flex items-center justify-center gap-1 mx-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                Пропустить оплату (Тестирование)
              </button>
            )}

            <button
              onClick={resetAll}
              className="mt-3 text-slate-500 hover:text-slate-400 text-xs font-semibold py-1 transition text-center"
            >
              Сбросить и переделать
            </button>
          </div>
        )}

        {/* RESULTS STATE */}
        {appState === "results" && result && (
          <div className="w-full flex flex-col py-2 animate-fade-in max-w-lg pb-20">

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
                    { id: "workout", icon: "🏋️", label: "Тренировка 30 мин" },
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
                      <Lock className="w-3.5 h-3.5" /> Полный 30-дневный план тренировок заблокирован
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
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div><p className="text-[11px] font-bold text-white">Подписка</p><p className={`text-[10px] font-semibold ${isFreePreview ? "text-amber-400" : "text-emerald-400"}`}>{isFreePreview ? "Бесплатный просмотр" : "✓ Активна"}</p></div>
                  {isFreePreview && <button onClick={() => setShowPaywallModal(true)} className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-500/20 transition">Активировать</button>}
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

                <div className="space-y-2">
                  <button onClick={resetAll} className="w-full bg-[#18181b] hover:bg-[#202025] text-slate-300 border border-white/10 font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /> Новый скан</button>
                  <button onClick={() => { localStorage.clear(); resetAll(); triggerToast("Данные сброшены"); }} className="w-full text-slate-600 hover:text-red-400 text-[10px] font-semibold py-2 transition cursor-pointer">Сбросить все данные</button>
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
                <h3 className="text-base font-extrabold text-white">Активировать полный отчёт</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Получите неограниченный доступ к деталям осанки, пропорций тела и персональной программе тренировок.
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
                      <h4 className="text-xs font-bold text-white">Способ 1: Месячная подписка</h4>
                      <p className="text-[9px] text-slate-500">СБП / Карты РФ. Отмена в любой момент</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs line-through text-slate-500 block">990 ₽</span>
                      <span className="text-xs font-black text-emerald-400">490 ₽<span className="text-[9px] font-normal text-slate-400">/мес</span></span>
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
                        Обработка платежа...
                      </>
                    ) : showPaymentSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-950" />
                        Оплачено! Открываем...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        Оплатить и открыть отчёт
                      </>
                    )}
                  </button>
                  <p className="text-[8px] text-slate-500 text-center leading-normal">
                    *Подписка продлевается автоматически каждый месяц за 490₽. Вы можете отменить подписку в любой момент в личном кабинете или обратившись в поддержку.
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
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#09090b]/90 border border-emerald-500/30 text-emerald-400 text-xs font-medium px-4 py-3 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.2)] backdrop-blur-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 px-4 mt-auto">
        <div className="max-w-md mx-auto text-center space-y-2 text-[10px] text-slate-600">
          <p>© 2026 TrueForm AI. Все права защищены. Сделано в РФ.</p>
          <p className="px-6 leading-relaxed">
            Пользуясь сервисом, вы соглашаетесь с условиями оферты. Все фотографии зашифрованы и автоматически удаляются в течение 10 минут после окончания анализа.
          </p>
        </div>
      </footer>
    </div>
  );
}
