export const EVENT_TYPES = {
    SCORE: 'score', // Points directly (e.g., target shooting)
    TIME: 'time',   // Time based (e.g., race) - NOT USED for main chrono, but maybe sub-events
    BOOL: 'bool',   // Success/Fail
};

// Points awarded based on ranking in the *Main Time Trial*
// 1st place gets 200, 2nd 175, etc.
export const TIME_SCORING_POINTS = [200, 175, 150, 125, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 5];

// Categories for the RACE itself (determines points for the Yearly Championship)
// The user said: "Major (1er: 100p...), Cat1 (60p...), Cat2 (45p...)"
export const RACE_CATEGORIES = {
    MAJOR: {
        id: 'major',
        name: 'Major',
        points: [100, 75, 50, 35, 30, 25, 20, 15, 10, 5]
    },
    CAT1: {
        id: 'cat1',
        name: 'Catégorie 1',
        points: [60, 40, 30, 25, 20, 15, 10, 5, 2, 1]
    },
    CAT2: {
        id: 'cat2',
        name: 'Catégorie 2',
        points: [45, 35, 25, 20, 15, 10, 5, 2, 1, 0]
    },
    CAT3: {
        id: 'cat3',
        name: 'Catégorie 3 (Petite)',
        points: [5, 4, 3, 2, 1, 0, 0, 0, 0, 0]
    }
};

// Existing Rank points for EVENTS (Standard scoring for sub-events)
// User didn't ask to change this specific part, so we keep standard points for sub-events?
// "Si jamais les joueurs mettent des paniers ou font des bon scores au tir ils marquent des points."
// This implies raw score adds to total? OR rank in event adds to total?
// Original implementation: Rank in event -> Points.
// User said: "Event scores add points... Time gives points... Total = Sum."
// We will keep the default rank points for events for now, or use raw score if event type is 'score' and it's cumulative?
// To keep it clean and likely intended: Events give points based on performance.
// Let's stick to: Event Rank -> Points.
// Default Sports List requested by user
export const DEFAULT_SPORTS_LIST = [
    "Tir à l'arc",
    "Vortex",
    "Mini-golf",
    "Golf",
    "Foot",
    "Hockey",
    "Gabaky",
    "Tennis",
    "Tir couché",
    "Basket",
    "Tir debout",
    "Fléchette",
    "Pistolet"
];

export const EVENT_RANK_POINTS = [25, 20, 15, 12, 10, 8, 6, 4, 2, 1, 0];
