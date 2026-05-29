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

    // Create script element
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12"); // Rounded borders to match UI
    script.setAttribute("data-request-access", "write");
    script.async = true;

    // Define global callback function
    (window as any).onTelegramAuth = (user: any) => {
      console.log("TelegramLoginButton widget callback triggered. User:", user);
      onAuth(user);
    };
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    containerRef.current.appendChild(script);

    return () => {
      // Clean up global callback
      delete (window as any).onTelegramAuth;
    };
  }, [botUsername, onAuth]);

  return (
    <div className="flex justify-center w-full min-h-[40px] items-center">
      <div ref={containerRef} id="telegram-login-container" />
    </div>
  );
}
