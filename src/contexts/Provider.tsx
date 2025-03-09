"use client"
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';
import { NextRollData, ReferralSystemData } from '../types/api';
import { ADDRESS_STORAGE_NAME, getCurrencyFromAddress, validateNanoAddress } from '../modules/utils';
import { getNextRollData, getReferralData } from '../modules/api';
import { cToast } from '../components/Toast';

// Atom to store address from localStorage
export const addressAtom = atomWithStorage<string | null>(ADDRESS_STORAGE_NAME, null);

// Atom to store Referral data
export const referralDataAtom = atom<ReferralSystemData | null>(null);

// Atom to store next available roll time
export const nextRollAtom = atom<NextRollData | null>(null);

// Atom to store currency
export const currencyAtom = atom<string>("XNO");

// Provider component to initialize data
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
    const [address, setAddress] = useAtom(addressAtom);
    const [, setReferralData] = useAtom(referralDataAtom);
    const [, setNextRoll] = useAtom(nextRollAtom);
    const [, setCurrency] = useAtom(currencyAtom);

    useEffect(() => {
        if (address && validateNanoAddress(address)) {
            Promise.allSettled([
                getReferralData(address),
                getNextRollData(address)
            ]).then(([referralData, nextRollData]) => {
                // Handle referral data
                if (referralData.status === 'fulfilled') {
                    setReferralData(referralData.value);
                } // No Toast since that probably means the user is first time user
        
                // Handle next roll data
                console.log("nextRollData", nextRollData);
                if (nextRollData.status === 'fulfilled') {
                    setNextRoll(nextRollData.value);
                } else cToast.error("Failed to fetch next roll data");
            });
            setCurrency(getCurrencyFromAddress(address));
        }
    }, [address, setAddress, setReferralData, setNextRoll, setCurrency]);

  return <>{children}</>;
};