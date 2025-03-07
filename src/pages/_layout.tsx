import { ToasterContainer } from '../components/Toast';
import { DataProvider } from '../contexts/Provider';
import '../styles.css';

import { type ReactNode } from 'react';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
    <title>NANOFAUCET</title>
    <link rel="icon" type="image/png" href="/images/favicon.png" />
    <meta name="title" content="NANOFAUCET - The coolest anonymous NANO Faucet!" />
    <meta name="description" content="NANOFAUCET is the top anonymous NANO faucet, offering free NANO cryptocurrency with no identity required. Claim your NANO securely and privately today!" />
    <meta name="keywords" content="nano, crypto, faucet, NANO cryptocurrency, Anonymous faucets, Free NANO, Crypto giveaways, Digital currencies, Online transactions, Fast and secure payouts, User privacy, Decentralized finance, Crypto rewards, Blockchain technology, Anonymous transactions, Crypto wallets, Instant transfers, No KYC" />
    <meta name="robots" content="index, follow" />
    <DataProvider>
      {children}
    </DataProvider>
    <ToasterContainer />
    </>
  )
}
