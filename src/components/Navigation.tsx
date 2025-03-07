"use client"
import React, { useState } from 'react';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HomeIcon from '@mui/icons-material/Home';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PeopleIcon from '@mui/icons-material/People';
import NanoAddressModal from './ConnectWalletModal';
import { PROTECTED_TABS, validateNanoAddress } from '../modules/utils';
import { cToast } from './Toast';
import { useAtom } from 'jotai';
import { addressAtom } from '../contexts/Provider';

interface NavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const Navigation = (props: NavigationProps) => {
    const { activeTab } = props;
    const [isCWMOpen, setIsCWMOpen] = useState(false);
    const [address] = useAtom(addressAtom);

    const switchTab = (tab: string) => {
        const isValid = validateNanoAddress(address || "");

        if(PROTECTED_TABS.includes(tab) && !isValid) {
            cToast.error("Please connect your wallet first");
            setIsCWMOpen(true);
            return;
        }

        window.location.hash = tab;
    }


    const openCWM = () => {
        setIsCWMOpen(true);
    };

    return (
        <>
        {isCWMOpen && <NanoAddressModal setVisible={setIsCWMOpen} />}
        <div className="join join-horizontal bg-base-100 rounded-full shadow-lg">
        <button 
        className={`join-item btn ${activeTab === 'home' ? 'btn-active' : ''}`}
        onClick={() => switchTab('home')}
        >
        <HomeIcon className="mr-2" />
        Home
        </button>
        
        <button 
        className={`join-item btn ${activeTab === 'faucet' ? 'btn-active' : ''}`}
        onClick={() => switchTab('faucet')}
        >
        <WaterDropIcon className="mr-2" />
        Faucet
        </button>
        
        <button 
        className={`join-item btn ${activeTab === 'referrals' ? 'btn-active' : ''}`}
        onClick={() => switchTab('referrals')}
        >
        <PeopleIcon className="mr-2" />
        Referrals
        </button>

        {/* Connect Wallet Button */}
        <div className="join-item">
        <button 
            className="btn btn-primary rounded-full"
            onClick={openCWM}
        >
            <AccountBalanceWalletIcon className="mr-2" />
            Connect
        </button>
        </div>
    </div>
    </>
    );
};
