import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, Save, ChevronRight, CheckCircle, RotateCcw, Play, Pause, AlertTriangle, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Layout } from './Layout';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { cn } from '../utils/cn';
import { EVENT_TYPES, TIME_SCORING_POINTS } from '../constants';

// Format HH:MM:SS.ms
const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const cent = Math.floor((ms % 1000) / 10);
    return `${min}:${sec.toString().padStart(2, '0')}.${cent.toString().padStart(2, '0')}`;
};

export default function ActiveRace() {
    const { id } = useParams();
    const navigate = useNavigate();
    // Using updatePlayerRun for atomic batch save
    const { races, players, updatePlayerRun, finishRace } = useGame();

    const race = races.find(r => r.id === id);
    if (!race) return <Layout>Course introuvable.</Layout>;

    // Selection state
    const [activePlayerId, setActivePlayerId] = useState(null);
    const racePlayers = players.filter(p => race.playerIds.includes(p.id));

    // Timer state (local to this component/session)
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    // Local cache for inputs to allow batch save
    // { [eventId]: score }
    const [currentRunScores, setCurrentRunScores] = useState({});

    // Penalties / Bonuses State
    const [timePenalty, setTimePenalty] = useState(''); // Seconds
    const [scorePenalty, setScorePenalty] = useState(''); // Points

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => setTime(t => t + 10), 10);
        }
        return () => clearInterval(interval);
    }, [isRunning]);


    const MAIN_TIME_KEY = 'total_time';
    const PENALTY_TIME_KEY = 'penalty_time';
    const PENALTY_SCORE_KEY = 'penalty_score';

    const activePlayer = players.find(p => p.id === activePlayerId);

    const handlePlayerSelect = (pid) => {
        setActivePlayerId(pid);
        const existingTime = race.scores?.[pid]?.[MAIN_TIME_KEY] || 0;
        setTime(existingTime);
        setIsRunning(false);

        // Load existing event scores into local state
        const playerScores = race.scores?.[pid] || {};
        const initialScores = {};
        race.events.forEach(ev => {
            initialScores[ev.id] = playerScores[ev.id] || '';
        });
        setCurrentRunScores(initialScores);

        // Load penalties
        // stored in ms for time, convert to seconds for display
        const pTime = playerScores[PENALTY_TIME_KEY] || 0;
        const pScore = playerScores[PENALTY_SCORE_KEY] || 0;

        setTimePenalty(pTime !== 0 ? (pTime / 1000).toString() : '');
        setScorePenalty(pScore !== 0 ? pScore.toString() : '');
    };

    const activePlayerHasRun = activePlayerId && race.scores?.[activePlayerId]?.[MAIN_TIME_KEY] !== undefined;

    const handleScoreChange = (eventId, val) => {
        setCurrentRunScores(prev => ({
            ...prev,
            [eventId]: val
        }));
    };

    const handleSaveRun = () => {
        if (isRunning) {
            if (!window.confirm("Le chrono tourne encore. Voulez-vous l'arrêter et sauvegarder ?")) return;
            setIsRunning(false);
        }

        // Prepare scores object including penalties
        const finalScores = { ...currentRunScores };

        // Convert time penalty (seconds input) to ms
        const tPenaltyMs = timePenalty ? parseFloat(timePenalty.replace(',', '.')) * 1000 : 0;
        // Score penalty raw
        const sPenalty = scorePenalty ? parseFloat(scorePenalty.replace(',', '.')) : 0;

        // We attach these as distinct keys in the scores object
        finalScores[PENALTY_TIME_KEY] = tPenaltyMs;
        finalScores[PENALTY_SCORE_KEY] = sPenalty;

        // Atomic update
        updatePlayerRun(race.id, activePlayerId, time, finalScores);

        alert(`Données sauvegardées pour ${activePlayer.name}`);
        setActivePlayerId(null);
    };

    const handleFinishRace = () => {
        if (window.confirm("Terminer la course et voir les résultats ?")) {
            finishRace(race.id);
            navigate(`/race/${race.id}/results`);
        }
    };

    return (
        <Layout>
            <div className="grid lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">

                {/* LEFT COLUMN: Player List & Race Info */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded border border-green-500/20 animate-pulse">En cours</span>
                                <h2 className="text-xl font-bold text-white">{race.name}</h2>
                            </div>
                            <div className="text-sm text-slate-400 space-y-1">
                                <p className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500" /> {race.categoryName}</p>
                                <p className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-500" /> {race.events.length} Épreuves</p>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="flex-1 overflow-hidden flex flex-col">
                        <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
                        <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2">
                            {racePlayers.map(p => {
                                const hasRun = race.scores?.[p.id]?.[MAIN_TIME_KEY] !== undefined;
                                const isActive = activePlayerId === p.id;
                                return (
                                    <button
                                        key={p.id}
                                        onClick={() => handlePlayerSelect(p.id)}
                                        className={cn(
                                            "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                                            isActive
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                                                : hasRun
                                                    ? "bg-slate-900/50 border-green-900/30 text-slate-400"
                                                    : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                                        )}
                                    >
                                        <span className="font-medium">{p.name}</span>
                                        {hasRun && <CheckCircle className="w-4 h-4 text-green-500" />}
                                        {isActive && <ChevronRight className="w-4 h-4 animate-bounce-x" />}
                                    </button>
                                );
                            })}
                        </CardContent>
                        <div className="pt-4 border-t border-slate-800 mt-auto">
                            <Button variant="danger" className="w-full" onClick={handleFinishRace}>
                                Terminer la compétition
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* CENTER/RIGHT: Active Run Area */}
                <div className="lg:col-span-2">
                    {activePlayer ? (
                        <div className="flex flex-col h-full gap-6">
                            {/* CHRONO HEADER */}
                            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Joueur en piste</h3>
                                        <h1 className="text-4xl font-bold text-white mt-1">{activePlayer.name}</h1>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className={cn("font-mono text-6xl font-black tabular-nums tracking-tighter", isRunning ? "text-indigo-400" : "text-slate-200")}>
                                            {formatTime(time)}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="lg"
                                                onClick={() => setIsRunning(!isRunning)}
                                                className={cn("w-32", isRunning ? "bg-amber-600 hover:bg-amber-700" : "bg-green-600 hover:bg-green-700")}
                                            >
                                                {isRunning ? <><Pause className="mr-2" /> Pause</> : <><Play className="mr-2" /> Start</>}
                                            </Button>
                                            <Button size="lg" variant="secondary" onClick={() => { setIsRunning(false); setTime(0); }}>
                                                <RotateCcw className="w-5 h-5" />
                                            </Button>
                                            <Button size="lg" variant="ghost" className="text-slate-500" onClick={() => {
                                                const newTime = prompt("Entrez le temps en ms (ex: 20000 = 20s):", time);
                                                if (newTime !== null) setTime(parseInt(newTime));
                                            }}>
                                                Edit
                                            </Button>

                                            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-900/20" onClick={handleSaveRun}>
                                                <Save className="w-5 h-5 md:mr-2" />
                                                <span className="hidden md:inline">Valider</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SCORING GRID */}
                            <Card className="flex-1 overflow-auto">
                                <CardHeader><CardTitle>Performances</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    {/* EVENTS */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {race.events.map((event, idx) => (
                                            <div key={event.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500">
                                                        {idx + 1}
                                                    </div>
                                                    <span className="font-medium text-slate-200">{event.name}</span>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        inputMode="decimal"
                                                        value={currentRunScores[event.id] || ''}
                                                        onChange={(e) => handleScoreChange(event.id, e.target.value)}
                                                        className="w-24 text-right pr-8 font-mono text-lg bg-slate-900 border-slate-700 focus:bg-slate-800"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">
                                                        pts
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PENALTIES / BONUS */}
                                    <div className="border-t border-slate-800 pt-6">
                                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Ajustements (Optionnel)</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                    <div>
                                                        <span className="font-medium text-slate-200 block">Pénalité Temps</span>
                                                        <span className="text-xs text-slate-500">Ajoute du temps au chrono (+/-)</span>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        inputMode="decimal"
                                                        placeholder="0"
                                                        value={timePenalty}
                                                        onChange={(e) => setTimePenalty(e.target.value)}
                                                        className="w-24 text-right pr-8 font-mono text-lg bg-slate-900 border-slate-700 focus:bg-slate-800"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">
                                                        sec
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/30 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                                    <div>
                                                        <span className="font-medium text-slate-200 block">Pénalité Points</span>
                                                        <span className="text-xs text-slate-500">Retire des points au score (+/-)</span>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        inputMode="decimal"
                                                        placeholder="0"
                                                        value={scorePenalty}
                                                        onChange={(e) => setScorePenalty(e.target.value)}
                                                        className="w-24 text-right pr-8 font-mono text-lg bg-slate-900 border-slate-700 focus:bg-slate-800"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs pointer-events-none">
                                                        pts
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-900/20">
                            <Clock className="w-16 h-16 mb-4 opacity-50" />
                            <h3 className="text-xl font-medium text-slate-300 mb-2">En attente de coureur</h3>
                            <p>Sélectionnez un participant dans la liste de gauche pour lancer son Chrono.</p>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
