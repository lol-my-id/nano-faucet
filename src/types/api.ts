"use client"
export interface ReferralSystemData {
    url: string;
    usersReferred: number;
    totalEarned: number;
    availableToClaim: number;
}

// Dumb API but I can't be bothered to update it, source remains closed for now
export interface FaucetResponse {
    prize: number;
    winnings: number[];
}

export interface NextRollData {
    lastDate: number;
    claimTimeout: number; 
}