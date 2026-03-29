import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileSpreadsheet, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboard } from '../context/DashboardContext';
import { getPeriodLabel } from '../utils/formatEmissions';

// ── Same data used in Overview (ideally this would live in a shared data layer) ──

const dataByPeriod: Record<string, any> = {
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

const scopeDataByPeriod: Record<string, any> = {
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

// ── Helpers ──

function escapeCSV(val: string | number): string {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

function downloadBlob(content: string, filename: string) {
    // BOM for Excel to recognise UTF-8
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function ExportMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { period, isScopeView, isTonnes } = useDashboard();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Reset downloaded state when dropdown re-opens
    useEffect(() => {
        if (isOpen) setDownloaded(false);
    }, [isOpen]);

    const convert = (v: number) => isTonnes ? +(v / 1000).toFixed(3) : v;
    const unitLabel = isTonnes ? 't CO₂e' : 'kg CO₂e';
    const periodLabel = getPeriodLabel(period);

    const handleExportCSV = () => {
        const pd = dataByPeriod[period];
        const sd = scopeDataByPeriod[period];
        const lines: string[] = [];

        // ── Report Header ──
        lines.push(escapeCSV('CampusCarbon — GHG Footprint Export'));
        lines.push(escapeCSV(`Period: ${periodLabel}`));
        lines.push(escapeCSV(`View: ${isScopeView ? 'Scope (1/2/3)' : 'Category (Energy/Transport/Waste)'}`));
        lines.push(escapeCSV(`Unit: ${unitLabel}`));
        lines.push(escapeCSV(`Exported: ${new Date().toLocaleString()}`));
        lines.push('');

        // ── Section 1: KPI Summary ──
        lines.push('--- KPI SUMMARY ---');
        if (isScopeView) {
            lines.push(['Metric', `Value (${unitLabel})`, 'Change (%)'].map(escapeCSV).join(','));
            lines.push(['Total CO₂e', convert(pd.kpi.total), `${pd.changes.total > 0 ? '+' : ''}${pd.changes.total}%`].map(escapeCSV).join(','));
            lines.push(['Scope 1 (Direct)', convert(sd.kpi.scope1), `${sd.changes.scope1 > 0 ? '+' : ''}${sd.changes.scope1}%`].map(escapeCSV).join(','));
            lines.push(['Scope 2 (Energy Indirect)', convert(sd.kpi.scope2), `${sd.changes.scope2 > 0 ? '+' : ''}${sd.changes.scope2}%`].map(escapeCSV).join(','));
            lines.push(['Scope 3 (Other Indirect)', convert(sd.kpi.scope3), `${sd.changes.scope3 > 0 ? '+' : ''}${sd.changes.scope3}%`].map(escapeCSV).join(','));
        } else {
            lines.push(['Metric', `Value (${unitLabel})`, 'Change (%)'].map(escapeCSV).join(','));
            lines.push(['Total CO₂e', convert(pd.kpi.total), `${pd.changes.total > 0 ? '+' : ''}${pd.changes.total}%`].map(escapeCSV).join(','));
            lines.push(['Energy', convert(pd.kpi.energy), `${pd.changes.energy > 0 ? '+' : ''}${pd.changes.energy}%`].map(escapeCSV).join(','));
            lines.push(['Transport', convert(pd.kpi.transport), `${pd.changes.transport > 0 ? '+' : ''}${pd.changes.transport}%`].map(escapeCSV).join(','));
            lines.push(['Waste', convert(pd.kpi.waste), `${pd.changes.waste > 0 ? '+' : ''}${pd.changes.waste}%`].map(escapeCSV).join(','));
        }
        lines.push(['Per Capita', isTonnes ? +(pd.kpi.perCapita / 1000).toFixed(5) : pd.kpi.perCapita, `${pd.changes.perCapita > 0 ? '+' : ''}${pd.changes.perCapita}%`].map(escapeCSV).join(','));
        lines.push('');

        // ── Section 2: Trend Data (time-series) ──
        lines.push('--- TREND DATA ---');
        if (isScopeView) {
            lines.push(['Period', `Total (${unitLabel})`, `Scope 1 (${unitLabel})`, `Scope 2 (${unitLabel})`, `Scope 3 (${unitLabel})`].map(escapeCSV).join(','));
            pd.months.forEach((m: string, i: number) => {
                lines.push([m, convert(pd.total[i]), convert(sd.scope1[i]), convert(sd.scope2[i]), convert(sd.scope3[i])].map(escapeCSV).join(','));
            });
        } else {
            lines.push(['Period', `Total (${unitLabel})`, `Energy (${unitLabel})`, `Transport (${unitLabel})`, `Waste (${unitLabel})`].map(escapeCSV).join(','));
            pd.months.forEach((m: string, i: number) => {
                lines.push([m, convert(pd.total[i]), convert(pd.energy[i]), convert(pd.transport[i]), convert(pd.waste[i])].map(escapeCSV).join(','));
            });
        }

        const csvContent = lines.join('\n');
        const viewTag = isScopeView ? 'scope' : 'category';
        const filename = `campus-carbon-${viewTag}-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
        downloadBlob(csvContent, filename);

        setDownloaded(true);
        setTimeout(() => setIsOpen(false), 800);
    };

    const handleExportPDF = () => {
        window.print();
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="export-btn group flex items-center gap-1.5 px-3 py-1.5 bg-white shadow-sm rounded-full border border-gray-200 text-gray-600 hover:text-gray-900 transition-all font-medium text-sm"
            >
                <Download className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                <span className="hidden sm:inline">Export</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="dropdown-panel absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                    >
                        {/* Context Info */}
                        <div className="dropdown-header px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                            <p className="text-[11px] text-gray-500 font-medium">
                                {isScopeView ? 'Scope view' : 'Category view'} · {periodLabel} · {isTonnes ? 'Tonnes' : 'kg'}
                            </p>
                        </div>

                        <div className="py-1.5">
                            <button
                                onClick={handleExportCSV}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                {downloaded
                                    ? <Check className="w-4 h-4 text-green-500" />
                                    : <FileSpreadsheet className="w-4 h-4 text-green-500" />
                                }
                                <span className="flex-1 text-left">
                                    {downloaded ? 'Downloaded!' : 'Download CSV'}
                                </span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <FileText className="w-4 h-4 text-red-500" />
                                Print / PDF
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
