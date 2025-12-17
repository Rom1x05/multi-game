import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Trophy, Users, History as HistoryIcon, Lock, Unlock, Database } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { cn } from '../utils/cn';

export function Layout({ children }) {
    const location = useLocation();
    const { isAdmin, verifyAdmin, logout } = useGame();

    const navItems = [
        { label: 'Accueil', path: '/', icon: LayoutDashboard },
        { label: 'Classement', path: '/leaderboard', icon: Trophy },
        { label: 'Historique', path: '/history', icon: HistoryIcon },
        { label: 'Joueurs', path: '/players', icon: Users },
        { label: 'Données', path: '/data', icon: Database },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-16">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            MultiGame
                        </span>
                    </Link>

                    <nav className="flex items-center gap-1 md:gap-4">
                        <button
                            onClick={() => {
                                if (isAdmin) {
                                    if (confirm("Se déconnecter du mode admin ?")) logout();
                                } else {
                                    verifyAdmin();
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold transition-all duration-200 border",
                                isAdmin
                                    ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20"
                                    : "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20"
                            )}
                        >
                            {isAdmin ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            <span className="hidden md:block">{isAdmin ? "Admin" : "Invité"}</span>
                        </button>
                        <div className="w-px h-6 bg-slate-800 mx-2" />

                        {navItems.map(item => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span className={cn("hidden md:block", isActive && "block")}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto animate-fade-in">
                {children}
            </main>
        </div>
    );
}
