"use client"

import { FaucetResponse, NextRollData, ReferralSystemData } from "../types/api";
const API_URL = process.env.WAKU_PUBLIC_API_URL;

function invoke(method: string, endpoint: string, body?: any, headers?: any): Promise<Response> {
    console.log("invoked", method, endpoint, body);
    return fetch(`${API_URL}/${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(headers ?? {})
        },
        body: method != "GET" ? JSON.stringify(body) : null
    });
}

export function useFaucet(address: string, captcha: string, referral?: string): Promise<FaucetResponse> {
    return new Promise((resolve, reject) => {
        invoke('GET', `faucet/${address}`, {}, { captcha, ref: referral }).then(r => {
            if(r.ok) {
                r.json().then(data => resolve(data as FaucetResponse));
                return;
            }

            r.text().then(text => reject(text));
        });
    });
}

export function getReferralData(address: string): Promise<ReferralSystemData> {
    return new Promise((resolve, reject) => {
        invoke('GET', `ref/${address}`).then(r => r.json()).then(data => {
            if (data == undefined) return reject();
            resolve(data as ReferralSystemData);
        }).catch(() => reject());
    });
}

export function getNextRollData(address: string): Promise<NextRollData> {
    return new Promise((resolve, reject) => {
        invoke('GET', `faucet/${address}/when`).then(r => r.json()).then(data => {
            console.log(data);
            if (data == undefined) return reject();
            resolve(data as NextRollData);
        }).catch(() => reject());
    });
}

export function claimReferral(address: string, captcha: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        invoke('POST', `ref/${address}/claim`, {}, { captcha }).then(r => r.json()).then(()=>resolve(true)).catch(() => reject());
    });
}