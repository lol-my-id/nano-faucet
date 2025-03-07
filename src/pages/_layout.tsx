import '../styles.css';

import type { ReactNode } from 'react';

import { Navigation } from '../components/Navigation';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  // const [activeTab, setActiveTab] = useState('home');
  const activeTab: string = 'home';
  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-4">
      {/* Logo */}
      <div className="mb-4">
        <img 
          src="/logo.png"
          className="w-24 h-24 rounded-full shadow-lg border-4 border-base-100"
          alt="Logo"
        />
      </div>

      {/* Navigation Bar */}
      <Navigation />

      {/* Content Area */}
      <div className="w-full max-w-4xl bg-base-100 rounded-box shadow-lg mt-8 p-8">
        {activeTab === 'home' && <div>Home Content</div>}
        {activeTab === 'faucet' && <div>Faucet Content</div>}
        {activeTab === 'referrals' && <div>Referrals Content</div>}
      </div>
    </div>
  );
}
