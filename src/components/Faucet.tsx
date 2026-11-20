"use client"

import AutoRenewIcon from '@mui/icons-material/Autorenew';
import ScheduleIcon from '@mui/icons-material/Schedule';

import { useCallback, useEffect, useRef, useState } from "react";
import HCaptchaComponent from './HCaptcha';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useFaucet } from '../modules/api';
import {
    formatAmount,
    formatTime,
    getPrizeTier,
    REEL_TIER_COUNT,
    reelTierFilter,
    shortAddress,
} from '../modules/utils';
import { cToast } from './Toast';
import RaffleRoller, { RaffleRollerHandle } from './RaffleRoller';
import { addressAtom, currencyAtom, nextRollAtom } from '../contexts/Provider';
import { useAtom } from 'jotai';

interface LastPrize {
    amount: string;
    currency: string;
    tier: number;
}

export default function FaucetPage() {
    const [currency] = useAtom(currencyAtom);
    const [address] = useAtom(addressAtom);
    const [nextRoll, setNextRoll] = useAtom(nextRollAtom);

    const raffleRef = useRef<RaffleRollerHandle | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [captchaPending, setCaptchaPending] = useState(false);
    const [lastPrize, setLastPrize] = useState<LastPrize | null>(null);
    const [refLink, setRefLink] = useState("");
    const captchaRef = useRef<HCaptcha>(null);
    const captchaPendingRef = useRef(false);
    const [, setClockTick] = useState(0);

    const handleRoll = useCallback(async (token?: string) => {
        if (isRolling) return;

        if (!token || typeof token !== 'string' || token.length === 0) {
            const cooldownActive = nextRoll
                ? nextRoll.claimTimeout - Math.floor((Date.now() - new Date(nextRoll.lastDate).getTime()) / 1000) > 0
                : false;

            if (captchaPendingRef.current || cooldownActive) return;
            captchaPendingRef.current = true;
            setCaptchaPending(true);
            captchaRef.current?.execute();
            return;
        }

        captchaPendingRef.current = false;
        setCaptchaPending(false);

        const roller = raffleRef.current;
        if (!roller || roller.isRolling()) return;

        setIsRolling(true);
        setLastPrize(null);
        roller.start();

        try {
            const data = await useFaucet(address ?? "", token, refLink);
            const tier = getPrizeTier(data.prize, data.winnings);

            // The reel keeps spinning until the request settles, then lands
            // on the card that matches the payout size.
            await roller.land(tier);

            const amount = formatAmount(data.prize);
            setLastPrize({ amount, currency, tier });
            setNextRoll({
                lastDate: Date.now(),
                claimTimeout: nextRoll?.claimTimeout ?? 45 * 60,
            });
            cToast.success(`Received ${amount} ${currency}`);
        } catch (error) {
            roller.reset();
            const message = typeof error === "string" && error.trim().length > 0
                ? error.trim()
                : "Couldn't reach the faucet. Try again in a moment.";
            cToast.error(message);
        } finally {
            setIsRolling(false);
            captchaPendingRef.current = false;
            setCaptchaPending(false);
            // hCaptcha tokens are single-use; reset so the next spin works.
            captchaRef.current?.resetCaptcha();
        }
    }, [address, currency, isRolling, nextRoll, refLink, setNextRoll]);

    useEffect(() => {
        const storedRef = localStorage.getItem("ref");
        if (storedRef) setRefLink(storedRef);
    }, []);

    // Re-render once a second while a cooldown is active. The remaining time
    // itself is derived from the timestamp on render, so the button never
    // briefly shows "Spin now" while the data is settling.
    useEffect(() => {
        if (!nextRoll) return;
        const timer = setInterval(() => setClockTick((tick) => tick + 1), 1000);
        return () => clearInterval(timer);
    }, [nextRoll]);

    const lastRollDate = nextRoll ? new Date(nextRoll.lastDate).getTime() : 0;
    const nextRollDisplay = nextRoll
        ? Math.min(
            nextRoll.claimTimeout,
            Math.max(0, nextRoll.claimTimeout - Math.floor((Date.now() - lastRollDate) / 1000)),
        )
        : 0;

    const coolingDown = nextRollDisplay > 0;
    const rollDisabled = isRolling || captchaPending || coolingDown;
    const rollLabel = isRolling
        ? "Spinning…"
        : captchaPending
            ? "Verifying…"
            : coolingDown
                ? `Next spin in ${formatTime(nextRollDisplay)}`
                : "Spin now";

    const statusText = captchaPending
        ? "Verifying captcha"
        : isRolling
            ? "Spinning"
            : coolingDown
                ? `Next spin in ${formatTime(nextRollDisplay)}`
                : "Ready to spin";

    const cardImage = `/images/cards/${currency.toLowerCase()}.png`;

    return (
        <div className="flex flex-col gap-5 sm:gap-6">
            <header className="mx-auto max-w-xl text-center">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Faucet</h1>
                <p className="mt-1.5 text-sm leading-6 text-base-content/55">
                    One spin every 45 minutes. Prizes are sent to your wallet as
                    soon as the reel stops.
                </p>
            </header>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[13px] text-base-content/55">
                <span>
                    Wallet{' '}
                    <span className="font-mono text-base-content/75">
                        {shortAddress(address, 6)}
                    </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                    Currency{' '}
                    <img
                        src={cardImage}
                        alt=""
                        className="h-4 w-4 rounded-full object-cover"
                        draggable={false}
                    />
                    <span className="font-semibold text-base-content/75">{currency}</span>
                </span>
                <span
                    className={
                        isRolling || captchaPending
                            ? 'text-primary'
                            : coolingDown
                                ? 'text-base-content/55'
                                : 'text-success'
                    }
                >
                    {statusText}
                </span>
            </div>

            <section className="rounded-lg border border-white/[0.07] bg-base-200/55 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-sm font-semibold">Reward reel</h2>
                    <p className="text-[11px] text-base-content/55">
                        Brighter card = bigger payout
                    </p>
                </div>

                <RaffleRoller
                    ref={raffleRef}
                    cards={[cardImage]}
                />

                <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-2">
                    <div aria-live="polite">
                        {lastPrize ? (
                            <p className="text-sm text-base-content/70">
                                Payout{' '}
                                <strong className="font-semibold text-base-content">
                                    {lastPrize.amount} {lastPrize.currency}
                                </strong>
                                {lastPrize.tier === REEL_TIER_COUNT - 1 && (
                                    <span className="ml-2 text-xs font-semibold text-primary">
                                        Top prize
                                    </span>
                                )}
                            </p>
                        ) : (
                            <p className="text-[13px] text-base-content/55">
                                {isRolling
                                    ? "Waiting for the payout…"
                                    : captchaPending
                                        ? "Waiting for captcha verification…"
                                        : coolingDown
                                            ? "Cooldown active."
                                            : "Spin to see your payout."}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1" aria-hidden="true">
                        {Array.from({ length: REEL_TIER_COUNT }, (_, tier) => (
                            <img
                                key={tier}
                                src={cardImage}
                                alt=""
                                className="h-4 w-4 rounded-sm object-contain"
                                style={{ filter: reelTierFilter(tier) }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <div className="mx-auto flex w-full max-w-sm flex-col gap-3">
                <HCaptchaComponent
                    onVerify={handleRoll}
                    captchaRef={captchaRef}
                    onClose={() => {
                        captchaPendingRef.current = false;
                        setCaptchaPending(false);
                    }}
                    onError={() => {
                        captchaPendingRef.current = false;
                        setCaptchaPending(false);
                        cToast.error("Captcha verification failed. Try again.");
                    }}
                    onExpire={() => {
                        captchaPendingRef.current = false;
                        setCaptchaPending(false);
                    }}
                />

                <button
                    type="button"
                    onClick={() => handleRoll()}
                    disabled={rollDisabled}
                    className="btn btn-primary h-11 min-h-11 w-full gap-2 rounded-lg text-sm font-semibold"
                >
                    {isRolling || captchaPending ? (
                        <AutoRenewIcon className="animate-spin" sx={{ fontSize: 18 }} />
                    ) : coolingDown ? (
                        <ScheduleIcon sx={{ fontSize: 17 }} />
                    ) : (
                        <AutoRenewIcon sx={{ fontSize: 18 }} />
                    )}
                    {rollLabel}
                </button>

                <p className="text-center text-xs leading-5 text-base-content/50">
                    Payout address: <span className="font-mono text-base-content/65">{shortAddress(address, 8)}</span>
                </p>
            </div>
        </div>
    );
}
