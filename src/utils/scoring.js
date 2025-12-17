import { EVENT_TYPES, RACE_CATEGORIES, TIME_SCORING_POINTS } from '../constants';

export function calculateRaceResults(race, players) {
    if (!race || !players) return null;

    const racePlayers = players.filter(p => race.playerIds.includes(p.id));
    const category = Object.values(RACE_CATEGORIES).find(c => c.id === race.categoryId) || RACE_CATEGORIES.MAJOR;

    const eventStandings = {};
    const playerTotals = {}; // { [playerId]: totalPoints }
    const timeStandings = []; // Special handling for time

    // Initialize totals safely
    racePlayers.forEach(p => {
        playerTotals[p.id] = 0;
    });

    // 1. Calculate Time Points (Dynamic based on rank)
    const timeScores = racePlayers.map(p => {
        const rawTime = parseFloat(race.scores?.[p.id]?.['total_time'] || 0);
        const penaltyTime = parseFloat(race.scores?.[p.id]?.['penalty_time'] || 0); // already in ms
        const finalTime = rawTime + penaltyTime; // Penalty ADDS time

        return {
            playerId: p.id,
            name: p.name,
            time: finalTime
        };
    }).filter(s => s.time > 0);

    // Sort by time (ascending)
    timeScores.sort((a, b) => a.time - b.time);

    // Assign Time Points
    timeScores.forEach((s, idx) => {
        const points = TIME_SCORING_POINTS[idx] || 0;
        if (!isNaN(points)) {
            playerTotals[s.playerId] += points;
        }
        timeStandings.push({
            ...s,
            rank: idx + 1,
            points,
            formattedTime: formatTime(s.time) // Display effective time
        });
    });

    // 2. Calculate Event Points (Sum of Raw Scores)
    if (race.events && Array.isArray(race.events)) {
        race.events.forEach(event => {
            // Get scores for this event
            const scores = racePlayers.map(p => {
                // Robust parsing: replace commas, handle empty strings
                let val = race.scores?.[p.id]?.[event.id];
                if (val === undefined || val === null || val === '') val = 0;
                // Handle "12,5" -> "12.5"
                if (typeof val === 'string') val = val.replace(',', '.');
                const parsed = parseFloat(val);

                return {
                    playerId: p.id,
                    name: p.name,
                    rawScore: isNaN(parsed) ? 0 : parsed,
                };
            });

            // Sort: Higher is better for scores visualization (doesn't affect sum logic but good for table)
            scores.sort((a, b) => b.rawScore - a.rawScore);

            // Assign points: DIRECT RAW SCORE ACCUMULATION
            const eventResult = scores.map((s, index) => {
                const points = s.rawScore;
                if (!isNaN(points)) {
                    playerTotals[s.playerId] += points;
                }
                return {
                    ...s,
                    rank: index + 1,
                    points
                };
            });

            eventStandings[event.id] = eventResult;
        });
    }

    // Apply Score Penalty (Global)
    // We do this after summing event scores.
    // Penalty = Positive value -> Deduction.
    racePlayers.forEach(p => {
        const penaltyScore = parseFloat(race.scores?.[p.id]?.['penalty_score'] || 0);
        // "Pénalité Points": Input > 0 means we Remove points.
        // User text: "Retire des points au score (+/-)"
        // Logic: Total = Sum(Events) - Penalty.
        if (!isNaN(penaltyScore)) {
            playerTotals[p.id] -= penaltyScore;
        }
    });


    // 3. Calculate Global Standing
    const globalStanding = racePlayers.map(p => ({
        ...p,
        totalPoints: Number((playerTotals[p.id] || 0).toFixed(2)), // Fix float precision issues
        scores: race.scores?.[p.id]
    })).sort((a, b) => b.totalPoints - a.totalPoints);

    // 4. Assign Category Points
    const championshipResults = globalStanding.map((p, idx) => ({
        ...p,
        rank: idx + 1,
        championshipPoints: category.points[idx] || 0,
        // Pass penalties for display
        rawTime: parseFloat(race.scores?.[p.id]?.['total_time'] || 0),
        timePenalty: parseFloat(race.scores?.[p.id]?.['penalty_time'] || 0),
        scorePenalty: parseFloat(race.scores?.[p.id]?.['penalty_score'] || 0)
    }));

    return {
        eventStandings,
        timeStandings,
        globalStanding: championshipResults,
        categoryName: category.name
    };
}

// Helper
const formatTime = (ms) => {
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    const cent = Math.floor((ms % 1000) / 10);
    return `${min}:${sec.toString().padStart(2, '0')}.${cent.toString().padStart(2, '0')}`;
};
