import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Medal, Crown, ArrowLeft, Clock, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { calculateRaceResults } from '../utils/scoring';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

export default function RaceResults() {
    const { id } = useParams();
    const { races, players } = useGame();
    const [activeTab, setActiveTab] = useState('general');

    const race = races.find(r => r.id === id);
    const results = useMemo(() => calculateRaceResults(race, players), [race, players]);

    if (!race || !results) return <Layout>Chargement des résultats...</Layout>;

    const { globalStanding, eventStandings, timeStandings, categoryName } = results;

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20"> {/* Added padding bottom */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link to="/">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Retour
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Résultats : {race.name}</h1>
                            <span className="text-indigo-400 font-medium text-sm border border-indigo-500/30 px-2 py-0.5 rounded-full bg-indigo-500/10">
                                {categoryName}
                            </span>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-slate-400 text-sm">Lieu : {race.location || 'Non défini'}</p>
                        <p className="text-slate-400 text-sm">{new Date(race.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Podium Top 3 - FIXED LAYOUT: Using flex-col-reverse on mobile or better fixed heights */}
                {activeTab === 'general' && (
                    <div className="flex justify-center items-end gap-2 md:gap-4 h-[350px] mb-8 pt-10">
                        {/* 2nd Place */}
                        {globalStanding[1] && (
                            <div className="flex flex-col items-center w-1/3 max-w-[150px]">
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-400 bg-slate-800 flex items-center justify-center text-xl md:text-2xl font-bold text-slate-300 shadow-xl">
                                        {globalStanding[1].name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">2ème</div>
                                </div>
                                <div className="w-full bg-gradient-to-t from-slate-700 to-slate-600 rounded-t-lg flex flex-col items-center justify-end pb-4 text-white shadow-lg h-[140px] md:h-[180px]">
                                    <span className="text-3xl font-bold">{globalStanding[1].totalPoints}</span>
                                    <span className="text-xs opacity-70">pts race</span>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-slate-300 font-semibold truncate w-full">{globalStanding[1].name}</p>
                                    <span className="text-green-400 text-sm font-bold">+{globalStanding[1].championshipPoints} pts champ.</span>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {globalStanding[0] && (
                            <div className="flex flex-col items-center w-1/3 max-w-[180px] z-10 -mx-2 md:mx-0">
                                <Crown className="w-10 h-10 text-yellow-400 mb-2 animate-bounce" />
                                <div className="relative mb-2">
                                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-yellow-400 bg-slate-800 flex items-center justify-center text-2xl md:text-3xl font-bold text-yellow-400 shadow-xl shadow-yellow-500/20">
                                        {globalStanding[0].name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">1er</div>
                                </div>
                                <div className="w-full bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex flex-col items-center justify-end pb-4 text-yellow-900 shadow-xl h-[180px] md:h-[220px]">
                                    <span className="text-4xl font-black">{globalStanding[0].totalPoints}</span>
                                    <span className="text-xs font-bold opacity-70">pts race</span>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-white font-bold text-lg truncate w-full">{globalStanding[0].name}</p>
                                    <span className="text-yellow-400 text-sm font-bold">+{globalStanding[0].championshipPoints} pts champ.</span>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {globalStanding[2] && (
                            <div className="flex flex-col items-center w-1/3 max-w-[150px]">
                                <div className="relative mb-2">
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-700 bg-slate-800 flex items-center justify-center text-xl md:text-2xl font-bold text-amber-700 shadow-xl">
                                        {globalStanding[2].name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 text-xs font-bold px-2 py-0.5 rounded-full">3ème</div>
                                </div>
                                <div className="w-full bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-lg flex flex-col items-center justify-end pb-4 text-amber-100 shadow-lg h-[100px] md:h-[140px]">
                                    <span className="text-2xl font-bold">{globalStanding[2].totalPoints}</span>
                                    <span className="text-xs opacity-70">pts race</span>
                                </div>
                                <div className="mt-2 text-center">
                                    <p className="text-slate-300 font-semibold truncate w-full">{globalStanding[2].name}</p>
                                    <span className="text-green-400 text-sm font-bold">+{globalStanding[2].championshipPoints} pts champ.</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar border-b border-slate-800">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                            activeTab === 'general'
                                ? "border-indigo-500 text-indigo-400"
                                : "border-transparent text-slate-400 hover:text-white"
                        )}
                    >
                        Classement Général
                    </button>
                    <button
                        onClick={() => setActiveTab('time')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2",
                            activeTab === 'time'
                                ? "border-amber-500 text-amber-400"
                                : "border-transparent text-slate-400 hover:text-white"
                        )}
                    >
                        <Clock className="w-3 h-3" /> Chrono
                    </button>
                    {race.events.map((event) => (
                        <button
                            key={event.id}
                            onClick={() => setActiveTab(event.id)}
                            className={cn(
                                "whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2",
                                activeTab === event.id
                                    ? "border-indigo-500 text-indigo-400"
                                    : "border-transparent text-slate-400 hover:text-white"
                            )}
                        >
                            {event.name}
                        </button>
                    ))}
                </div>

                {/* Detailed Table */}
                <Card className="bg-slate-900/50 backdrop-blur">
                    <CardHeader><CardTitle className="flex items-center gap-2">
                        {activeTab === 'general' && <><Medal className="w-5 h-5 text-indigo-400" /> Tableau Complet</>}
                        {activeTab === 'time' && <><Clock className="w-5 h-5 text-amber-400" /> Classement Temps (Points Bonus)</>}
                        {!['general', 'time'].includes(activeTab) && race.events.find(e => e.id === activeTab)?.name}
                    </CardTitle></CardHeader>
                    <CardContent>
                        {activeTab === 'general' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                        <th className="p-3">Rang</th>
                                        <th className="p-3">Joueur</th>
                                        <th className="p-3 text-right">Pts Épreuves</th>
                                        <th className="p-3 text-right text-red-400" title="Pénalité Points">Pén. Pts</th>
                                        <th className="p-3 text-right text-amber-400">Pts Chrono</th>
                                        <th className="p-3 text-right text-red-400" title="Pénalité Temps">Pén. Temps</th>
                                        <th className="p-3 text-right font-bold text-white">Total Course</th>
                                        <th className="p-3 text-right text-green-400">Points Champ.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {globalStanding.map((p, idx) => {
                                        const timeData = timeStandings.find(t => t.playerId === p.id);
                                        const timePoints = timeData ? timeData.points : 0;

                                        // p.totalPoints is ALREADY (Events - ScorePenalty + TimePoints)
                                        // We want to show: Events (Gross), Penalty (Score), Time Points, Time Penalty (info only, implies rank)

                                        // Reverse engineer Gross Event Points:
                                        // Total = (GrossEvents - ScorePenalty) + TimePoints
                                        // GrossEvents = Total - TimePoints + ScorePenalty
                                        const scorePenalty = p.scorePenalty || 0;
                                        const timePenalty = p.timePenalty || 0;
                                        const eventPointsNet = p.totalPoints - timePoints; // This is (Gross - Penalty)
                                        const eventPointsGross = eventPointsNet + scorePenalty;

                                        return (
                                            <tr key={p.id} className={cn("hover:bg-slate-800/50 transition-colors", idx < 3 ? "bg-white/5" : "")}>
                                                <td className="p-3 font-mono font-bold text-slate-500">#{idx + 1}</td>
                                                <td className="p-3 font-medium text-white">
                                                    <Link to={`/players/${p.id}`} className="hover:text-indigo-400 hover:underline">{p.name}</Link>
                                                </td>
                                                <td className="p-3 text-right text-slate-300 font-mono">
                                                    {eventPointsGross}
                                                </td>
                                                <td className="p-3 text-right text-red-400 font-mono">
                                                    {scorePenalty > 0 ? `-${scorePenalty}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-amber-300 font-mono">
                                                    {timePoints > 0 ? `+${timePoints}` : '-'}
                                                </td>
                                                <td className="p-3 text-right text-red-400 font-mono text-xs">
                                                    {timePenalty !== 0 ? `${timePenalty > 0 ? '+' : ''}${timePenalty / 1000}s` : '-'}
                                                </td>
                                                <td className="p-3 text-right font-bold text-xl text-white">{p.totalPoints}</td>
                                                <td className="p-3 text-right font-bold text-green-400">+{p.championshipPoints}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'time' && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                        <th className="p-3">Rang</th>
                                        <th className="p-3">Joueur</th>
                                        <th className="p-3 text-right">Temps Réel</th>
                                        <th className="p-3 text-right text-red-400">Pén.</th>
                                        <th className="p-3 text-right text-amber-400">Temps Final</th>
                                        <th className="p-3 text-right">Points Bonus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {timeStandings.map((res) => {
                                        // Retrieve raw data from global standing which we augmented in scoring.js
                                        // But timeStandings itself doesn't have rawTime/penalty details by default in current scoring.js structure unless we added it?
                                        // Wait, strictly speaking `scoring.js` returns `timeStandings` with minimal info.
                                        // I should cross-reference with `globalStanding` data or update `scoring.js` to include it in `timeStandings` too.
                                        // `calculateRaceResults` logic:
                                        // ... timeScores.map ...
                                        // Let's use `globalStanding` to find the player and get the detailed breakdown since I added `rawTime` there.
                                        const detailedPlayer = globalStanding.find(p => p.id === res.playerId);
                                        const rawTime = detailedPlayer?.rawTime || 0;
                                        const penalty = detailedPlayer?.timePenalty || 0;

                                        // Format helper
                                        const fmt = (ms) => {
                                            const min = Math.floor(ms / 60000);
                                            const sec = Math.floor((ms % 60000) / 1000);
                                            const cent = Math.floor((ms % 1000) / 10);
                                            return `${min}:${sec.toString().padStart(2, '0')}.${cent.toString().padStart(2, '0')}`;
                                        };

                                        return (
                                            <tr key={res.playerId} className="hover:bg-slate-800/50 transition-colors">
                                                <td className="p-3 font-mono font-bold text-slate-500">#{res.rank}</td>
                                                <td className="p-3 font-medium text-white">
                                                    <Link to={`/players/${res.playerId}`} className="hover:text-indigo-400 hover:underline">{res.name}</Link>
                                                </td>
                                                <td className="p-3 text-right font-mono text-slate-400">{fmt(rawTime)}</td>
                                                <td className="p-3 text-right font-mono text-red-400">
                                                    {penalty !== 0 ? `+${penalty / 1000}s` : '-'}
                                                </td>
                                                <td className="p-3 text-right font-mono text-amber-300 font-bold">{res.formattedTime}</td>
                                                <td className="p-3 text-right font-bold text-indigo-400">+{res.points}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {!['general', 'time'].includes(activeTab) && (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                        <th className="p-3">Rang</th>
                                        <th className="p-3">Joueur</th>
                                        <th className="p-3 text-right">Performance</th>
                                        <th className="p-3 text-right">Points</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {eventStandings[activeTab]?.map((res) => (
                                        <tr key={res.playerId} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 font-mono font-bold text-slate-500">#{res.rank}</td>
                                            <td className="p-3 font-medium text-white">
                                                <Link to={`/players/${res.playerId}`} className="hover:text-indigo-400 hover:underline">{res.name}</Link>
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-300">{res.rawScore}</td>
                                            <td className="p-3 text-right font-bold text-indigo-400">+{res.points}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
