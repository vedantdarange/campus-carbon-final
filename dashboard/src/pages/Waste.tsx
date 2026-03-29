import { useState, useEffect, useRef } from 'react';
import { Recycle, Trash2, Leaf, Activity, ArrowDown, ArrowUp, TreePine, AlertCircle } from 'lucide-react';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { motion, useInView } from 'framer-motion';
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

export default function Waste() {
    /* ─── Base Data & State ─── */
    // const totalWasteKgBase = 14500;
    const { hasManualData, getWasteData } = useManualData();
    const manualWaste = hasManualData ? getWasteData() : null;

    const baseLandfill = manualWaste ? manualWaste.landfillKg : [1200, 1150, 1300, 1250, 1100, 950, 1050, 1150, 1200, 1180, 1220, 1100];
    const baseRecycled = manualWaste ? manualWaste.recycledKg : [800, 850, 900, 950, 800, 700, 750, 850, 900, 880, 920, 850];
    const baseComposted = manualWaste ? manualWaste.compostedKg : [400, 420, 450, 480, 400, 350, 380, 420, 450, 440, 460, 420];
    const months = manualWaste ? manualWaste.labels : ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    // Expanded What-If Sliders
    const [compostBoost, setCompostBoost] = useState<number>(0); // 0-80
    const [recycleBoost, setRecycleBoost] = useState<number>(0); // 0-50
    const [reduceTotal, setReduceTotal] = useState<number>(0);   // 0-30

    const [isSimulating, setIsSimulating] = useState(false);

    // Apply simulation across entire array
    const applySimulation = (baseArray: number[], type: 'landfill' | 'recycled' | 'compost') => {
        return baseArray.map((_, i) => {
            const rawReduction = 1 - (reduceTotal / 100);

            // Baseline starting values for that month
            let l = baseLandfill[i] * rawReduction;
            let r = baseRecycled[i] * rawReduction;
            let c = baseComposted[i] * rawReduction;

            // Apply conversions from landfill to compost/recycle
            const drainToCompost = l * (compostBoost / 100);
            const drainToRecycle = l * (recycleBoost / 100);

            // Ensure we don't drain more than 100% of landfill
            const totalDrain = drainToCompost + drainToRecycle;
            let actualL = l;
            let actualC = c;
            let actualR = r;

            if (totalDrain > l) {
                // Scale down proportionally
                const scale = l / totalDrain;
                actualL = 0;
                actualC += drainToCompost * scale;
                actualR += drainToRecycle * scale;
            } else {
                actualL -= totalDrain;
                actualC += drainToCompost;
                actualR += drainToRecycle;
            }

            if (type === 'landfill') return actualL;
            if (type === 'recycled') return actualR;
            return actualC;
        });
    };

    const adjLandfill = applySimulation(baseLandfill, 'landfill');
    const adjRecycled = applySimulation(baseRecycled, 'recycled');
    const adjComposted = applySimulation(baseComposted, 'compost');

    const sumList = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
    const tLandfill = sumList(adjLandfill);
    const tRecycled = sumList(adjRecycled);
    const tComposted = sumList(adjComposted);
    const currentTotalWaste = tLandfill + tRecycled + tComposted;

    const efLandfill = 1.2;
    const efRecycled = 0.1;
    const efCompost = 0.05;

    const currentEmissions = (tLandfill * efLandfill) + (tRecycled * efRecycled) + (tComposted * efCompost);
    const baselineEmissions = sumList(baseLandfill) * efLandfill + sumList(baseRecycled) * efRecycled + sumList(baseComposted) * efCompost;
    const co2eSaved = baselineEmissions - currentEmissions;

    const diversionRate = ((tRecycled + tComposted) / currentTotalWaste * 100) || 0;

    // Simulation trigger
    useEffect(() => {
        setIsSimulating(true);
        const t = setTimeout(() => setIsSimulating(false), 400);
        return () => clearTimeout(t);
    }, [compostBoost, recycleBoost, reduceTotal]);

    /* ─── VIZ H: Monthly Trend Map ─── */
    const trendData = {
        labels: months,
        datasets: [
            {
                label: 'Composted',
                data: adjComposted,
                borderColor: 'rgba(34, 197, 94, 1)',
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Recycled',
                data: adjRecycled,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Landfill',
                data: adjLandfill,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
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
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                callbacks: { label: (ctx: import('chart.js').TooltipItem<'line'>) => `${ctx.dataset.label}: ${Math.round((ctx.parsed.y as number) || 0)} kg` }
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
            y: {
                stacked: true,
                grid: { color: 'rgba(229, 231, 235, 0.4)' },
                title: { display: true, text: 'Mass (kg)', color: '#9ca3af', font: { size: 11 } },
                ticks: { color: '#6b7280', font: { size: 11 } },
                border: { display: false }
            }
        }
    };

    /* ─── VIZ H: Composition Doughnut ─── */
    const doughnutData = {
        labels: ['Landfill', 'Recycled', 'Composted'],
        datasets: [{
            data: [tLandfill, tRecycled, tComposted],
            backgroundColor: ['rgba(239, 68, 68, 0.85)', 'rgba(59, 130, 246, 0.85)', 'rgba(34, 197, 94, 0.85)'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: { animateRotate: true, duration: 800 },
        plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: import('chart.js').TooltipItem<'doughnut'>) => ` ${ctx.label}: ${Math.round(ctx.parsed).toLocaleString()} kg` } }
        },
        cutout: '70%'
    };

    /* ─── Diverging Bar Chart ─── */
    const emittedData = [tLandfill * efLandfill, 0, 0];
    const avoidedData = [0, tRecycled * 0.4, tComposted * 0.2]; // Dummy avoidance factors

    const divergingData = {
        labels: ['Landfill', 'Recycled', 'Composted'],
        datasets: [
            {
                label: 'CO₂e Emitted (kg)',
                data: emittedData.map(v => -v),
                backgroundColor: 'rgba(239, 68, 68, 0.85)',
                borderRadius: 4,
            },
            {
                label: 'CO₂e Avoided (kg)',
                data: avoidedData,
                backgroundColor: 'rgba(34, 197, 94, 0.85)',
                borderRadius: 4,
            }
        ]
    };

    const divergingOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800 },
        plugins: {
            legend: { position: 'top' as const, labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
            tooltip: { callbacks: { label: (ctx: import('chart.js').TooltipItem<'bar'>) => `${ctx.dataset.label}: ${Math.abs(Math.round(ctx.raw as number)).toLocaleString()} kg` } }
        },
        scales: {
            x: {
                stacked: true,
                grid: { color: 'rgba(229, 231, 235, 0.4)' },
                ticks: { callback: (v: string | number) => Math.abs(Number(v)) }
            },
            y: { stacked: true, grid: { display: false }, border: { display: false } }
        }
    };

    /* ─── Scroll Reveal Hook ─── */
    const useReveal = () => {
        const ref = useRef(null);
        const isInView = useInView(ref, { once: true, margin: "-50px" });
        return { ref, isInView };
    };

    const { ref: s1, isInView: v1 } = useReveal();
    const { ref: s2, isInView: v2 } = useReveal();
    const { ref: s3, isInView: v3 } = useReveal();
    const { ref: s4, isInView: v4 } = useReveal();
    const { ref: s5, isInView: v5 } = useReveal();

    /* ─── Custom Sankey SVG Component ─── */
    const FlowDiagram = () => {
        const [hoveredPath, setHoveredPath] = useState<string | null>(null);

        // Define paths mathematically
        const paths = [
            // Sources -> Streams
            { id: '1', start: [0, 40], end: [150, 60], color: '#f87171', width: 24, from: 'Canteen', to: 'Organic' },
            { id: '2', start: [0, 110], end: [150, 140], color: '#60a5fa', width: 14, from: 'Academic', to: 'Dry' },
            { id: '3', start: [0, 170], end: [150, 140], color: '#60a5fa', width: 10, from: 'Hostels', to: 'Dry' },
            { id: '4', start: [0, 230], end: [150, 220], color: '#9ca3af', width: 6, from: 'Labs', to: 'Hazardous' },
            { id: '5', start: [0, 110], end: [150, 60], color: '#f87171', width: 6, from: 'Academic', to: 'Organic' },

            // Streams -> Treatment
            { id: '6', start: [150, 60], end: [300, 40], color: '#4ade80', width: 20, from: 'Organic', to: 'Composting' },
            { id: '7', start: [150, 60], end: [300, 180], color: '#f87171', width: 10, from: 'Organic', to: 'Landfill' },
            { id: '8', start: [150, 140], end: [300, 110], color: '#60a5fa', width: 18, from: 'Dry', to: 'Recycling' },
            { id: '9', start: [150, 140], end: [300, 180], color: '#f87171', width: 6, from: 'Dry', to: 'Landfill' },
            { id: '10', start: [150, 220], end: [300, 250], color: '#a78bfa', width: 6, from: 'Hazardous', to: 'Incineration' },
        ];

        return (
            <div className="relative w-full h-[300px] flex justify-between items-center text-xs font-semibold text-gray-600 mt-4 overflow-hidden">
                {/* SVG Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 300 300">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f87171" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#4ade80" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                    {paths.map(p => {
                        const isFaded = hoveredPath && hoveredPath !== p.id && hoveredPath !== p.from && hoveredPath !== p.to;
                        const isHighlighted = hoveredPath === p.id || hoveredPath === p.from || hoveredPath === p.to;

                        return (
                            <motion.path
                                key={p.id}
                                d={`M ${p.start[0]} ${p.start[1]} C ${(p.start[0] + p.end[0]) / 2} ${p.start[1]}, ${(p.start[0] + p.end[0]) / 2} ${p.end[1]}, ${p.end[0]} ${p.end[1]}`}
                                fill="none"
                                stroke={p.color}
                                strokeWidth={isHighlighted ? p.width + 2 : p.width}
                                strokeOpacity={isFaded ? 0.15 : 0.65}
                                strokeLinecap="round"
                                className="transition-all duration-300 pointer-events-auto cursor-pointer"
                                onMouseEnter={() => setHoveredPath(p.id)}
                                onMouseLeave={() => setHoveredPath(null)}
                                initial={{ strokeDasharray: 500, strokeDashoffset: 500 }}
                                animate={{ strokeDashoffset: v2 ? 0 : 500 }}
                                transition={{ duration: 1.5, ease: "easeInOut", delay: parseInt(p.id) * 0.05 }}
                            />
                        )
                    })}
                </svg>

                {/* Nodes HTML overlay */}
                <div className="flex flex-col justify-around h-full z-10 w-24">
                    {['Canteen', 'Academic', 'Hostels', 'Labs'].map((n) => (
                        <div key={n}
                            onMouseEnter={() => setHoveredPath(n)} onMouseLeave={() => setHoveredPath(null)}
                            className="bg-white border shadow-sm rounded-lg py-2 px-3 text-center cursor-default hover:border-gray-400 transition-colors">
                            {n}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-around h-full z-10 w-24">
                    {['Organic', 'Dry', 'Hazardous'].map((n) => (
                        <div key={n}
                            onMouseEnter={() => setHoveredPath(n)} onMouseLeave={() => setHoveredPath(null)}
                            className="bg-gray-800 text-white rounded-lg py-2 px-3 text-center cursor-default">
                            {n}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-around h-full z-10 w-28 text-right">
                    {['Composting', 'Recycling', 'Landfill', 'Incineration'].map((n) => (
                        <div key={n}
                            onMouseEnter={() => setHoveredPath(n)} onMouseLeave={() => setHoveredPath(null)}
                            className="bg-white border shadow-sm rounded-lg py-2 px-3 text-center cursor-default">
                            {n}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    /* ─── Render ─── */
    return (
        <div className="w-full flex justify-center pb-12 font-['Sora',sans-serif]">
            {/* Base styles for animations/gradients */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Sora:wght@400;500;600;700&display=swap');
                * { font-family: 'Sora', sans-serif; }
                .mono { font-family: 'DM Mono', monospace; }
                
                .pulse-glow { animation: simGlow 0.4s ease-out; }
                @keyframes simGlow {
                    0% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); }
                    50% { box-shadow: 0 0 20px 4px rgba(34, 197, 94, 0.4); transform: scale(1.01); }
                    100% { box-shadow: 0 0 0 0px rgba(34, 197, 94, 0); transform: scale(1); }
                }

                input[type=range] { -webkit-appearance:none; background:transparent; }
                input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; height:16px; width:16px; border-radius:50%; background:#16a34a; border:2px solid white; box-shadow:0 1px 3px rgba(0,0,0,0.3); cursor:pointer; margin-top:-6px; transition:transform 0.1s;}
                input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); }
                input[type=range]::-webkit-slider-runnable-track { width:100%; height:4px; cursor:pointer; background: #e5e7eb; border-radius: 4px; }
            `}</style>

            <div className="w-full max-w-7xl flex flex-col gap-6">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center px-1 mb-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Waste & Resource Recovery</h1>
                        <p className="text-gray-500 text-sm mt-1">Track waste streams, trace pathways, and simulate granular interventions.</p>
                    </div>
                </motion.div>

                {/* Manual Data Banner */}
                {manualWaste && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-violet-600" />
                            <div>
                                <p className="text-sm font-semibold text-violet-900">Manual Data Active</p>
                                <p className="text-xs text-violet-600">
                                    {manualWaste.labels.length} months entered · {manualWaste.totalWasteKg.toLocaleString()} kg total waste · {manualWaste.totalWasteCO2.toFixed(1)} kg CO₂e · {manualWaste.diversionRate.toFixed(1)}% diversion
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Top KPIs ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" ref={s1}>
                    {/* KPI 1 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={v1 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.0 }}
                        className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-200 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-gray-50 text-gray-600 rounded-xl"><Trash2 className="w-5 h-5" /></div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                <ArrowUp className="w-3 h-3" /> 2.4%
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">Total Waste (YTD)</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-bold text-gray-900 tracking-tight mono">
                                    <CountUp end={currentTotalWaste / 1000} decimals={1} duration={2} separator="," />
                                </span>
                                <span className="text-sm font-medium text-gray-400">tons</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* KPI 2 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={v1 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }}
                        className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-200 flex flex-col justify-between relative overflow-hidden"
                    >
                        {/* Background Arc */}
                        <svg className="absolute right-[-20%] bottom-[-20%] w-48 h-48 opacity-[0.03] text-emerald-500 pointer-events-none" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="15" fill="none" strokeDasharray="251" strokeDashoffset={251 * (1 - diversionRate / 100)} transform="rotate(-90 50 50)" strokeLinecap="round" />
                        </svg>

                        <div className="flex justify-between items-start mb-3 relative z-10">
                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl"><Recycle className="w-5 h-5" /></div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <ArrowUp className="w-3 h-3" /> 4.1%
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">Landfill Diversion</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-bold text-gray-900 tracking-tight mono">
                                    <CountUp end={diversionRate} decimals={1} duration={2} />
                                </span>
                                <span className="text-lg font-medium text-gray-400">%</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* KPI 3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={v1 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }}
                        className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-200 flex flex-col justify-between"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl"><Activity className="w-5 h-5" /></div>
                            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <ArrowDown className="w-3 h-3" /> 1.2%
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-1">Scope 3 Emissions</p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-bold text-gray-900 tracking-tight mono">
                                    <CountUp end={currentEmissions / 1000} decimals={1} duration={2} separator="," />
                                </span>
                                <span className="text-sm font-medium text-gray-400">tCO₂e</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Stream Sankey Flow ── */}
                <motion.div ref={s2} initial={{ opacity: 0, y: 20 }} animate={v2 ? { opacity: 1, y: 0 } : {}} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-200">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <h3 className="text-gray-900 font-bold text-lg leading-tight">Waste Stream Architecture</h3>
                            <p className="text-gray-500 text-sm mt-1">Trace organic and inorganic pathways from generated source to treatment resolution.</p>
                        </div>
                    </div>
                    <FlowDiagram />
                </motion.div>

                {/* ── Charts Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" ref={s3}>
                    {/* Trend line */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={v3 ? { opacity: 1, y: 0 } : {}} className="col-span-1 lg:col-span-8 bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200">
                        <div className="mb-4">
                            <h3 className="text-gray-900 font-semibold text-lg">Academic Year Trend</h3>
                            <p className="text-gray-400 text-sm mt-0.5">Monthly material recovery vs landfill generation.</p>
                        </div>
                        <div className="w-full h-[320px]">
                            <Line options={trendOptions} data={trendData} />
                        </div>
                    </motion.div>

                    {/* Composition Doughnut */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={v3 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="col-span-1 lg:col-span-4 bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200 flex flex-col items-center">
                        <div className="w-full mb-2">
                            <h3 className="text-gray-900 font-semibold text-lg">Stream Composition</h3>
                            <p className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mt-1">Total YTD Breakdown</p>
                        </div>
                        <div className="h-[240px] w-full relative mt-4">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-gray-800 mono">
                                    <CountUp end={diversionRate} decimals={1} duration={0.8} />%
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Diverted</span>
                            </div>
                        </div>
                        {/* Custom Legend */}
                        <div className="flex justify-center gap-4 mt-6 w-full text-xs font-medium text-gray-600">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Landfill</div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Recycled</div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Composted</div>
                        </div>
                    </motion.div>
                </div>

                {/* ── Expanded Impact Simulator ── */}
                <motion.div ref={s4} initial={{ opacity: 0, y: 20 }} animate={v4 ? { opacity: 1, y: 0 } : {}} className={`bg-[#064e3b] rounded-[2rem] p-8 shadow-xl relative overflow-hidden text-white ${isSimulating ? 'pulse-glow' : ''}`}>
                    {/* Decor lines */}
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 Q 50 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M-20 100 Q 50 -20 120 100" fill="none" stroke="currentColor" strokeWidth="1" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                        {/* Left: Outputs */}
                        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-6 text-emerald-300 font-semibold text-sm uppercase tracking-widest">
                                <Leaf className="w-4 h-4" /> Live Impact Simulator
                            </div>

                            <p className="text-emerald-50 max-w-sm text-sm leading-relaxed mb-8">
                                Adjust variables to map the massive leverage of institutional behavioral shifts on total Scope 3 impact.
                            </p>

                            <div className="bg-emerald-900/50 rounded-[1.5rem] p-6 border border-emerald-700/50 backdrop-blur-sm">
                                <div className="text-emerald-200/70 text-[10px] uppercase tracking-wider font-bold mb-2">Net Projected Annual Reduction</div>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span className="text-5xl font-bold tracking-tight text-white mono">
                                        <CountUp end={co2eSaved} duration={0.6} separator="," />
                                    </span>
                                    <span className="text-emerald-300 font-medium">kg CO₂e</span>
                                </div>
                                <div className="flex items-center gap-2 text-emerald-300 text-sm mt-4 pt-4 border-t border-emerald-800">
                                    <TreePine className="w-4 h-4" />
                                    <span>Equivalent to planting <strong className="text-white mono"><CountUp end={co2eSaved / 21} duration={0.6} /></strong> trees</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Sliders */}
                        <div className="col-span-1 lg:col-span-7 flex flex-col gap-6 justify-center">
                            {/* Reset Line */}
                            <div className="flex justify-end">
                                <button onClick={() => { setReduceTotal(0); setCompostBoost(0); setRecycleBoost(0); }}
                                    className="text-[11px] font-bold text-emerald-300/60 hover:text-emerald-300 uppercase tracking-widest flex items-center gap-1 transition-colors">
                                    Reset Values
                                </button>
                            </div>

                            {/* Sliders */}
                            {[
                                { label: "1. Reduce Overall Generation", state: reduceTotal, set: setReduceTotal, max: 30, color: '#34d399', desc: "Behavioral campaigns and packaging mandates." },
                                { label: "2. Aggressive Composting", state: compostBoost, set: setCompostBoost, max: 80, color: '#4ade80', desc: "Redirecting organic loads to municipal composters." },
                                { label: "3. Expand Recycling Coverage", state: recycleBoost, set: setRecycleBoost, max: 50, color: '#60a5fa', desc: "Adding new dry waste sorting stations across campus." }
                            ].map((s, i) => (
                                <div key={i} className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-800/30">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm font-semibold text-emerald-50">{s.label}</label>
                                        <span className="text-sm font-bold mono" style={{ color: s.color }}>+{s.state}%</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-300/60 mb-3">{s.desc}</p>
                                    <div className="relative h-2 bg-emerald-950 rounded-full flex items-center">
                                        <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-300" style={{ width: `${(s.state / s.max) * 100}%`, background: s.color }}></div>
                                        <input
                                            type="range" min="0" max={s.max} step="5" value={s.state} onChange={(e) => s.set(parseInt(e.target.value))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {/* Fake thumb */}
                                        <div className="absolute h-4 w-4 rounded-full bg-white shadow-md border-2 pointer-events-none transition-all duration-300"
                                            style={{ left: `calc(${(s.state / s.max) * 100}% - 8px)`, borderColor: s.color }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* ── Detailed Analytics Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={s5}>

                    {/* Ring Targets */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={v5 ? { opacity: 1, y: 0 } : {}} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200">
                        <div className="mb-6">
                            <h3 className="text-gray-900 font-semibold text-lg">Goal Progression</h3>
                            <p className="text-gray-400 text-sm mt-0.5">Campus 2030 targets vs Simulated achievement.</p>
                        </div>
                        <div className="flex justify-around items-center h-48">
                            {[
                                { label: 'Diversion', val: diversionRate, target: 80, col: '#10b981' },
                                { label: 'Compost', val: (tComposted / (tLandfill + tRecycled + tComposted)) * 100, target: 35, col: '#8b5cf6' },
                                { label: 'Recycle', val: (tRecycled / (tLandfill + tRecycled + tComposted)) * 100, target: 45, col: '#3b82f6' },
                            ].map((r, i) => (
                                <div key={i} className="flex flex-col items-center gap-3">
                                    <div className="relative w-24 h-24 flex items-center justify-center">
                                        <svg className="absolute inset-0 w-full h-full text-gray-100" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" />
                                        </svg>
                                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                            <motion.circle
                                                cx="50" cy="50" r="42" fill="none"
                                                stroke={r.val >= r.target ? '#4ade80' : r.col}
                                                strokeWidth="8" strokeLinecap="round"
                                                strokeDasharray="264"
                                                initial={{ strokeDashoffset: 264 }}
                                                animate={v5 ? { strokeDashoffset: 264 - (264 * (Math.min(r.val, 100) / 100)) } : {}}
                                                transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.2 }}
                                            />
                                        </svg>
                                        <div className="text-lg font-bold text-gray-800 mono">
                                            <CountUp end={r.val} decimals={1} duration={1} />%
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">{r.label}</div>
                                        <div className="text-[10px] text-gray-400 font-medium mt-1">Target: {r.target}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Diverging Bar */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={v5 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.1 }} className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200">
                        <div className="mb-4">
                            <h3 className="text-gray-900 font-semibold text-lg">Emissions Balance</h3>
                            <p className="text-gray-400 text-sm mt-0.5">Comparing Scope 3 emissions against theoretical offset potential.</p>
                        </div>
                        <div className="w-full h-[220px]">
                            <Bar data={divergingData} options={divergingOptions} />
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
}

