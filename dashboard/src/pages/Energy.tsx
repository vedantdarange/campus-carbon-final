import { useState, useMemo } from 'react';
import { Search, Zap, Sun, Users, Map, X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import CountUp from 'react-countup';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Filler, Legend } from 'chart.js';
import { Bar as ChartBar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';

// Chart Plugins
const customPlugins = {
    id: 'benchmarkLine',
    beforeDraw: (chart: any) => {
        if (chart.options.plugins?.benchmarkLine?.display) {
            const ctx = chart.ctx;
            const xAxis = chart.scales.x;
            const yAxis = chart.scales.y;
            const value = chart.options.plugins.benchmarkLine.value;
            const x = xAxis.getPixelForValue(value);

            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([6, 6]);
            ctx.moveTo(x, yAxis.top);
            ctx.lineTo(x, yAxis.bottom);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#9ca3af';
            ctx.stroke();

            ctx.fillStyle = '#6b7280';
            ctx.font = '11px Inter, sans-serif';
            ctx.fillText('Campus Avg', x + 6, yAxis.top + 12);
            ctx.restore();
        }
    }
};

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Filler, Legend, customPlugins);

const BUILDINGS = [
    'DYPIU', 'PGDM & Hostel', 'Engg Bldg A', 'Engg Bldg B',
    'Engg Bldg C', 'Engg Bldg D', 'Engg Bldg E',
    'Architecture', 'Junior College', 'Canteens'
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MOCK_STATS: Record<string, { area: number, occupants: number, elec: number, diesel: number, lpg: number }> = {
    'DYPIU': { area: 12000, occupants: 1500, elec: 294, diesel: 84, lpg: 42 },
    'PGDM & Hostel': { area: 8500, occupants: 800, elec: 266, diesel: 76, lpg: 38 },
    'Engg Bldg A': { area: 4500, occupants: 600, elec: 147, diesel: 42, lpg: 21 },
    'Engg Bldg B': { area: 4200, occupants: 550, elec: 136, diesel: 39, lpg: 20 },
    'Engg Bldg C': { area: 4000, occupants: 500, elec: 133, diesel: 38, lpg: 19 },
    'Engg Bldg D': { area: 4100, occupants: 520, elec: 129, diesel: 37, lpg: 19 },
    'Engg Bldg E': { area: 3800, occupants: 450, elec: 119, diesel: 34, lpg: 17 },
    'Architecture': { area: 5000, occupants: 400, elec: 105, diesel: 30, lpg: 15 },
    'Junior College': { area: 6000, occupants: 900, elec: 91, diesel: 26, lpg: 13 },
    'Canteens': { area: 2500, occupants: 1200, elec: 13, diesel: 65, lpg: 182 }
};

export default function Energy() {
    const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
    const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
    const [isSorted, setIsSorted] = useState(false);

    // Dynamic Data calculations
    const displayBuildings = useMemo(() => {
        let list = [...BUILDINGS];
        if (isSorted) {
            list.sort((a, b) => {
                const totalA = MOCK_STATS[a].elec + MOCK_STATS[a].diesel + MOCK_STATS[a].lpg;
                const totalB = MOCK_STATS[b].elec + MOCK_STATS[b].diesel + MOCK_STATS[b].lpg;
                return totalB - totalA;
            });
        }
        return list;
    }, [isSorted]);

    // Horizontal Stacked Bar specific to requirements
    const stackedBarData = {
        labels: displayBuildings,
        datasets: [
            {
                label: 'Electricity',
                data: displayBuildings.map(b => MOCK_STATS[b].elec),
                backgroundColor: '#3b82f6', // blue-500
                borderRadius: { topLeft: 4, bottomLeft: 4 },
                borderSkipped: false,
            },
            {
                label: 'Diesel',
                data: displayBuildings.map(b => MOCK_STATS[b].diesel),
                backgroundColor: '#f59e0b', // amber-500
            },
            {
                label: 'LPG',
                data: displayBuildings.map(b => MOCK_STATS[b].lpg),
                backgroundColor: '#10b981', // emerald-500
                borderRadius: { topRight: 4, bottomRight: 4 },
                borderSkipped: false,
            }
        ]
    };

    const stackedBarOptions: any = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        onClick: (_event: any, elements: any[]) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                setSelectedBuilding(displayBuildings[index]);
            }
        },
        onHover: (event: any, elements: any[]) => {
            if (event.native?.target) {
                (event.native.target as HTMLElement).style.cursor = elements.length ? 'pointer' : 'default';
            }
        },
        animation: {
            x: {
                duration: 800,
                easing: 'easeOutQuart',
                from: 0,
                delay: (context: any) => {
                    let delay = 0;
                    if (context.type === 'data' && context.mode === 'default' && !context.chart._delayed) {
                        delay = context.dataIndex * 50; // staggered entry left-to-right
                    }
                    return delay;
                }
            }
        },
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8 } },
            tooltip: { mode: 'index', intersect: false, animation: { duration: 100 } },
            benchmarkLine: {
                display: true,
                value: 300 // example average total consumption
            }
        },
        scales: {
            x: { stacked: true, grid: { color: '#f3f4f6' } },
            y: { stacked: true, grid: { display: false } }
        }
    };

    // Calculate Heatmap Data
    const heatmapData = useMemo(() => {
        return displayBuildings.map(_b => {
            return MONTHS.map((m) => {
                let val = Math.random() * 100;
                if (['Mar', 'Apr', 'May'].includes(m)) val += 40;
                return val;
            });
        });
    }, [displayBuildings]);

    // Green-scale heatmap
    const getHeatmapColor = (val: number) => {
        if (val > 100) return 'bg-emerald-600';
        if (val > 80) return 'bg-emerald-500';
        if (val > 60) return 'bg-emerald-400';
        if (val > 40) return 'bg-emerald-300';
        if (val > 20) return 'bg-emerald-200';
        return 'bg-emerald-50';
    };

    const getConfidenceBorder = (bldg: string) => {
        if (['DYPIU', 'Canteens'].includes(bldg)) return 'border-l-4 border-red-500';
        if (['PGDM & Hostel', 'Engg Bldg A'].includes(bldg)) return 'border-l-4 border-amber-400';
        return 'border-l-4 border-green-500';
    };

    const drawerMonthlyOptions: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, display: false } }
    };

    return (
        <div className="w-full h-full flex flex-col pt-2 pb-12 overflow-y-auto pr-2 overflow-x-hidden">
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes cascadeFade {
                    0% { opacity: 0; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}} />

            {/* Title Row */}
            <div className="flex justify-between items-center mb-6 px-1 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#111] flex items-center justify-center text-white cursor-pointer hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                        <Search className="w-5 h-5" />
                    </div>
                    <h1 className="text-[32px] font-semibold text-[#1a1a1c] tracking-tight">Energy Hub</h1>
                </div>
            </div>

            {/* Top Stat Cards - White styling */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 flex-shrink-0">
                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-full"><Zap className="w-5 h-5" /></div>
                        <span className="text-sm font-medium text-gray-400">Total Consumption</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-800"><CountUp end={45.2} duration={2} decimals={1} useEasing /></span>
                        <span className="text-gray-500 text-sm">M kWh</span>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-amber-50 text-amber-500 rounded-full"><Sun className="w-5 h-5" /></div>
                        <span className="text-sm font-medium text-gray-400">Solar Gen</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-800"><CountUp end={12.8} duration={2} decimals={1} useEasing /></span>
                        <span className="text-gray-500 text-sm">M kWh</span>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full"><Map className="w-5 h-5" /></div>
                        <span className="text-sm font-medium text-gray-400">Campus Avg</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-800"><CountUp end={42.4} duration={2} decimals={1} useEasing /></span>
                        <span className="text-gray-500 text-sm">kgCO₂/m²</span>
                    </div>
                </div>

                <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-full"><Users className="w-5 h-5" /></div>
                        <span className="text-sm font-medium text-gray-400">Campus Avg</span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-800"><CountUp end={2.1} duration={2} decimals={1} useEasing /></span>
                        <span className="text-gray-500 text-sm">tCO₂/Occupant</span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Layout */}
            <div className="flex flex-1 gap-6 relative pb-10">

                {/* Left Side (Charts) */}
                <motion.div
                    className={`flex flex-col gap-6 transition-all duration-500 ease-out flex-1 ${selectedBuilding ? 'xl:max-w-[calc(100%-400px)]' : 'w-full'}`}
                >
                    {/* Horizontal Stacked Bar */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Building-Wise CO₂ by Source</h3>
                                <p className="text-sm text-gray-500 mb-1">Electricity, Diesel, and LPG (Click a bar to drilldown)</p>
                            </div>
                            <button
                                onClick={() => setIsSorted(!isSorted)}
                                className="text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600 transition-colors"
                            >
                                {isSorted ? 'Unsort' : 'Sort Desc'}
                            </button>
                        </div>
                        <div className="h-[400px] w-full relative">
                            <ChartBar options={stackedBarOptions} data={stackedBarData} />
                        </div>
                    </div>

                    {/* Heatmap */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800">Monthly Consumption Heatmap (kWh)</h3>
                            <p className="text-sm text-gray-500">Green-scale intensity matrix with left confidence border & MoM trend</p>
                        </div>

                        <div className="w-full overflow-x-auto pb-4">
                            <div className="min-w-[800px] flex flex-col gap-[3px]">
                                {/* Header */}
                                <div className="flex gap-[3px] ml-[140px] mb-2 pr-[60px]">
                                    {MONTHS.map(m => (
                                        <div key={m} className="flex-1 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">{m}</div>
                                    ))}
                                </div>

                                {/* Rows */}
                                <AnimatePresence>
                                    {displayBuildings.map((b, i) => {
                                        const trend = getMoMChange(heatmapData[i][10], heatmapData[i][11]);
                                        return (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scaleY: 0.8 }}
                                                animate={{ opacity: 1, scaleY: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.4 }}
                                                key={b}
                                                className={`flex gap-[3px] items-stretch transition-colors duration-200 rounded-l-md ${getConfidenceBorder(b)} ${hoveredBuilding === b ? 'bg-gray-50' : ''}`}
                                                onMouseEnter={() => setHoveredBuilding(b)}
                                                onMouseLeave={() => setHoveredBuilding(null)}
                                            >
                                                <div className="w-[136px] px-2 py-1.5 text-[13px] font-medium text-gray-700 truncate flex items-center bg-white cursor-pointer hover:bg-gray-100" onClick={() => setSelectedBuilding(b)}>
                                                    {b}
                                                </div>

                                                {heatmapData[i].map((val, m_i) => (
                                                    <div
                                                        key={m_i}
                                                        className={`flex-1 rounded-[3px] ${getHeatmapColor(val)} cursor-help group relative`}
                                                        style={{
                                                            opacity: 0,
                                                            animation: `cascadeFade 500ms ease-out ${m_i * 30}ms forwards`
                                                        }}
                                                    >
                                                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-50 transition-opacity duration-100">
                                                            {MONTHS[m_i]}: {Math.round(val)} kWh
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* MoM % Column */}
                                                <div className="w-[60px] flex items-center justify-center text-xs font-semibold pl-2">
                                                    {trend.isUp ? (
                                                        <span className="text-red-500 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> {trend.pct.toFixed(0)}%</span>
                                                    ) : (
                                                        <span className="text-green-500 flex items-center"><ArrowDownRight className="w-3 h-3 mr-0.5" /> {trend.pct.toFixed(0)}%</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div >
                </motion.div >

                {/* Right Side Drilldown Drawer */}
                <AnimatePresence>
                    {
                        selectedBuilding && (
                            <motion.div
                                initial={{ x: '110%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: '110%', opacity: 0 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className="bg-white border text-gray-800 border-gray-100 rounded-[2rem] shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] absolute right-0 top-0 bottom-0 w-[380px] p-6 flex flex-col z-20 overflow-y-auto"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">{selectedBuilding}</h2>
                                        <p className="text-sm text-gray-500">Facility Deep Dive</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedBuilding(null)}
                                        className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* 4 Mini KPI Chips */}
                                <div className="grid grid-cols-2 gap-3 mb-8">
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total CO₂</p>
                                        <p className="text-lg font-bold text-gray-800"><CountUp end={842} duration={2} separator="," /> <span className="text-xs font-medium text-gray-500">kg</span></p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">CO₂ / m²</p>
                                        <p className="text-lg font-bold text-gray-800"><CountUp end={42.4} duration={2} decimals={1} /> <span className="text-xs font-medium text-gray-500">kg</span></p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">CO₂ / Person</p>
                                        <p className="text-lg font-bold text-gray-800"><CountUp end={1.2} duration={2} decimals={1} /> <span className="text-xs font-medium text-gray-500">tons</span></p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Area</p>
                                        <p className="text-lg font-bold text-gray-800"><CountUp end={MOCK_STATS[selectedBuilding]?.area || 0} duration={2} separator="," /> <span className="text-xs font-medium text-gray-500">m²</span></p>
                                    </div>
                                </div>

                                {/* Monthly Stacked Bar for Building */}
                                <div className="mb-8">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Monthly Emissions Breakdown</h3>
                                    <div className="h-[200px] w-full">
                                        <ChartBar
                                            options={drawerMonthlyOptions}
                                            data={{
                                                labels: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                                                datasets: [
                                                    { label: 'Elec', data: Array(12).fill(0).map(() => Math.random() * 40 + 20), backgroundColor: '#3b82f6' },
                                                    { label: 'Diesel', data: Array(12).fill(0).map(() => Math.random() * 10 + 5), backgroundColor: '#f59e0b' },
                                                    { label: 'LPG', data: Array(12).fill(0).map(() => Math.random() * 5 + 2), backgroundColor: '#10b981' },
                                                ]
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Provenance Table */}
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3">Source Provenance</h3>
                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="px-4 py-2 font-semibold">Source</th>
                                                    <th className="px-4 py-2 font-semibold text-right">Raw Units</th>
                                                    <th className="px-4 py-2 font-semibold text-right">% Rel</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Electricity</td>
                                                    <td className="px-4 py-2 text-right font-medium">{MOCK_STATS[selectedBuilding]?.elec}k</td>
                                                    <td className="px-4 py-2 text-right text-gray-500">65%</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Diesel</td>
                                                    <td className="px-4 py-2 text-right font-medium">{MOCK_STATS[selectedBuilding]?.diesel}k</td>
                                                    <td className="px-4 py-2 text-right text-gray-500">22%</td>
                                                </tr>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> LPG</td>
                                                    <td className="px-4 py-2 text-right font-medium">{MOCK_STATS[selectedBuilding]?.lpg}k</td>
                                                    <td className="px-4 py-2 text-right text-gray-500">13%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    }
                </AnimatePresence >

            </div >
        </div >
    );
}

// Utility
const getMoMChange = (val1: number, val2: number) => {
    const diff = val2 - val1;
    const pct = (diff / val1) * 100;
    return {
        isUp: diff > 0,
        pct: Math.abs(pct)
    };
};
