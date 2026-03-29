import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── Emission Factors (kg CO₂e per unit) ─────────────────────────
export const EMISSION_FACTORS = {
    electricity: 0.85,      // kg CO₂e / kWh  (BEE / MoEFCC 2023)
    diesel: 2.68,           // kg CO₂e / L    (MoEFCC / DEFRA 2023)
    naturalGas: 2.02,       // kg CO₂e / m³   (MoEFCC GHG Inventory 2023)
    lpg: 2.98,              // kg CO₂e / kg   (DEFRA 2023)
    petrolVehicle: 0.17,    // kg CO₂e / km   (MoRTH / BEE 2023)
    dieselVehicle: 0.21,    // kg CO₂e / km
    busTransport: 0.089,    // kg CO₂e / km-pax
    landfillWaste: 1.20,    // kg CO₂e / kg   (CPCB India 2023)
    recycledWaste: 0.21,    // kg CO₂e / kg
    compostedWaste: 0.10,   // kg CO₂e / kg
    // Building-level (same base factors, explicit for clarity)
    buildingElectricity: 0.85,
    buildingDiesel: 2.68,
    buildingLpg: 2.98,
};

// ─── Types ────────────────────────────────────────────────────────
export interface MonthlyEntry {
    month: string; // e.g. "Jan", "Feb", …
    year: number;
    // Energy inputs (raw activity data)
    electricityKwh: number;
    dieselLitres: number;
    naturalGasM3: number;
    lpgKg: number;
    // Transport inputs
    petrolVehicleKm: number;
    dieselVehicleKm: number;
    busPassengerKm: number;
    // Waste inputs
    landfillKg: number;
    recycledKg: number;
    compostedKg: number;
}

export interface ComputedEntry extends MonthlyEntry {
    // Computed CO₂e (kg)
    energyCO2: number;
    transportCO2: number;
    wasteCO2: number;
    totalCO2: number;
    // Scope breakdown
    scope1: number; // diesel + naturalGas + LPG (stationary combustion)
    scope2: number; // electricity
    scope3: number; // transport + waste
}

// ─── Building Entry Types ─────────────────────────────────────────
export type BuildingType = 'Academic' | 'Canteen' | 'Residential' | 'Administrative' | 'Professional' | 'Facility';

export interface BuildingEntry {
    id: string;
    name: string;
    type: BuildingType;
    area: number;       // m²
    occupants: number;
    electricityKwh: number;
    dieselLitres: number;
    lpgKg: number;
}

export interface ComputedBuildingEntry extends BuildingEntry {
    co2e: number;       // total kg CO₂e
    intensity: number;  // kWh / m²
    perOccupant: number; // kg CO₂e / person
}

export interface BuildingData {
    buildings: ComputedBuildingEntry[];
    totalBuildings: number;
    totalElecMwh: number;
    totalCO2eTonnes: number;
    totalArea: number;
    avgIntensity: number;
}

export interface DataContextType {
    entries: ComputedEntry[];
    addEntry: (entry: MonthlyEntry) => void;
    updateEntry: (index: number, entry: MonthlyEntry) => void;
    deleteEntry: (index: number) => void;
    clearEntries: () => void;
    hasManualData: boolean;

    // Building entries
    buildingEntries: ComputedBuildingEntry[];
    addBuildingEntry: (entry: BuildingEntry) => void;
    updateBuildingEntry: (index: number, entry: BuildingEntry) => void;
    deleteBuildingEntry: (index: number) => void;
    clearBuildingEntries: () => void;
    hasBuildingData: boolean;

    // Aggregated helpers used by dashboard pages
    getOverviewData: () => OverviewData;
    getEnergyData: () => EnergyData;
    getTransportData: () => TransportData;
    getWasteData: () => WasteData;
    getBuildingData: () => BuildingData;
}

export interface OverviewData {
    labels: string[];
    totalCO2: number[];
    energyCO2: number[];
    transportCO2: number[];
    wasteCO2: number[];
    scope1: number[];
    scope2: number[];
    scope3: number[];
    kpi: {
        total: number;
        energy: number;
        transport: number;
        waste: number;
        scope1Total: number;
        scope2Total: number;
        scope3Total: number;
    };
}

export interface EnergyData {
    labels: string[];
    electricity: number[];
    diesel: number[];
    lpg: number[];
    naturalGas: number[];
    totalConsumptionKwh: number;
    totalCO2: number;
}

export interface TransportData {
    labels: string[];
    petrolKm: number[];
    dieselKm: number[];
    busKm: number[];
    totalCO2: number[];
    totalKm: number;
    totalTransportCO2: number;
}

export interface WasteData {
    labels: string[];
    landfillKg: number[];
    recycledKg: number[];
    compostedKg: number[];
    totalCO2: number[];
    totalWasteKg: number;
    totalWasteCO2: number;
    diversionRate: number;
}

// ─── Compute emissions from raw inputs ────────────────────────────
function computeEntry(entry: MonthlyEntry): ComputedEntry {
    const elecCO2 = entry.electricityKwh * EMISSION_FACTORS.electricity;
    const dieselCO2 = entry.dieselLitres * EMISSION_FACTORS.diesel;
    const gasCO2 = entry.naturalGasM3 * EMISSION_FACTORS.naturalGas;
    const lpgCO2 = entry.lpgKg * EMISSION_FACTORS.lpg;

    const petrolCO2 = entry.petrolVehicleKm * EMISSION_FACTORS.petrolVehicle;
    const dieselVehCO2 = entry.dieselVehicleKm * EMISSION_FACTORS.dieselVehicle;
    const busCO2 = entry.busPassengerKm * EMISSION_FACTORS.busTransport;

    const landfillCO2 = entry.landfillKg * EMISSION_FACTORS.landfillWaste;
    const recycledCO2 = entry.recycledKg * EMISSION_FACTORS.recycledWaste;
    const compostCO2 = entry.compostedKg * EMISSION_FACTORS.compostedWaste;

    const energyCO2 = elecCO2 + dieselCO2 + gasCO2 + lpgCO2;
    const transportCO2 = petrolCO2 + dieselVehCO2 + busCO2;
    const wasteCO2 = landfillCO2 + recycledCO2 + compostCO2;

    const scope1 = dieselCO2 + gasCO2 + lpgCO2;
    const scope2 = elecCO2;
    const scope3 = transportCO2 + wasteCO2;

    return {
        ...entry,
        energyCO2,
        transportCO2,
        wasteCO2,
        totalCO2: energyCO2 + transportCO2 + wasteCO2,
        scope1,
        scope2,
        scope3,
    };
}

// ─── Default empty entry ──────────────────────────────────────────
export function createEmptyEntry(month: string, year: number): MonthlyEntry {
    return {
        month, year,
        electricityKwh: 0, dieselLitres: 0, naturalGasM3: 0, lpgKg: 0,
        petrolVehicleKm: 0, dieselVehicleKm: 0, busPassengerKm: 0,
        landfillKg: 0, recycledKg: 0, compostedKg: 0,
    };
}

function computeBuildingEntry(entry: BuildingEntry): ComputedBuildingEntry {
    const co2e = (entry.electricityKwh * EMISSION_FACTORS.buildingElectricity)
        + (entry.dieselLitres * EMISSION_FACTORS.buildingDiesel)
        + (entry.lpgKg * EMISSION_FACTORS.buildingLpg);
    return {
        ...entry,
        co2e,
        intensity: entry.area > 0 ? entry.electricityKwh / entry.area : 0,
        perOccupant: entry.occupants > 0 ? co2e / entry.occupants : 0,
    };
}

export function createEmptyBuildingEntry(): BuildingEntry {
    return {
        id: crypto.randomUUID(),
        name: '', type: 'Academic', area: 0, occupants: 0,
        electricityKwh: 0, dieselLitres: 0, lpgKg: 0,
    };
}

const STORAGE_KEY = 'campuscarbon_manual_data';
const BUILDING_STORAGE_KEY = 'campuscarbon_building_data';

// ─── Context ──────────────────────────────────────────────────────
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    const [entries, setEntries] = useState<ComputedEntry[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const raw: MonthlyEntry[] = JSON.parse(saved);
                return raw.map(computeEntry);
            }
        } catch { /* ignore */ }
        return [];
    });

    const [buildingEntries, setBuildingEntries] = useState<ComputedBuildingEntry[]>(() => {
        try {
            const saved = localStorage.getItem(BUILDING_STORAGE_KEY);
            if (saved) {
                const raw: BuildingEntry[] = JSON.parse(saved);
                return raw.map(computeBuildingEntry);
            }
        } catch { /* ignore */ }
        return [];
    });

    const persist = (list: ComputedEntry[]) => {
        const raw: MonthlyEntry[] = list.map(({ energyCO2, transportCO2, wasteCO2, totalCO2, scope1, scope2, scope3, ...rest }) => rest);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    };

    const persistBuildings = (list: ComputedBuildingEntry[]) => {
        const raw: BuildingEntry[] = list.map(({ co2e, intensity, perOccupant, ...rest }) => rest);
        localStorage.setItem(BUILDING_STORAGE_KEY, JSON.stringify(raw));
    };

    const addEntry = useCallback((entry: MonthlyEntry) => {
        setEntries(prev => {
            const next = [...prev, computeEntry(entry)];
            persist(next);
            return next;
        });
    }, []);

    const updateEntry = useCallback((index: number, entry: MonthlyEntry) => {
        setEntries(prev => {
            const next = [...prev];
            next[index] = computeEntry(entry);
            persist(next);
            return next;
        });
    }, []);

    const deleteEntry = useCallback((index: number) => {
        setEntries(prev => {
            const next = prev.filter((_, i) => i !== index);
            persist(next);
            return next;
        });
    }, []);

    const clearEntries = useCallback(() => {
        setEntries([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Building CRUD
    const addBuildingEntry = useCallback((entry: BuildingEntry) => {
        setBuildingEntries(prev => {
            const next = [...prev, computeBuildingEntry(entry)];
            persistBuildings(next);
            return next;
        });
    }, []);

    const updateBuildingEntry = useCallback((index: number, entry: BuildingEntry) => {
        setBuildingEntries(prev => {
            const next = [...prev];
            next[index] = computeBuildingEntry(entry);
            persistBuildings(next);
            return next;
        });
    }, []);

    const deleteBuildingEntry = useCallback((index: number) => {
        setBuildingEntries(prev => {
            const next = prev.filter((_, i) => i !== index);
            persistBuildings(next);
            return next;
        });
    }, []);

    const clearBuildingEntries = useCallback(() => {
        setBuildingEntries([]);
        localStorage.removeItem(BUILDING_STORAGE_KEY);
    }, []);

    const hasManualData = entries.length > 0;
    const hasBuildingData = buildingEntries.length > 0;

    // ─── Aggregation helpers ──────────────────────────────────────
    const getOverviewData = useCallback((): OverviewData => {
        const sorted = [...entries].sort((a, b) => {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return (a.year - b.year) || (months.indexOf(a.month) - months.indexOf(b.month));
        });
        return {
            labels: sorted.map(e => `${e.month} ${e.year}`),
            totalCO2: sorted.map(e => e.totalCO2),
            energyCO2: sorted.map(e => e.energyCO2),
            transportCO2: sorted.map(e => e.transportCO2),
            wasteCO2: sorted.map(e => e.wasteCO2),
            scope1: sorted.map(e => e.scope1),
            scope2: sorted.map(e => e.scope2),
            scope3: sorted.map(e => e.scope3),
            kpi: {
                total: sorted.reduce((s, e) => s + e.totalCO2, 0),
                energy: sorted.reduce((s, e) => s + e.energyCO2, 0),
                transport: sorted.reduce((s, e) => s + e.transportCO2, 0),
                waste: sorted.reduce((s, e) => s + e.wasteCO2, 0),
                scope1Total: sorted.reduce((s, e) => s + e.scope1, 0),
                scope2Total: sorted.reduce((s, e) => s + e.scope2, 0),
                scope3Total: sorted.reduce((s, e) => s + e.scope3, 0),
            },
        };
    }, [entries]);

    const getEnergyData = useCallback((): EnergyData => {
        const sorted = [...entries].sort((a, b) => {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return (a.year - b.year) || (months.indexOf(a.month) - months.indexOf(b.month));
        });
        return {
            labels: sorted.map(e => `${e.month}`),
            electricity: sorted.map(e => e.electricityKwh * EMISSION_FACTORS.electricity),
            diesel: sorted.map(e => e.dieselLitres * EMISSION_FACTORS.diesel),
            lpg: sorted.map(e => e.lpgKg * EMISSION_FACTORS.lpg),
            naturalGas: sorted.map(e => e.naturalGasM3 * EMISSION_FACTORS.naturalGas),
            totalConsumptionKwh: sorted.reduce((s, e) => s + e.electricityKwh, 0),
            totalCO2: sorted.reduce((s, e) => s + e.energyCO2, 0),
        };
    }, [entries]);

    const getTransportData = useCallback((): TransportData => {
        const sorted = [...entries].sort((a, b) => {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return (a.year - b.year) || (months.indexOf(a.month) - months.indexOf(b.month));
        });
        return {
            labels: sorted.map(e => `${e.month}`),
            petrolKm: sorted.map(e => e.petrolVehicleKm),
            dieselKm: sorted.map(e => e.dieselVehicleKm),
            busKm: sorted.map(e => e.busPassengerKm),
            totalCO2: sorted.map(e => e.transportCO2),
            totalKm: sorted.reduce((s, e) => s + e.petrolVehicleKm + e.dieselVehicleKm + e.busPassengerKm, 0),
            totalTransportCO2: sorted.reduce((s, e) => s + e.transportCO2, 0),
        };
    }, [entries]);

    const getWasteData = useCallback((): WasteData => {
        const sorted = [...entries].sort((a, b) => {
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return (a.year - b.year) || (months.indexOf(a.month) - months.indexOf(b.month));
        });
        const totalWaste = sorted.reduce((s, e) => s + e.landfillKg + e.recycledKg + e.compostedKg, 0);
        const diverted = sorted.reduce((s, e) => s + e.recycledKg + e.compostedKg, 0);
        return {
            labels: sorted.map(e => `${e.month}`),
            landfillKg: sorted.map(e => e.landfillKg),
            recycledKg: sorted.map(e => e.recycledKg),
            compostedKg: sorted.map(e => e.compostedKg),
            totalCO2: sorted.map(e => e.wasteCO2),
            totalWasteKg: totalWaste,
            totalWasteCO2: sorted.reduce((s, e) => s + e.wasteCO2, 0),
            diversionRate: totalWaste > 0 ? (diverted / totalWaste) * 100 : 0,
        };
    }, [entries]);

    const getBuildingData = useCallback((): BuildingData => {
        const totalElec = buildingEntries.reduce((s, b) => s + b.electricityKwh, 0);
        const totalArea = buildingEntries.reduce((s, b) => s + b.area, 0);
        const totalCO2e = buildingEntries.reduce((s, b) => s + b.co2e, 0);
        return {
            buildings: buildingEntries,
            totalBuildings: buildingEntries.length,
            totalElecMwh: totalElec / 1000,
            totalCO2eTonnes: totalCO2e / 1000,
            totalArea,
            avgIntensity: totalArea > 0 ? totalElec / totalArea : 0,
        };
    }, [buildingEntries]);

    return (
        <DataContext.Provider value={{
            entries,
            addEntry,
            updateEntry,
            deleteEntry,
            clearEntries,
            hasManualData,
            buildingEntries,
            addBuildingEntry,
            updateBuildingEntry,
            deleteBuildingEntry,
            clearBuildingEntries,
            hasBuildingData,
            getOverviewData,
            getEnergyData,
            getTransportData,
            getWasteData,
            getBuildingData,
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useManualData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useManualData must be used within a DataProvider');
    }
    return context;
}
