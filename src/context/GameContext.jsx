import React, { createContext, useContext, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export function GameProvider({ children }) {
    const [players, setPlayers] = useLocalStorage('mg_players', []);
    const [races, setRaces] = useLocalStorage('mg_races', []);
    const [activeRaceId, setActiveRaceId] = useLocalStorage('mg_active_race_id', null);

    const activeRace = races.find(r => r.id === activeRaceId) || null;

    const addPlayer = (name) => {
        const newPlayer = { id: uuidv4(), name, createdAt: new Date().toISOString() };
        setPlayers(prev => [...prev, newPlayer]);
        return newPlayer;
    };

    const updatePlayer = (id, updates) => {
        setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    };

    const removePlayer = (id) => {
        setPlayers(prev => prev.filter(p => p.id !== id));
    };

    const createRace = (name, events, playerIds, metadata = {}) => {
        const newRace = {
            id: uuidv4(),
            name,
            createdAt: new Date().toISOString(),
            events, // [{id, name, type, ...}]
            playerIds,
            scores: {}, // { [playerId]: { [eventId]: score } }
            status: 'ongoing',
            ...metadata // Spread location, date, categoryId, etc.
        };
        setRaces(prev => [...prev, newRace]);
        setActiveRaceId(newRace.id);
        return newRace;
    };

    const updatePlayerRun = (raceId, playerId, totalTime, eventScores) => {
        setRaces(prev => prev.map(race => {
            if (race.id !== raceId) return race;

            const newScores = { ...race.scores };
            if (!newScores[playerId]) newScores[playerId] = {};

            // Update Time if provided
            if (totalTime !== undefined) {
                newScores[playerId]['total_time'] = totalTime;
            }

            // Update Event Scores
            Object.entries(eventScores).forEach(([eventId, score]) => {
                newScores[playerId][eventId] = score;
            });

            return { ...race, scores: newScores };
        }));
    };

    const finishRace = (raceId) => {
        setRaces(prev => prev.map(race => {
            if (race.id !== raceId) return race;
            return { ...race, status: 'finished', endedAt: new Date().toISOString() };
        }));
        if (activeRaceId === raceId) setActiveRaceId(null);
    };

    const updateRaceMetadata = (raceId, updates) => {
        setRaces(prev => prev.map(race => {
            if (race.id !== raceId) return race;
            return { ...race, ...updates };
        }));
    };

    const deleteRace = (raceId) => {
        setRaces(prev => prev.filter(r => r.id !== raceId));
        if (activeRaceId === raceId) setActiveRaceId(null);
    };

    const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('mg_admin') === 'true');

    const login = (code) => {
        if (code === '2005') {
            setIsAdmin(true);
            sessionStorage.setItem('mg_admin', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAdmin(false);
        sessionStorage.removeItem('mg_admin');
    };

    const verifyAdmin = () => {
        if (isAdmin) return true;
        const code = prompt("🔒 Accès Administrateur requis\nEntrez le code secret :");
        if (login(code)) {
            return true;
        }
        alert("⛔ Code incorrect. Accès refusé.");
        return false;
    };

    const exportData = () => {
        const data = {
            version: 1,
            exportedAt: new Date().toISOString(),
            players,
            races
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup_multigame_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const importData = (jsonData, mode = 'merge') => {
        try {
            if (!jsonData || !jsonData.version || !Array.isArray(jsonData.players) || !Array.isArray(jsonData.races)) {
                throw new Error("Format de fichier invalide");
            }

            if (mode === 'replace') {
                setPlayers(jsonData.players);
                setRaces(jsonData.races);
                return { success: true, message: "Données remplacées avec succès." };
            }

            if (mode === 'merge') {
                // Merge Players
                const newPlayers = [...players];
                let pCount = 0;
                jsonData.players.forEach(p => {
                    if (!newPlayers.find(existing => existing.id === p.id)) {
                        newPlayers.push(p);
                        pCount++;
                    }
                });

                // Merge Races
                const newRaces = [...races];
                let rCount = 0;
                jsonData.races.forEach(r => {
                    if (!newRaces.find(existing => existing.id === r.id)) {
                        newRaces.push(r);
                        rCount++;
                    }
                });

                setPlayers(newPlayers);
                setRaces(newRaces);
                return { success: true, message: `Fusion terminée : ${pCount} joueurs et ${rCount} courses ajoutés.` };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: "Erreur lors de l'import : " + error.message };
        }
    };

    return (
        <GameContext.Provider value={{
            players,
            races,
            activeRace,
            isAdmin,
            addPlayer,
            updatePlayer,
            removePlayer,
            createRace,
            updatePlayerRun,
            updateRaceMetadata,
            finishRace,
            deleteRace,
            setActiveRaceId,
            login,
            logout,
            login,
            logout,
            verifyAdmin,
            exportData,
            importData
        }}>
            {children}
        </GameContext.Provider>
    );
}
