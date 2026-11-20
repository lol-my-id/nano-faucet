"use client"

import GitHubIcon from '@mui/icons-material/GitHub';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BoltIcon from '@mui/icons-material/Bolt';
import BlockIcon from '@mui/icons-material/Block';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface HomePageProps {
    onStart: () => void;
}

export default function HomePage({ onStart }: HomePageProps) {
    const currencies = [
      { name: "XNO", src: "/images/cards/xno.png" },
      { name: "XDG", src: "/images/cards/xdg.png" },
      { name: "BAN", src: "/images/cards/ban.png" }
    ];

    const details = [
      {
        Icon: AccessTimeIcon,
        title: "45-minute cooldown",
        description: "One spin per wallet address. The remaining time is shown on the faucet page."
      },
      {
        Icon: BoltIcon,
        title: "Instant payouts",
        description: "Your prize is sent to your wallet as soon as the reel finishes."
      },
      {
        Icon: SportsEsportsIcon,
        title: "Reward tiers",
        description: "Card brightness shows the payout size. The blue card is the top prize."
      },
      {
        Icon: BlockIcon,
        title: "No ads",
        description: "No advertising, pop-ups, or sponsored third-party scripts."
      },
      {
        Icon: VisibilityIcon,
        title: "No personal details",
        description: "A Nano, DogeNano, or Banano address is all the faucet needs."
      },
      {
        Icon: AccountBalanceWalletIcon,
        title: "Three currencies",
        description: "Claim free XNO, XDG, or BAN with the matching wallet prefix."
      }
    ];

    return (
      <div className="flex flex-col gap-8">
        <section className="mx-auto flex max-w-2xl flex-col items-center pt-2 text-center sm:pt-4">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            <span className="text-primary">{process.env.WAKU_PUBLIC_DOMAIN ?? "NANO Faucet"}</span>
          </h1>
          <p className="mt-2 text-lg font-bold text-base-content/85 sm:text-xl">
            Earn cryptocurrency instantly.
          </p>

          <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {currencies.map(({ name, src }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/60"
              >
                <img
                  src={src}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-white/10"
                  draggable={false}
                />
                {name}
              </span>
            ))}
          </div>

          <p className="mt-3.5 text-sm leading-6 text-base-content/55 sm:text-[15px]">
            Spin the reward reel with your wallet address and receive free
            cryptocurrency right away. No account and no personal details.
          </p>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onStart}
              className="btn btn-primary h-11 min-h-11 gap-2 rounded-lg px-5 text-sm font-semibold"
            >
              Open the faucet
              <ArrowForwardIcon sx={{ fontSize: 17 }} />
            </button>
          </div>

          <p className="mt-3 text-xs text-base-content/45">
            Free to use. No deposits, no wagering.
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(({ Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-white/[0.06] bg-base-200/55 p-4 transition-colors duration-150 hover:border-white/[0.12] hover:bg-base-200"
            >
              <Icon sx={{ fontSize: 18 }} className="text-primary/80" />
              <h2 className="mt-2.5 text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-[13px] leading-5 text-base-content/50">
                {description}
              </p>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 text-base-content/45">
            <GitHubIcon sx={{ fontSize: 16 }} />
            Source
          </span>
          <a
            href="https://github.com/lol-my-id/nano-faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-content/60 underline-offset-4 transition-colors hover:text-base-content hover:underline"
          >
            Frontend
          </a>
          <span aria-hidden="true" className="text-base-content/20">·</span>
          <a
            href="https://github.com/lol-my-id/nano-faucet-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="text-base-content/60 underline-offset-4 transition-colors hover:text-base-content hover:underline"
          >
            Backend
          </a>
        </div>
      </div>
    );
}
