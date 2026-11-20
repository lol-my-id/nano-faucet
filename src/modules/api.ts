"use client"

import { FaucetResponse, NextRollData, ReferralSystemData } from "../types/api";
const API_URL = process.env.WAKU_PUBLIC_API_URL;

function invoke(method: string, endpoint: string, body?: any, headers?: any): Promise<Response> {
    return fetch(`${API_URL}/${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(headers ?? {})
        },
        body: method != "GET" ? JSON.stringify(body) : null
    });
}

async function errorMessage(response: Response, fallback: string) {
    try {
        const text = (await response.text()).trim();
        if (!text) return fallback;

        try {
            const data = JSON.parse(text) as { error?: unknown };
            const code = typeof data.error === "string" ? data.error : "";
            const messages: Record<string, string> = {
                INVALID_ADDRESS: "That wallet address is not valid.",
                FAUCET_UNAVAILABLE: "This faucet is temporarily unavailable.",
                FAILED: "The faucet couldn't complete the payout. Try again in a moment.",
                CAPTCHA: "Captcha verification failed. Try again.",
            };
            return messages[code] ?? fallback;
        } catch {
            return text;
        }
    } catch {
        return fallback;
    }
}

export function useFaucet(address: string, captcha: string, referral?: string): Promise<FaucetResponse> {
    return new Promise((resolve, reject) => {
        invoke('GET', `faucet/${address}`, {}, { captcha, ref: referral })
            .then(async (response) => {
                if (!response.ok) {
                    reject(await errorMessage(response, "Unable to claim from the faucet"));
                    return;
                }
                resolve(await response.json() as FaucetResponse);
            })
            .catch(reject);
    });
}

export function getReferralData(address: string): Promise<ReferralSystemData> {
    return new Promise((resolve, reject) => {
        invoke('GET', `ref/${address}`)
            .then(async (response) => {
                if (!response.ok) {
                    reject(await errorMessage(response, "Unable to load referral data"));
                    return;
                }
                const data = await response.json();
                if (data == undefined) {
                    reject("Unable to load referral data");
                    return;
                }
                resolve(data as ReferralSystemData);
            })
            .catch(reject);
    });
}

export function getNextRollData(address: string): Promise<NextRollData> {
    return new Promise((resolve, reject) => {
        invoke('GET', `faucet/${address}/when`)
            .then(async (response) => {
                if (!response.ok) {
                    reject(await errorMessage(response, "Unable to load the next spin time"));
                    return;
                }
                const data = await response.json();
                if (data == undefined) {
                    reject("Unable to load the next spin time");
                    return;
                }
                resolve(data as NextRollData);
            })
            .catch(reject);
    });
}

export function claimReferral(address: string, captcha: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        invoke('POST', `ref/${address}/claim`, {}, { captcha })
            .then(async (response) => {
                if (!response.ok) {
                    reject(await errorMessage(response, "Unable to claim referral earnings"));
                    return;
                }
                resolve(true);
            })
            .catch(reject);
    });
}
