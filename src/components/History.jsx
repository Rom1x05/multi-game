import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Lock, Unlock, Edit, Eye, ShieldAlert, Calendar, MapPin, Check, Trophy, Medal, Crown } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../utils/cn';
import { calculateRaceResults } from '../utils/scoring';

export default function History() {
    const navigate = useNavigate();
    const { races, players, updateRaceMetadata, deleteRace, verifyAdmin } = useGame();

    // Local state for interactions
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});

    // Sort by date desc
    const sortedRaces = [...races].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const handleEditClick = (race, e) => {
        e.stopPropagation();
        if (!verifyAdmin()) return;
        setEditingId(race.id);
        setEditForm({
            name: race.name,
            location: race.location || '',
            date: race.date || ''
        });
    };

    const saveEdit = (id) => {
        updateRaceMetadata(id, editForm);
        setEditingId(null);
    };

    const handleLockToggle = (race, e) => {
        e.stopPropagation();
        if (!verifyAdmin()) return;

        if (race.locked) {
            updateRaceMetadata(race.id, { locked: false, pinCode: null });
        } else {
            updateRaceMetadata(race.id, { locked: true });
        }
    };

    const handleDelete = (race, e) => {
        e.stopPropagation();
        if (!verifyAdmin()) return;

        if (confirm(`Êtes-vous sûr de vouloir supprimer "${race.name}" ?`)) {
            deleteRace(race.id);
        }
    };

    const getRacePodium = (race) => {
        // Calculate results on the fly for the preview
        const res = calculateRaceResults(race, players);
        if (!res || !res.globalStanding) return [];
        return res.globalStanding.slice(0, 3);
    };

    return (
        <Layout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2">Historique</h1>
                        <p className="text-slate-400 text-lg">Retrouvez toutes vos compétitions passées et leurs podiums.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {sortedRaces.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
                            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Aucune course enregistrée.</p>
                            <Button variant="link" onClick={() => navigate('/race/new')} className="mt-2 text-indigo-400 text-lg">
                                Lancer une nouvelle compétition
                            </Button>
                        </div>
                    ) : (
                        sortedRaces.map(race => {
                            const podium = getRacePodium(race);
                            const isEditing = editingId === race.id;

                            return (
                                <div
                                    key={race.id}
                                    onClick={(e) => !isEditing && navigate(race.status === 'finished' ? `/race/${race.id}/results` : `/race/${race.id}`)}
                                    className={cn(
                                        "group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer",
                                        race.status === 'finished'
                                            ? "bg-slate-900/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-900/20"
                                            : "bg-slate-900 border-green-900/30 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-900/20"
                                    )}
                                >
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                                    <div className="relative p-6 md:p-8 flex flex-col gap-6">

                                        {/* Header Row */}
                                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                {isEditing ? (
                                                    <div className="grid gap-3 max-w-md bg-slate-950 p-4 rounded-xl border border-indigo-500/50 shadow-xl z-20 relative" onClick={e => e.stopPropagation()}>
                                                        <Input
                                                            value={editForm.name}
                                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                            placeholder="Nom de la course"
                                                            className="text-lg font-bold"
                                                            autoFocus
                                                        />
                                                        <div className="flex gap-2">
                                                            <Input
                                                                value={editForm.location}
                                                                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                                                placeholder="Lieu"
                                                            />
                                                            <Input
                                                                type="date"
                                                                value={editForm.date}
                                                                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="flex gap-2 mt-2 justify-end">
                                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>Annuler</Button>
                                                            <Button size="sm" onClick={(e) => { e.stopPropagation(); saveEdit(race.id); }} className="bg-green-600 hover:bg-green-500">
                                                                <Check className="w-4 h-4 mr-2" /> Valider
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <div className="flex items-start gap-3 mb-2">
                                                            <h3 className="text-xl md:text-2xl font-black text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight">{race.name}</h3>
                                                            {race.locked && <Lock className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />}
                                                            <span className={cn(
                                                                "flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                                                race.status === 'finished'
                                                                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                                                                    : "bg-green-500/10 text-green-400 border border-green-500/20 animate-pulse"
                                                            )}>
                                                                {race.status === 'finished' ? 'Terminé' : 'En cours'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
                                                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-slate-500" /> {race.date || new Date(race.createdAt).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-500" /> {race.location || 'Lieu non défini'}</span>
                                                            <span className="flex items-center gap-1.5"><Trophy className="w-4 h-4 text-slate-500" /> {race.events?.length || 0} épreuves</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-lg border border-slate-800/50 backdrop-blur-sm opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity absolute top-6 right-6 md:static" onClick={e => e.stopPropagation()}>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white" onClick={(e) => handleEditClick(race, e)} disabled={isEditing || race.locked}><Edit className="w-4 h-4" /></Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white" onClick={(e) => handleLockToggle(race, e)}>{race.locked ? <Unlock className="w-4 h-4 text-amber-500" /> : <Lock className="w-4 h-4" />}</Button>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-500" onClick={(e) => handleDelete(race, e)}><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>

                                        {/* Podium Preview Section */}
                                        {race.status === 'finished' && podium.length > 0 && (
                                            <div className="border-t border-slate-800 pt-6 mt-2">
                                                <div className="flex flex-col gap-3">
                                                    {/* 1st Place */}
                                                    {podium[0] && (
                                                        <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/10 to-transparent p-2 pr-4 rounded-xl border border-yellow-500/30">
                                                            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-yellow-500 flex items-center justify-center font-bold text-yellow-500 shadow-lg shadow-yellow-500/20 text-sm flex-shrink-0">
                                                                1
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span className="block text-xs text-yellow-500 font-bold leading-none mb-0.5 uppercase tracking-wider">Vainqueur</span>
                                                                <span className="block text-white font-bold text-base leading-none truncate">{podium[0].name}</span>
                                                            </div>
                                                            <Trophy className="w-5 h-5 text-yellow-500 ml-auto opacity-50" />
                                                        </div>
                                                    )}

                                                    {/* 2nd & 3rd Place */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {podium[1] && (
                                                            <div className="flex items-center gap-2 opacity-80 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700">
                                                                <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-400 flex items-center justify-center text-[10px] font-bold text-slate-300 flex-shrink-0">2</div>
                                                                <span className="text-slate-300 font-medium text-xs truncate">{podium[1].name}</span>
                                                            </div>
                                                        )}
                                                        {podium[2] && (
                                                            <div className="flex items-center gap-2 opacity-80 bg-slate-800/50 p-1.5 rounded-lg border border-slate-700">
                                                                <div className="w-5 h-5 rounded-full bg-slate-800 border border-amber-700 flex items-center justify-center text-[10px] font-bold text-amber-600 flex-shrink-0">3</div>
                                                                <span className="text-slate-300 font-medium text-xs truncate">{podium[2].name}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Active Race Status Bar */}
                                        {race.status !== 'finished' && (
                                            <div className="mt-2">
                                                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 w-1/3 animate-pulse" />
                                                </div>
                                                <div className="flex justify-between items-center mt-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                                                    <span>Compétition en cours</span>
                                                    <span>Cliquez pour reprendre</span>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
}
