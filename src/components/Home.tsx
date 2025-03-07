"use client"

// IMPORTANT: Never deep import from MUI icons, it will break dev.
import GitHubIcon from '@mui/icons-material/GitHub';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BoltIcon from '@mui/icons-material/Bolt';
import BlockIcon from '@mui/icons-material/Block';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function HomePage() {
    const features = [
      {
        icon: <AccessTimeIcon />,
        title: "45-Minute Spins",
        description: "Spin every 45 minutes with your wallet address to earn throughout the day"
      },
      {
        icon: <BlockIcon />,
        title: "No Ads",
        description: "Enjoy an ad-free experience while you earn cryptocurrency"
      },
      {
        icon: <BoltIcon />,
        title: "Instant Payouts",
        description: "Receive your rewards directly in your wallet immediately after spinning"
      },
      {
        icon: <VisibilityIcon />,
        title: "100% Anonymous",
        description: "No personal information required - complete privacy guaranteed"
      },
      {
        icon: <SportsEsportsIcon />,
        title: "CS2-Inspired",
        description: "Fun case-opening mechanic similar to Counter-Strike 2"
      },
      {
        icon: <ThumbUpIcon />,
        title: "User-Friendly",
        description: "Simple interface that lets you start earning with just a few clicks"
      }
    ];
  
    return (
      <div className="flex flex-col gap-8">
        {/* Hero Section */}
        <div className="hero bg-base-100 rounded-xl p-6 py-0">
          <div className="hero-content text-center">
            <div className="max-w-4xl">
              <h1 className="text-5xl font-bold pt-2">
                <span className="text-primary">nano.lol.my.id</span>
                <div className="text-xl mt-2 opacity-70">
                  Earn XNO, XDG, and BAN instantly!
                </div>
              </h1>
              
              <p className="py-6 text-lg">
                Experience the thrill of CS2-style case opening combined with instant cryptocurrency payouts. 
                The 100% anonymous platform lets you earn with just a few clicks - no personal info required!
              </p>
            </div>
          </div>
        </div>
  
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-0">
          {features.map((feature, index) => (
            <div key={index} className="card bg-base-200 hover:bg-base-300 transition-all">
              <div className="card-body">
                <div className="text-2xl text-primary mb-2">{feature.icon}</div>
                <h3 className="card-title">{feature.title}</h3>
                <p className="opacity-80">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
  
        {/* Social Links */}
        <div className="flex justify-center gap-6 mt-8">
          <a
            href="https://github.com/nextu1337"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-circle text-2xl hover:text-primary"
          >
            <GitHubIcon fontSize="inherit" />
          </a>
        </div>
      </div>
    );
}