"use client";

import { useEffect, useState } from "react";
import { fetchPortfolioSummary, type ApiConnection } from "@/src/db/portfolioApi";
import { useUser } from "@/src/hooks/useUser";

type PlaidLinkHandler = {
  open: () => void;
  exit: () => void;
};

type PlaidCreateOptions = {
  token: string;
  onSuccess: () => void;
  onExit?: (error: { error_message?: string } | null, metadata: unknown) => void;
};

let plaidScriptPromise: Promise<void> | null = null;

function getPlaidWindow() {
  return window as Window & {
    Plaid?: {
      create: (options: PlaidCreateOptions) => PlaidLinkHandler;
    };
  };
}

function loadPlaidScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (getPlaidWindow().Plaid) return Promise.resolve();

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

export default function ConnectedAccounts() {
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId, isLoaded, isSignedIn } = useUser();

  async function loadConnections() {
    const data = await fetchPortfolioSummary();
    setConnections(data.connections);
  }

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    loadConnections().catch((err) => {
      setError(err instanceof Error ? err.message : "Unable to load connections.");
    });
  }, [isSignedIn, userId]);

  async function syncNow(connectionId?: string) {
    setIsSyncing(true);
    setActiveConnectionId(connectionId ?? null);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/plaid/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(connectionId ? { connectionId } : {}),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to sync Plaid accounts.");
      }

      setMessage(`Synced ${payload.syncedHoldings} holdings and ${payload.syncedTransactions} transactions.`);
      await loadConnections();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sync Plaid accounts.");
    } finally {
      setIsSyncing(false);
      setActiveConnectionId(null);
    }
  }

  async function reconnect(connectionId: string) {
    setActiveConnectionId(connectionId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/plaid/create-update-link-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ connectionId }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to create update link token.");

      await loadPlaidScript();
      const plaidWindow = getPlaidWindow();
      if (!plaidWindow.Plaid) throw new Error("Plaid Link did not load.");

      const handler = plaidWindow.Plaid.create({
        token: payload.linkToken,
        onSuccess: async () => {
          setMessage("Connection refreshed. Syncing latest data...");
          await syncNow(connectionId);
        },
        onExit: (linkError) => {
          if (linkError) setError(linkError.error_message ?? "Plaid update mode exited with an error.");
        },
      });

      handler.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reconnect account.");
    } finally {
      setActiveConnectionId(null);
    }
  }

  async function disconnect(connectionId: string) {
    setActiveConnectionId(connectionId);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Unable to disconnect account.");

      setMessage("Connection disconnected.");
      await loadConnections();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to disconnect account.");
    } finally {
      setActiveConnectionId(null);
    }
  }

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="dashboard-card">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow">Connected accounts</p>
          <h2 className="card-title">Brokerage links</h2>
        </div>
        <button
          type="button"
          onClick={() => syncNow()}
          disabled={isSyncing || connections.every((connection) => connection.provider !== "plaid")}
          className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-stone-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {isSyncing && !activeConnectionId ? "Syncing..." : "Sync all"}
        </button>
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {message ? <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p> : null}

      {connections.length > 0 ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {connections.map((connection) => (
            <article key={connection.id} className="rounded-3xl border border-stone-200/80 bg-white/55 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-stone-950">{connection.institution_name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    {connection.provider}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                  {connection.status}
                </span>
              </div>
              <p className="mt-5 text-sm text-stone-500">
                Last synced: {connection.last_synced_at ? new Date(connection.last_synced_at).toLocaleString() : "Never"}
              </p>
              {connection.provider === "plaid" ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  <button className="rounded-full bg-stone-950 px-3 py-2 text-xs font-bold text-white disabled:opacity-50" type="button" onClick={() => syncNow(connection.id)} disabled={activeConnectionId === connection.id}>
                    Sync
                  </button>
                  <button className="rounded-full border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-700 disabled:opacity-50" type="button" onClick={() => reconnect(connection.id)} disabled={activeConnectionId === connection.id}>
                    Reconnect
                  </button>
                  <button className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50" type="button" onClick={() => disconnect(connection.id)} disabled={activeConnectionId === connection.id}>
                    Disconnect
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-stone-600">No connected brokerage accounts yet.</p>
      )}
    </div>
  );
}
