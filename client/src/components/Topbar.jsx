import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ user, logout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  console.log("Topbar - User:", user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-500';
      case 'MANAGER': return 'bg-blue-500';
      case 'RECEPTIONIST': return 'bg-green-500';
      case 'HOUSEKEEPING': return 'bg-amber-500';
      case 'RESTAURANT': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getRoleName = (role) => {
    return role ? role.replace('_', ' ').toLowerCase() : 'user';
  };

  if (!user) {
    return (
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Hotel PMS</h1>
          </div>
          <div className="text-slate-400">Not logged in</div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <h1 className="text-xl font-semibold tracking-tight">
              Welcome back, {user.firstName}!
            </h1>
            <p className="text-sm text-slate-400">
              You are logged in as {getRoleName(user.role)}
            </p>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition border border-slate-700"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {getRoleName(user.role)}
              </div>
            </div>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getRoleColor(user.role)}`}>
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-lg z-50">
              <div className="p-3 border-b border-slate-700">
                <div className="text-sm font-medium">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-slate-400">
                  {user.email}
                </div>
                <div className="text-xs text-slate-500 capitalize mt-1">
                  {getRoleName(user.role)}
                </div>
              </div>
              
              <div className="p-1">
                <button
                  onClick={() => navigate('/settings')}
                  className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition"
                >
                  ⚙️ Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
