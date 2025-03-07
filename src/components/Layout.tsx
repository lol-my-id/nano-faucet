"use client"
import React,{ useEffect, useState } from "react";

import { Navigation } from "./Navigation";
import Home from "./Home";
import Faucet from "./Faucet";
import Referrals from "./Referrals";

export const Layout = () => {
    const [activeTab, setActiveTab] = useState('home');
  
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.substring(1); // Remove the leading '#' character
            const tabs = ["home", "faucet", "referrals"];
            if (!tabs.includes(hash)) {
                window.location.hash = 'home';
                setActiveTab('home');
                return;
            }

            setActiveTab(hash);
        };

        // Set the initial tab based on the URL hash
        handleHashChange();

        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, [setActiveTab]);

    return (
      <div className="min-h-screen bg-base-200 flex flex-col items-center p-4">
        {/* Logo */}
        <div className="mb-4">
          <img 
            src="/images/logo.png"
            className="h-18"
            alt="Logo"
          />
        </div>
  
        {/* Navigation Bar */}
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
  
        {/* Content Area */}
        <div className="w-full max-w-4xl bg-base-100 rounded-box shadow-lg mt-8 p-8 pt-0">
          {activeTab === 'home' && <Home />}
          {activeTab === 'faucet' && <Faucet />}
          {activeTab === 'referrals' && <Referrals />}
        </div>
        <footer className="footer sm:footer-horizontal footer-center text-base-content mt-auto p-4">
            <aside>
                <p>© {new Date().getFullYear()} nano.lol.my.id - Project <b>barely</b> maintained by <a className="link link-secondary" href="https://github.com/nextu1337">nx2</a></p>
            </aside>
        </footer>
      </div>
    );
}