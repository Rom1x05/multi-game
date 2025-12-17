import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, User, UserX, AlertCircle, Search } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent } from './ui/Card';
import { cn } from '../utils/cn';

export default function PlayerManager() {
    const navigate = useNavigate();
    const { players, addPlayer, removePlayer, races } = useGame();
    const [newName, setNewName] = useState('');
    const [search, setSearch] = useState('');

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName.trim()) return;
        addPlayer(newName.trim());
        setNewName('');
    };

    const handleRemove = (e, id) => {
        e.stopPropagation(); // Prevent navigation
        const player = players.find(p => p.id === id);

        // Check usage
        const hasPlayed = races.some(r => r.playerIds.includes(id));

        if (hasPlayed) {
            alert(`Impossible de supprimer ${player.name} : ce joueur a participé à des courses. Vous ne pouvez pas le supprimer pour préserver l'historique.`);
            return;
        }

        if (window.confirm(`Voulez-vous vraiment supprimer ${player.name} ?`)) {
            removePlayer(id);
        }
    };

    const filteredPlayers = players.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Layout>
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Gestion des Joueurs</h1>
                    <p className="text-slate-400">Ajoutez des participants ou consultez leurs profils détaillés.</p>
                </div>

                <Card className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                        <form onSubmit={handleAdd} className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-slate-400 mb-2">Nouveau joueur</label>
                                <Input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Prénom ou Surnom..."
                                    className="bg-slate-950"
                                />
                            </div>
                            <Button type="submit" size="lg" className="bg-indigo-600 hover:bg-indigo-500">
                                <Plus className="w-5 h-5 mr-2" />
                                Ajouter
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4 bg-slate-900/30 p-2 rounded-lg border border-slate-800/50">
                    <Search className="w-5 h-5 text-slate-500 ml-2" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher un joueur..."
                        className="bg-transparent border-none focus:outline-none text-slate-200 w-full placeholder:text-slate-600"
                    />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPlayers.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                            Aucun joueur trouvé.
                        </div>
                    ) : (
                        filteredPlayers.map(player => {
                            const isUsed = races.some(r => r.playerIds.includes(player.id));
                            return (
                                <div
                                    key={player.id}
                                    onClick={() => navigate(`/players/${player.id}`)}
                                    className="group relative bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col items-center gap-3 transition-all cursor-pointer hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1"
                                >
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-2xl font-bold text-slate-300 shadow-inner group-hover:from-indigo-600 group-hover:to-purple-600 group-hover:text-white transition-colors">
                                        {player.name.charAt(0)}
                                    </div>

                                    <div className="text-center">
                                        <h3 className="font-bold text-slate-100 truncate max-w-[150px]">{player.name}</h3>
                                        <p className="text-xs text-slate-500">{isUsed ? 'Actif' : 'Nouveau'}</p>
                                    </div>

                                    <button
                                        onClick={(e) => handleRemove(e, player.id)}
                                        className={cn(
                                            "absolute top-2 right-2 p-2 rounded-full transition-colors",
                                            isUsed
                                                ? "text-slate-600 hover:bg-slate-700 cursor-not-allowed opacity-50"
                                                : "text-slate-500 hover:bg-red-500/20 hover:text-red-400"
                                        )}
                                        title={isUsed ? "Ce joueur ne peut pas être supprimé" : "Supprimer"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </Layout>
    );
}
