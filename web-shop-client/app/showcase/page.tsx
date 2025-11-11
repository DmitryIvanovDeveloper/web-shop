"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { container } from "@/infrastructure/bootstrap/container";
import { TYPES } from "@/infrastructure/bootstrap/types";
import { LoadAppConfigFromMessageUseCase } from "@/application/use-cases/load-app-config-from-message.use-case";
import { OffersList } from "@/modules/offers/interface-adapters/ui/components/offers-list";
import { ProductsList } from "@/modules/products/interface-adapters/ui/components/products-list";
import { AuthModule } from "@/modules/authentication/interface-adapters/ui/auth-module";

function ShowcaseContent(): JSX.Element {
  const searchParams = useSearchParams();
  const previewMode = searchParams.get("previewMode") === "true";

  useEffect(() => {
    if (!previewMode) {
      return;
    }

    try {
      const builderOrigin = process.env.NEXT_PUBLIC_BUILDER_URL;
      const isDev = !builderOrigin || builderOrigin.startsWith("http://localhost:");
      const targetOrigin = isDev ? "*" : builderOrigin!;

      setTimeout(() => {
        window.parent?.postMessage({ type: "PREVIEW_READY" }, targetOrigin);
      }, 0);
    } catch (error) {
      console.warn("[Showcase] Failed to notify parent about readiness", error);
    }

    const handleMessage = async (event: MessageEvent) => {
      const allowedOrigin = process.env.NEXT_PUBLIC_BUILDER_URL;
      const isLocalhost = event.origin.startsWith("http://localhost:");
      const isDevelopment = !allowedOrigin || allowedOrigin.startsWith("http://localhost:");

      if (isDevelopment && !isLocalhost) {
        console.warn("[Showcase] Message from untrusted origin (dev mode):", event.origin);
        return;
      }

      if (!isDevelopment && event.origin !== allowedOrigin) {
        console.warn("[Showcase] Message from untrusted origin (prod mode):", event.origin);
        return;
      }

      if (event.data.type === "CONFIG_UPDATE") {
        const config = event.data.payload?.config;
        if (!config) {
          console.warn("[Showcase] Received CONFIG_UPDATE without config payload");
          return;
        }

        try {
          const loadConfigFromMessageUseCase = container.get<LoadAppConfigFromMessageUseCase>(
            TYPES.LoadAppConfigFromMessage
          );
          await loadConfigFromMessageUseCase.execute(config);
        } catch (err) {
          console.error("[Showcase] Failed to process CONFIG_UPDATE", err);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [previewMode]);

  return (
    <div
      className="min-h-screen p-4 sm:p-6 md:p-8 overflow-x-hidden"
      style={{
        background: "var(--color-background, #0D1117)",
        color: "var(--color-text, #FFFFFF)",
        maxWidth: "100vw",
        boxSizing: "border-box"
      }}
    >
      {previewMode && (
        <div className="mb-4 p-2 sm:p-3 bg-blue-900 text-blue-100 rounded-lg text-xs sm:text-sm">
          🔍 Preview Mode - This is a live preview from UI Builder
        </div>
      )}

      <div className="w-full max-w-full mx-auto space-y-8 sm:space-y-12" style={{ overflow: "hidden" }}>
        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: "var(--color-text, #FFFFFF)" }}>
            Special Offers
          </h2>
          <OffersList showPopupOnFirstLoad={false} />
        </div>

        <div className="w-full">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: "var(--color-text, #FFFFFF)" }}>
            Products
          </h2>
          <ProductsList />
        </div>
      </div>

      <AuthModule renderPopupConfig={true} />
    </div>
  );
}

export default function ShowcasePage(): JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Loading showcase...</p>
          </div>
        </div>
      }
    >
      <ShowcaseContent />
    </Suspense>
  );
}
