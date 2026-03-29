import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Trash2, Zap, Car, Recycle, ChevronDown, ChevronUp,
    CheckCircle2, AlertCircle, Download, Upload, BarChart3, Calculator, Building2
} from 'lucide-react';
import { useManualData, createEmptyEntry, createEmptyBuildingEntry, EMISSION_FACTORS, MonthlyEntry, BuildingEntry, BuildingType } from '../context/DataContext';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Filler, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend, ArcElement);

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type Section = 'energy' | 'transport' | 'waste' | 'buildings';

export default function DataEntry() {
    const { entries, addEntry, updateEntry, deleteEntry, clearEntries, hasManualData, getOverviewData,
        buildingEntries, addBuildingEntry, updateBuildingEntry, deleteBuildingEntry, clearBuildingEntries, hasBuildingData } = useManualData();

    // Form state
    const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [editIndex, setEditIndex] = useState<number | null>(null);

    // Energy fields
    const [electricityKwh, setElectricityKwh] = useState('');
    const [dieselLitres, setDieselLitres] = useState('');
    const [naturalGasM3, setNaturalGasM3] = useState('');
    const [lpgKg, setLpgKg] = useState('');

    // Transport fields
    const [petrolVehicleKm, setPetrolVehicleKm] = useState('');
    const [dieselVehicleKm, setDieselVehicleKm] = useState('');
    const [busPassengerKm, setBusPassengerKm] = useState('');

    // Waste fields
    const [landfillKg, setLandfillKg] = useState('');
    const [recycledKg, setRecycledKg] = useState('');
    const [compostedKg, setCompostedKg] = useState('');

    // Section collapse states
    const [openSections, setOpenSections] = useState<Record<Section, boolean>>({
        energy: true, transport: true, waste: true, buildings: true
    });

    // Building form fields
    const [bldgName, setBldgName] = useState('');
    const [bldgType, setBldgType] = useState<BuildingType>('Academic');
    const [bldgArea, setBldgArea] = useState('');
    const [bldgOccupants, setBldgOccupants] = useState('');
    const [bldgElec, setBldgElec] = useState('');
    const [bldgDiesel, setBldgDiesel] = useState('');
    const [bldgLpg, setBldgLpg] = useState('');
    const [bldgEditIndex, setBldgEditIndex] = useState<number | null>(null);

    const [successMsg, setSuccessMsg] = useState('');

    const toggleSection = (section: Section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Live preview calculations
    const livePreview = useMemo(() => {
        const e = (parseFloat(electricityKwh) || 0) * EMISSION_FACTORS.electricity
            + (parseFloat(dieselLitres) || 0) * EMISSION_FACTORS.diesel
            + (parseFloat(naturalGasM3) || 0) * EMISSION_FACTORS.naturalGas
            + (parseFloat(lpgKg) || 0) * EMISSION_FACTORS.lpg;
        const t = (parseFloat(petrolVehicleKm) || 0) * EMISSION_FACTORS.petrolVehicle
            + (parseFloat(dieselVehicleKm) || 0) * EMISSION_FACTORS.dieselVehicle
            + (parseFloat(busPassengerKm) || 0) * EMISSION_FACTORS.busTransport;
        const w = (parseFloat(landfillKg) || 0) * EMISSION_FACTORS.landfillWaste
            + (parseFloat(recycledKg) || 0) * EMISSION_FACTORS.recycledWaste
            + (parseFloat(compostedKg) || 0) * EMISSION_FACTORS.compostedWaste;
        return { energy: e, transport: t, waste: w, total: e + t + w };
    }, [electricityKwh, dieselLitres, naturalGasM3, lpgKg, petrolVehicleKm, dieselVehicleKm, busPassengerKm, landfillKg, recycledKg, compostedKg]);

    const resetForm = () => {
        setElectricityKwh(''); setDieselLitres(''); setNaturalGasM3(''); setLpgKg('');
        setPetrolVehicleKm(''); setDieselVehicleKm(''); setBusPassengerKm('');
        setLandfillKg(''); setRecycledKg(''); setCompostedKg('');
        setEditIndex(null);
    };

    const resetBldgForm = () => {
        setBldgName(''); setBldgType('Academic'); setBldgArea(''); setBldgOccupants('');
        setBldgElec(''); setBldgDiesel(''); setBldgLpg(''); setBldgEditIndex(null);
    };

    const loadEntry = (index: number) => {
        const e = entries[index];
        setMonth(e.month); setYear(e.year);
        setElectricityKwh(String(e.electricityKwh || '')); setDieselLitres(String(e.dieselLitres || ''));
        setNaturalGasM3(String(e.naturalGasM3 || '')); setLpgKg(String(e.lpgKg || ''));
        setPetrolVehicleKm(String(e.petrolVehicleKm || '')); setDieselVehicleKm(String(e.dieselVehicleKm || ''));
        setBusPassengerKm(String(e.busPassengerKm || ''));
        setLandfillKg(String(e.landfillKg || '')); setRecycledKg(String(e.recycledKg || ''));
        setCompostedKg(String(e.compostedKg || ''));
        setEditIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = () => {
        const entry: MonthlyEntry = {
            month, year,
            electricityKwh: parseFloat(electricityKwh) || 0,
            dieselLitres: parseFloat(dieselLitres) || 0,
            naturalGasM3: parseFloat(naturalGasM3) || 0,
            lpgKg: parseFloat(lpgKg) || 0,
            petrolVehicleKm: parseFloat(petrolVehicleKm) || 0,
            dieselVehicleKm: parseFloat(dieselVehicleKm) || 0,
            busPassengerKm: parseFloat(busPassengerKm) || 0,
            landfillKg: parseFloat(landfillKg) || 0,
            recycledKg: parseFloat(recycledKg) || 0,
            compostedKg: parseFloat(compostedKg) || 0,
        };
        if (editIndex !== null) {
            updateEntry(editIndex, entry);
            setSuccessMsg(`✅  Updated ${month} ${year} entry successfully!`);
        } else {
            addEntry(entry);
            setSuccessMsg(`✅  Added ${month} ${year} entry! Charts across the dashboard are now updated.`);
        }
        resetForm();
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const handleBldgSubmit = () => {
        if (!bldgName.trim()) return;
        const entry: BuildingEntry = {
            id: bldgEditIndex !== null ? buildingEntries[bldgEditIndex].id : crypto.randomUUID(),
            name: bldgName, type: bldgType,
            area: parseFloat(bldgArea) || 0,
            occupants: parseFloat(bldgOccupants) || 0,
            electricityKwh: parseFloat(bldgElec) || 0,
            dieselLitres: parseFloat(bldgDiesel) || 0,
            lpgKg: parseFloat(bldgLpg) || 0,
        };
        if (bldgEditIndex !== null) {
            updateBuildingEntry(bldgEditIndex, entry);
            setSuccessMsg(`✅  Updated building "${bldgName}" successfully!`);
        } else {
            addBuildingEntry(entry);
            setSuccessMsg(`✅  Added building "${bldgName}"! Building Analytics page will reflect this data.`);
        }
        resetBldgForm();
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const loadBldgEntry = (index: number) => {
        const b = buildingEntries[index];
        setBldgName(b.name); setBldgType(b.type);
        setBldgArea(String(b.area || '')); setBldgOccupants(String(b.occupants || ''));
        setBldgElec(String(b.electricityKwh || '')); setBldgDiesel(String(b.dieselLitres || ''));
        setBldgLpg(String(b.lpgKg || '')); setBldgEditIndex(index);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleExport = () => {
        const csv = [
            'Month,Year,Electricity(kWh),Diesel(L),NaturalGas(m³),LPG(kg),PetrolVehicle(km),DieselVehicle(km),Bus(km-pax),Landfill(kg),Recycled(kg),Composted(kg),EnergyCO2,TransportCO2,WasteCO2,TotalCO2',
            ...entries.map(e =>
                `${e.month},${e.year},${e.electricityKwh},${e.dieselLitres},${e.naturalGasM3},${e.lpgKg},${e.petrolVehicleKm},${e.dieselVehicleKm},${e.busPassengerKm},${e.landfillKg},${e.recycledKg},${e.compostedKg},${e.energyCO2.toFixed(1)},${e.transportCO2.toFixed(1)},${e.wasteCO2.toFixed(1)},${e.totalCO2.toFixed(1)}`
            )
        ].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'campus_carbon_manual_data.csv'; a.click();
        URL.revokeObjectURL(url);
    };

    // Chart data from manual entries
    const overviewData = hasManualData ? getOverviewData() : null;

    const InputField = ({ label, value, onChange, unit, icon: Icon }: {
        label: string; value: string; onChange: (v: string) => void; unit: string; icon?: any;
    }) => (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
                <input
                    type="number"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="0"
                    className={`w-full bg-white border border-gray-200 rounded-xl py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 shadow-sm transition-all text-sm ${Icon ? 'pl-9 pr-14' : 'px-4 pr-14'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 font-medium">{unit}</span>
            </div>
        </div>
    );

    const SectionHeader = ({ section, label, icon: Icon, color }: { section: Section; label: string; icon: any; color: string }) => (
        <button
            onClick={() => toggleSection(section)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${color} border shadow-sm`}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{label}</span>
            </div>
            {openSections[section] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
    );

    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in-up pb-8">

            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight flex items-center gap-3">
                        <Upload className="w-6 h-6 text-indigo-600" /> Manual Data Entry
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Feed raw activity data — emissions are <span className="font-medium text-indigo-600">calculated automatically</span> using standard emission factors.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {hasManualData && (
                        <>
                            <button onClick={handleExport}
                                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-gray-50 shadow-sm transition-all">
                                <Download className="w-3.5 h-3.5" /> Export CSV
                            </button>
                            <button onClick={clearEntries}
                                className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-[13px] font-medium hover:bg-red-100 shadow-sm transition-all">
                                <Trash2 className="w-3.5 h-3.5" /> Clear All
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-2 shadow-sm"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col xl:flex-row gap-6">

                {/* ─── LEFT: Input Form ─────────────────────────────── */}
                <div className="flex-[3] flex flex-col gap-4">

                    {/* Month/Year Selector */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 className="w-4 h-4 text-indigo-600" />
                            <h3 className="text-sm font-semibold text-gray-800">Reporting Period</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Month</label>
                                <select value={month} onChange={e => setMonth(e.target.value)}
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm text-sm appearance-none cursor-pointer">
                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Year</label>
                                <select value={year} onChange={e => setYear(parseInt(e.target.value))}
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm text-sm appearance-none cursor-pointer">
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Energy Section ────────────────── */}
                    <div className="flex flex-col gap-3">
                        <SectionHeader section="energy" label="Energy — Scope 1 & 2" icon={Zap}
                            color="bg-blue-50 text-blue-700 border-blue-200" />
                        <AnimatePresence>
                            {openSections.energy && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputField label="Grid Electricity" value={electricityKwh} onChange={setElectricityKwh} unit="kWh" icon={Zap} />
                                            <InputField label="Diesel (Stationary)" value={dieselLitres} onChange={setDieselLitres} unit="Litres" />
                                            <InputField label="Natural Gas" value={naturalGasM3} onChange={setNaturalGasM3} unit="m³" />
                                            <InputField label="LPG" value={lpgKg} onChange={setLpgKg} unit="kg" />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-3">
                                            EFs: Electricity = {EMISSION_FACTORS.electricity} kg CO₂e/kWh · Diesel = {EMISSION_FACTORS.diesel} kg CO₂e/L · Gas = {EMISSION_FACTORS.naturalGas} kg CO₂e/m³ · LPG = {EMISSION_FACTORS.lpg} kg CO₂e/kg
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Transport Section ─────────────── */}
                    <div className="flex flex-col gap-3">
                        <SectionHeader section="transport" label="Transport — Scope 3" icon={Car}
                            color="bg-amber-50 text-amber-700 border-amber-200" />
                        <AnimatePresence>
                            {openSections.transport && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputField label="Petrol Vehicles" value={petrolVehicleKm} onChange={setPetrolVehicleKm} unit="km" icon={Car} />
                                            <InputField label="Diesel Vehicles" value={dieselVehicleKm} onChange={setDieselVehicleKm} unit="km" />
                                            <InputField label="Bus Passenger" value={busPassengerKm} onChange={setBusPassengerKm} unit="km-pax" />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-3">
                                            EFs: Petrol Vehicle = {EMISSION_FACTORS.petrolVehicle} · Diesel Vehicle = {EMISSION_FACTORS.dieselVehicle} · Bus = {EMISSION_FACTORS.busTransport} kg CO₂e/km
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Waste Section ─────────────────── */}
                    <div className="flex flex-col gap-3">
                        <SectionHeader section="waste" label="Waste — Scope 3" icon={Recycle}
                            color="bg-violet-50 text-violet-700 border-violet-200" />
                        <AnimatePresence>
                            {openSections.waste && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <InputField label="Landfill" value={landfillKg} onChange={setLandfillKg} unit="kg" icon={Recycle} />
                                            <InputField label="Recycled" value={recycledKg} onChange={setRecycledKg} unit="kg" />
                                            <InputField label="Composted" value={compostedKg} onChange={setCompostedKg} unit="kg" />
                                        </div>
                                        <p className="text-[11px] text-gray-400 mt-3">
                                            EFs: Landfill = {EMISSION_FACTORS.landfillWaste} · Recycled = {EMISSION_FACTORS.recycledWaste} · Composted = {EMISSION_FACTORS.compostedWaste} kg CO₂e/kg
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Buildings Section ────────────────── */}
                    <div className="flex flex-col gap-3">
                        <SectionHeader section="buildings" label="Buildings — Per-Facility" icon={Building2}
                            color="bg-emerald-50 text-emerald-700 border-emerald-200" />
                        <AnimatePresence>
                            {openSections.buildings && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden">
                                    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Building Name</label>
                                                <input type="text" value={bldgName} onChange={e => setBldgName(e.target.value)}
                                                    placeholder="e.g. Engineering Block A"
                                                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 shadow-sm text-sm" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Building Type</label>
                                                <select value={bldgType} onChange={e => setBldgType(e.target.value as BuildingType)}
                                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 shadow-sm text-sm appearance-none cursor-pointer">
                                                    {['Academic', 'Canteen', 'Residential', 'Administrative', 'Professional', 'Facility'].map(t =>
                                                        <option key={t} value={t}>{t}</option>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <InputField label="Floor Area" value={bldgArea} onChange={setBldgArea} unit="m²" />
                                            <InputField label="Occupants" value={bldgOccupants} onChange={setBldgOccupants} unit="people" />
                                            <InputField label="Annual Electricity" value={bldgElec} onChange={setBldgElec} unit="kWh" icon={Zap} />
                                            <InputField label="Annual Diesel" value={bldgDiesel} onChange={setBldgDiesel} unit="Litres" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <InputField label="Annual LPG" value={bldgLpg} onChange={setBldgLpg} unit="kg" />
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <p className="text-[11px] text-gray-400">
                                                EFs: Electricity = {EMISSION_FACTORS.buildingElectricity} · Diesel = {EMISSION_FACTORS.buildingDiesel} · LPG = {EMISSION_FACTORS.buildingLpg} kg CO₂e/unit
                                            </p>
                                            <button onClick={handleBldgSubmit}
                                                disabled={!bldgName.trim()}
                                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-200 transition-all">
                                                {bldgEditIndex !== null ? <><CheckCircle2 className="w-4 h-4" /> Update Building</> : <><Plus className="w-4 h-4" /> Add Building</>}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <button onClick={handleSubmit}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all duration-300 flex items-center justify-center gap-2 mt-2">
                        {editIndex !== null ? (
                            <><CheckCircle2 className="w-4 h-4" /> Update Entry</>
                        ) : (
                            <><Plus className="w-4 h-4" /> Add Entry & Calculate Emissions</>
                        )}
                    </button>
                </div>

                {/* ─── RIGHT: Live Preview & Summary ────────────────── */}
                <div className="flex-[2] flex flex-col gap-4">

                    {/* Live Preview Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-lg sticky top-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Calculator className="w-5 h-5 opacity-80" />
                            <h3 className="font-semibold text-sm">Live Emission Preview</h3>
                        </div>
                        <div className="text-4xl font-light mb-1">
                            {livePreview.total.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </div>
                        <div className="text-indigo-200 text-sm mb-6">kg CO₂e total for {month} {year}</div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-[10px] uppercase tracking-wider text-indigo-200 mb-1">Energy</div>
                                <div className="text-lg font-semibold">{livePreview.energy.toFixed(1)}</div>
                                <div className="text-[10px] text-indigo-200">kg CO₂e</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-[10px] uppercase tracking-wider text-indigo-200 mb-1">Transport</div>
                                <div className="text-lg font-semibold">{livePreview.transport.toFixed(1)}</div>
                                <div className="text-[10px] text-indigo-200">kg CO₂e</div>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                <div className="text-[10px] uppercase tracking-wider text-indigo-200 mb-1">Waste</div>
                                <div className="text-lg font-semibold">{livePreview.waste.toFixed(1)}</div>
                                <div className="text-[10px] text-indigo-200">kg CO₂e</div>
                            </div>
                        </div>
                        {livePreview.total > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/20">
                                <div className="flex items-center gap-2 text-[11px] text-indigo-200">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    Calculated using BEE / MoEFCC / CPCB India emission factors (2023)
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mini Summary Chart (from existing entries) */}
                    {overviewData && overviewData.labels.length > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-indigo-600" /> Entered Data Overview
                            </h3>
                            <div className="h-48">
                                <Bar
                                    options={{
                                        responsive: true, maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
                                            tooltip: { mode: 'index', intersect: false }
                                        },
                                        scales: {
                                            x: { stacked: true, grid: { display: false } },
                                            y: { stacked: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } } }
                                        },
                                    }}
                                    data={{
                                        labels: overviewData.labels,
                                        datasets: [
                                            { label: 'Energy', data: overviewData.energyCO2, backgroundColor: '#3b82f6' },
                                            { label: 'Transport', data: overviewData.transportCO2, backgroundColor: '#f59e0b' },
                                            { label: 'Waste', data: overviewData.wasteCO2, backgroundColor: '#8b5cf6' },
                                        ]
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Scope Doughnut */}
                    {overviewData && overviewData.kpi.total > 0 && (
                        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4">Scope Split</h3>
                            <div className="h-48 flex items-center justify-center">
                                <Doughnut
                                    options={{
                                        responsive: true, maintainAspectRatio: false,
                                        plugins: {
                                            legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
                                        },
                                        cutout: '65%',
                                    }}
                                    data={{
                                        labels: ['Scope 1 (Direct)', 'Scope 2 (Energy)', 'Scope 3 (Other)'],
                                        datasets: [{
                                            data: [overviewData.kpi.scope1Total, overviewData.kpi.scope2Total, overviewData.kpi.scope3Total],
                                            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
                                            borderWidth: 0,
                                        }]
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Entries Table ────────────────────────────────────── */}
            {hasManualData && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">All Manual Entries ({entries.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Period</th>
                                    <th className="px-4 py-3 text-right">Energy CO₂</th>
                                    <th className="px-4 py-3 text-right">Transport CO₂</th>
                                    <th className="px-4 py-3 text-right">Waste CO₂</th>
                                    <th className="px-4 py-3 text-right">Total CO₂</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {entries.map((e, i) => (
                                    <motion.tr key={i}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{e.month} {e.year}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">
                                                {e.energyCO2.toFixed(1)} kg
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">
                                                {e.transportCO2.toFixed(1)} kg
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded text-xs font-semibold">
                                                {e.wasteCO2.toFixed(1)} kg
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">
                                            {e.totalCO2.toFixed(1)} kg
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => loadEntry(i)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-xs font-medium px-2 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => deleteEntry(i)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!hasManualData && !hasBuildingData && (
                <div className="bg-gray-50 rounded-2xl p-12 border border-dashed border-gray-300 text-center">
                    <Upload className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Entered Yet</h3>
                    <p className="text-sm text-gray-500 max-w-md mx-auto">
                        Fill in the activity data above and click <span className="font-medium text-indigo-600">"Add Entry"</span>.
                        Emissions will be calculated automatically and all dashboard charts will update in real-time.
                    </p>
                </div>
            )}

            {/* ─── Buildings Table ─────────────────────────────────── */}
            {hasBuildingData && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-emerald-600" />
                            Manual Buildings ({buildingEntries.length})
                        </h3>
                        <button onClick={clearBuildingEntries}
                            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-xl text-[12px] font-medium hover:bg-red-100 transition-all">
                            <Trash2 className="w-3 h-3" /> Clear Buildings
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">Building</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3 text-right">Area (m²)</th>
                                    <th className="px-4 py-3 text-right">Occupants</th>
                                    <th className="px-4 py-3 text-right">Elec (kWh)</th>
                                    <th className="px-4 py-3 text-right">CO₂e (t)</th>
                                    <th className="px-4 py-3 text-right">Intensity</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {buildingEntries.map((b, i) => (
                                    <motion.tr key={b.id}
                                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                        className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">{b.type}</span>
                                        </td>
                                        <td className="px-4 py-3 text-right">{b.area.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{b.occupants.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right">{b.electricityKwh.toLocaleString()}</td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900">{(b.co2e / 1000).toFixed(1)}</td>
                                        <td className="px-4 py-3 text-right">{b.intensity.toFixed(1)} kWh/m²</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button onClick={() => loadBldgEntry(i)}
                                                    className="text-emerald-600 hover:text-emerald-800 text-xs font-medium px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors">
                                                    Edit
                                                </button>
                                                <button onClick={() => deleteBuildingEntry(i)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors">
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
