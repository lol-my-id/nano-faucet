"use client"
import { useEffect, useRef, useState } from "react";

import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { getCurrencyFromAddress, validateNanoAddress } from "../modules/utils";
import { cToast } from "./Toast";

import { useAtom } from 'jotai';
import { addressAtom } from '../contexts/Provider';

interface NanoAddressModalProps {
  setVisible: (visible: boolean) => void;
}

const NanoAddressModal: React.FC<NanoAddressModalProps> = ({ setVisible }) => {
    const [address, setAddress] = useAtom(addressAtom);
    const [tempAddress, setTempAddress] = useState(address ?? "");
    const inputRef = useRef<HTMLInputElement>(null);

    const trimmed = tempAddress.trim();
    const isValid = validateNanoAddress(trimmed);
    const detectedCurrency = trimmed.includes("_") ? getCurrencyFromAddress(trimmed) : null;

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setVisible(false);
        };

        window.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const input = inputRef.current;
        if (input) {
            input.focus();
            input.setSelectionRange(0, input.value.length);
        }

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [setVisible]);

    const handleSave = () => {
        if (!isValid) {
            cToast.error("That doesn't look like a valid wallet address");
            return;
        }

        setAddress(trimmed);
        setVisible(false);
        cToast.success("Wallet connected");
    };

    const handleDisconnect = () => {
        setAddress(null);
        setVisible(false);
        cToast.info("Wallet disconnected");
    };

    return (
        <div
            className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) setVisible(false);
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="wallet-modal-title"
                className="w-full max-w-md rounded-xl border border-white/10 bg-base-100 p-5"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="wallet-modal-title" className="text-lg font-bold tracking-tight">
                            {address ? "Your wallet" : "Connect your wallet"}
                        </h2>
                        <p className="mt-1 text-[13px] leading-5 text-base-content/55">
                            Enter a wallet address to receive payouts. It stays
                            in this browser.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        aria-label="Close wallet dialog"
                        className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-base-content/45 hover:bg-base-300 hover:text-base-content"
                    >
                        <CloseIcon sx={{ fontSize: 18 }} />
                    </button>
                </div>

                <label htmlFor="nano-address" className="mt-5 block text-sm font-semibold">
                    Wallet address
                </label>
                <input
                    id="nano-address"
                    ref={inputRef}
                    type="text"
                    spellCheck={false}
                    autoComplete="off"
                    placeholder="nano_…, xdg_…, or ban_…"
                    value={tempAddress}
                    onChange={(event) => setTempAddress(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") handleSave();
                    }}
                    className="input mt-2 h-10 min-h-10 w-full rounded-lg border border-white/[0.08] bg-base-200 px-3 font-mono text-xs text-base-content/85 placeholder:text-base-content/25 focus:border-primary/50 focus:outline-none"
                />

                <div className="mt-2 flex min-h-5 items-center gap-1.5 text-xs">
                    {trimmed.length === 0 ? (
                        <span className="text-base-content/45">Nano, DogeNano, and Banano addresses are supported.</span>
                    ) : isValid ? (
                        <>
                            <CheckCircleIcon sx={{ fontSize: 14 }} className="text-success" />
                            <span className="text-success/80">
                                Valid {detectedCurrency ?? "Nano"} address
                            </span>
                        </>
                    ) : (
                        <span className="text-error/80">That address doesn&apos;t look right</span>
                    )}
                </div>

                <div className="mt-5 flex gap-2">
                    <button
                        type="button"
                        onClick={() => setVisible(false)}
                        className="btn h-10 min-h-10 flex-1 rounded-lg border border-white/10 bg-transparent text-sm font-semibold text-base-content/65 shadow-none hover:border-white/20 hover:bg-base-300 hover:text-base-content"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="btn btn-primary h-10 min-h-10 flex-1 gap-1.5 rounded-lg text-sm font-semibold"
                    >
                        <SaveIcon sx={{ fontSize: 16 }} />
                        Save
                    </button>
                </div>

                {address && (
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-error/70 hover:text-error"
                    >
                        <LinkOffIcon sx={{ fontSize: 14 }} />
                        Disconnect wallet
                    </button>
                )}
            </div>
        </div>
    );
};

export default NanoAddressModal;
