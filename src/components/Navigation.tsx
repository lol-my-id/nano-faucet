"use client"

import HomeIcon from '@mui/icons-material/Home';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import PeopleIcon from '@mui/icons-material/People';

interface NavigationProps {
    activeTab: string;
    onNavigate: (tab: string) => void;
}

const tabs = [
    { id: 'home', label: 'Home', Icon: HomeIcon },
    { id: 'faucet', label: 'Faucet', Icon: WaterDropIcon },
    { id: 'referrals', label: 'Referrals', Icon: PeopleIcon },
] as const;

export const Navigation = ({ activeTab, onNavigate }: NavigationProps) => {
    return (
        <nav aria-label="Primary" className="flex flex-1 items-center justify-center sm:flex-none">
            {tabs.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                    <button
                        key={id}
                        type="button"
                        aria-current={active ? 'page' : undefined}
                        onClick={() => onNavigate(id)}
                        className={`flex h-9 items-center gap-1.5 border-b-2 px-2.5 text-[13px] font-semibold transition-colors sm:h-10 sm:px-3 sm:text-sm ${
                            active
                                ? 'border-primary text-base-content'
                                : 'border-transparent text-base-content/60 hover:text-base-content'
                        }`}
                    >
                        <Icon sx={{ fontSize: 16 }} />
                        <span>{label}</span>
                    </button>
                );
            })}
        </nav>
    );
};
