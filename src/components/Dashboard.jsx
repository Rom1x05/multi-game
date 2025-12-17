import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Users, Clock, Trophy, ArrowRight, Medal, Crown, MapPin, Calendar } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { calculateRaceResults } from '../utils/scoring';
import { cn } from '../utils/cn';

export default function Dashboard() {
    const { races, players, verifyAdmin } = useGame();
    const navigate = useNavigate();

    const activeRaces = races.filter(r => r.status === 'ongoing');
    const finishedRaces = races.filter(r => r.status === 'finished').sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt));

    // Calculate Top 5 for Micro Leaderboard
    const topPlayers = useMemo(() => {
        const totals = {};
        finishedRaces.forEach(race => {
            const results = calculateRaceResults(race, players);
            if (!results) return;
            results.globalStanding.forEach(p => {
                if (!totals[p.id]) totals[p.id] = { ...p, totalPoints: 0 };
                totals[p.id].totalPoints += p.championshipPoints;
            });
        });
        return Object.values(totals)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, 5);
    }, [finishedRaces, players]);

    const getRacePodium = (race) => {
        const res = calculateRaceResults(race, players);
        if (!res || !res.globalStanding) return [];
        return res.globalStanding.slice(0, 3);
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-12">

                {/* HERO SECTION */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-black border border-indigo-500/20 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-2xl">
                            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                                MultiGame Championship
                            </h1>
                            <p className="text-lg text-indigo-200/80 font-medium">
                                Gérez vos compétitions, suivez les performances et couronnez le champion.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Button
                                    onClick={() => { if (verifyAdmin()) navigate('/race/new'); }}
                                    className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold px-8 py-6 text-lg shadow-xl hover:scale-105 transition-transform"
                                >
                                    <Plus className="w-5 h-5 mr-2" /> Démarrer une course
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => { if (verifyAdmin()) navigate('/players'); }}
                                    className="px-8 py-6 text-lg bg-indigo-900/50 hover:bg-indigo-900/70 border border-indigo-500/30"
                                >
                                    <Users className="w-5 h-5 mr-2" /> Gérer les joueurs
                                </Button>
                            </div>
                        </div>
                        {/* DECORATIVE ELEMENT */}
                        <div className="hidden md:block relative">
                            <Trophy className="w-48 h-48 text-indigo-500/20 rotate-12" />
                            <Crown className="absolute top-0 right-0 w-24 h-24 text-yellow-400/20 -rotate-12 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* MAIN GRID */}
                <div className="grid lg:grid-cols-3 gap-8">

                    {/* LEFT COL: MICRO LEADERBOARD */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-slate-900/80 border-slate-800 overflow-hidden backdrop-blur-sm relative h-full">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Crown className="w-5 h-5 text-yellow-500" /> Top Champions
                                </CardTitle>
                                <Link to="/leaderboard" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors">
                                    Voir tout <ArrowRight className="w-3 h-3" />
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-1">
                                {topPlayers.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500 text-sm italic">
                                        En attente de résultats...
                                    </div>
                                ) : (
                                    topPlayers.map((p, idx) => (
                                        <div
                                            key={p.id}
                                            onClick={() => navigate(`/players/${p.id}`)}
                                            className="group flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-all border border-transparent hover:border-slate-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                                                    idx === 0 ? "bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50" :
                                                        idx === 1 ? "bg-slate-500/20 text-slate-300" :
                                                            idx === 2 ? "bg-amber-700/20 text-amber-600" :
                                                                "bg-slate-800 text-slate-500"
                                                )}>
                                                    {idx + 1}
                                                </div>
                                                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{p.name}</span>
                                            </div>
                                            <span className="font-mono text-indigo-400 font-bold">{p.totalPoints} <span className="text-xs text-slate-600 font-normal">pts</span></span>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COL: ACTIVE & RECENT RACES */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* ACTIVE RACES */}
                        {activeRaces.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Courses en cours
                                </h2>
                                <div className="grid gap-4">
                                    {activeRaces.map(race => (
                                        <div
                                            key={race.id}
                                            className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 hover:border-green-500/50 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
                                        >
                                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-400 to-emerald-600" />
                                            <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start gap-3 mb-2">
                                                        <h3 className="font-bold text-2xl text-white group-hover:text-green-400 transition-colors uppercase tracking-tight line-clamp-1">{race.name}</h3>
                                                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-bold border border-green-500/20 animate-pulse mt-1">LIVE</span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                                                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(race.createdAt).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {race.location || 'N/A'}</span>
                                                        <span className="flex items-center gap-2"><Medal className="w-4 h-4" /> {race.categoryName}</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    onClick={() => navigate(`/race/${race.id}`)}
                                                    size="lg"
                                                    className="w-full md:w-auto flex-shrink-0 bg-green-600 hover:bg-green-500 text-white border-0 shadow-lg shadow-green-900/40 rounded-xl font-bold text-lg px-8"
                                                >
                                                    <Play className="w-5 h-5 mr-2 fill-current" /> REPRENDRE
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RECENT HISTORY */}
                        <div className="space-y-4 pt-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-slate-400" /> Historique récent
                                </h2>
                                <Link to="/history" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Voir tout l'historique</Link>
                            </div>

                            {finishedRaces.length === 0 ? (
                                <Card className="border-dashed border-slate-800 bg-transparent">
                                    <CardContent className="p-12 text-center">
                                        <p className="text-slate-500">Aucune course terminée dans l'historique.</p>
                                        <Button variant="link" onClick={() => navigate('/race/new')} className="mt-2 text-indigo-400">
                                            Créer votre première course
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {finishedRaces.slice(0, 4).map(race => {
                                        const podium = getRacePodium(race);
                                        return (
                                            <div
                                                key={race.id}
                                                onClick={() => navigate(`/race/${race.id}/results`)}
                                                className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 h-full flex flex-col"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative p-5 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-4 gap-4">
                                                        <div className="min-w-0 flex-1">
                                                            <h3 className="font-bold text-lg text-slate-200 group-hover:text-indigo-300 transition-colors mb-1 line-clamp-2 leading-tight">{race.name}</h3>
                                                            <div className="text-xs text-slate-500 flex flex-col gap-1">
                                                                <span>{new Date(race.endedAt).toLocaleDateString()}</span>
                                                                <span className="uppercase text-indigo-500/70 font-bold">{race.categoryName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg text-slate-500">
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>

                                                    {/* MINI PODIUM */}
                                                    {podium.length > 0 ? (
                                                        <div className="mt-auto pt-4 border-t border-slate-800/50">
                                                            <div className="flex flex-col gap-2">
                                                                {/* Winner */}
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-[10px] font-bold text-yellow-500 flex-shrink-0">1</div>
                                                                    <span className="text-sm font-bold text-white truncate">{podium[0].name}</span>
                                                                </div>
                                                                {/* 2nd & 3rd */}
                                                                <div className="flex items-center gap-4 pl-7">
                                                                    {podium[1] && (
                                                                        <div className="flex items-center gap-1.5 opacity-70 min-w-0">
                                                                            <span className="text-[10px] text-slate-500 font-mono">2.</span>
                                                                            <span className="text-xs text-slate-400 truncate max-w-[80px]">{podium[1].name}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-auto pt-4 border-t border-slate-800/50">
                                                            <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors">Résultats disponibles</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </Layout>
    );
}
