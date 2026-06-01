"use client";

import React, { useEffect, useRef } from "react";

interface TelegramLoginButtonProps {
  botUsername: string;
  onAuth: (user: any) => void;
}

export function TelegramLoginButton({ botUsername, onAuth }: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = "";

    // Define global callback
    (window as any).onTelegramAuth = (user: any) => {
      console.log("TelegramLoginButton callback triggered. User:", user);
      onAuth(user);
    };

    // Create script element
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.async = true;

    containerRef.current.appendChild(script);

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  return (
    <div className="flex justify-center w-full min-h-[44px] items-center">
      <div ref={containerRef} id="telegram-login-container" />
    </div>
  );
}
