
export type Country = {
    id: string;
    name: string;
    abbreviation: string;
    emoji: string;
    ranks: Record<string, number>;
};

export type Bucket = {
    id: string;
    label: string;
    emoji: string;
    assignedCountryId: string | null;
};