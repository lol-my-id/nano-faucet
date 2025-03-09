"use client"

import HCaptchaComponent from "./HCaptcha";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import { useEffect, useRef, useState } from "react";
import { claimReferral } from "../modules/api";
import { cToast } from "./Toast";
import { useAtom } from "jotai";
import { addressAtom, currencyAtom, referralDataAtom } from "../contexts/Provider";
import { ReferralSystemData } from "../types/api";
import { referralLink } from "../modules/utils";

const Referrals: React.FC = () => {
    const [isClaiming, setIsClaiming] = useState(false);
    const [[currency], [address]] = [useAtom(currencyAtom), useAtom(addressAtom)];

    const [referralData] = useAtom(referralDataAtom);

    const captchaRef = useRef<HCaptcha>(null);
    
    const handleReferralClaim = (token?: string) => {
        if (!token || typeof token !== 'string' || token.length === 0) {
            captchaRef.current?.execute();
            return;
        }

        setIsClaiming(true);
        claimReferral(address ?? "", token).then(data =>{
            setIsClaiming(false);
            if(data == undefined) return;
            cToast.success("Referral earnings claimed successfully, in case of any issues contact nx2 on Discord");
        }).catch((err) => {
            setIsClaiming(false);
            cToast.error("Failed to claim referral earnings");
            console.error(err);
        });
    }


    return (
        <div className="flex flex-col gap-8">
            {/* Hero Section */}
            <div className="hero bg-base-100 rounded-xl p-6">
            <div className="hero-content text-center">
                <div className="max-w-4xl">
                <h2 className="text-4xl font-bold">
                    <span className="text-primary">Referrals</span>
                    <div className="text-lg mt-2 opacity-70">
                    Claim your referral earnings here
                    </div>
                </h2>
                </div>
            </div>
            </div>
  
            {/* Main Content */}
            {referralData && <><input
            type="text"
            placeholder="Referral code should appear here"
            readOnly
            value={referralLink(referralData.url)}
            className="input input-bordered w-full"
            onClick={(e) => e.currentTarget.select()}
            />
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-0">
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-title">Users referred</div>
                        <div className="stat-value">{referralData.usersReferred}</div>
                    </div>
                </div>
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-title">Total earned</div>
                        <div className="stat-value lg:text-2xl md:text-4xl">{parseFloat(referralData.totalEarned.toFixed(6))}<small className="text-base">{currency}</small></div>
                    </div>
                </div>
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-title">Available to claim</div>
                        <div className="stat-value lg:text-2xl md:text-4xl">{parseFloat(referralData.availableToClaim.toFixed(6))}<small className="text-base">{currency}</small></div>
                    </div>
                </div>
                <div className="stats shadow bg-base-100">
                    <div className="stat">
                        <div className="stat-title">Comission</div>
                        <div className="stat-value">20%</div>
                    </div>
                </div>
            </div>
            <HCaptchaComponent onVerify={handleReferralClaim} captchaRef={captchaRef} />
            <div className="flex flex-col gap-4 mx-auto w-full max-w-md">
                <button 
                className={`btn gap-2 text-lg transition-transform btn-primary hover:scale-105 ${(isClaiming || referralData.availableToClaim == 0) ? 'btn-disabled' : ''}`}
                onClick={()=>handleReferralClaim()}
                >
                <MonetizationOnIcon className={`${isClaiming ? 'loading  loading-infinity loading-lg' : ''}`} />
                {isClaiming ? "Claiming" : "Claim"}
                </button>
            </div></>}
            <small className="w-full text-center stat-title">If you claimed referral earnings during getnano.ovh downtime, contact me on Discord: nx2</small>
        </div>
    );
};

export default Referrals;