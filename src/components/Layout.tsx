"use client"
import React,{ useEffect, useRef, useState } from "react";

import { Navigation } from "./Navigation";
import Home from "./Home";
import Faucet from "./Faucet";
import Referrals from "./Referrals";
import { useAtom } from "jotai";
import { addressAtom } from "../contexts/Provider";
import { PROTECTED_TABS, validateNanoAddress } from "../modules/utils";
import { cToast } from "./Toast";

export const Layout = () => {
    const [activeTab, setActiveTab] = useState('home');
    const loaded = useRef(false);
    const [address] = useAtom(addressAtom);

    useEffect(() => {
        // Prevent the initial tab change on first load, wait for address to be set
        if(!loaded.current) {
            loaded.current = true;
            return;
        }

        const handleHashChange = () => {
            const hash = window.location.hash.substring(1); // Remove the leading '#' character
            const tabs = ["home", "faucet", "referrals"];
            if (!tabs.includes(hash)) {
                window.location.hash = 'home';
                setActiveTab('home');
                return;
            }

            console.log(address, validateNanoAddress(address || ""));
            if(!validateNanoAddress(address || "") && PROTECTED_TABS.includes(hash)) {
                window.location.hash = 'home';
                setActiveTab('home');
                cToast.info("Please connect your wallet first");
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
    }, [address]);

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
                <p>© {new Date().getFullYear()} {process.env.WAKU_PUBLIC_DOMAIN ?? "NANO Faucet"} - Project <b>barely</b> maintained by <a className="link link-secondary" href="https://github.com/nextu1337">nx2</a></p>
            </aside>
        </footer>
      </div>
    );
}