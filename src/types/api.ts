"use client"
export interface ReferralData {
    link: string;
    earnings: number;
    total: number;
    claim: number;
}

// Dumb API but I can't be bothered to update it, source remains closed for now
export interface FaucetResponse {
    prize: number;
    winnings: number[];
}

export interface NextRollData {
    date: number; // How many seconds from now?
}