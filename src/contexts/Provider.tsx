"use client"
import { atom, useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { useEffect } from 'react';
import { NextRollData, ReferralData } from '../types/api';
import { ADDRESS_STORAGE_NAME, getCurrencyFromAddress } from '../modules/utils';
import { getNextRollData, getReferralData } from '../modules/api';

// Atom to store address from localStorage
export const addressAtom = atomWithStorage<string | null>(ADDRESS_STORAGE_NAME, null);

// Atom to store Referral data
export const referralDataAtom = atom<ReferralData | null>(null);

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
        const initializeData = () => {
            if (address && address.length > 0) {
                // Fetch referral data and next roll data, not async for better code readability
                getReferralData(address).then(setReferralData).catch(() => setReferralData(null));
                getNextRollData(address).then(setNextRoll).catch(() => setNextRoll(null));
                setCurrency(getCurrencyFromAddress(address));
            }
        };

        initializeData();
    }, [address, setAddress, setReferralData, setNextRoll, setCurrency]);

  return <>{children}</>;
};