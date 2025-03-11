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
            setNextRoll({
                lastDate: Date.now(),
                claimTimeout: nextRoll?.claimTimeout ?? 45 * 60
            });
            
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
            <RaffleRoller ref={raffleRef} targetIndex={40} duration={1000} cards={["images/favicon.png","images/favicon.png","images/favicon.png"]} />

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
        {/* Additional Info */}
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title"><ScheduleIcon /> Recent Wins</h3>
                <div className="space-y-2">
                <div className="flex justify-between">
                    <span>🎉 User123</span>
                    <span className="text-primary">0.45 NANO</span>
                </div>
                <div className="flex justify-between">
                    <span>🎁 CryptoFan</span>
                    <span className="text-primary">12 XDG</span>
                </div>
                </div>
            </div>
            </div>

            <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title">💡 Pro Tip</h3>
                <p>Bookmark this page and set a timer to maximize your earnings!</p>
                <div className="stats stats-hoverable mt-4">
                <div className="stat">
                    <div className="stat-title">Your Today's Earnings</div>
                    <div className="stat-value text-primary">0.89 XNO</div>
                </div>
                </div>
            </div>
            </div>

            <div className="card bg-base-200">
            <div className="card-body">
                <h3 className="card-title">⚡ Instant Payouts</h3>
                <ul className="list-disc pl-4 space-y-2">
                <li>No minimum withdrawal</li>
                <li>Direct to your wallet</li>
                <li>Supports NANO/XDG/BAN</li>
                </ul>
            </div>
            </div>
        </div> */}
        </div>
    );
}