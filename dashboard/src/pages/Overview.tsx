import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Database,
    FileText,
    Users,
    ClipboardList,
} from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useDashboard } from '../context/DashboardContext';
import { useManualData } from '../context/DataContext';
import { formatEmissions, getPeriodLabel } from '../utils/formatEmissions';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler,
    Legend
);

// --- Dummy Data per Period ---

const dataByPeriod = {
    month: {
        months: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        total: [3200, 3600, 3850, 3600],
        energy: [2100, 2300, 2500, 2300],
        transport: [850, 1000, 1050, 1000],
        waste: [250, 300, 300, 300],
        kpi: { total: 14250, energy: 9200, transport: 3950, waste: 1100, perCapita: 4.4 },
        changes: { total: 2.4, energy: 1.8, transport: 4.2, waste: -0.8, perCapita: 1.1 },
    },
    quarter: {
        months: ['Jan', 'Feb', 'Mar'],
        total: [13100, 12800, 14250],
        energy: [8500, 8200, 9200],
        transport: [3600, 3500, 3950],
        waste: [1000, 1100, 1100],
        kpi: { total: 40150, energy: 25900, transport: 11050, waste: 3200, perCapita: 12.4 },
        changes: { total: 3.1, energy: 2.5, transport: 5.0, waste: -1.2, perCapita: 1.8 },
    },
    year: {
        months: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        total: [12500, 13200, 14100, 13800, 15000, 14200, 13100, 12800, 13500, 14000, 14800, 14250],
        energy: [8000, 8500, 9200, 9000, 9800, 9500, 8500, 8200, 8800, 9100, 9600, 9200],
        transport: [3500, 3700, 3900, 3800, 4200, 3800, 3600, 3500, 3700, 3900, 4100, 3950],
        waste: [1000, 1000, 1000, 1000, 1000, 900, 1000, 1100, 1000, 1000, 1100, 1100],
        kpi: { total: 165250, energy: 107400, transport: 45750, waste: 12200, perCapita: 51.0 },
        changes: { total: 5.6, energy: 4.2, transport: 8.1, waste: -2.1, perCapita: 3.2 },
    },
    custom: {
        months: ['Jan', 'Feb', 'Mar'],
        total: [13100, 12800, 14250],
        energy: [8500, 8200, 9200],
        transport: [3600, 3500, 3950],
        waste: [1000, 1100, 1100],
        kpi: { total: 40150, energy: 25900, transport: 11050, waste: 3200, perCapita: 12.4 },
        changes: { total: 3.1, energy: 2.5, transport: 5.0, waste: -1.2, perCapita: 1.8 },
    },
};

// Scope view data (Scope 1/2/3) per period
const scopeDataByPeriod = {
    month: {
        scope1: [1200, 1400, 1500, 1350],
        scope2: [1600, 1700, 1800, 1750],
        scope3: [400, 500, 550, 500],
        kpi: { scope1: 5400, scope2: 6850, scope3: 2000 },
        changes: { scope1: 1.5, scope2: 3.0, scope3: 2.8 },
    },
    quarter: {
        scope1: [5000, 4800, 5400],
        scope2: [6500, 6200, 6850],
        scope3: [1600, 1800, 2000],
        kpi: { scope1: 15200, scope2: 19550, scope3: 5400 },
        changes: { scope1: 2.0, scope2: 3.8, scope3: 3.5 },
    },
    year: {
        scope1: [4800, 5000, 5400, 5200, 5700, 5400, 5000, 4800, 5100, 5300, 5600, 5400],
        scope2: [6200, 6600, 7000, 6900, 7500, 7100, 6500, 6200, 6700, 6900, 7300, 6850],
        scope3: [1500, 1600, 1700, 1700, 1800, 1700, 1600, 1800, 1700, 1800, 1900, 2000],
        kpi: { scope1: 63700, scope2: 81650, scope3: 20700 },
        changes: { scope1: 4.0, scope2: 6.5, scope3: 5.2 },
    },
    custom: {
        scope1: [5000, 4800, 5400],
        scope2: [6500, 6200, 6850],
        scope3: [1600, 1800, 2000],
        kpi: { scope1: 15200, scope2: 19550, scope3: 5400 },
        changes: { scope1: 2.0, scope2: 3.8, scope3: 3.5 },
    },
};


export default function Overview() {
    const [isNormalized, setIsNormalized] = useState(false);
    const { period, isScopeView, isTonnes } = useDashboard();
    const { hasManualData, getOverviewData, hasBuildingData, getBuildingData } = useManualData();

    const manualBuilding = hasBuildingData ? getBuildingData() : null;

    const baselinePeriodData = dataByPeriod[period];
    const baselineScopeData = scopeDataByPeriod[period];
    const periodLabel = getPeriodLabel(period);

    // If manual data exists, overlay it on the charts; otherwise use baseline.
    const manualOverview = hasManualData ? getOverviewData() : null;

    const baseCampusLocations = [
        { id: 1, name: 'Science Complex', type: 'High Energy', co2: 5200, coords: [42.0580, -87.6750], color: '#ef4444' },
        { id: 2, name: 'Main Library', type: 'Base Load', co2: 2400, coords: [42.0535, -87.6738], color: '#f59e0b' },
        { id: 3, name: 'Student Center', type: 'Mixed Use', co2: 3100, coords: [42.0520, -87.6780], color: '#f59e0b' },
        { id: 4, name: 'North Parking Structure', type: 'Transport Hub', co2: 850, coords: [42.0610, -87.6755], color: '#3b82f6' },
        { id: 5, name: 'Athletic Facility', type: 'Events', co2: 1800, coords: [42.0590, -87.6720], color: '#10b981' },
    ];

    const activeCampusLocations = manualBuilding ? manualBuilding.buildings.map((b, i) => {
        const coordsList = [[42.0580, -87.6750], [42.0535, -87.6738], [42.0520, -87.6780], [42.0610, -87.6755], [42.0590, -87.6720]];
        const colorList = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
        return {
            id: b.id,
            name: b.name,
            type: b.type,
            co2: b.co2e,
            coords: coordsList[i % coordsList.length],
            color: colorList[i % colorList.length]
        };
    }) : baseCampusLocations;

    const periodData = manualOverview ? {
        months: manualOverview.labels,
        total: manualOverview.totalCO2,
        energy: manualOverview.energyCO2,
        transport: manualOverview.transportCO2,
        waste: manualOverview.wasteCO2,
        kpi: {
            total: manualOverview.kpi.total,
            energy: manualOverview.kpi.energy,
            transport: manualOverview.kpi.transport,
            waste: manualOverview.kpi.waste,
            perCapita: manualOverview.kpi.total / 22500,
        },
        changes: baselinePeriodData.changes, // keep baseline % changes for display
    } : baselinePeriodData;

    const scopeData = manualOverview ? {
        scope1: manualOverview.scope1,
        scope2: manualOverview.scope2,
        scope3: manualOverview.scope3,
        kpi: {
            scope1: manualOverview.kpi.scope1Total,
            scope2: manualOverview.kpi.scope2Total,
            scope3: manualOverview.kpi.scope3Total,
        },
        changes: baselineScopeData.changes,
    } : baselineScopeData;

    // Utility to display a value with unit conversion
    const fmt = (valueKg: number) => formatEmissions(valueKg, isTonnes);

    // Chart helper: scale data for unit toggle
    const scaleData = (data: number[]) => isTonnes ? data.map(v => v / 1000) : data;

    // Calculate normalized percentages for stacked chart if toggled
    const getStackedData = () => {
        if (isScopeView) {
            const s1 = scopeData.scope1;
            const s2 = scopeData.scope2;
            const s3 = scopeData.scope3;
            if (!isNormalized) return { d1: scaleData(s1), d2: scaleData(s2), d3: scaleData(s3) };
            const totals = s1.map((_, i) => s1[i] + s2[i] + s3[i]);
            return {
                d1: s1.map((v, i) => (v / totals[i]) * 100),
                d2: s2.map((v, i) => (v / totals[i]) * 100),
                d3: s3.map((v, i) => (v / totals[i]) * 100),
            };
        }
        const e = periodData.energy;
        const t = periodData.transport;
        const w = periodData.waste;
        if (!isNormalized) return { d1: scaleData(e), d2: scaleData(t), d3: scaleData(w) };
        const totals = e.map((_, i) => e[i] + t[i] + w[i]);
        return {
            d1: e.map((v, i) => (v / totals[i]) * 100),
            d2: t.map((v, i) => (v / totals[i]) * 100),
            d3: w.map((v, i) => (v / totals[i]) * 100),
        };
    };

    const stackedData = getStackedData();

    const stackedLabels = isScopeView
        ? ['Scope 1 (Direct)', 'Scope 2 (Energy Indirect)', 'Scope 3 (Other Indirect)']
        : ['Energy', 'Transport', 'Waste'];
    const stackedColors = isScopeView
        ? ['#0284C7', '#7C3AED', '#F59E0B']
        : ['#0284C7', '#D97706', '#7C3AED'];

    const unitLabel = isTonnes ? 't' : 'kg';

    // Chart Configuration for VIZ B: Total Trend
    const totalTrendOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(17, 17, 17, 0.9)',
                titleColor: '#a3a3a3',
                bodyColor: '#fff',
                borderColor: '#333',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (context: any) => {
                        const val = context.parsed.y;
                        return isTonnes
                            ? `${val.toFixed(2)} t CO₂e`
                            : `${val.toLocaleString()} kg CO₂e`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false, color: '#333' },
                ticks: { color: '#888', font: { size: 11 } }
            },
            y: {
                grid: { color: 'rgba(51, 51, 51, 0.2)' },
                ticks: {
                    color: '#888',
                    font: { size: 11 },
                    callback: (value: any) => isTonnes
                        ? `${Number(value).toFixed(1)}t`
                        : `${(value / 1000).toFixed(0)}k`
                },
                border: { display: false },
                beginAtZero: true
            }
        },
        interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    };

    // Chart Configuration for VIZ C: Stacked Categories
    const stackedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: { color: '#a3a3a3', usePointStyle: true, boxWidth: 8, padding: 20 }
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
                backgroundColor: 'rgba(17, 17, 17, 0.9)',
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== null) {
                            label += isNormalized
                                ? `${context.parsed.y.toFixed(1)}%`
                                : isTonnes
                                    ? `${context.parsed.y.toFixed(2)} t`
                                    : `${context.parsed.y.toLocaleString()} kg`;
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: '#888', font: { size: 11 } }
            },
            y: {
                stacked: true,
                grid: { color: 'rgba(51, 51, 51, 0.2)' },
                ticks: {
                    color: '#888',
                    font: { size: 11 },
                    callback: (value: any) => isNormalized
                        ? `${value}%`
                        : isTonnes
                            ? `${Number(value).toFixed(1)}t`
                            : `${(value / 1000).toFixed(0)}k`
                },
                border: { display: false },
                min: 0,
                max: isNormalized ? 100 : undefined
            }
        },
        interaction: { mode: 'index' as const, intersect: false },
    };

    // Build KPI cards data dynamically
    const kpiCards = isScopeView
        ? [
            { label: 'Total CO₂e', value: periodData.kpi.total, change: periodData.changes.total, color: 'bg-gray-800', confidence: 'High', icon: Database, source: 'Metered' },
            { label: 'Scope 1 (Direct)', value: scopeData.kpi.scope1, change: scopeData.changes.scope1, color: 'bg-[#0284C7]', confidence: 'High', icon: Database, source: 'Metered' },
            { label: 'Scope 2 (Indirect)', value: scopeData.kpi.scope2, change: scopeData.changes.scope2, color: 'bg-[#7C3AED]', confidence: 'High', icon: FileText, source: 'Bill' },
            { label: 'Scope 3 (Other)', value: scopeData.kpi.scope3, change: scopeData.changes.scope3, color: 'bg-[#F59E0B]', confidence: 'Medium', icon: ClipboardList, source: 'Est' },
            { label: 'Per Capita', value: periodData.kpi.perCapita, change: periodData.changes.perCapita, color: 'bg-gray-300', confidence: 'Medium', icon: Users, source: 'Est', isPerCapita: true },
        ]
        : [
            { label: 'Total CO₂e', value: periodData.kpi.total, change: periodData.changes.total, color: 'bg-gray-800', confidence: 'High', icon: Database, source: 'Metered' },
            { label: 'Energy', value: periodData.kpi.energy, change: periodData.changes.energy, color: 'bg-[#0284C7]', confidence: 'High', icon: FileText, source: 'Bill' },
            { label: 'Transport', value: periodData.kpi.transport, change: periodData.changes.transport, color: 'bg-[#D97706]', confidence: 'Medium', icon: ClipboardList, source: 'Survey' },
            { label: 'Waste', value: periodData.kpi.waste, change: periodData.changes.waste, color: 'bg-[#7C3AED]', confidence: 'Medium', icon: Database, source: 'Log' },
            { label: 'Per Capita', value: periodData.kpi.perCapita, change: periodData.changes.perCapita, color: 'bg-gray-300', confidence: 'Medium', icon: Users, source: 'Est', isPerCapita: true },
        ];

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in-up">

            {/* Title Row */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Campus Overview</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {isScopeView ? 'Scope-based' : 'Category-based'} GHG footprint — <span className="font-medium text-gray-700">{periodLabel}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="hidden sm:flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all duration-200">
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
                    </button>
                </div>
            </div>

            {/* VIZ A: KPI Tiles Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
                {kpiCards.map((card, index) => {
                    const Icon = card.icon;
                    const isDown = card.change < 0;
                    const displayed = card.isPerCapita
                        ? { value: isTonnes ? (card.value / 1000).toFixed(3) : card.value.toFixed(1), unit: isTonnes ? 't / person' : 'kg / person' }
                        : fmt(card.value);
                    const confidenceColor = card.confidence === 'High' ? 'bg-green-500' : 'bg-amber-400';

                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
                            whileHover={{
                                y: -6,
                                scale: 1.03,
                                boxShadow: '0 12px 28px -4px rgba(0,0,0,0.12), 0 4px 10px -2px rgba(0,0,0,0.06)',
                                transition: { duration: 0.25, ease: 'easeOut' }
                            }}
                            className="kpi-card bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between relative cursor-default"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${card.color}`}></div>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wider">{card.label}</h3>
                                <div className="group/dot relative">
                                    <div className={`w-2 h-2 rounded-full ${confidenceColor} cursor-help`}></div>
                                    <span className="absolute top-4 right-0 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[100]">
                                        {card.confidence} Confidence
                                    </span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-light text-gray-900">{displayed.value}</span>
                                    <span className="text-gray-500 text-sm">{displayed.unit}</span>
                                </div>
                                <div className="flex items-center mt-3 justify-between">
                                    <span className={`${isDown ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-500 bg-red-50 border-red-100'} text-xs flex items-center font-medium px-1.5 py-0.5 rounded border`}>
                                        {isDown ? <ArrowDownRight className="w-3 h-3 mr-0.5" /> : <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                                        {Math.abs(card.change)}% {card.isPerCapita ? 'YoY' : 'MoM'}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                        <Icon className="w-3 h-3" /> {card.source}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Row */}
            <div className="flex flex-col lg:flex-row gap-6">

                {/* VIZ B: Main Trend Area Chart */}
                <div className="bg-white flex-[3] rounded-[2rem] p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-gray-800 font-medium text-base">Campus Total CO₂e Trend</h3>
                            <p className="text-gray-500 text-xs mt-1">
                                {period === 'month' ? 'Weekly breakdown' : period === 'quarter' ? '3-month trend' : '12-month trailing'} emissions — {periodLabel}
                            </p>
                        </div>
                    </div>

                    <div className="w-full h-72">
                        <Line
                            options={totalTrendOptions}
                            data={{
                                labels: periodData.months,
                                datasets: [{
                                    fill: true,
                                    label: 'Total CO₂e',
                                    data: scaleData(periodData.total),
                                    borderColor: '#171717',
                                    borderWidth: 2,
                                    pointBackgroundColor: '#fff',
                                    pointBorderColor: '#171717',
                                    pointBorderWidth: 2,
                                    pointRadius: 4,
                                    pointHoverRadius: 6,
                                    backgroundColor: (context: any) => {
                                        const chart = context.chart;
                                        const { ctx, chartArea } = chart;
                                        if (!chartArea) return 'rgba(23, 23, 23, 0.1)';
                                        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                                        gradient.addColorStop(0, 'rgba(23, 23, 23, 0.15)');
                                        gradient.addColorStop(1, 'rgba(23, 23, 23, 0)');
                                        return gradient;
                                    },
                                    tension: 0.4
                                }]
                            }}
                        />
                    </div>
                </div>

                {/* VIZ C: Stacked Category / Scope Chart */}
                <div className="bg-white flex-[2] rounded-[2rem] p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-gray-800 font-medium text-base">
                                {isScopeView ? 'Emissions by Scope' : 'Emissions by Category'}
                            </h3>
                            <p className="text-gray-500 text-xs mt-1">
                                {isScopeView ? 'Scope 1 / 2 / 3 split' : 'Energy vs Transport vs Waste split'}
                            </p>
                        </div>
                        {/* Normalize Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-0.5 border border-gray-200 text-xs font-medium">
                            <button
                                onClick={() => setIsNormalized(false)}
                                className={`px-2 py-1 rounded-md transition-all ${!isNormalized ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Absolute
                            </button>
                            <button
                                onClick={() => setIsNormalized(true)}
                                className={`px-2 py-1 rounded-md transition-all ${isNormalized ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Percent %
                            </button>
                        </div>
                    </div>

                    <div className="w-full h-72">
                        <Line
                            options={stackedOptions as any}
                            data={{
                                labels: periodData.months,
                                datasets: [
                                    {
                                        fill: true,
                                        label: stackedLabels[2],
                                        data: stackedData.d3,
                                        borderColor: stackedColors[2],
                                        backgroundColor: `${stackedColors[2]}cc`,
                                        borderWidth: 1,
                                        pointRadius: 0,
                                        pointHoverRadius: 4,
                                        tension: 0.4
                                    },
                                    {
                                        fill: true,
                                        label: stackedLabels[1],
                                        data: stackedData.d2,
                                        borderColor: stackedColors[1],
                                        backgroundColor: `${stackedColors[1]}cc`,
                                        borderWidth: 1,
                                        pointRadius: 0,
                                        pointHoverRadius: 4,
                                        tension: 0.4
                                    },
                                    {
                                        fill: true,
                                        label: stackedLabels[0],
                                        data: stackedData.d1,
                                        borderColor: stackedColors[0],
                                        backgroundColor: `${stackedColors[0]}cc`,
                                        borderWidth: 1,
                                        pointRadius: 0,
                                        pointHoverRadius: 4,
                                        tension: 0.4
                                    }
                                ]
                            }}
                        />
                    </div>
                </div>

            </div>

            {/* Map Row */}
            {/* VIZ B-1: Interactive Operations Map */}
            <div className="bg-white w-full rounded-[2rem] p-6 shadow-sm border border-gray-200 relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-gray-800 font-medium text-base">Campus Operations Map</h3>
                        <p className="text-gray-500 text-xs mt-1">Interactive view of facilities and emissions hotspots</p>
                    </div>
                </div>

                {/* z-0 ensures leaflet controls don't overlay top drop-downs if we add any */}
                <div className="w-full h-96 rounded-xl overflow-hidden border border-gray-100 relative z-0">
                    <MapContainer
                        center={[42.0560, -87.6750]}
                        zoom={15}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
                            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />

                        {activeCampusLocations.map((site: any) => {
                            const siteEmissions = fmt(site.co2);
                            return (
                                <CircleMarker
                                    key={site.id}
                                    center={site.coords as [number, number]}
                                    radius={Math.max(8, site.co2 / 300)}
                                    pathOptions={{
                                        fillColor: site.color,
                                        color: site.color,
                                        fillOpacity: 0.6,
                                        weight: 2
                                    }}
                                >
                                    <Popup className="rounded-xl">
                                        <div className="flex flex-col gap-1 p-1 min-w-[140px]">
                                            <span className="font-bold text-gray-900 text-sm leading-tight">{site.name}</span>
                                            <span className="text-xs text-gray-500">{site.type}</span>
                                            <div className="mt-2 text-sm">
                                                <span className="font-semibold text-gray-900">{siteEmissions.value}</span>
                                                <span className="text-gray-500 text-xs ml-1">{siteEmissions.unit}/mo</span>
                                            </div>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
}
