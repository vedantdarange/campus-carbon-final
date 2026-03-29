import { useState } from 'react';
import { CarFront, Bus, MapPin, Users, Download, ArrowUpRight, Truck, Car, AlertCircle } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Doughnut, Line as ChartLine } from 'react-chartjs-2';
import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';
import { useManualData } from '../context/DataContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

type Cohort = 'All' | 'Students' | 'Staff';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const sparklineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    elements: { line: { tension: 0.4, borderWidth: 2 }, point: { radius: 0 } },
    interaction: { intersect: false, mode: 'index' as const },
    animation: { duration: 1000, easing: 'easeOutQuart' as const }
};

const getSparklineData = (color: string, isUp: boolean) => ({
    labels: ['1', '2', '3', '4', '5', '6', '7'],
    datasets: [{
        data: isUp ? [10, 15, 13, 18, 22, 24, 28] : [28, 24, 25, 20, 15, 12, 8],
        borderColor: color,
        backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 40);
            gradient.addColorStop(0, `${color}40`);
            gradient.addColorStop(1, `${color}00`);
            return gradient;
        },
        fill: true
    }]
});

export default function Transport() {
    const [cohort, setCohort] = useState<Cohort>('All');
    const [shiftBus, setShiftBus] = useState<number>(0);
    const [shiftTrain, setShiftTrain] = useState<number>(0);

    const [calcMode, setCalcMode] = useState<string>('Car (Solo)');
    const [calcDist, setCalcDist] = useState<number>(15);
    const [calcDays, setCalcDays] = useState<number>(20);

    const { hasManualData, getTransportData } = useManualData();
    const manualTransport = hasManualData ? getTransportData() : null;

    // Dummy Data varied by cohort
    const dataMultipliers = {
        All: 1,
        Students: 0.7,
        Staff: 0.3
    };
    const mult = dataMultipliers[cohort];

    // VIZ F: Modal CO2 Share (Doughnut)
    const modes = ['Car (Solo)', 'Car (Carpool)', 'Bus', 'Two-Wheeler', 'Bike/Walk'];
    const modeCo2Raw = [12500, 4200, 3100, 2400, 0].map(v => v * mult);

    const doughnutData = {
        labels: modes,
        datasets: [
            {
                data: modeCo2Raw,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.85)',   // Red
                    'rgba(249, 115, 22, 0.85)',  // Orange
                    'rgba(59, 130, 246, 0.85)',  // Blue
                    'rgba(168, 85, 247, 0.85)',  // Purple
                    'rgba(34, 197, 94, 0.85)'    // Green
                ],
                borderWidth: 0,
                hoverOffset: 6
            }
        ]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'right' as const, labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: {
                callbacks: {
                    label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed.toLocaleString()} kg CO₂e`
                }
            }
        },
        cutout: '65%',
        animation: { animateRotate: true, duration: 1000 }
    };

    // VIZ F: CO2 by Mode (Vertical Bar)
    const sortedIndices = [...modeCo2Raw.keys()].sort((a, b) => modeCo2Raw[b] - modeCo2Raw[a]);
    const sortedModes = sortedIndices.map(i => modes[i]);
    const sortedCo2 = sortedIndices.map(i => modeCo2Raw[i]);

    const barData = {
        labels: sortedModes,
        datasets: [{
            label: 'CO₂e Emissions (kg)',
            data: sortedCo2,
            backgroundColor: 'rgba(56, 189, 248, 0.85)', // Sky blue
            borderRadius: 4,
            barPercentage: 0.6
        }]
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' as const },
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index' as const, intersect: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(229, 231, 235, 0.5)' },
                border: { display: false },
                title: { display: true, text: 'kg CO₂e', color: '#9ca3af', font: { size: 11 } },
                ticks: { color: '#6b7280', font: { size: 11 }, callback: (val: any) => `${(val / 1000).toFixed(1)}k` }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 11 } },
                border: { display: false }
            }
        }
    };

    // VIZ F: Distance vs Emissions (Grouped Dual Axis)
    const distanceRaw = [85000, 41000, 115000, 52000, 24000].map(v => v * mult);

    const dualAxisData = {
        labels: modes,
        datasets: [
            {
                label: 'Emissions (kg CO₂e)',
                data: modeCo2Raw,
                backgroundColor: 'rgba(244, 63, 94, 0.85)', // Rose
                yAxisID: 'y',
                borderRadius: 4,
            },
            {
                label: 'Distance (km)',
                data: distanceRaw,
                backgroundColor: 'rgba(99, 102, 241, 0.85)', // Indigo
                yAxisID: 'y1',
                borderRadius: 4,
            }
        ]
    };

    const dualAxisOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' as const },
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } }, border: { display: false } },
            y: {
                type: 'linear' as const,
                display: true,
                position: 'left' as const,
                title: { display: true, text: 'Emissions (kg)', color: '#9ca3af', font: { size: 11 } },
                grid: { color: 'rgba(229, 231, 235, 0.4)' },
                ticks: { color: '#6b7280', font: { size: 11 } },
                border: { display: false }
            },
            y1: {
                type: 'linear' as const,
                display: true,
                position: 'right' as const,
                title: { display: true, text: 'Distance (km)', color: '#9ca3af', font: { size: 11 } },
                grid: { drawOnChartArea: false },
                ticks: { color: '#6b7280', font: { size: 11 } },
                border: { display: false }
            },
        }
    };

    // Fleet / Campus Vehicles Data (Scope 1)
    const fleetData = [
        { type: 'College Buses', count: 12, fuel: 'Diesel', kmMonth: 18500, co2e: 5200, icon: Bus },
        { type: 'Admin Cars', count: 5, fuel: 'Petrol', kmMonth: 4200, co2e: 850, icon: Car },
        { type: 'Maintenance', count: 8, fuel: 'Diesel', kmMonth: 3800, co2e: 1100, icon: Truck },
    ];

    // Commuter Zones Table Data
    const commuterZones = [
        { name: 'North Suburbs', count: Math.round(1250 * mult), mode: 'Bus', distance: 18, co2e: 3100 * mult, perPerson: 2.48 },
        { name: 'City Center', count: Math.round(950 * mult), mode: 'Two-Wheeler', distance: 5, co2e: 1800 * mult, perPerson: 1.89 },
        { name: 'East Riverside', count: Math.round(680 * mult), mode: 'Carpool', distance: 12, co2e: 950 * mult, perPerson: 1.40 },
        { name: 'West Hills', count: Math.round(420 * mult), mode: 'Solo Car', distance: 8, co2e: 840 * mult, perPerson: 2.00 },
        { name: 'South Quarter', count: Math.round(310 * mult), mode: 'Walk/Bike', distance: 2, co2e: 0, perPerson: 0.00 },
    ];

    // Monthly Trend Data (Academic Year)
    const trendMonths = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
    const trendCarSolo = [1200, 1150, 400, 450, 1250, 1300, 1280, 1100, 900, 1200, 1250, 1100].map(v => v * mult);
    const trendTwoWheeler = [800, 850, 200, 250, 900, 950, 920, 800, 600, 850, 820, 750].map(v => v * mult);
    const trendBus = [400, 420, 100, 120, 450, 480, 460, 400, 300, 420, 410, 380].map(v => v * mult);

    const trendData = {
        labels: trendMonths,
        datasets: [
            {
                label: 'Car (Solo)',
                data: trendCarSolo,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.4)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Two-Wheeler',
                data: trendTwoWheeler,
                borderColor: 'rgba(168, 85, 247, 1)',
                backgroundColor: 'rgba(168, 85, 247, 0.4)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Bus',
                data: trendBus,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const trendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1200, easing: 'easeOutQuart' as const },
        interaction: { mode: 'index' as const, intersect: false },
        plugins: {
            legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
            tooltip: { position: 'nearest' as const }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
            y: { stacked: true, beginAtZero: true, grid: { color: 'rgba(229, 231, 235, 0.5)' }, ticks: { color: '#6b7280', font: { size: 11 } } }
        }
    };

    // What-If Scenario Calculation
    const baseTotal = modeCo2Raw.reduce((a, b) => a + b, 0);
    const shiftBusCo2Reduction = (12500 * mult) * (shiftBus / 100);
    const addedBusCo2 = shiftBusCo2Reduction * 0.25;

    const shiftTrainCo2Reduction = (2400 * mult) * (shiftTrain / 100);
    const addedTrainCo2 = shiftTrainCo2Reduction * 0.10;

    const finalSavedCo2 = Math.max(0, (shiftBusCo2Reduction - addedBusCo2) + (shiftTrainCo2Reduction - addedTrainCo2));

    const newCarCo2 = Math.max(0, (12500 * mult) - shiftBusCo2Reduction);
    const newTwoWheelerCo2 = Math.max(0, (2400 * mult) - shiftTrainCo2Reduction);
    const newBusCo2 = (3100 * mult) + addedBusCo2;
    const newTrainCo2 = addedTrainCo2;

    const newTotal = baseTotal - finalSavedCo2;
    const npCar = (newCarCo2 / newTotal) * 100 || 0;
    const npTwoWheeler = (newTwoWheelerCo2 / newTotal) * 100 || 0;
    const npBus = (newBusCo2 / newTotal) * 100 || 0;
    const npTrain = (newTrainCo2 / newTotal) * 100 || 0;

    // Per-Person Calculator Logic
    const calcModeFactors = {
        'Car (Solo)': 0.143,
        'Car (Carpool)': 0.071,
        'Two-Wheeler': 0.05,
        'Bus': 0.03,
        'Walk/Bike': 0
    };
    const personalCo2 = (calcModeFactors[calcMode as keyof typeof calcModeFactors] || 0) * calcDist * calcDays * 2;
    const campusAvg = 38.5; // Average monthly kg CO2 per person

    // Calendar Heatmap Logic
    const weeks = 40;
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const calendarData = Array.from({ length: 6 }).map(() =>
        Array.from({ length: weeks }).map((_, c) => {
            let val = Math.floor(Math.random() * 4) + 1;
            if (c > 14 && c < 19) val = Math.random() > 0.6 ? 1 : 0; // Winter break / exams
            if (c > 35) val = Math.random() > 0.8 ? 2 : 1;
            return val;
        })
    );

    const getHeatmapColor = (intensity: number) => {
        if (intensity === 0) return 'bg-gray-100';
        if (intensity === 1) return 'bg-emerald-200';
        if (intensity === 2) return 'bg-emerald-300';
        if (intensity === 3) return 'bg-emerald-400';
        return 'bg-emerald-600';
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="w-full flex flex-col gap-6 pb-8"
        >

            {/* Title Row & Cohort Filters */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Mobility & Transport</h1>
                    <p className="text-gray-500 text-sm mt-1">Analyze commuter footprint, modal split, and fleet emissions.</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-100/80 p-1 rounded-xl border border-gray-200 shadow-sm relative z-0">
                    {(['All', 'Students', 'Staff'] as Cohort[]).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCohort(c)}
                            className={`relative px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors duration-200 z-10
                                ${cohort === c ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {cohort === c && (
                                <motion.div
                                    layoutId="cohort-pill"
                                    className="absolute inset-0 bg-white shadow-sm border border-gray-200 rounded-[10px] -z-10"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            {c}
                        </button>
                    ))}
                    <div className="w-px h-6 bg-gray-300 mx-1"></div>
                    <button className="p-1.5 text-gray-500 hover:text-gray-800 transition-colors" title="Export Transport Data">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Manual Data Banner */}
            {manualTransport && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-indigo-600" />
                        <div>
                            <p className="text-sm font-semibold text-indigo-900">Manual Data Active</p>
                            <p className="text-xs text-indigo-600">
                                {manualTransport.labels.length} months entered · {manualTransport.totalKm.toLocaleString()} total km · {manualTransport.totalTransportCO2.toFixed(1)} kg CO₂e
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {manualTransport.labels.map((label, i) => (
                            <div key={label} className="text-center hidden lg:block">
                                <div className="text-[10px] text-indigo-500 font-medium">{label}</div>
                                <div className="text-sm font-bold text-indigo-800">{manualTransport.totalCO2[i].toFixed(0)}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Top Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Users className="w-5 h-5" /></div>
                            <p className="text-gray-500 text-xs uppercase font-medium tracking-wider">Active Commuters (Est.)</p>
                        </div>
                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 4.2%
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-gray-900"><CountUp end={Math.round(4850 * mult)} duration={0.6} separator="," /></p>
                        <div className="h-8 w-24">
                            <ChartLine options={sparklineOptions} data={getSparklineData('#3b82f6', true)} />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Bus className="w-5 h-5" /></div>
                            <p className="text-gray-500 text-xs uppercase font-medium tracking-wider">Public Transit Share</p>
                        </div>
                        <div className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-semibold">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 2.1%
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-gray-900"><CountUp end={38} duration={0.6} /><span className="text-xl font-normal text-gray-500">%</span></p>
                        <div className="h-8 w-24">
                            <ChartLine options={sparklineOptions} data={getSparklineData('#10b981', true)} />
                        </div>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><CarFront className="w-5 h-5" /></div>
                            <p className="text-gray-500 text-xs uppercase font-medium tracking-wider">Avg. Daily Distance</p>
                        </div>
                        <div className="flex items-center text-red-500 bg-red-50 px-2 py-1 rounded-md text-xs font-semibold">
                            <ArrowUpRight className="w-3 h-3 mr-0.5" /> 1.5%
                        </div>
                    </div>
                    <div className="flex items-end justify-between">
                        <p className="text-3xl font-bold text-gray-900"><CountUp end={14.2} decimals={1} duration={0.6} /><span className="text-sm font-normal text-gray-500 ml-1">km/person</span></p>
                        <div className="h-8 w-24">
                            <ChartLine options={sparklineOptions} data={getSparklineData('#ef4444', true)} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* VIZ F: Multi-chart Breakdown Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Modal CO2 Share (Doughnut) */}
                <div className="col-span-1 lg:col-span-4 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
                    <h3 className="text-gray-800 font-medium text-base mb-1">Emissions Share by Mode</h3>
                    <p className="text-gray-500 text-xs mb-6">Percentage of total CO₂e generated per transit mode.</p>
                    <div className="h-[250px] w-full relative">
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                            <span className="text-3xl font-light text-gray-800">{(modeCo2Raw.reduce((a, b) => a + b, 0) / 1000).toFixed(1)}t</span>
                            <span className="text-xs text-gray-500">Total CO₂e</span>
                        </div>
                    </div>
                </div>

                {/* Absolute CO2 by Mode (Vertical Bar) */}
                <div className="col-span-1 lg:col-span-8 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col">
                    <h3 className="text-gray-800 font-medium text-base mb-1">Absolute CO₂e by Mode</h3>
                    <p className="text-gray-500 text-xs mb-6">Ranked absolute emissions to identify primary intervention targets.</p>
                    <div className="flex-1 w-full min-h-[250px]">
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
            </div>

            {/* VIZ F Details & Fleet Row */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >

                {/* Distance vs Emissions (Dual Axis) */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-gray-800 font-medium text-base">Distance vs. Emissions Intensity</h3>
                        <p className="text-gray-500 text-xs mt-1">Comparing total km traveled against resultant CO₂e to highlight efficiency.</p>
                    </div>
                    <div className="flex-1 w-full min-h-[300px]">
                        <Bar options={dualAxisOptions} data={dualAxisData} />
                    </div>
                </motion.div>

                {/* Campus Fleet (Scope 1) Section */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-gray-800 font-medium text-base">Campus Fleet (Scope 1)</h3>
                            <p className="text-gray-500 text-xs mt-1">Direct emissions from college-owned vehicles.</p>
                        </div>
                        <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 flex-1 pt-2">
                        {fleetData.map((fleet, i) => {
                            const Icon = fleet.icon;
                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between"
                                >
                                    <div className="flex items-center justify-between mb-3 text-gray-500">
                                        <Icon className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">{fleet.fuel}</span>
                                    </div>
                                    <div>
                                        <p className="text-gray-900 font-semibold text-sm leading-tight">{fleet.type}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{fleet.count} Vehicles</p>
                                    </div>
                                    <div className="mt-4 space-y-1">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-gray-400">Monthly Run</span>
                                            <span className="text-sm font-medium text-gray-700">{fleet.kmMonth.toLocaleString()} km</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs text-gray-400">Emissions</span>
                                            <span className="text-sm font-bold text-rose-600">{fleet.co2e.toLocaleString()} kg</span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>

            {/* Commuter Zones Table & Calculator Row */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
                {/* Zones Table */}
                <motion.div variants={itemVariants} className="xl:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="text-gray-800 font-medium text-base">Top Commuter Zones</h3>
                            <p className="text-gray-500 text-xs mt-1">Highest volume residential zones contributing to campus traffic, ranked by associated emissions.</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                            <MapPin className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Zone</th>
                                    <th className="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Commuters</th>
                                    <th className="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dominant Mode</th>
                                    <th className="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Distance</th>
                                    <th className="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Monthly CO₂e</th>
                                    <th className="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Per Person CO₂e</th>
                                </tr>
                            </thead>
                            <tbody>
                                {commuterZones.map((zone, i) => (
                                    <motion.tr
                                        variants={itemVariants}
                                        key={i}
                                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                                    >
                                        <td className="py-4 px-2 text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">{zone.name}</td>
                                        <td className="py-4 px-2 text-sm text-gray-600">{(zone.count).toLocaleString()}</td>
                                        <td className="py-4 px-2">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                {zone.mode}
                                            </span>
                                        </td>
                                        <td className="py-4 px-2 text-sm text-gray-600">{zone.distance} km</td>
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">{(zone.co2e).toLocaleString()} kg</span>
                                                <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden hidden sm:block">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${Math.min(100, (zone.co2e / 3100) * 100)}%` }}
                                                        transition={{ duration: 1, delay: 0.2 }}
                                                        viewport={{ once: true }}
                                                        className="h-full bg-emerald-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2 text-sm font-medium text-rose-500">{zone.perPerson.toFixed(2)} kg</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Per-Person Calculator Widget */}
                < motion.div variants={itemVariants} className="xl:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col justify-between" >
                    <div>
                        <h3 className="text-gray-800 font-medium text-base mb-1">My Commute Footprint</h3>
                        <p className="text-gray-500 text-xs mb-6">Calculate your personal monthly transport emissions.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700 block mb-1.5">Primary Transit Mode</label>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow"
                                    value={calcMode}
                                    onChange={(e) => setCalcMode(e.target.value)}
                                >
                                    {Object.keys(calcModeFactors).map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-gray-700">One-way Distance</label>
                                    <span className="text-xs font-bold text-indigo-600">{calcDist} km</span>
                                </div>
                                <input
                                    type="range" min="1" max="60"
                                    value={calcDist} onChange={(e) => setCalcDist(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-gray-700">Campus Days per Month</label>
                                    <span className="text-xs font-bold text-indigo-600">{calcDays} / 30</span>
                                </div>
                                <input
                                    type="range" min="1" max="30"
                                    value={calcDays} onChange={(e) => setCalcDays(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 border-t border-gray-100 pt-6">
                        <div className={`rounded-xl p-4 border flex items-center justify-between ${personalCo2 > campusAvg ? 'bg-rose-50 border-rose-100' : 'bg-indigo-50 border-indigo-100'}`}>
                            <div>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${personalCo2 > campusAvg ? 'text-rose-700' : 'text-indigo-700'}`}>Your Footprint</p>
                                <p className={`text-sm ${personalCo2 > campusAvg ? 'text-rose-900' : 'text-indigo-900'}`}>{personalCo2 > campusAvg ? 'Above Average' : 'Below Average'}</p>
                            </div>
                            <div className="text-right">
                                <p className={`text-3xl font-black ${personalCo2 > campusAvg ? 'text-rose-600' : 'text-indigo-600'}`}>
                                    <CountUp end={personalCo2} decimals={1} duration={0.8} />
                                    <span className="text-base font-medium ml-1">kg</span>
                                </p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-2 text-center uppercase tracking-wider">Campus Avg: {campusAvg} kg/mo</p>
                    </div>
                </motion.div >
            </motion.div >

            {/* Monthly Trend & What-If Scenario Row */}
            < motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }
                }
                className="grid grid-cols-1 xl:grid-cols-3 gap-6"
            >
                {/* Monthly Trend Line Chart */}
                < motion.div variants={itemVariants} className="xl:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col" >
                    <h3 className="text-gray-800 font-medium text-base mb-1">Academic Year Emissions Trend</h3>
                    <p className="text-gray-500 text-xs mb-6">Stacked tracking of transportation carbon footprint from April to March.</p>
                    <div className="flex-1 w-full min-h-[300px]">
                        <ChartLine data={trendData} options={trendOptions} />
                    </div>
                </motion.div >

                {/* Modal Shift "What-If" Scenario Bar */}
                < motion.div variants={itemVariants} className="xl:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col justify-between" >
                    <div>
                        <h3 className="text-gray-800 font-medium text-base mb-1">Modal Shift Simulator</h3>
                        <p className="text-gray-500 text-xs mb-6">Adjust the sliders to simulate commuting behavior change and view the projected impact.</p>

                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-gray-700">Solo Car → Bus Switch</label>
                                    <span className="text-xs font-bold text-emerald-600">{shiftBus}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={shiftBus}
                                    onChange={(e) => setShiftBus(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-semibold text-gray-700">Two-Wheeler → Train Switch</label>
                                    <span className="text-xs font-bold text-emerald-600">{shiftTrain}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="100"
                                    value={shiftTrain}
                                    onChange={(e) => setShiftTrain(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-0.5">Projected Savings</p>
                                <p className="text-emerald-900 text-sm">Monthly reduction</p>
                            </div>
                            <div className="text-right">
                                <p className="text-3xl font-black text-emerald-600">
                                    -<CountUp end={finalSavedCo2} duration={0.8} separator="," className="mx-1" />
                                    <span className="text-base font-medium">kg</span>
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-2">Projected Modal Split (CO₂e)</p>
                            <div className="w-full h-6 flex rounded-full overflow-hidden shadow-inner">
                                <motion.div animate={{ width: `${npCar}%` }} transition={{ duration: 0.3 }} className="bg-red-500 h-full relative group">
                                    <div className="absolute inset-x-0 -top-8 hidden group-hover:flex justify-center"><span className="bg-gray-800 text-white text-[10px] py-0.5 px-2 rounded opacity-90 whitespace-nowrap">Car: {npCar.toFixed(1)}%</span></div>
                                </motion.div>
                                <motion.div animate={{ width: `${npTwoWheeler}%` }} transition={{ duration: 0.3 }} className="bg-purple-500 h-full relative group">
                                    <div className="absolute inset-x-0 -top-8 hidden group-hover:flex justify-center"><span className="bg-gray-800 text-white text-[10px] py-0.5 px-2 rounded opacity-90 whitespace-nowrap">2-Wheel: {npTwoWheeler.toFixed(1)}%</span></div>
                                </motion.div>
                                <motion.div animate={{ width: `${npBus}%` }} transition={{ duration: 0.3 }} className="bg-blue-500 h-full relative group">
                                    <div className="absolute inset-x-0 -top-8 hidden group-hover:flex justify-center"><span className="bg-gray-800 text-white text-[10px] py-0.5 px-2 rounded opacity-90 whitespace-nowrap">Bus: {npBus.toFixed(1)}%</span></div>
                                </motion.div>
                                <motion.div animate={{ width: `${npTrain}%` }} transition={{ duration: 0.3 }} className="bg-emerald-500 h-full relative group">
                                    <div className="absolute inset-x-0 -top-8 hidden group-hover:flex justify-center"><span className="bg-gray-800 text-white text-[10px] py-0.5 px-2 rounded opacity-90 whitespace-nowrap">Train: {npTrain.toFixed(1)}%</span></div>
                                </motion.div>
                            </div>
                            <div className="flex justify-between mt-2 px-1">
                                <span className="text-[10px] text-gray-500 font-medium">Original vs Projected Impact</span>
                            </div>
                        </div>
                    </div>
                </motion.div >
            </motion.div >

            {/* Commute Heatmap Calendar Strip */}
            < motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 overflow-hidden"
            >
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h3 className="text-gray-800 font-medium text-base">Academic Year Traffic Heatmap</h3>
                        <p className="text-gray-500 text-xs mt-1">Daily structural tracking of campus commuter volume from August to May. Visually depicts exams, breaks, and holidays.</p>
                    </div>
                </div>

                <div className="w-full overflow-x-auto pb-2">
                    <div className="min-w-[800px] flex gap-2">
                        {/* Y-axis Labels */}
                        <div className="flex flex-col gap-[3px] mt-5 mr-1 justify-between text-[10px] font-medium text-gray-400 h-[88px]">
                            <span>Mon</span>
                            <span>Wed</span>
                            <span>Fri</span>
                        </div>

                        {/* Heatmap Grid */}
                        <div className="flex-1">
                            {/* X-axis Labels */}
                            <div className="flex justify-between text-[10px] font-medium text-gray-400 mb-2">
                                <span>Aug</span>
                                <span>Sep</span>
                                <span>Oct</span>
                                <span>Nov</span>
                                <span>Dec</span>
                                <span>Jan</span>
                                <span>Feb</span>
                                <span>Mar</span>
                                <span>Apr</span>
                                <span>May</span>
                            </div>

                            {/* Grid container */}
                            <div className="flex flex-col gap-[3px]">
                                {calendarData.map((row, r) => (
                                    <div key={r} className="flex gap-[3px]">
                                        {row.map((val, c) => (
                                            <motion.div
                                                custom={c}
                                                initial={{ opacity: 0, scale: 0.5 }}
                                                whileInView={{ opacity: 1, scale: 1 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3, delay: c * 0.01 }}
                                                key={`${r}-${c}`}
                                                className={`h-3 flex-1 rounded-[2px] ${getHeatmapColor(val)} cursor-pointer transition-transform hover:scale-125 hover:ring-1 hover:ring-gray-300 relative group`}
                                            >
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap pointer-events-none">
                                                    Week {c + 1}, {days[r]}: {val === 0 ? 'Empty' : val * 850 + ' Commuters'}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-end mt-4 gap-2 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        <div className="w-3 h-3 rounded-[2px] bg-gray-100"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-200"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-300"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-400"></div>
                        <div className="w-3 h-3 rounded-[2px] bg-emerald-600"></div>
                    </div>
                    <span>More</span>
                </div>
            </motion.div >

        </motion.div >
    );
}
