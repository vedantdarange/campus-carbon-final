/**
 * Formats emission values with unit conversion support.
 * @param valueInKg - The emission value in kilograms of CO₂e
 * @param isTonnes - Whether to display in tonnes (divide by 1000)
 * @returns Object with formatted value string and unit label
 */
export function formatEmissions(
    valueInKg: number,
    isTonnes: boolean
): { value: string; unit: string } {
    if (isTonnes) {
        const tonnes = valueInKg / 1000;
        return {
            value: tonnes >= 10 ? tonnes.toLocaleString(undefined, { maximumFractionDigits: 1 }) : tonnes.toFixed(2),
            unit: 't CO₂e',
        };
    }
    return {
        value: valueInKg.toLocaleString(undefined, { maximumFractionDigits: 0 }),
        unit: 'kg CO₂e',
    };
}

/**
 * Returns a human-readable label for the selected period.
 */
export function getPeriodLabel(period: string): string {
    switch (period) {
        case 'month':
            return 'Mar 2026';
        case 'quarter':
            return 'Q1 2026';
        case 'year':
            return 'FY 2025–26';
        case 'custom':
            return 'Custom Range';
        default:
            return '';
    }
}
