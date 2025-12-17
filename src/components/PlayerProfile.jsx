import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Save, User, Activity, Trophy, Medal, Calendar, Ruler, Weight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { calculateRaceResults } from '../utils/scoring';
import { cn } from '../utils/cn';

export default function PlayerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { players, races, updatePlayer } = useGame();

    const player = players.find(p => p.id === id);

    if (!player) return <Layout>Joueur introuvable</Layout>;

    // Editable Bio State
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        age: player.age || '',
        height: player.height || '',
        weight: player.weight || '',
        bio: player.bio || '' // "phrase personnalisée"
    });

    const handleSave = () => {
        updatePlayer(player.id, formData);
        setIsEditing(false);
    };

    // Stats Calculation
    const stats = useMemo(() => {
        let totalRaces = 0;
        let wins = 0;
        let podiums = 0;
        let totalPoints = 0;
        let maxScore = 0;
        let bestRank = 999;

        // Get participation history
        const history = races
            .filter(r => r.playerIds.includes(player.id) && r.status === 'finished')
            .map(race => {
                const res = calculateRaceResults(race, players);
                const pRes = res?.globalStanding.find(p => p.id === player.id);

                if (pRes) {
                    totalRaces++;
                    totalPoints += pRes.totalPoints; // Race Points
                    if (pRes.rank === 1) wins++;
                    if (pRes.rank <= 3) podiums++;
                    if (pRes.rank < bestRank) bestRank = pRes.rank;
                    if (pRes.totalPoints > maxScore) maxScore = pRes.totalPoints;

                    return {
                        raceId: race.id,
                        name: race.name,
                        date: race.date || race.createdAt,
                        category: race.categoryName || 'N/A',
                        rank: pRes.rank,
                        points: pRes.totalPoints,
                        champPoints: pRes.championshipPoints
                    };
                }
                return null;
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
            totalRaces,
            wins,
            podiums,
            totalPoints,
            avgPoints: totalRaces > 0 ? Number((totalPoints / totalRaces).toFixed(0)) : 0,
            bestRank: bestRank === 999 ? '-' : bestRank,
            history
        };
    }, [races, player.id, players]);

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8">
                <Button variant="ghost" onClick={() => navigate('/players')} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux joueurs
                </Button>

                {/* HEADER / BIO CARD */}
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="md:col-span-1 bg-gradient-to-b from-slate-800 to-slate-900 border-none shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600/20 z-0" />
                        <CardContent className="relative z-10 flex flex-col items-center pt-12 pb-8 text-center">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-4xl font-bold text-indigo-400 shadow-xl mb-4">
                                {player.name.charAt(0)}
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-1">{player.name}</h1>
                            <p className="text-indigo-300 text-sm uppercasetracking-wider font-semibold">Athlète MultiGame</p>

                            <div className="mt-8 w-full space-y-4">
                                {isEditing ? (
                                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg text-left">
                                        <div>
                                            <label className="text-xs text-slate-500">Âge</label>
                                            <Input value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} placeholder="25 ans" size="sm" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-xs text-slate-500">Taille (cm)</label>
                                                <Input value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} placeholder="180" size="sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Poids (kg)</label>
                                                <Input value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} placeholder="75" size="sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Bio</label>
                                            <Input value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Phrase perso..." size="sm" />
                                        </div>
                                        <Button size="sm" className="w-full bg-indigo-600" onClick={handleSave}><Save className="w-4 h-4 mr-2" /> Enregistrer</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4" onClick={() => setIsEditing(true)}>
                                        <div className="flex justify-center gap-6 text-sm">
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-400 flex items-center gap-1"><Calendar className="w-3 h-3" /> Âge</span>
                                                <span className="font-bold text-white">{formData.age || '-'} ans</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-400 flex items-center gap-1"><Ruler className="w-3 h-3" /> Taille</span>
                                                <span className="font-bold text-white">{formData.height || '-'} cm</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <span className="text-slate-400 flex items-center gap-1"><Weight className="w-3 h-3" /> Poids</span>
                                                <span className="font-bold text-white">{formData.weight || '-'} kg</span>
                                            </div>
                                        </div>
                                        {formData.bio && (
                                            <div className="bg-white/5 p-3 rounded-lg text-sm text-slate-300 italic">
                                                "{formData.bio}"
                                            </div>
                                        )}
                                        <Button variant="ghost" size="sm" className="w-full text-slate-500 hover:text-white">
                                            <Edit2 className="w-3 h-3 mr-2" /> Modifier profil
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* RIGHT COLUMN: STATS & HISTORY */}
                    <div className="md:col-span-2 space-y-6">
                        {/* KPI CARDS */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <Activity className="w-8 h-8 text-indigo-500 mb-2" />
                                    <span className="text-2xl font-black text-white">{stats.totalRaces}</span>
                                    <span className="text-xs text-slate-500 uppercase">Courses</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <Trophy className="w-8 h-8 text-amber-400 mb-2" />
                                    <span className="text-2xl font-black text-white">{stats.wins}</span>
                                    <span className="text-xs text-slate-500 uppercase">Victoires</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <Medal className="w-8 h-8 text-slate-300 mb-2" />
                                    <span className="text-2xl font-black text-white">{stats.podiums}</span>
                                    <span className="text-xs text-slate-500 uppercase">Podiums</span>
                                </CardContent>
                            </Card>
                            <Card className="bg-slate-900 border-slate-800">
                                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                                    <span className="text-lg font-bold text-green-400 mb-1">#{stats.bestRank}</span>
                                    <span className="text-xs text-slate-500 uppercase">Meilleur Rang</span>
                                </CardContent>
                            </Card>
                        </div>

                        {/* HISTORY TABLE */}
                        <Card>
                            <CardHeader><CardTitle>Historique des Performances</CardTitle></CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-slate-400 text-sm border-b border-slate-800">
                                                <th className="p-3 font-normal">Date</th>
                                                <th className="p-3 font-normal">Course</th>
                                                <th className="p-3 font-normal">Catégorie</th>
                                                <th className="p-3 font-normal text-center">Rang</th>
                                                <th className="p-3 font-normal text-right">Pts</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {stats.history.length === 0 ? (
                                                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Aucune course terminée.</td></tr>
                                            ) : (
                                                stats.history.map(run => (
                                                    <tr key={run.raceId} className="hover:bg-slate-800/50 transition-colors cursor-pointer" onClick={() => navigate(`/race/${run.raceId}/results`)}>
                                                        <td className="p-3 text-slate-400 text-sm">{new Date(run.date).toLocaleDateString()}</td>
                                                        <td className="p-3 font-medium text-white">{run.name}</td>
                                                        <td className="p-3 text-xs uppercase tracking-wider text-slate-500">{run.category}</td>
                                                        <td className="p-3 text-center">
                                                            <span className={cn(
                                                                "px-2 py-0.5 rounded font-bold text-sm",
                                                                run.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                                                                    run.rank === 2 ? "bg-slate-300/20 text-slate-300" :
                                                                        run.rank === 3 ? "bg-amber-700/20 text-amber-600" :
                                                                            "text-slate-500"
                                                            )}>
                                                                {run.rank === 1 ? '1er' : `${run.rank}e`}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-right font-mono text-indigo-400">+{run.champPoints}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
