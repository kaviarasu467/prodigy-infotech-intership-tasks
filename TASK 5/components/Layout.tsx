
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Compass, Bell, User as UserIcon, LogOut, PlusSquare, Search } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: any;
  notificationsCount: number;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, notificationsCount, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 bg-white p-6">
        <div className="mb-8">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VibeStream
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem to="/" icon={<Home size={22} />} label="Home" />
          <NavItem to="/explore" icon={<Compass size={22} />} label="Explore" />
          <NavItem 
            to="/notifications" 
            icon={<Bell size={22} />} 
            label="Notifications" 
            badge={notificationsCount > 0 ? notificationsCount : undefined} 
          />
          <NavItem to={`/profile/${currentUser?.username}`} icon={<UserIcon size={22} />} label="Profile" />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-6 p-2 rounded-lg bg-slate-50">
            <img src={currentUser?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
            <div className="overflow-hidden">
              <p className="font-semibold text-sm truncate">{currentUser?.displayName}</p>
              <p className="text-xs text-slate-500 truncate">@{currentUser?.username}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 min-w-0">
        <header className="md:hidden sticky top-0 z-20 glass-panel border-b border-slate-200 p-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            VibeStream
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/search" className="text-slate-600"><Search size={22} /></Link>
            <Link to="/notifications" className="text-slate-600 relative">
              <Bell size={22} />
              {notificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {notificationsCount}
                </span>
              )}
            </Link>
          </div>
        </header>
        
        <div className="max-w-4xl mx-auto md:p-6">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-50">
        <MobileNavItem to="/" icon={<Home size={24} />} />
        <MobileNavItem to="/explore" icon={<Compass size={24} />} />
        <MobileNavItem to="/create" icon={<PlusSquare size={28} className="text-indigo-600" />} />
        <MobileNavItem to="/notifications" icon={<Bell size={24} />} />
        <MobileNavItem to={`/profile/${currentUser?.username}`} icon={<UserIcon size={24} />} />
      </nav>
    </div>
  );
};

const NavItem = ({ to, icon, label, badge }: { to: string, icon: React.ReactNode, label: string, badge?: number }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `flex items-center justify-between p-3 rounded-xl transition-all ${
        isActive 
          ? 'bg-indigo-50 text-indigo-700 font-semibold' 
          : 'text-slate-600 hover:bg-slate-100'
      }`
    }
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge !== undefined && (
      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
        {badge}
      </span>
    )}
  </NavLink>
);

const MobileNavItem = ({ to, icon }: { to: string, icon: React.ReactNode }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`
    }
  >
    {icon}
  </NavLink>
);

export default Layout;
