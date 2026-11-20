import { ToasterContainer } from '../components/Toast';
import { DataProvider } from '../contexts/Provider';
import '../styles.css';

import { type ReactNode } from 'react';

type RootLayoutProps = { children: ReactNode };

const domain = (process.env.WAKU_PUBLIC_DOMAIN ?? "nano.lol.my.id")
  .replace(/^https?:\/\//, "")
  .replace(/\/+$/, "");
const siteUrl = `https://${domain}`;
const title = `NANO Faucet · Free XNO, XDG & BAN | ${domain}`;
const description =
  "Spin the anonymous NANO faucet every 45 minutes and receive XNO, XDG (DogeNano), or BAN (Banano) instantly. No account, no KYC, no personal details.";
const ogImage = `${siteUrl}/images/og.png`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NANO Faucet",
  url: `${siteUrl}/`,
  description,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  isAccessibleForFree: true,
  inLanguage: "en",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Person",
    name: "2xxn",
    url: "https://github.com/2xxn",
  },
  sameAs: [
    "https://github.com/lol-my-id/nano-faucet",
    "https://github.com/lol-my-id/nano-faucet-backend",
  ],
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
    <title>{title}</title>
    <link rel="icon" type="image/png" href="/images/favicon.png" />
    <link rel="apple-touch-icon" href="/images/favicon.png" />
    <link rel="canonical" href={`${siteUrl}/`} />
    <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <meta name="theme-color" content="#070c14" />
    <meta name="color-scheme" content="dark" />
    <meta name="description" content={description} />
    <meta name="keywords" content="NANO faucet, nano faucet, free NANO, XNO, XDG, BAN, crypto faucet, anonymous faucet" />
    <meta name="author" content="2xxn" />
    <meta name="application-name" content="NANO Faucet" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="NANO Faucet" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={`${siteUrl}/`} />
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="NANO Faucet — free XNO, XDG and BAN" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImage} />
    <meta name="twitter:image:alt" content="NANO Faucet — free XNO, XDG and BAN" />
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
    <DataProvider>
      {children}
    </DataProvider>
    <ToasterContainer />
    </>
  )
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
