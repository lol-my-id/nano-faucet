"use client"
import isValid from 'nano-address-validator';

export const PROTECTED_TABS = ["faucet", "referrals"]
export const ADDRESS_STORAGE_NAME = "address";

export const referralLink = (id: string) => `https://${process.env.WAKU_PUBLIC_DOMAIN}/r/${id}`;
export const convertIntoNanoAddress = (address: string) => `nano_${address.split("_")?.[1]}`;
export const validateNanoAddress = (address: string) => isValid(convertIntoNanoAddress(address));
export const getCurrencyFromAddress = (address: string): string => {
    const currency = address.split("_")?.[0];
    return currency === "nano" ? "XNO" : currency?.toUpperCase() ?? "XNO";
};

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};