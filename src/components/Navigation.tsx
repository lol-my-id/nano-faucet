"use client"
import { Link } from 'waku';
import React, { useState } from 'react';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import HomeIcon from '@mui/icons-material/Home';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PeopleIcon from '@mui/icons-material/People';

export const Navigation = () => {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <div className="join join-horizontal bg-base-100 rounded-full shadow-lg">
        <button 
        className={`join-item btn ${activeTab === 'home' ? 'btn-active' : ''}`}
        onClick={() => setActiveTab('home')}
        >
        <HomeIcon className="mr-2" />
        Home
        </button>
        
        <button 
        className={`join-item btn ${activeTab === 'faucet' ? 'btn-active' : ''}`}
        onClick={() => setActiveTab('faucet')}
        >
        <WaterDropIcon className="mr-2" />
        Faucet
        </button>
        
        <button 
        className={`join-item btn ${activeTab === 'referrals' ? 'btn-active' : ''}`}
        onClick={() => setActiveTab('referrals')}
        >
        <PeopleIcon className="mr-2" />
        Referrals
        </button>

        {/* Connect Wallet Button */}
        <div className="join-item">
        <button 
            className="btn btn-primary rounded-full"
            onClick={() => alert('Connect wallet clicked!')}
        >
            <AccountBalanceWalletIcon className="mr-2" />
            Connect Wallet
        </button>
        </div>
    </div>
    );
};
