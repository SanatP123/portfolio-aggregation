"use client";

import { useState } from "react";

type PlaidLinkHandler = {
  open: () => void;
  exit: () => void;
};

type PlaidCreateOptions = {
  token: string;
  onSuccess: (publicToken: string, metadata: PlaidSuccessMetadata) => void;
  onExit?: (error: PlaidLinkError | null, metadata: unknown) => void;
};

type PlaidSuccessMetadata = {
  institution?: {
    name?: string;
    institution_id?: string;
  } | null;
  accounts?: Array<{
    id: string;
    name: string;
    type: string;
    subtype: string;
  }>;
};

type PlaidLinkError = {
  error_code?: string;
  error_message?: string;
};

declare global {
  interface Window {
    Plaid?: {
      create: (options: PlaidCreateOptions) => PlaidLinkHandler;
    };
  }
}

let plaidScriptPromise: Promise<void> | null = null;

function loadPlaidScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Plaid) return Promise.resolve();

  if (!plaidScriptPromise) {
    plaidScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"]');
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve());
        existingScript.addEventListener("error", () => reject(new Error("Failed to load Plaid Link.")));
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.plaid.com/link/v2/stable/link-initialize.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Plaid Link."));
      document.body.appendChild(script);
    });
  }

  return plaidScriptPromise;
}

export default function ConnectPlaidButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConnect() {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/plaid/create-link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create Plaid link token.");
      }

      await loadPlaidScript();
      if (!window.Plaid) {
        throw new Error("Plaid Link did not load.");
      }

      const handler = window.Plaid.create({
        token: payload.linkToken,
        onSuccess: async (publicToken, metadata) => {
          setIsLoading(true);
          setMessage("Finishing secure Plaid connection...");

          try {
            const exchangeResponse = await fetch("/api/plaid/exchange-public-token", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                publicToken,
                institution: metadata.institution ?? null,
              }),
            });

            const exchangePayload = await exchangeResponse.json();
            if (!exchangeResponse.ok) {
              throw new Error(exchangePayload.error ?? "Unable to store Plaid connection.");
            }

            setMessage(`Connected ${exchangePayload.connection.institution_name}. Syncing holdings...`);

            const syncResponse = await fetch("/api/plaid/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                connectionId: exchangePayload.connection.id,
              }),
            });

            const syncPayload = await syncResponse.json();
            if (!syncResponse.ok) {
              throw new Error(syncPayload.error ?? "Plaid connected, but sync failed.");
            }

            const warningText = syncPayload.warnings?.length
              ? ` ${syncPayload.warnings[0]}`
              : "";

            setMessage(`Synced ${syncPayload.syncedHoldings} holdings.${warningText}`);
            window.location.reload();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Unable to store Plaid connection.");
          } finally {
            setIsLoading(false);
          }
        },
        onExit: (error) => {
          if (error) {
            setMessage(error.error_message ?? "Plaid Link exited with an error.");
          }
        },
      });

      handler.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to open Plaid Link.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleConnect}
        disabled={isLoading}
        className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? "Connecting..." : "Connect Plaid"}
      </button>
      {message ? <p className="max-w-xs text-right text-xs text-stone-500">{message}</p> : null}
    </div>
  );
}
