"use client"
import AutoRenewIcon from '@mui/icons-material/Autorenew';

import { useState, useEffect, useRef } from "react";
import HCaptchaComponent from './HCaptcha';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useFaucet } from '../modules/api';
import { formatTime } from '../modules/utils';
import { cToast } from './Toast';
import RaffleRoller from './RaffleRoller';
import Card from './Card';
import { addressAtom, currencyAtom, nextRollAtom } from '../contexts/Provider';
import { useAtom } from 'jotai';

export default function FaucetPage() {
    // Doesn't feel right to do it this way
    const [[currency], [address]] = [useAtom(currencyAtom), useAtom(addressAtom)];
    const [nextRoll, setNextRoll] = useAtom(nextRollAtom);

    const raffleRef = useRef<{ isRolling: () => boolean, roll: () => void } | null>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [nextRollDisplay, setNextRollDisplay] = useState(0);
    const [refLink, setRefLink] = useState("");
    const captchaRef = useRef<HCaptcha>(null);

    const handleRoll = (token?: string) => {
        if (!token || typeof token !== 'string' || token.length === 0) {
            captchaRef.current?.execute();
            return;
        }

        if(!raffleRef.current) return;
        if(raffleRef.current.isRolling()) return;
        raffleRef.current.roll();
        
        useFaucet(address ?? "", token ?? "", refLink).then((data) => {
            setIsRolling(false);
            if(nextRoll) setNextRoll({ ...nextRoll, lastDate: Date.now() });
            
            setTimeout(() => {
                cToast.success(`You won ${data.prize} ${currency}`);
            }, 2500);
        }).catch((data: string) => {
            setIsRolling(false);
            cToast.error(data);
        });
    };

    useEffect(() => {
        const lRefLink = localStorage.getItem("ref");
        if (lRefLink) setRefLink(lRefLink);
    }, []);

    // Countdown timer
    useEffect(() => {
        if (!nextRoll) return;

        const now = new Date().getTime();
        const last = new Date(nextRoll.lastDate).getTime();

        const diff = now - last;
        const nextRollTime = nextRoll.claimTimeout - Math.floor(diff/1000);

        setNextRollDisplay(nextRollTime);

        if(nextRollTime > 0) {
            const timer = setInterval(() => {
                setNextRollDisplay(prev => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        return 45 * 60; // Reset to 45 minutes if needed
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [nextRoll]); // Add nextRollDisplay to the dependency array
    
    return (
        <div className="flex flex-col gap-8 animate-fade-in">
        {/* Main Roll Section */}
        <div className="hero bg-base-100 rounded-xl overflow-x-auto p-6">
            <div className="hero-content text-center w-full flex flex-col gap-6">
            <h2 className="text-4xl font-bold">
                <span className="text-primary">Faucet</span>
                {nextRoll && <div className="text-lg mt-2 opacity-70">
                Spin every 45 minutes - Next spin in: {nextRollDisplay > 0 ? formatTime(nextRollDisplay) : "Available"}
                </div>}
            </h2>

            {/* Rolling Animation */}
            <RaffleRoller ref={raffleRef} targetIndex={10} duration={3000} cards={[`images/${currency.toLowerCase()}.png`]} />

            {/* Captcha & Roll Button */}
            <div className="flex flex-col gap-4 w-full max-w-md">
                <HCaptchaComponent onVerify={handleRoll} captchaRef={captchaRef} />

                <button 
                className={`btn gap-2 text-lg transition-transform btn-primary hover:scale-105
                    ${(nextRoll && (isRolling || nextRollDisplay > 0)) ? 'btn-disabled' : ''}`}
                onClick={()=>handleRoll()}
                >
                <AutoRenewIcon className={`${isRolling ? 'loading  loading-infinity loading-lg' : ''}`} />
                {isRolling ? "ROLLING..." : "ROLL NOW"}
                </button>
            </div>
            </div>
        </div>
        </div>
    );
}