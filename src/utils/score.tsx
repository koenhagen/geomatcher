
export function getScoreForRank(rankPosition: number | undefined, totalCountries: number): number {
    if (!rankPosition) return 0;
    return rankPosition === 1
        ? 20 + 20 * (totalCountries - rankPosition)
        : 20 * (totalCountries - rankPosition);
}

// src/utils/score.tsx

export function rankToColor(rank: number, total: number): string {
    if (total < 2) return '🟩';
    const percent = (rank - 1) / (total - 1);
    if (percent <= 0.2) return '🟩';
    if (percent <= 0.5) return '🟨';
    if (percent <= 0.8) return '🟧';
    return '🟥';
}