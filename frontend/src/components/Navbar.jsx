import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, Search } from 'lucide-react';

export default function Navbar() {
  const { logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/explore" className="flex items-center gap-2 text-primary">
            <Activity size={24} />
            <span className="font-bold text-xl text-text">FinGraph</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/explore" className="text-text-secondary hover:text-text transition-colors" title="Search Stocks">
              <Search size={20} />
            </Link>
            <Link 
              to="/explore" 
              className={`${isActive('/explore') || isActive('/stocks') ? 'text-primary font-medium border-b-2 border-primary pb-1' : 'text-text-secondary hover:text-text transition-colors'}`}
            >
              Explore
            </Link>
            <Link 
              to="/dashboard" 
              className={`${isActive('/dashboard') ? 'text-primary font-medium border-b-2 border-primary pb-1' : 'text-text-secondary hover:text-text transition-colors'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/profile" 
              className={`flex items-center gap-2 ${isActive('/profile') ? 'text-primary font-medium border-b-2 border-primary pb-1' : 'text-text-secondary hover:text-text transition-colors'}`}
            >
              <UserIcon size={20} />
              <span>Profile</span>
            </Link>
            <button 
              onClick={logout} 
              className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
