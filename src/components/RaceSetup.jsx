import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, ArrowRight, MapPin, Calendar, Medal } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardTitle, CardHeader } from './ui/Card';
import { EVENT_TYPES, RACE_CATEGORIES, DEFAULT_SPORTS_LIST } from '../constants';

const INITIAL_EVENTS = DEFAULT_SPORTS_LIST.map((name, idx) => ({
    id: `def_${idx}`,
    name,
    type: EVENT_TYPES.SCORE
}));

export default function RaceSetup() {
    const navigate = useNavigate();
    const { players, createRace } = useGame();

    const [raceName, setRaceName] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState('major');

    const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
    const [events, setEvents] = useState(INITIAL_EVENTS);
    const [newEventName, setNewEventName] = useState('');

    const togglePlayer = (id) => {
        setSelectedPlayerIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const addEvent = (name) => {
        const title = name || newEventName;
        if (!title.trim()) return;

        const newEvent = {
            id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: title.trim(),
            type: EVENT_TYPES.SCORE
        };
        setEvents([...events, newEvent]);
        if (!name) setNewEventName('');
    };

    const unusedDefaults = DEFAULT_SPORTS_LIST.filter(sport => !events.some(e => e.name === sport));

    const removeEvent = (id) => {
        setEvents(events.filter(e => e.id !== id));
    };

    const handleCreate = () => {
        if (!raceName.trim()) return alert("Nom de la course requis");
        if (selectedPlayerIds.length === 0) return alert("Sélectionnez au moins un joueur");
        if (events.length === 0) return alert("Ajoutez au moins une épreuve");

        const category = Object.values(RACE_CATEGORIES).find(c => c.id === categoryId);

        // Pass extra metadata
        const race = createRace(raceName, events, selectedPlayerIds, {
            location,
            date,
            categoryId,
            categoryName: category?.name
        });
        navigate(`/race/${race.id}`);
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto grid gap-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Nouvelle Course</h1>
                    <p className="text-slate-400">Configurez votre compétition MultiGame.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Details & Events */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>1. Informations</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Nom de la course</label>
                                    <Input
                                        value={raceName}
                                        onChange={(e) => setRaceName(e.target.value)}
                                        placeholder="ex: Championnat d'été"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <MapPin className="w-3 h-3" /> Lieu
                                        </label>
                                        <Input
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            placeholder="Stade..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                                        <Medal className="w-3 h-3" /> Catégorie (Points Championnat)
                                    </label>
                                    <select
                                        value={categoryId}
                                        onChange={(e) => setCategoryId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-md h-10 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {Object.values(RACE_CATEGORIES).map(cat => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name} (1er: {cat.points[0]}pts)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>3. Épreuves du Parcours</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {events.map((event, idx) => (
                                        <div key={event.id} className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700">
                                            <span className="text-slate-200 font-medium">#{idx + 1} {event.name}</span>
                                            <button onClick={() => removeEvent(event.id)} className="text-slate-500 hover:text-red-400">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2 mt-4">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sports disponibles</label>
                                    <div className="flex flex-wrap gap-2">
                                        {unusedDefaults.map(sport => (
                                            <button
                                                key={sport}
                                                onClick={() => addEvent(sport)}
                                                className="px-3 py-1 bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs rounded-full border border-slate-700 transition-colors"
                                            >
                                                + {sport}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-800">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Ajouter autre</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newEventName}
                                            onChange={(e) => setNewEventName(e.target.value)}
                                            placeholder="Nom de l'épreuve..."
                                            className="h-9 text-sm"
                                            onKeyDown={(e) => { if (e.key === 'Enter') addEvent(); }}
                                        />
                                        <Button onClick={() => addEvent()} size="sm" variant="secondary">
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Players */}
                    <div>
                        <Card className="h-full">
                            <CardHeader className="flex flex-row justify-between items-center">
                                <CardTitle>2. Joueurs</CardTitle>
                                <span className="text-sm text-slate-400">{selectedPlayerIds.length} sélectionné(s)</span>
                            </CardHeader>
                            <CardContent>
                                {players.length === 0 ? (
                                    <p className="text-slate-500 text-sm">Prévoyez d'ajout des joueurs dans le menu "Joueurs".</p>
                                ) : (
                                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                                        {players.map(player => (
                                            <label key={player.id} className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 cursor-pointer border border-transparent hover:border-slate-700 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlayerIds.includes(player.id)}
                                                    onChange={() => togglePlayer(player.id)}
                                                    className="w-5 h-5 rounded border-slate-600 bg-slate-700 checked:bg-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-slate-200">{player.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800">
                    <Button size="lg" onClick={handleCreate} className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600">
                        Lancer la compétition
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </div>
        </Layout>
    );
}
