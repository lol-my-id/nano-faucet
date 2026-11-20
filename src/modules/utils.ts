"use client"
import isValid from 'nano-address-validator';

export const PROTECTED_TABS = ["faucet", "referrals"]
export const ADDRESS_STORAGE_NAME = "address";

export const referralLink = (id: string) => `https://${process.env.WAKU_PUBLIC_DOMAIN}/r/${id}`;
export const convertIntoNanoAddress = (address: string) => `nano_${address.split("_")?.[1] ?? ""}`;
export const getCurrencyFromAddress = (address: string): string => {
    const currency = address.split("_")?.[0]?.toLowerCase();
    if (currency === "xdg") return "XDG";
    if (currency === "ban") return "BAN";
    return "XNO";
};
export const validateNanoAddress = (address: string) => {
    const prefix = address.split("_")?.[0]?.toLowerCase();
    // nano, DogeNano and Banano share the same address encoding. Only accept
    // the three prefixes this faucet can pay out to.
    if (prefix !== "nano" && prefix !== "xdg" && prefix !== "ban") return false;
    return isValid(convertIntoNanoAddress(address));
};

export const shortAddress = (address: string | null | undefined, chars = 4) => {
    if (!address) return "";
    const separator = address.indexOf("_");
    if (separator < 0) return address;

    const prefix = address.slice(0, separator);
    const body = address.slice(separator + 1);
    if (body.length <= chars * 2 + 1) return address;
    return `${prefix}_${body.slice(0, chars)}…${body.slice(-chars)}`;
};

export const REEL_TIER_COUNT = 5;

export const reelTierFilter = (tier: number, tierCount = REEL_TIER_COUNT) => {
    if (tierCount <= 1 || tier >= tierCount - 1) return "none";
    const ratio = Math.max(0, Math.min(1, tier / (tierCount - 1)));
    return `grayscale(1) brightness(${(0.34 + ratio * 0.66).toFixed(2)})`;
};

/**
 * The backend returns every possible prize in `winnings` (sorted ascending).
 * Map the prize that was actually paid out onto a 0–4 brightness tier so the
 * reel lands on the card that matches the size of the reward.
 */
export const getPrizeTier = (prize: number, winnings: number[]) => {
    const values = Array.isArray(winnings) ? winnings : [];
    const unique = [...new Set(values.filter((value) => Number.isFinite(value)))]
        .sort((a, b) => a - b);

    if (unique.length === 0) return Math.floor((REEL_TIER_COUNT - 1) / 2);
    if (unique.length === 1) return REEL_TIER_COUNT - 1;

    let closest = 0;
    let closestDistance = Infinity;
    unique.forEach((value, index) => {
        const distance = Math.abs(value - prize);
        if (distance < closestDistance) {
            closest = index;
            closestDistance = distance;
        }
    });

    return Math.round((closest / (unique.length - 1)) * (REEL_TIER_COUNT - 1));
};

export const formatAmount = (amount: number, maxDecimals = 6) => {
    if (!Number.isFinite(amount)) return "0";
    if (amount === 0) return "0";
    if (amount < 0.000001) {
        return amount.toFixed(9).replace(/0+$/, "").replace(/\.$/, "");
    }
    return amount.toLocaleString(undefined, { maximumFractionDigits: maxDecimals });
};

export const formatTime = (seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(safe / 60);
    const secs = safe % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};
