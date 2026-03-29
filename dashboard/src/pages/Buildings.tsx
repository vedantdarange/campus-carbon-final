import { useState, useMemo, ElementType } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
    Building2, Laptop, Settings, GraduationCap, Library, Home,
    Coffee, Activity, Users, Zap, Search, ChevronDown, X, Info,
    Flame, Droplets, MapPin, BarChart3, TrendingUp, AlertCircle
} from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    ArcElement, PointElement, BubbleController
} from 'chart.js';
import { Bar, Doughnut, Bubble } from 'react-chartjs-2';
import { useManualData } from '../context/DataContext';

ChartJS.register(
    CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
    ArcElement, PointElement, BubbleController
);

// --- MOCK DATA ---

type BuildingType = 'Academic' | 'Canteen' | 'Residential' | 'Administrative' | 'Professional' | 'Facility';

interface MonthlyData {
    month: string;
    electricity: number; // kWh
    diesel: number; // L
    lpg: number; // kg
}

interface Building {
    id: string;
    name: string;
    type: BuildingType;
    icon: ElementType;
    emoji: string;
    area: number; // m²
    occupants: number;
    electricity: number; // kWh/year
    diesel: number; // L/year
    lpg: number; // kg/year
    monthlyData: MonthlyData[];
}

const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// Helper to generate realistic monthly spreads with a curve
const generateMonthly = (baseElec: number, baseDiesel: number, baseLpg: number, isAcademic: boolean, isHostel: boolean) => {
    return MONTHS.map((month) => {
        let multiplier = 1;
        // Academic dip in May/June
        if (isAcademic && (month === 'May' || month === 'Jun')) multiplier = 0.4;
        // Exams in Nov/Dec, Apr
        if (isAcademic && (month === 'Nov' || month === 'Dec' || month === 'Apr')) multiplier = 1.2;

        // Hostel dip in May/June/July
        if (isHostel && (month === 'May' || month === 'Jun' || month === 'Jul')) multiplier = 0.3;

        // Add some noise
        const noise = 0.9 + (Math.random() * 0.2);

        return {
            month,
            electricity: Math.round((baseElec / 12) * multiplier * noise),
            diesel: Math.round((baseDiesel / 12) * multiplier * noise),
            lpg: Math.round((baseLpg / 12) * multiplier * noise),
        };
    });
};

const EMISSION_FACTORS = {
    electricity: 0.70, // kg CO2e / kWh
    diesel: 2.68,      // kg CO2e / L
    lpg: 1.50          // kg CO2e / kg
};

const BUILDINGS_MOCK: Building[] = [
    { id: 'dypiu', name: 'DYPIU', type: 'Professional', icon: Building2, emoji: '🏛', area: 25000, occupants: 3500, electricity: 850000, diesel: 12000, lpg: 8000, monthlyData: generateMonthly(850000, 12000, 8000, true, false) },
    { id: 'eng_a', name: 'Building A (Computer)', type: 'Academic', icon: Laptop, emoji: '💻', area: 12000, occupants: 1800, electricity: 420000, diesel: 2000, lpg: 0, monthlyData: generateMonthly(420000, 2000, 0, true, false) },
    { id: 'eng_b', name: 'Building B (Mechanical)', type: 'Academic', icon: Settings, emoji: '⚙', area: 15000, occupants: 1500, electricity: 380000, diesel: 8000, lpg: 0, monthlyData: generateMonthly(380000, 8000, 0, true, false) },
    { id: 'eng_c', name: 'Building C (Civil)', type: 'Academic', icon: GraduationCap, emoji: '🏗', area: 11000, occupants: 1200, electricity: 250000, diesel: 1500, lpg: 0, monthlyData: generateMonthly(250000, 1500, 0, true, false) },
    { id: 'eng_d', name: 'Building D (E&TC)', type: 'Academic', icon: Activity, emoji: '📡', area: 10500, occupants: 1400, electricity: 290000, diesel: 1000, lpg: 0, monthlyData: generateMonthly(290000, 1000, 0, true, false) },
    { id: 'eng_e', name: 'Building E (First Year)', type: 'Academic', icon: Users, emoji: '🎓', area: 9000, occupants: 2000, electricity: 210000, diesel: 500, lpg: 0, monthlyData: generateMonthly(210000, 500, 0, true, false) },
    { id: 'pharmacy', name: 'Pharmacy Building', type: 'Academic', icon: Droplets, emoji: '💊', area: 8500, occupants: 800, electricity: 260000, diesel: 2500, lpg: 500, monthlyData: generateMonthly(260000, 2500, 500, true, false) },
    { id: 'architecture', name: 'Architecture Bld', type: 'Academic', icon: Building2, emoji: '📐', area: 7000, occupants: 600, electricity: 180000, diesel: 1000, lpg: 0, monthlyData: generateMonthly(180000, 1000, 0, true, false) },
    { id: 'jr_college', name: 'Junior College', type: 'Academic', icon: GraduationCap, emoji: '🏫', area: 6000, occupants: 1500, electricity: 120000, diesel: 0, lpg: 0, monthlyData: generateMonthly(120000, 0, 0, true, false) },
    { id: 'pgdm', name: 'PGDM Building', type: 'Professional', icon: BarChart3, emoji: '📈', area: 5500, occupants: 500, electricity: 150000, diesel: 500, lpg: 0, monthlyData: generateMonthly(150000, 500, 0, true, false) },
    { id: 'canteen_main', name: 'Main Cafeteria (+Workshop)', type: 'Canteen', icon: Coffee, emoji: '🍽', area: 4000, occupants: 800, electricity: 160000, diesel: 0, lpg: 18000, monthlyData: generateMonthly(160000, 0, 18000, false, false) },
    { id: 'canteen_c', name: 'C Block Canteen', type: 'Canteen', icon: Coffee, emoji: '🥪', area: 800, occupants: 150, electricity: 45000, diesel: 0, lpg: 6000, monthlyData: generateMonthly(45000, 0, 6000, false, false) },
    { id: 'canteen_arch', name: 'Architecture Canteen', type: 'Canteen', icon: Coffee, emoji: '☕', area: 600, occupants: 100, electricity: 35000, diesel: 0, lpg: 4500, monthlyData: generateMonthly(35000, 0, 4500, false, false) },
    { id: 'canteen_dypiu', name: 'DYPIU Canteen', type: 'Canteen', icon: Coffee, emoji: '🍕', area: 1200, occupants: 400, electricity: 65000, diesel: 0, lpg: 9000, monthlyData: generateMonthly(65000, 0, 9000, false, false) },
    { id: 'library', name: 'Central Library', type: 'Facility', icon: Library, emoji: '📚', area: 6500, occupants: 1000, electricity: 220000, diesel: 0, lpg: 0, monthlyData: generateMonthly(220000, 0, 0, true, false) },
    { id: 'admin', name: 'Admin Block', type: 'Administrative', icon: Building2, emoji: '🏢', area: 4500, occupants: 300, electricity: 140000, diesel: 0, lpg: 0, monthlyData: generateMonthly(140000, 0, 0, false, false) },
    { id: 'parking', name: 'Campus Parking', type: 'Facility', icon: MapPin, emoji: '🅿', area: 20000, occupants: 0, electricity: 40000, diesel: 0, lpg: 0, monthlyData: generateMonthly(40000, 0, 0, false, false) },
    { id: 'hostel_a', name: 'Boys Hostel A', type: 'Residential', icon: Home, emoji: '🏠', area: 15000, occupants: 1200, electricity: 320000, diesel: 4000, lpg: 0, monthlyData: generateMonthly(320000, 4000, 0, false, true) },
    { id: 'hostel_b', name: 'Girls Hostel B', type: 'Residential', icon: Home, emoji: '🏠', area: 14000, occupants: 1100, electricity: 290000, diesel: 3500, lpg: 0, monthlyData: generateMonthly(290000, 3500, 0, false, true) },
];

const PRECALC_BUILDINGS = BUILDINGS_MOCK.map(b => {
    // Recalculate totals from monthly to ensure alignment
    const totalElec = b.monthlyData.reduce((sum, m) => sum + m.electricity, 0);
    const totalDiesel = b.monthlyData.reduce((sum, m) => sum + m.diesel, 0);
    const totalLpg = b.monthlyData.reduce((sum, m) => sum + m.lpg, 0);

    const co2eElecStr = (totalElec * EMISSION_FACTORS.electricity) / 1000; // Tonnes
    const co2eDieselStr = (totalDiesel * EMISSION_FACTORS.diesel) / 1000;
    const co2eLpgStr = (totalLpg * EMISSION_FACTORS.lpg) / 1000;

    const co2e_tonnes = co2eElecStr + co2eDieselStr + co2eLpgStr;
    const intensity = b.area > 0 ? (totalElec / b.area) : 0;
    const kgOccupant = b.occupants > 0 ? ((co2e_tonnes * 1000) / b.occupants) : 0;

    return {
        ...b,
        totalElec, totalDiesel, totalLpg,
        co2e_tonnes, intensity, kgOccupant
    };
});

// Calculate totals for KPI strip
const TOTAL_BUILDINGS = PRECALC_BUILDINGS.length;
const TOTAL_ELEC_MWH = PRECALC_BUILDINGS.reduce((sum, b) => sum + b.totalElec, 0) / 1000;
const TOTAL_CO2E = PRECALC_BUILDINGS.reduce((sum, b) => sum + b.co2e_tonnes, 0);
const TOTAL_AREA = PRECALC_BUILDINGS.reduce((sum, b) => sum + b.area, 0);
const AVG_INTENSITY = (TOTAL_ELEC_MWH * 1000) / TOTAL_AREA; // kWh/m2
const MAX_CO2E = Math.max(...PRECALC_BUILDINGS.map(b => b.co2e_tonnes));

// --- COMPONENTS ---

// Custom Chart Plugin for Bubble Emojis
const bubbleEmojiPlugin = {
    id: 'bubbleEmoji',
    afterDatasetDraw(chart: any, args: any) {
        const { ctx } = chart;
        const dataset = chart.data.datasets[args.index];
        const meta = chart.getDatasetMeta(args.index);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        meta.data.forEach((element: any, index: number) => {
            const dataPoint = dataset.data[index];
            if (dataPoint.emoji) {
                // Approximate font size based on radius
                const fontSize = Math.max(10, element.options.radius * 0.8);
                ctx.font = `${fontSize}px Arial`;
                ctx.fillText(dataPoint.emoji, element.x, element.y);
            }
        });
        ctx.restore();
    }
};

ChartJS.register(bubbleEmojiPlugin);

export default function Buildings() {
    const [sortBy, setSortBy] = useState<'co2e' | 'kwh' | 'intensity' | 'occupants'>('co2e');
    const [filterType, setFilterType] = useState<BuildingType | 'All'>('All');
    const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

    const { hasBuildingData, getBuildingData } = useManualData();
    const manualBldg = hasBuildingData ? getBuildingData() : null;

    const types: ('All' | BuildingType)[] = ['All', 'Academic', 'Canteen', 'Residential', 'Administrative', 'Professional'];

    const displayedBuildings = useMemo(() => {
        let list = [...PRECALC_BUILDINGS];

        // We don't remove non-matching, we handle it in render for opacity/scale

        list.sort((a, b) => {
            if (sortBy === 'co2e') return b.co2e_tonnes - a.co2e_tonnes;
            if (sortBy === 'kwh') return b.totalElec - a.totalElec;
            if (sortBy === 'intensity') return b.intensity - a.intensity;
            if (sortBy === 'occupants') return b.occupants - a.occupants;
            return 0;
        });

        return list;
    }, [sortBy]);

    const selectedCard = displayedBuildings.find(b => b.id === selectedBuildingId);

    // Color gradient for CO2e bar (green -> yellow -> red)
    const getCO2Color = (value: number, max: number) => {
        const ratio = value / max;
        if (ratio < 0.3) return 'bg-emerald-500';
        if (ratio < 0.6) return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full h-full flex flex-col pt-2 pb-16">

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
            >
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary" />
                        Building Analytics
                    </h1>
                    <p className="text-gray-500 mt-1">Detailed performance metrics across 19 major campus facilities.</p>
                </div>
            </motion.div>

            {/* Manual Data Banner */}
            {manualBldg && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-sm font-semibold text-emerald-900">Manual Building Data Active</p>
                            <p className="text-xs text-emerald-600">
                                {manualBldg.totalBuildings} buildings entered · {manualBldg.totalElecMwh.toFixed(0)} MWh total · {manualBldg.totalCO2eTonnes.toFixed(1)} tCO₂e · {manualBldg.totalArea.toLocaleString()} m² · Avg intensity {manualBldg.avgIntensity.toFixed(1)} kWh/m²
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* TOP KPI STRIP */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Buildings', value: TOTAL_BUILDINGS, unit: '', icon: Building2, color: 'bg-blue-500' },
                    { label: 'Total Electricity', value: TOTAL_ELEC_MWH, unit: 'MWh/yr', icon: Zap, color: 'bg-amber-500', decimals: 0 },
                    { label: 'Total CO₂e', value: TOTAL_CO2E, unit: 'tonnes/yr', icon: Flame, color: 'bg-red-500', decimals: 0 },
                    { label: 'Total Area', value: TOTAL_AREA, unit: 'm²', icon: MapPin, color: 'bg-purple-500', decimals: 0 },
                    { label: 'Avg Intensity', value: AVG_INTENSITY, unit: 'kWh/m²', icon: Activity, color: 'bg-emerald-500', decimals: 1 },
                ].map((kpi, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }} // cubic ease-out
                        className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden"
                    >
                        <div className={`absolute top-0 left-0 w-full h-1 ${kpi.color}`}></div>
                        <div className="flex justify-between items-start mb-2 mt-1">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                            <div className={`p-1.5 rounded-lg ${kpi.color} bg-opacity-10`}>
                                <kpi.icon className={`w-4 h-4 ${kpi.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mt-auto">
                            <span className="text-2xl font-bold text-gray-900">
                                <CountUp end={kpi.value} decimals={kpi.decimals || 0} duration={2} separator="," />
                            </span>
                            <span className="text-sm font-medium text-gray-400">{kpi.unit}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* CONTROLS */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-6 bg-white p-3 rounded-2xl shadow-sm border border-gray-100"
            >
                <div className="flex flex-wrap gap-2">
                    {types.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilterType(t)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${filterType === t
                                ? 'bg-gray-900 text-white shadow-md scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Sort by:</span>
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-medium"
                        >
                            <option value="co2e">Annual CO₂e</option>
                            <option value="kwh">Electricity Usage</option>
                            <option value="intensity">Energy Intensity</option>
                            <option value="occupants">Occupants</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>
            </motion.div>

            {/* BUILDING GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                <AnimatePresence>
                    {displayedBuildings.map((b, idx) => {
                        const isSelected = selectedBuildingId === b.id;
                        const isFilteredOut = filterType !== 'All' && b.type !== filterType;

                        return (
                            <motion.div
                                key={b.id}
                                layout
                                initial={{ opacity: 0, y: 16 }}
                                animate={{
                                    opacity: isFilteredOut ? 0.3 : 1,
                                    y: 0,
                                    scale: isFilteredOut ? 0.95 : 1
                                }}
                                transition={{ duration: 0.4, delay: idx * 0.05 }}
                                onClick={() => setSelectedBuildingId(isSelected ? null : b.id)}
                                className={`relative cursor-pointer bg-white rounded-2xl p-5 border transition-all duration-250 group overflow-hidden
                                    ${isSelected ? 'border-primary ring-2 ring-primary/20 shadow-md' : 'border-gray-100 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-gray-200'}
                                `}
                            >
                                {/* Animated bottom border on hover */}
                                <div className={`absolute bottom-0 left-0 h-1 w-full scale-x-0 origin-left transition-transform duration-250 ${isSelected ? 'scale-x-100 bg-primary' : 'bg-gray-300 group-hover:scale-x-100'}`}></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl shadow-inner border border-gray-100/50">
                                            {b.emoji}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">{b.name}</h3>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{b.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-end gap-1 mb-1">
                                        <span className="text-2xl font-black text-gray-800 tracking-tight">
                                            <CountUp end={b.co2e_tonnes} decimals={1} duration={2} />
                                        </span>
                                        <span className="text-sm font-medium text-gray-400 mb-1">t CO₂e</span>
                                    </div>

                                    {/* Rank progress bar */}
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(b.co2e_tonnes / MAX_CO2E) * 100}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.7, delay: 0.2 }}
                                            className={`h-full ${getCO2Color(b.co2e_tonnes, MAX_CO2E)} rounded-full`}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <div className="bg-gray-50 border border-gray-100 rounded-md px-2 py-1 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-gray-400" />
                                        <span className="text-xs font-medium text-gray-600">{b.occupants.toLocaleString()}</span>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100/50 rounded-md px-2 py-1 flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs font-medium text-amber-700">{Math.round(b.totalElec / 1000)} MWh</span>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-100/50 rounded-md px-2 py-1 flex items-center gap-1.5">
                                        <Activity className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="text-xs font-medium text-blue-700">{Math.round(b.intensity)} int.</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* DRILLDOWN PANEL */}
            <AnimatePresence>
                {selectedCard && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -20 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -20, transition: { duration: 0.3 } }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="bg-gray-900 rounded-3xl p-6 md:p-8 shadow-2xl relative border border-gray-800">
                            <button
                                onClick={() => setSelectedBuildingId(null)}
                                className="absolute top-6 right-6 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Drilldown Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl border border-white/5">
                                    {selectedCard.emoji}
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedCard.name}</h2>
                                    <p className="text-gray-400 font-medium flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-xs">{selectedCard.type}</span>
                                        • {selectedCard.area.toLocaleString()} m² • {selectedCard.occupants.toLocaleString()} Occupants
                                    </p>
                                </div>
                            </div>

                            {/* Mini KPIs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Annual Electricity', val: selectedCard.totalElec, suffix: ' kWh', color: 'text-amber-400' },
                                    { label: 'Total Footprint', val: selectedCard.co2e_tonnes, suffix: ' tCO₂e', color: 'text-red-400', dec: 1 },
                                    { label: 'Energy Intensity', val: selectedCard.intensity, suffix: ' kWh/m²', color: 'text-emerald-400', dec: 1 },
                                    { label: 'Per Occupant', val: selectedCard.kgOccupant, suffix: ' kg', color: 'text-blue-400', dec: 0 },
                                ].map((k, i) => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{k.label}</div>
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-2xl font-bold ${k.color}`}>
                                                <CountUp end={k.val} decimals={k.dec || 0} duration={1.5} separator="," />
                                            </span>
                                            <span className="text-gray-500 text-sm font-medium">{k.suffix}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <div className="lg:col-span-2 bg-white/5 rounded-2xl p-5 border border-white/5">
                                    <h3 className="text-white font-medium mb-4 text-sm flex items-center gap-2">
                                        <BarChart3 className="w-4 h-4 text-gray-400" />
                                        Monthly Energy Mix
                                    </h3>
                                    <div className="h-64">
                                        <Bar
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                animation: { duration: 800 },
                                                scales: {
                                                    x: { stacked: true, grid: { display: false } },
                                                    y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, border: { dash: [4, 4] } }
                                                },
                                                plugins: {
                                                    legend: { position: 'bottom', labels: { color: '#9ca3af', usePointStyle: true } },
                                                    tooltip: { mode: 'index', intersect: false }
                                                }
                                            }}
                                            data={{
                                                labels: MONTHS,
                                                datasets: [
                                                    { label: 'Electricity (kWh)', data: selectedCard.monthlyData.map(d => d.electricity), backgroundColor: '#10b981', stack: 'Stack 0' },
                                                    { label: 'Diesel (L)', data: selectedCard.monthlyData.map(d => d.diesel), backgroundColor: '#ef4444', stack: 'Stack 0' },
                                                    { label: 'LPG (kg)', data: selectedCard.monthlyData.map(d => d.lpg), backgroundColor: '#f59e0b', stack: 'Stack 0' },
                                                ]
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex flex-col items-center">
                                    <h3 className="text-white font-medium mb-4 text-sm w-full">CO₂e Source Split</h3>
                                    <div className="h-48 w-full relative flex items-center justify-center mt-4">
                                        <Doughnut
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                cutout: '75%',
                                                animation: { animateRotate: true, duration: 1000 },
                                                plugins: { legend: { display: false } }
                                            }}
                                            data={{
                                                labels: ['Electricity', 'Diesel', 'LPG'],
                                                datasets: [{
                                                    data: [
                                                        selectedCard.totalElec * EMISSION_FACTORS.electricity,
                                                        selectedCard.totalDiesel * EMISSION_FACTORS.diesel,
                                                        selectedCard.totalLpg * EMISSION_FACTORS.lpg
                                                    ],
                                                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                                                    borderColor: '#111827',
                                                    borderWidth: 2
                                                }]
                                            }}
                                        />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                            <span className="text-2xl font-bold text-white">{selectedCard.co2e_tonnes.toFixed(1)}</span>
                                            <span className="text-xs text-gray-500">t CO₂e</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6 text-xs text-gray-400">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Elec</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>Diesel</div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>LPG</div>
                                    </div>
                                </div>
                            </div>

                            {/* Monthly Table */}
                            <div className="bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm text-gray-300">
                                        <thead className="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Month</th>
                                                <th className="px-4 py-3 font-medium text-right">Elect. (kWh)</th>
                                                <th className="px-4 py-3 font-medium text-right">Diesel (L)</th>
                                                <th className="px-4 py-3 font-medium text-right">LPG (kg)</th>
                                                <th className="px-4 py-3 font-medium text-right">CO₂e (kg)</th>
                                                <th className="px-4 py-3 font-medium text-center">Data Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedCard.monthlyData.map((d, i) => {
                                                const rowCo2 = (d.electricity * EMISSION_FACTORS.electricity) + (d.diesel * EMISSION_FACTORS.diesel) + (d.lpg * EMISSION_FACTORS.lpg);
                                                return (
                                                    <motion.tr
                                                        key={d.month}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                                    >
                                                        <td className="px-4 py-2.5 font-medium text-gray-200">{d.month}</td>
                                                        <td className="px-4 py-2.5 text-right font-mono text-emerald-400/80">{d.electricity.toLocaleString()}</td>
                                                        <td className="px-4 py-2.5 text-right font-mono text-red-400/80">{d.diesel > 0 ? d.diesel.toLocaleString() : '-'}</td>
                                                        <td className="px-4 py-2.5 text-right font-mono text-amber-400/80">{d.lpg > 0 ? d.lpg.toLocaleString() : '-'}</td>
                                                        <td className="px-4 py-2.5 text-right font-mono text-white/90">{Math.round(rowCo2).toLocaleString()}</td>
                                                        <td className="px-4 py-2.5 text-center">
                                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                Metered
                                                            </span>
                                                        </td>
                                                    </motion.tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* BOTTOM SECTION - CAMPUS COMPARISONS */}
            <div className="mt-8 space-y-8">

                {/* Horizontal Bar Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CO2 per Occupant */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" />
                                CO₂e per Occupant <span className="text-gray-400 font-normal text-sm font-sans">(kg/person/yr)</span>
                            </h3>
                        </div>
                        <div className="h-80">
                            <Bar
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    animation: { duration: 900 },
                                    scales: {
                                        x: { grid: { color: '#f3f4f6' }, border: { dash: [4, 4] } },
                                        y: { grid: { display: false } }
                                    },
                                    plugins: { legend: { display: false } }
                                }}
                                data={{
                                    labels: [...PRECALC_BUILDINGS].sort((a, b) => b.kgOccupant - a.kgOccupant).slice(0, 10).map(b => b.name.split(' ')[0] + (b.type === 'Canteen' ? ' Cant' : '')),
                                    datasets: [{
                                        data: [...PRECALC_BUILDINGS].sort((a, b) => b.kgOccupant - a.kgOccupant).slice(0, 10).map(b => b.kgOccupant),
                                        backgroundColor: (ctx) => {
                                            const val = ctx.raw as number;
                                            return val > 300 ? '#f59e0b' : val > 150 ? '#fbbf24' : '#10b981';
                                        },
                                        borderRadius: 4
                                    }]
                                }}
                            />
                        </div>
                    </div>

                    {/* Energy Intensity */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Energy Intensity <span className="text-gray-400 font-normal text-sm font-sans">(kWh/m²/yr)</span>
                            </h3>
                        </div>
                        <div className="h-80">
                            <Bar
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    indexAxis: 'y',
                                    animation: { duration: 900 },
                                    scales: {
                                        x: { grid: { color: '#f3f4f6' }, border: { dash: [4, 4] } },
                                        y: { grid: { display: false }, position: 'right' }
                                    },
                                    plugins: { legend: { display: false } }
                                }}
                                data={{
                                    labels: [...PRECALC_BUILDINGS].sort((a, b) => b.intensity - a.intensity).slice(0, 10).map(b => b.name.split(' ')[0] + (b.emoji ? ` ${b.emoji}` : '')),
                                    datasets: [{
                                        data: [...PRECALC_BUILDINGS].sort((a, b) => b.intensity - a.intensity).slice(0, 10).map(b => b.intensity),
                                        backgroundColor: '#3b82f6',
                                        borderRadius: 4
                                    }]
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bubble Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-purple-500" />
                            Building Footprint Typology Matrix
                        </h3>
                        <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            Bubble size = Total CO₂e
                        </div>
                    </div>
                    <div className="h-96 w-full relative">
                        <Bubble
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: {
                                    duration: 1500,
                                    easing: 'easeOutBounce'
                                },
                                scales: {
                                    x: {
                                        type: 'linear',
                                        position: 'bottom',
                                        title: { display: true, text: 'Floor Area (m²)', color: '#6b7280', font: { weight: 'bold' } },
                                        grid: { color: '#f3f4f6' }
                                    },
                                    y: {
                                        title: { display: true, text: 'Intensity (kWh/m²)', color: '#6b7280', font: { weight: 'bold' } },
                                        grid: { color: '#f3f4f6' }
                                    }
                                },
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => {
                                                const raw = ctx.raw as any;
                                                return `${raw.buildingName} : Area ${raw.x}m², Int. ${raw.y.toFixed(1)}, CO₂e ${raw.r_val.toFixed(0)}t`;
                                            }
                                        }
                                    }
                                }
                            }}
                            data={{
                                datasets: [{
                                    label: 'Buildings',
                                    data: PRECALC_BUILDINGS.map(b => ({
                                        x: b.area,
                                        y: b.intensity,
                                        r: Math.max(8, Math.sqrt(b.co2e_tonnes) * 1.5), // Scale radius
                                        r_val: b.co2e_tonnes,
                                        buildingName: b.name,
                                        emoji: b.emoji
                                    })),
                                    backgroundColor: (ctx) => {
                                        const raw = ctx.raw as any;
                                        if (!raw) return 'rgba(16, 185, 129, 0.6)';
                                        return raw.y > 50 ? 'rgba(239, 68, 68, 0.6)' : raw.y > 30 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(16, 185, 129, 0.6)';
                                    },
                                    borderColor: (ctx) => {
                                        const raw = ctx.raw as any;
                                        if (!raw) return 'rgb(16, 185, 129)';
                                        return raw.y > 50 ? 'rgb(239, 68, 68)' : raw.y > 30 ? 'rgb(245, 158, 11)' : 'rgb(16, 185, 129)';
                                    },
                                    borderWidth: 2,
                                    hoverBorderWidth: 4,
                                    hoverRadius: 5
                                }]
                            }}
                        />
                    </div>
                </div>

                {/* Heatmap & Sparkline row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Heatmap */}
                    <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                                Energy Intensity Heatmap <span className="text-gray-400 font-normal text-sm">(Electricity kWh)</span>
                            </h3>
                            <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400">
                                <span>Low</span>
                                <div className="w-16 h-2 rounded-sm bg-gradient-to-r from-emerald-50 up to-emerald-800"></div>
                                <span>High</span>
                            </div>
                        </div>

                        <div className="overflow-x-auto pb-2">
                            <div className="min-w-[700px]">
                                {/* Header */}
                                <div className="flex mb-1">
                                    <div className="w-32 shrink-0"></div>
                                    {MONTHS.map(m => (
                                        <div key={m} className="flex-1 text-center text-xs font-semibold text-gray-400">{m}</div>
                                    ))}
                                </div>
                                {/* Rows */}
                                {PRECALC_BUILDINGS.slice(0, 10).map((b, rowIdx) => (
                                    <div key={b.id} className="flex mb-1 group items-center">
                                        <div className="w-32 shrink-0 text-xs font-medium text-gray-600 truncate pr-2 group-hover:text-gray-900 transition-colors">
                                            {b.emoji} {b.name.split(' ')[0]}
                                        </div>
                                        {b.monthlyData.map((m, colIdx) => {
                                            // Determine color intensity (relative to 100k max roughly)
                                            const intensity = Math.min(100, (m.electricity / 80000) * 100);
                                            return (
                                                <motion.div
                                                    key={m.month}
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: (colIdx * 0.03) + (rowIdx * 0.05) }}
                                                    className="flex-1 h-8 mx-0.5 rounded-sm relative group/cell cursor-pointer"
                                                    style={{ backgroundColor: `rgba(16, 185, 129, ${Math.max(0.05, intensity / 100)})` }}
                                                >
                                                    <div className="absolute opacity-0 group-hover/cell:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity flex flex-col items-center">
                                                        <span className="font-bold">{m.electricity.toLocaleString()} kWh</span>
                                                        <span className="text-gray-400 text-[10px]">{b.name} - {m.month}</span>
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sparkline KPIs */}
                    <div className="flex flex-col gap-4">
                        {[
                            { label: 'Campus Avg Per Capita', val: '45.2', unit: 'kg/student', trend: 'up' },
                            { label: 'Avg Area Intensity', val: '28.4', unit: 'kg/m²', trend: 'down' },
                            { label: 'Daily Load Avg', val: '12.4', unit: 'MWh/day', trend: 'up' }
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-gray-900 rounded-2xl p-5 border border-gray-800 flex-1 flex flex-col justify-between"
                            >
                                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold text-white"><CountUp end={parseFloat(s.val)} decimals={1} duration={2} /></span>
                                    <span className="text-xs text-gray-500">{s.unit}</span>
                                </div>
                                {/* CSS Sparkline SVG */}
                                <div className="mt-3 w-full h-8 flex items-end opacity-60">
                                    <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d overflow-visible">
                                        <polyline
                                            fill="none"
                                            stroke={s.trend === 'up' ? "#f59e0b" : "#10b981"}
                                            strokeWidth="2"
                                            points={`0,${15 + Math.random() * 10} 20,${10 + Math.random() * 10} 40,${20 + Math.random() * 5} 60,${15 + Math.random() * 10} 80,${5 + Math.random() * 10} 100,${s.trend === 'up' ? 5 : 25}`}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>

        </div>
    );
}
