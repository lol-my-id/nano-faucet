"use client"
import { Link } from 'waku';
import React, { useState } from 'react';

import { AccountBalanceWallet, Home, WaterDrop, People } from '@mui/icons-material';

export const Navigation = () => {
    const [activeTab, setActiveTab] = useState('home');

    return (
        <div className="join join-horizontal bg-base-100 rounded-full shadow-lg">
        <button 
        className={`join-item btn ${activeTab === 'home' ? 'btn-active' : ''}`}
        onClick={() => setActiveTab('home')}
        >
        <Home className="mr-2" />
        Home
        </button>
        
        <button 
        className={`join-item btn ${activeTab === 'faucet' ? 'btn-active' : ''}`}
        onClick={() => setActiveTab('faucet')}
        >
        {/* <WaterDrop className="mr-2" /> */}
        Faucet
        </button>
        
        <button 
        className={`join-item btn ${activeTab === 'referrals' ? 'btn-active' : ''}`}
        onClick={() => setActiveTab('referrals')}
        >
        {/* <People className="mr-2" /> */}
        Referrals
        </button>

        {/* Connect Wallet Button */}
        <div className="join-item">
        <button 
            className="btn btn-primary rounded-full"
            onClick={() => alert('Connect wallet clicked!')}
        >
            {/* <AccountBalanceWallet className="mr-2" /> */}
            Connect Wallet
        </button>
        </div>
    </div>
    );
};
