"use client"

import HCaptchaComponent from "./HCaptcha";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import { useEffect, useRef, useState } from "react";
import { claimReferral } from "../modules/api";
import { cToast } from "./Toast";
import { useAtom } from "jotai";
import { addressAtom, currencyAtom, referralDataAtom } from "../contexts/Provider";
import { formatAmount, referralLink } from "../modules/utils";
import type { ReferralSystemData } from "../types/api";

// Preview-only fixture. It is never used unless the page is opened with
// ?mock=referrals and the live API has not supplied real referral data.
const MOCK_REFERRAL_DATA: ReferralSystemData = {
    url: "68600a30e0ee72cdfc091e00",
    usersReferred: 27,
    totalEarned: 0.018412,
    availableToClaim: 0.00356,
};

const Referrals: React.FC = () => {
    const [isClaiming, setIsClaiming] = useState(false);
    const [copied, setCopied] = useState(false);
    const [previewData, setPreviewData] = useState(false);
    const [currency] = useAtom(currencyAtom);
    const [address] = useAtom(addressAtom);
    const [referralData, setReferralData] = useAtom(referralDataAtom);

    const captchaRef = useRef<HCaptcha>(null);
    const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        setPreviewData(new URLSearchParams(window.location.search).get("mock") === "referrals");

        return () => {
            if (copyTimer.current) clearTimeout(copyTimer.current);
        };
    }, []);

    const isMock = !referralData && previewData;
    const data = referralData ?? (isMock ? MOCK_REFERRAL_DATA : null);
    const link = data ? referralLink(data.url) : "";

    const handleCopy = async () => {
        if (!link) return;
        try {
            await navigator.clipboard.writeText(link);
            setCopied(true);
            cToast.success("Referral link copied");
            if (copyTimer.current) clearTimeout(copyTimer.current);
            copyTimer.current = setTimeout(() => setCopied(false), 2000);
        } catch {
            cToast.error("Couldn't copy the link");
        }
    };

    const handleReferralClaim = (token?: string) => {
        if (isMock) {
            cToast.info("Sample referral data — claiming is disabled in preview mode");
            return;
        }

        if (!token || typeof token !== 'string' || token.length === 0) {
            captchaRef.current?.execute();
            return;
        }

        if (!referralData || referralData.availableToClaim <= 0 || isClaiming) return;

        setIsClaiming(true);
        claimReferral(address ?? "", token).then(() => {
            setIsClaiming(false);
            cToast.success("Referral earnings claimed");
            setReferralData({ ...referralData, availableToClaim: 0 });
        }).catch((error) => {
            setIsClaiming(false);
            const message = typeof error === "string" && error.trim().length > 0
                ? error.trim()
                : "Couldn't claim referral earnings";
            cToast.error(message);
        });
    };

    return (
        <div className="flex flex-col gap-5 sm:gap-6">
            <header className="mx-auto max-w-xl text-center">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Referrals</h1>
                <p className="mt-1.5 text-sm leading-6 text-base-content/55">
                    Share your link and earn 20% of the rewards from every wallet
                    you refer. Earnings collect here until you claim them.
                </p>
            </header>

            {data ? (
                <>
                    <section className="w-full">
                        <label
                            htmlFor="referral-link"
                            className="text-sm font-semibold"
                        >
                            Referral link
                        </label>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                            <input
                                id="referral-link"
                                type="text"
                                readOnly
                                value={link}
                                onClick={(event) => event.currentTarget.select()}
                                className="input h-10 min-h-10 w-full rounded-lg border border-white/[0.08] bg-base-100 px-3 font-mono text-xs text-base-content/70 focus:border-primary/50 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="btn h-10 min-h-10 shrink-0 gap-1.5 rounded-lg border border-white/10 bg-base-100 px-3 text-xs font-semibold text-base-content/70 shadow-none hover:border-white/20 hover:bg-base-300 hover:text-base-content"
                            >
                                {copied ? (
                                    <CheckIcon sx={{ fontSize: 15 }} className="text-success" />
                                ) : (
                                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                                )}
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </section>

                    <section className="w-full rounded-lg border border-white/[0.07] bg-base-200/55">
                        <dl className="grid grid-cols-2 divide-white/[0.07] sm:grid-cols-4 sm:divide-x">
                            <div className="border-b border-white/[0.07] p-4 sm:border-b-0">
                                <dt className="text-xs text-base-content/55">Users referred</dt>
                                <dd className="mt-1.5 text-lg font-bold">
                                    {data.usersReferred.toLocaleString()}
                                </dd>
                            </div>
                            <div className="border-b border-white/[0.07] p-4 sm:border-b-0">
                                <dt className="text-xs text-base-content/55">Total earned</dt>
                                <dd className="mt-1.5 break-words text-lg font-bold">
                                    {formatAmount(data.totalEarned)} {currency}
                                </dd>
                            </div>
                            <div className="p-4">
                                <dt className="text-xs text-base-content/55">Available</dt>
                                <dd className="mt-1.5 break-words text-lg font-bold text-secondary">
                                    {formatAmount(data.availableToClaim)} {currency}
                                </dd>
                            </div>
                            <div className="p-4">
                                <dt className="text-xs text-base-content/55">Commission</dt>
                                <dd className="mt-1.5 text-lg font-bold">20%</dd>
                            </div>
                        </dl>
                    </section>

                    <section className="flex w-full flex-col gap-4 rounded-lg border border-white/[0.07] bg-base-200/55 p-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold">Claim referral earnings</p>
                            <p className="mt-1 text-xs leading-5 text-base-content/55">
                                Available balance: {formatAmount(data.availableToClaim)} {currency}
                            </p>
                        </div>
                        <div className="flex w-full flex-col gap-3 sm:w-56">
                            <HCaptchaComponent onVerify={handleReferralClaim} captchaRef={captchaRef} />
                            <button
                                type="button"
                                disabled={isClaiming || data.availableToClaim <= 0}
                                onClick={() => handleReferralClaim()}
                                className="btn btn-secondary h-10 min-h-10 w-full gap-2 rounded-lg text-sm font-semibold"
                            >
                                {isClaiming ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <MonetizationOnIcon sx={{ fontSize: 17 }} />
                                )}
                                {isClaiming ? "Claiming…" : "Claim"}
                            </button>
                        </div>
                    </section>
                </>
            ) : (
                <div className="w-full rounded-lg border border-dashed border-white/[0.09] bg-base-200/55 px-6 py-10">
                    <h2 className="text-sm font-semibold">No referral data yet</h2>
                    <p className="mt-1.5 max-w-md text-[13px] leading-6 text-base-content/55">
                        Spin once with your wallet connected, then come back here.
                        Your link and earnings will appear after that first spin.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Referrals;
