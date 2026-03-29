import { useState, useMemo, useEffect, ElementType } from 'react';
import { SlidersHorizontal, ArrowDownRight, Wand2, Factory, Zap, CloudOff, Save, Trash2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale, ArcElement
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, ArcElement, Title, Tooltip, Legend, Filler);

// Custom Semicircular Gauge Component
const CarbonBudgetGauge = ({ totalSaved }: { totalSaved: number }) => {
    // Campus target to stay under budget: say we need 1500t savings.
    const target = 1500;
    const progress = Math.min(Math.max((totalSaved / target) * 100, 0), 100);
    // Rotate from -90 to 90 degrees
    const rotation = -90 + (progress / 100) * 180;

    let colorClass = 'text-red-500';
    let zoneText = 'Over Budget';
    let monthsLeft = 4;

    if (progress > 80) { colorClass = 'text-emerald-500'; zoneText = 'On Track'; monthsLeft = 48; }
    else if (progress > 40) { colorClass = 'text-amber-500'; zoneText = 'Marginal'; monthsLeft = 18; }
    else if (progress > 15) { monthsLeft = 9; }

    return (
        <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200 flex flex-col items-center relative overflow-hidden">
            <h3 className="text-gray-900 font-semibold text-sm self-start mb-6">Carbon Budget 1.5°C Pathway</h3>
            <div className="relative w-48 h-24 overflow-hidden mb-2">
                {/* Background Arc */}
                <div className="absolute top-0 w-48 h-48 rounded-full border-[1.5rem] border-gray-100 border-b-transparent border-l-transparent transform -rotate-45"></div>
                {/* Foreground Arc - Colors based on zones. We'll simulate it simply */}
                <svg className="w-full h-full absolute top-0 left-0" viewBox="0 0 200 100">
                    <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#gradient)" strokeWidth="24" strokeLinecap="round" />
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                    </defs>
                </svg>
                {/* Needle */}
                <div
                    className="absolute bottom-0 left-[50%] w-1 bg-gray-900 origin-bottom rounded-t-full transition-transform duration-500 ease-out"
                    style={{ height: '70px', marginLeft: '-2px', transform: `rotate(${rotation}deg)` }}
                >
                    <div className="w-3 h-3 bg-gray-900 rounded-full absolute -bottom-1.5 -left-1"></div>
                </div>
            </div>
            <div className={`text-lg font-bold ${colorClass} transition-colors duration-300`}>{zoneText}</div>
            <div className="text-xs text-gray-500 mt-1">{monthsLeft} months of budget remaining</div>
        </div>
    );
};

// Feasibility Card Component
const FeasibilityCard = ({
    active, icon: Icon, title, cost, payback, efficiency, difficulty, color
}: {
    active: boolean, icon: ElementType, title: string, cost: string, payback: string, efficiency: string, difficulty: string, color: string
}) => {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className={`mt-3 border rounded-xl overflow-hidden transition-all duration-300 ${active ? `border-${color}-400 bg-${color}-50/30` : 'border-gray-100 bg-gray-50'}`}>
            <button onClick={() => setExpanded(!expanded)} className="w-full px-3 py-2 flex items-center justify-between text-xs text-gray-600 hover:text-gray-900">
                <span className="font-medium flex items-center gap-1.5"><Icon className="w-3 h-3" /> {title} Profile</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <div className={`px-3 overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-40 pb-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                    <div><span className="text-gray-400 block">Est. Cost</span><span className="font-medium text-gray-800">₹{cost}</span></div>
                    <div><span className="text-gray-400 block">Payback</span><span className="font-medium text-gray-800">{payback}</span></div>
                    <div><span className="text-gray-400 block">Efficiency</span><span className="font-medium text-gray-800">{efficiency}</span></div>
                    <div><span className="text-gray-400 block">Complexity</span><span className="font-medium text-gray-800">{difficulty}</span></div>
                </div>
            </div>
        </div>
    );
};


export default function Scenarios() {
    /* --- State --- */
    const [solarOffset, setSolarOffset] = useState<number>(0);
    const [evAdoption, setEvAdoption] = useState<number>(0);
    const [compostBoost, setCompostBoost] = useState<number>(0);
    const [fuelReduction, setFuelReduction] = useState<number>(0);

    const [scenarios, setScenarios] = useState<{ name: string, data: number[] }[]>([]);
    const [compareMode, setCompareMode] = useState(false);
    const [isPulsing, setIsPulsing] = useState(false);

    /* --- Base Data --- */
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
    const baseEnergy = [120, 115, 130, 140, 150, 155, 145, 125, 110, 130, 135, 125];
    const baseTransport = [80, 85, 80, 75, 70, 70, 85, 80, 85, 75, 80, 80];
    const baseWaste = [45, 45, 48, 42, 40, 40, 45, 48, 50, 45, 45, 45];
    const baseFuel = [30, 25, 20, 25, 30, 35, 30, 25, 25, 30, 35, 30];

    const totalBaseline = months.map((_, i) => baseEnergy[i] + baseTransport[i] + baseWaste[i] + baseFuel[i]);

    /* --- Projection Calculation --- */
    const projectedDecomp = useMemo(() => {
        let savedSolarMonth = Array(12).fill(0);
        let savedEvMonth = Array(12).fill(0);
        let savedCompostMonth = Array(12).fill(0);
        let savedFuelMonth = Array(12).fill(0);

        const projected = months.map((_, i) => {
            const progressRaw = i / 11;
            const progress = Math.pow(progressRaw, 1.5);

            const eSave = baseEnergy[i] * ((solarOffset / 100) * progress);
            const tSave = baseTransport[i] * ((evAdoption / 100 * 0.6) * progress);
            const wSave = baseWaste[i] * ((compostBoost / 100 * 0.5) * progress);
            const fSave = baseFuel[i] * ((fuelReduction / 100) * progress);

            savedSolarMonth[i] = eSave;
            savedEvMonth[i] = tSave;
            savedCompostMonth[i] = wSave;
            savedFuelMonth[i] = fSave;

            const adjEnergy = baseEnergy[i] - eSave;
            const adjTransport = baseTransport[i] - tSave;
            const adjWaste = baseWaste[i] - wSave;
            const adjFuel = baseFuel[i] - fSave;

            return adjEnergy + adjTransport + adjWaste + adjFuel;
        });

        const sumSolar = savedSolarMonth.reduce((a, b) => a + b, 0);
        const sumEv = savedEvMonth.reduce((a, b) => a + b, 0);
        const sumCompost = savedCompostMonth.reduce((a, b) => a + b, 0);
        const sumFuel = savedFuelMonth.reduce((a, b) => a + b, 0);

        return { projected, savedSolarMonth, savedEvMonth, savedCompostMonth, savedFuelMonth, sumSolar, sumEv, sumCompost, sumFuel };
    }, [solarOffset, evAdoption, compostBoost, fuelReduction]);

    const sumBaseline = totalBaseline.reduce((a, b) => a + b, 0);
    const sumProjected = projectedDecomp.projected.reduce((a, b) => a + b, 0);
    const totalSaved = sumBaseline - sumProjected;
    const percentSaved = (sumBaseline > 0) ? ((totalSaved / sumBaseline) * 100) : 0;

    // Trigger Pulse
    useEffect(() => {
        setIsPulsing(true);
        const timer = setTimeout(() => setIsPulsing(false), 600);
        return () => clearTimeout(timer);
    }, [solarOffset, evAdoption, compostBoost, fuelReduction]);

    const resetAll = () => {
        setSolarOffset(0);
        setEvAdoption(0);
        setCompostBoost(0);
        setFuelReduction(0);
    };

    const saveScenario = () => {
        if (scenarios.length >= 3) return; // limit 3
        setScenarios([...scenarios, {
            name: `Scenario ${String.fromCharCode(65 + scenarios.length)}`,
            data: projectedDecomp.projected
        }]);
    };

    /* --- CHARTS CONFIG --- */

    // 1. Line Chart
    const lineChartData = {
        labels: months,
        datasets: [
            {
                label: 'Baseline (BAU)',
                data: totalBaseline,
                borderColor: 'rgba(156, 163, 175, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                pointRadius: 0,
                pointHoverRadius: 4,
                tension: 0.4
            },
            ...(compareMode ? scenarios.map((s, i) => ({
                label: s.name,
                data: s.data,
                borderColor: ['#3b82f6', '#8b5cf6', '#ec4899'][i % 3],
                borderWidth: 2,
                backgroundColor: 'transparent',
                pointRadius: 0,
                tension: 0.4
            })) : []),
            {
                label: 'Projected Emissions',
                data: projectedDecomp.projected,
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 3,
                backgroundColor: (context: import('chart.js').ScriptableContext<'line'>) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
                    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
                    return gradient;
                },
                fill: '-1',
                pointRadius: 2,
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                pointHoverRadius: 6,
                tension: 0.4
            }
        ]
    };
    const lineChartOptions = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 600 },
        interaction: { mode: 'index' as const, intersect: false },
        plugins: { legend: { position: 'top' as const } },
        scales: {
            x: { grid: { display: false } },
            y: { min: 150, grid: { color: 'rgba(229, 231, 235, 0.4)' } }
        }
    };

    // 2. Waterfall
    const waterfallData = {
        labels: ['Solar', 'EV', 'Composting', 'Diesel Red.', 'Total Savings'],
        datasets: [{
            label: 'CO₂e Savings (t)',
            data: [projectedDecomp.sumSolar, projectedDecomp.sumEv, projectedDecomp.sumCompost, projectedDecomp.sumFuel, totalSaved],
            backgroundColor: [
                'rgba(245, 158, 11, 0.8)', // amber
                'rgba(16, 185, 129, 0.8)', // emerald
                'rgba(168, 85, 247, 0.8)', // purple
                'rgba(244, 63, 94, 0.8)',  // rose
                'rgba(5, 150, 105, 1)'     // total
            ],
            borderRadius: 4
        }]
    };
    const waterfallOptions = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: { legend: { display: false } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
    };

    // 3. Stacked Bar Monthly
    const monthlyStackedData = {
        labels: months,
        datasets: [
            { label: 'Solar', data: projectedDecomp.savedSolarMonth, backgroundColor: '#f59e0b' },
            { label: 'EV', data: projectedDecomp.savedEvMonth, backgroundColor: '#10b981' },
            { label: 'Compost', data: projectedDecomp.savedCompostMonth, backgroundColor: '#a855f7' },
            { label: 'Diesel', data: projectedDecomp.savedFuelMonth, backgroundColor: '#f43f5e' }
        ]
    };
    const monthlyStackedOptions = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 800 },
        interaction: { mode: 'index' as const, intersect: false },
        plugins: { legend: { position: 'bottom' as const } },
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true } }
    };

    // 4. Radar Before/After
    const radarData = {
        labels: ['Energy Int.', 'Transport', 'Waste', 'Diesel Dep.', 'Per-Capita', 'Diversion'],
        datasets: [
            {
                label: 'Baseline',
                data: [100, 100, 100, 100, 100, 20], // normalized
                backgroundColor: 'rgba(156, 163, 175, 0.2)',
                borderColor: 'rgba(156, 163, 175, 1)',
                borderDash: [5, 5],
                borderWidth: 2
            },
            {
                label: 'Projected',
                data: [
                    100 - (solarOffset * 0.8), // simulated impact
                    100 - (evAdoption * 0.6),
                    100 - (compostBoost * 0.4),
                    100 - fuelReduction,
                    100 - percentSaved,
                    20 + (compostBoost * 0.5)
                ],
                backgroundColor: 'rgba(16, 185, 129, 0.4)',
                borderColor: 'rgba(16, 185, 129, 1)',
                pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2
            }
        ]
    };
    const radarOptions = {
        responsive: true, maintainAspectRatio: false,
        animation: { duration: 600 },
        scales: { r: { beginAtZero: true, suggestedMax: 100, ticks: { display: false } } }
    };

    // Net Zero Marker Pos (0 to 100%)
    // Let's say max total potential savings is ~1000t, net zero needs 3000t
    const netZeroPercent = Math.min((totalSaved / 1500) * 100, 100);

    return (
        <div className="w-full flex gap-6 pb-8 flex-col xl:flex-row">

            {/* LEFT PANEL: SLIDERS */}
            <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }}
                className="w-full xl:w-[350px] shrink-0 bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200 flex flex-col"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-3 items-center">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><SlidersHorizontal className="w-5 h-5" /></div>
                        <h3 className="text-gray-800 font-semibold text-base">Key Interventions</h3>
                    </div>
                    <button
                        onClick={resetAll}
                        className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors bg-indigo-50 px-3 py-1.5 rounded-lg active:scale-95"
                    >
                        Reset
                    </button>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Solar */}
                    <div className="group">
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${solarOffset > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                <Zap className={`w-4 h-4 ${solarOffset > 0 ? 'text-amber-500' : 'text-gray-400'}`} /> Solar Offset
                            </label>
                            <span className={`text-sm font-semibold transition-colors duration-150 ${solarOffset > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                                <CountUp end={solarOffset} duration={0.2} preserveValue />%
                            </span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-amber-500 transition-all duration-[50ms]" style={{ width: `${solarOffset}%` }}></div>
                            <input type="range" min="0" max="100" step="5" value={solarOffset} onChange={(e) => setSolarOffset(parseInt(e.target.value))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <p className={`text-[11px] mt-1.5 leading-tight transition-colors duration-150 ${solarOffset > 0 ? 'text-gray-500' : 'text-gray-400'}`}>Install campus solar capacity.</p>
                        <FeasibilityCard active={solarOffset > 50} icon={Zap} title="Solar" cost="25L" payback="4.2 yrs" efficiency="40 CO₂e/₹" difficulty="Moderate" color="amber" />
                    </div>

                    {/* EV */}
                    <div className="group">
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${evAdoption > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                <Factory className={`w-4 h-4 ${evAdoption > 0 ? 'text-emerald-500' : 'text-gray-400'}`} /> EV Transition
                            </label>
                            <span className={`text-sm font-semibold transition-colors duration-150 ${evAdoption > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                                <CountUp end={evAdoption} duration={0.2} preserveValue />%
                            </span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-[50ms]" style={{ width: `${evAdoption}%` }}></div>
                            <input type="range" min="0" max="100" step="5" value={evAdoption} onChange={(e) => setEvAdoption(parseInt(e.target.value))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <p className={`text-[11px] mt-1.5 leading-tight transition-colors duration-150 ${evAdoption > 0 ? 'text-gray-500' : 'text-gray-400'}`}>Replace engine campus fleet.</p>
                        <FeasibilityCard active={evAdoption > 50} icon={Factory} title="EV Transition" cost="40L" payback="6.5 yrs" efficiency="25 CO₂e/₹" difficulty="Complex" color="emerald" />
                    </div>

                    {/* Diesel */}
                    <div className="group">
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${fuelReduction > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                <CloudOff className={`w-4 h-4 ${fuelReduction > 0 ? 'text-rose-500' : 'text-gray-400'}`} /> Diesel Red.
                            </label>
                            <span className={`text-sm font-semibold transition-colors duration-150 ${fuelReduction > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                                <CountUp end={fuelReduction} duration={0.2} preserveValue />%
                            </span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-rose-500 transition-all duration-[50ms]" style={{ width: `${fuelReduction}%` }}></div>
                            <input type="range" min="0" max="100" step="5" value={fuelReduction} onChange={(e) => setFuelReduction(parseInt(e.target.value))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <p className={`text-[11px] mt-1.5 leading-tight transition-colors duration-150 ${fuelReduction > 0 ? 'text-gray-500' : 'text-gray-400'}`}>Cut backup generator usage.</p>
                        <FeasibilityCard active={fuelReduction > 50} icon={CloudOff} title="Diesel Red." cost="12L" payback="3.0 yrs" efficiency="55 CO₂e/₹" difficulty="Easy" color="rose" />
                    </div>

                    {/* Composting */}
                    <div className="group">
                        <div className="flex justify-between items-center mb-2">
                            <label className={`text-sm font-medium flex items-center gap-2 transition-colors duration-150 ${compostBoost > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
                                <Wand2 className={`w-4 h-4 ${compostBoost > 0 ? 'text-purple-500' : 'text-gray-400'}`} /> Composting
                            </label>
                            <span className={`text-sm font-semibold transition-colors duration-150 ${compostBoost > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                <CountUp end={compostBoost} duration={0.2} preserveValue />%
                            </span>
                        </div>
                        <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-purple-500 transition-all duration-[50ms]" style={{ width: `${compostBoost}%` }}></div>
                            <input type="range" min="0" max="100" step="5" value={compostBoost} onChange={(e) => setCompostBoost(parseInt(e.target.value))} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                        <p className={`text-[11px] mt-1.5 leading-tight transition-colors duration-150 ${compostBoost > 0 ? 'text-gray-500' : 'text-gray-400'}`}>Divert organic waste.</p>
                        <FeasibilityCard active={compostBoost > 50} icon={Wand2} title="Composting" cost="5L" payback="1.5 yrs" efficiency="80 CO₂e/₹" difficulty="Easy" color="purple" />
                    </div>
                </div>
            </motion.div>

            {/* RIGHT PANEL: DASHBOARD */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">

                {/* TOP CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                        className={`bg-gradient-to-br from-emerald-500 to-green-600 rounded-[2rem] p-6 text-white text-center sm:text-left relative overflow-hidden group transition-all duration-300 ${isPulsing ? 'shadow-[0_0_0_8px_rgba(16,185,129,0.3)]' : 'shadow-[0_8px_30px_rgb(16,185,129,0.2)]'}`}
                    >
                        {/* Shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-[150%] animate-[shimmer_3s_infinite] skew-x-12"></div>
                        <div className="flex items-center justify-center sm:justify-start gap-2 opacity-90 mb-4">
                            <ArrowDownRight className="w-5 h-5" />
                            <span className="font-medium text-sm tracking-wide uppercase">Projected Savings</span>
                        </div>
                        <div className="flex items-baseline justify-center sm:justify-start gap-2 z-10 relative">
                            <span className="text-4xl font-bold tracking-tight"><CountUp end={totalSaved} duration={0.6} preserveValue /></span>
                            <span className="text-emerald-100 font-medium">tCO₂e</span>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col justify-between relative"
                    >
                        <div className="flex items-center gap-2 text-gray-500 mb-4">
                            <span className="font-medium text-sm tracking-wide uppercase">Reduction</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-bold tracking-tight transition-colors duration-500 ${percentSaved > 25 ? 'text-emerald-500' : percentSaved > 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                                <CountUp end={percentSaved} decimals={1} duration={0.6} preserveValue />%
                            </span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
                            <div className={`h-full transition-all duration-500 ease-out ${percentSaved > 25 ? 'bg-emerald-500' : percentSaved > 10 ? 'bg-amber-500' : 'bg-gray-400'}`} style={{ width: `${Math.min(percentSaved, 100)}%` }}></div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                        <CarbonBudgetGauge totalSaved={totalSaved} />
                    </motion.div>
                </div>

                {/* MAIN CHART */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}
                    className={`bg-white rounded-[2rem] p-7 shadow-sm border border-gray-200 flex-1 min-h-[400px] flex flex-col transition-shadow duration-300 ${isPulsing ? 'shadow-[0_0_0_4px_rgba(16,185,129,0.15)]' : ''}`}
                >
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-gray-900 font-semibold text-lg flex items-center gap-3">
                                Emissions Projection
                                {scenarios.length > 0 && (
                                    <div className="flex gap-2">
                                        <AnimatePresence>
                                            {scenarios.map((s, i) => (
                                                <motion.span key={i} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ width: 0, opacity: 0, margin: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full flex items-center gap-1 font-medium"
                                                >
                                                    {s.name}
                                                    <button onClick={() => setScenarios(scenarios.filter((_, idx) => idx !== i))} className="hover:text-red-500"><Trash2 className="w-3 h-3" /></button>
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={saveScenario} disabled={scenarios.length >= 3} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save Scenario</button>
                            {scenarios.length > 0 && (
                                <button onClick={() => setCompareMode(!compareMode)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${compareMode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}><CheckCircle2 className="w-3.5 h-3.5" /> Compare</button>
                            )}
                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-100 shadow-sm relative overflow-hidden">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live Model
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 w-full relative">
                        <Line data={lineChartData} options={lineChartOptions} />
                        {totalSaved > 0 && !compareMode && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute right-[10%] top-[35%] bg-white/90 backdrop-blur-sm border border-emerald-200 shadow-sm px-2 py-1 rounded text-xs font-semibold text-emerald-700 pointer-events-none">
                                Saved: <CountUp end={totalSaved} duration={0.6} preserveValue />t
                            </motion.div>
                        )}
                    </div>

                    {/* Net Zero Marker */}
                    <div className="mt-6 pt-4 border-t relative h-12 flex flex-col justify-center">
                        <div className="w-full h-1 bg-gray-200 rounded-full relative">
                            {/* Year tags */}
                            <div className="absolute top-3 left-0 text-[10px] text-gray-400 font-medium">2024 (Now)</div>
                            <div className="absolute top-3 right-0 text-[10px] text-gray-400 font-medium">2035</div>

                            {/* Sliding Marker */}
                            {totalSaved > 0 && (
                                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow transition-all duration-500" style={{ left: `calc(${netZeroPercent}% - 8px)`, transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                                    <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-emerald-600 whitespace-nowrap bg-emerald-50 px-1.5 rounded">Net Zero By Expected</div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* BOTTOM GRIDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Waterfall */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4">Contribution Waterfall</h4>
                        <div className="h-48">
                            <Bar data={waterfallData} options={waterfallOptions} />
                        </div>
                    </motion.div>

                    {/* Stacked */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-4">Monthly Savings Breakdown</h4>
                        <div className="h-48">
                            <Bar data={monthlyStackedData} options={monthlyStackedOptions} />
                        </div>
                    </motion.div>

                    {/* Radar */}
                    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-200 flex flex-col">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Performance Footprint</h4>
                        <div className="flex-1 w-full min-h-[180px]">
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
