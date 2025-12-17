import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { calculateRaceResults } from '../utils/scoring';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { RACE_CATEGORIES } from '../constants';
import { AlignJustify, BarChart, Medal, Trophy, ArrowUpDown } from 'lucide-react';
import { cn } from '../utils/cn';

export default function Leaderboard() {
    const { races, players } = useGame();
    const [viewMode, setViewMode] = useState('detailed'); // 'simple' | 'detailed' (default to detailed as requested "Ajout après une page avec le classement général", actually user said "garde l'affichage mais ajoute bouton")

    const finishedRaces = races.filter(r => r.status === 'finished');

    const globalRankings = useMemo(() => {
        const totals = {};
        // totals: { [playerId]: { id, name, categories: {}, totalChampionshipPoints: 0, wins: 0, podiums: 0, totalRacePoints: 0, racesParticipated: 0, sumOfRanks: 0 } }

        finishedRaces.forEach(race => {
            const results = calculateRaceResults(race, players);
            if (!results) return;

            results.globalStanding.forEach((p, idx) => {
                const rank = idx + 1;

                if (!totals[p.id]) {
                    totals[p.id] = {
                        id: p.id,
                        name: p.name,
                        categories: {},
                        totalChampionshipPoints: 0,
                        // Stats
                        wins: 0,
                        podiums: 0,
                        totalRacePoints: 0,
                        racesParticipated: 0,
                        sumOfRanks: 0
                    };
                }

                // Championship Points (Category based)
                if (!totals[p.id].categories[race.categoryId]) {
                    totals[p.id].categories[race.categoryId] = 0;
                }
                totals[p.id].categories[race.categoryId] += p.championshipPoints;
                totals[p.id].totalChampionshipPoints += p.championshipPoints;

                // Detailed Stats
                totals[p.id].totalRacePoints += p.totalPoints;
                totals[p.id].racesParticipated += 1;
                totals[p.id].sumOfRanks += rank;

                if (!totals[p.id].maxRacePoints || p.totalPoints > totals[p.id].maxRacePoints) {
                    totals[p.id].maxRacePoints = p.totalPoints;
                }

                if (rank === 1) totals[p.id].wins += 1;
                if (rank <= 3) totals[p.id].podiums += 1;
            });
        });

        return Object.values(totals).sort((a, b) => b.totalChampionshipPoints - a.totalChampionshipPoints);
    }, [finishedRaces, players]);

    const [sortConfig, setSortConfig] = useState({ key: 'default', direction: 'desc' });

    const sortedRankings = useMemo(() => {
        let sorted = [...globalRankings];
        if (sortConfig.key !== 'default') {
            sorted.sort((a, b) => {
                let aValue, bValue;

                switch (sortConfig.key) {
                    case 'avgRank':
                        aValue = a.sumOfRanks / a.racesParticipated;
                        bValue = b.sumOfRanks / b.racesParticipated;
                        // For rank, lower is better (ascending default)
                        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
                    case 'avgScore':
                        aValue = a.totalRacePoints / a.racesParticipated;
                        bValue = b.totalRacePoints / b.racesParticipated;
                        break;
                    case 'cumulPts':
                        aValue = a.totalRacePoints;
                        bValue = b.totalRacePoints;
                        break;
                    case 'record':
                        aValue = a.maxRacePoints || 0;
                        bValue = b.maxRacePoints || 0;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }, [globalRankings, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Classement Général Annuel</h1>
                        <p className="text-slate-400">Total des points de championnat et statistiques de la saison.</p>
                    </div>

                    <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                            onClick={() => setViewMode('simple')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                                viewMode === 'simple' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <AlignJustify className="w-4 h-4" /> Synthèse
                        </button>
                        <button
                            onClick={() => setViewMode('detailed')}
                            className={cn(
                                "px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
                                viewMode === 'detailed' ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <BarChart className="w-4 h-4" /> Analyse Complète
                        </button>
                    </div>
                </div>

                <Card className="overflow-hidden">
                    <CardHeader className="bg-slate-900/50 border-b border-slate-800">
                        <CardTitle>
                            {viewMode === 'simple' ? "Tableau des Points Championnat" : "Tableau Détaillé des Performances"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900/30 text-slate-400 text-sm border-b border-slate-700">
                                        <th className="p-4 font-normal">Rang</th>
                                        <th className="p-4 font-normal">Joueur</th>

                                        {/* Simple View Columns */}
                                        {viewMode === 'simple' && Object.values(RACE_CATEGORIES).map(cat => (
                                            <th key={cat.id} className="p-4 font-normal text-right hidden md:table-cell text-xs uppercase tracking-wider opacity-70">
                                                {cat.name}
                                            </th>
                                        ))}

                                        {/* Detailed View Columns */}
                                        {viewMode === 'detailed' && (
                                            <>
                                                <th className="p-4 font-normal text-center" title="Nombre de courses">Courses</th>
                                                <th className="p-4 font-normal text-center text-amber-400" title="Nombre de victoires"><Trophy className="w-4 h-4 mx-auto" /></th>
                                                <th className="p-4 font-normal text-center text-slate-300" title="Nombre de podiums"><Medal className="w-4 h-4 mx-auto" /></th>
                                                <th
                                                    className="p-4 font-normal text-center text-green-400 cursor-pointer hover:bg-slate-800/50 transition-colors group"
                                                    onClick={() => handleSort('avgRank')}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        Pos. Moy.
                                                        <ArrowUpDown className={cn("w-3 h-3 transition-opacity", sortConfig.key === 'avgRank' ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                                                    </div>
                                                </th>

                                                <th
                                                    className="p-4 font-normal text-center text-indigo-400 cursor-pointer hover:bg-slate-800/50 transition-colors group"
                                                    onClick={() => handleSort('avgScore')}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        Moy. Score
                                                        <ArrowUpDown className={cn("w-3 h-3 transition-opacity", sortConfig.key === 'avgScore' ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                                                    </div>
                                                </th>

                                                <th
                                                    className="p-4 font-normal text-center text-blue-400 cursor-pointer hover:bg-slate-800/50 transition-colors group"
                                                    onClick={() => handleSort('cumulPts')}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        Cumul Pts
                                                        <ArrowUpDown className={cn("w-3 h-3 transition-opacity", sortConfig.key === 'cumulPts' ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                                                    </div>
                                                </th>

                                                <th
                                                    className="p-4 font-normal text-center text-purple-400 cursor-pointer hover:bg-slate-800/50 transition-colors group"
                                                    onClick={() => handleSort('record')}
                                                >
                                                    <div className="flex items-center justify-center gap-1">
                                                        Record
                                                        <ArrowUpDown className={cn("w-3 h-3 transition-opacity", sortConfig.key === 'record' ? "opacity-100" : "opacity-30 group-hover:opacity-100")} />
                                                    </div>
                                                </th>
                                            </>
                                        )}

                                        <th className="p-4 font-bold text-right text-indigo-300 bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors group"
                                            onClick={() => handleSort('default')}>
                                            <div className="flex items-center justify-end gap-2">
                                                TOTAL CHAMP.
                                                {sortConfig.key === 'default' && <ArrowUpDown className="w-3 h-3" />}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {sortedRankings.map((p, idx) => (
                                        <tr key={p.id} className="hover:bg-slate-800/50 transition-colors group">
                                            <td className="p-4 font-mono font-bold text-slate-500">
                                                {idx + 1 === 1 ? <Trophy className="w-5 h-5 text-yellow-500" /> : `#${idx + 1}`}
                                            </td>
                                            <td className="p-4 font-medium text-white text-lg flex items-center gap-3">
                                                <Link to={`/players/${p.id}`} className="hover:text-indigo-400 hover:underline transition-colors">
                                                    {p.name}
                                                </Link>
                                            </td>

                                            {/* Simple Data */}
                                            {viewMode === 'simple' && Object.values(RACE_CATEGORIES).map(cat => (
                                                <td key={cat.id} className="p-4 text-right hidden md:table-cell text-slate-500 font-mono">
                                                    {p.categories[cat.id] ? <span className="text-slate-300">+{p.categories[cat.id]}</span> : '-'}
                                                </td>
                                            ))}

                                            {/* Detailed Data */}
                                            {viewMode === 'detailed' && (
                                                <>
                                                    <td className="p-4 text-center font-mono text-slate-300">
                                                        {p.racesParticipated}
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-amber-500/80">
                                                        {p.wins > 0 ? p.wins : <span className="text-slate-700">-</span>}
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-slate-300">
                                                        {p.podiums > 0 ? p.podiums : <span className="text-slate-700">-</span>}
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-green-400">
                                                        {(p.sumOfRanks / p.racesParticipated).toFixed(1)}
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-indigo-400" title="Moyenne des scores bruts par course">
                                                        {Math.round(p.totalRacePoints / p.racesParticipated)}
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-blue-400 font-bold">
                                                        {Math.round(p.totalRacePoints)}
                                                    </td>
                                                    <td className="p-4 text-center font-mono text-purple-400">
                                                        {Math.round(p.maxRacePoints || 0)}
                                                    </td>
                                                </>
                                            )}

                                            <td className="p-4 text-right font-black text-indigo-400 text-2xl bg-indigo-500/5 shadow-[inset_4px_0_0_0_rgba(99,102,241,0.2)]">
                                                {p.totalChampionshipPoints}
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedRankings.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="p-12 text-center text-slate-500">
                                                Aucune donnée disponible. Terminez des courses pour voir le classement.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}
