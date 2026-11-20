"use client"
import { useCallback, useEffect, useState } from "react";

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Navigation } from "./Navigation";
import Home from "./Home";
import Faucet from "./Faucet";
import Referrals from "./Referrals";
import NanoAddressModal from "./ConnectWalletModal";
import { useAtom } from "jotai";
import { addressAtom } from "../contexts/Provider";
import { PROTECTED_TABS, shortAddress, validateNanoAddress } from "../modules/utils";
import { cToast } from "./Toast";

const TABS = ["home", "faucet", "referrals"] as const;
type Tab = (typeof TABS)[number];

const isTab = (value: string): value is Tab =>
    (TABS as readonly string[]).includes(value);

export const Layout = () => {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [walletOpen, setWalletOpen] = useState(false);
    const [storageReady, setStorageReady] = useState(false);
    const [address] = useAtom(addressAtom);
    const connected = validateNanoAddress(address ?? "");
    const domain = process.env.WAKU_PUBLIC_DOMAIN ?? "nano.lol.my.id";

    // atomWithStorage reads localStorage on mount. Wait for that before
    // validating a deep-linked protected tab, otherwise a saved wallet looks
    // disconnected for one render and gets bounced to home.
    useEffect(() => {
        setStorageReady(true);
    }, []);

    const navigate = useCallback((tab: string) => {
        const nextTab: Tab = isTab(tab) ? tab : 'home';

        if (PROTECTED_TABS.includes(nextTab) && !connected) {
            setWalletOpen(true);
            cToast.info("Connect your wallet to continue");
            return;
        }

        if (window.location.hash === `#${nextTab}`) {
            setActiveTab(nextTab);
        } else {
            window.location.hash = nextTab;
        }

        window.scrollTo({ top: 0 });
    }, [connected]);

    // Restore the tab from the URL on load and keep it in sync with the hash.
    useEffect(() => {
        if (!storageReady) return;

        const syncFromHash = () => {
            const raw = window.location.hash.replace(/^#\/?/, "");
            if (!isTab(raw)) {
                window.history.replaceState(null, "", "#home");
                setActiveTab('home');
                return;
            }

            if (PROTECTED_TABS.includes(raw) && !connected) {
                window.history.replaceState(null, "", "#home");
                setActiveTab('home');
                setWalletOpen(true);
                cToast.info("Connect your wallet to open this tab");
                return;
            }

            setActiveTab(raw);
        };

        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);

        return () => {
            window.removeEventListener('hashchange', syncFromHash);
        };
    }, [connected, storageReady]);

    // Never leave a protected tab visible after disconnecting.
    useEffect(() => {
        if (storageReady && !connected && PROTECTED_TABS.includes(activeTab)) {
            setActiveTab('home');
            window.history.replaceState(null, "", "#home");
        }
    }, [connected, activeTab]);

    return (
      <div className="flex min-h-dvh flex-col items-center bg-base-200 px-3 sm:px-4">
        <header className="flex w-full max-w-4xl flex-col items-center gap-3 pt-6 sm:gap-4 sm:pt-8">
          <button
            type="button"
            onClick={() => navigate('home')}
            aria-label="Go to the home page"
            className="flex items-center py-1"
          >
            <img
              src="/images/logo.png"
              className="h-9 w-auto select-none sm:h-12"
              alt="NANO Faucet"
              draggable={false}
            />
          </button>

          <div className="flex w-full max-w-sm flex-col items-stretch rounded-lg border border-white/[0.07] bg-base-100 p-1 sm:w-auto sm:max-w-none sm:flex-row sm:items-center">
            <Navigation activeTab={activeTab} onNavigate={navigate} />
            <div
              aria-hidden="true"
              className="my-1 h-px bg-white/[0.07] sm:mx-1 sm:my-0 sm:h-5 sm:w-px"
            />
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              title={connected && address ? address : "Connect your wallet"}
              className={`btn h-9 min-h-9 w-full gap-1.5 rounded-md px-2.5 text-xs font-semibold sm:w-auto sm:px-3 ${
                connected
                  ? 'border border-transparent bg-transparent text-base-content/65 hover:bg-base-300 hover:text-base-content'
                  : 'btn-primary'
              }`}
              aria-label={connected ? "Wallet connected — open wallet dialog" : "Connect wallet"}
            >
              {connected ? (
                <>
                  <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                  <span className="hidden font-mono sm:inline">{shortAddress(address, 4)}</span>
                  <span className="sm:hidden">Connected</span>
                </>
              ) : (
                <>
                  <AccountBalanceWalletIcon sx={{ fontSize: 16 }} />
                  <span>Connect</span>
                </>
              )}
            </button>
          </div>
        </header>

        <main className="w-full max-w-4xl flex-1 pt-5 sm:pt-6">
          <div className="rounded-xl border border-white/[0.07] bg-base-100 p-4 sm:p-7">
            {activeTab === 'home' && <Home onStart={() => navigate('faucet')} />}
            {activeTab === 'faucet' && <Faucet />}
            {activeTab === 'referrals' && <Referrals />}
          </div>
        </main>

        <footer className="w-full max-w-4xl px-4 py-6 text-center">
          <div className="mx-auto max-w-md border-t border-white/[0.06] pt-5 text-xs leading-5 text-base-content/50">
            <p>
              © {new Date().getFullYear()} {domain} · Project{' '}
              <b className="font-semibold text-base-content/65">barely</b> maintained by{' '}
              <a
                className="font-semibold text-base-content/65 underline decoration-white/15 underline-offset-4 transition-colors hover:text-base-content"
                href="https://github.com/2xxn"
                target="_blank"
                rel="noopener noreferrer"
              >
                2xxn
              </a>
            </p>
          </div>
        </footer>

        {walletOpen && <NanoAddressModal setVisible={setWalletOpen} />}
      </div>
    );
}
