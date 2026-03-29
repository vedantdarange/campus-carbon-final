import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Database, History, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

type TabId = 'general' | 'factors' | 'quality' | 'audit';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<TabId>('general');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <div className="mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">General Configuration</h3>
                            <p className="text-sm text-gray-500 mt-1">Manage global campus variables and reporting standards.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Campus Identity</label>
                                <input
                                    type="text"
                                    defaultValue="DY Patil College of Engineering"
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Reporting Framework</label>
                                <select className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm appearance-none cursor-pointer">

                                    {/* ── Global Standards ─────────────────────────── */}
                                    <optgroup label="── Global Standards ──────────────────">
                                        <option value="ghg-protocol">GHG Protocol Corporate Standard</option>
                                        <option value="iso-14064">ISO 14064-1:2018</option>
                                        <option value="gri">GRI Standards (Sustainability Disclosure)</option>
                                    </optgroup>

                                    {/* ── India-Specific Standards ─────────────────── */}
                                    <optgroup label="── India-Specific Standards ──────────">
                                        <option value="bee">BEE — Bureau of Energy Efficiency (India)</option>
                                        <option value="moefcc">MoEFCC National GHG Inventory Guidelines</option>
                                        <option value="napcc">NAPCC — National Action Plan on Climate Change</option>
                                    </optgroup>

                                    {/* ── Indian Campus / Higher Education ────────── */}
                                    <optgroup label="── Indian Campus / Higher Education ──">
                                        <option value="naac">NAAC Green Audit Framework</option>
                                        <option value="igbc">IGBC Green Campus Rating</option>
                                        <option value="nirf">NIRF Sustainability Ranking Criteria</option>
                                    </optgroup>

                                </select>
                                <p className="text-xs text-gray-400 mt-1">
                                    Select the standard your institution reports against. Affects scope labelling and EF authority references.
                                </p>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Student Headcount (Constant)</label>
                                <input
                                    type="number"
                                    defaultValue="22500"
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Staff Headcount (Constant)</label>
                                <input
                                    type="number"
                                    defaultValue="4200"
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-gray-700">Total Built Area (m²)</label>
                                <input
                                    type="number"
                                    defaultValue="1450000"
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-colors">
                                Save Constants
                            </button>
                        </div>
                    </div>
                );

            case 'factors':
                return (
                    <div className="flex flex-col gap-6 animate-fade-in-up h-full">
                        <div className="mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">Emission Factors Registry</h3>
                            <p className="text-sm text-gray-500 mt-1">Underlying constants used to convert activity data into CO₂e.</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3">Source/Fuel</th>
                                            <th className="px-4 py-3">Factor Value</th>
                                            <th className="px-4 py-3">Unit</th>
                                            <th className="px-4 py-3">Scope</th>
                                            <th className="px-4 py-3">Authority / Year</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">Grid Electricity</td>
                                            <td className="px-4 py-3">0.85</td>
                                            <td className="px-4 py-3">kg CO₂e / kWh</td>
                                            <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-semibold">Scope 2</span></td>
                                            <td className="px-4 py-3 text-gray-500">BEE / MoEFCC (2023)</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">Diesel (Stationary)</td>
                                            <td className="px-4 py-3">2.68</td>
                                            <td className="px-4 py-3">kg CO₂e / L</td>
                                            <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">Scope 1</span></td>
                                            <td className="px-4 py-3 text-gray-500">MoEFCC / DEFRA (2023)</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">Natural Gas</td>
                                            <td className="px-4 py-3">2.02</td>
                                            <td className="px-4 py-3">kg CO₂e / m³</td>
                                            <td className="px-4 py-3"><span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">Scope 1</span></td>
                                            <td className="px-4 py-3 text-gray-500">MoEFCC GHG Inventory (2023)</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">Landfill Waste</td>
                                            <td className="px-4 py-3">1.20</td>
                                            <td className="px-4 py-3">kg CO₂e / kg</td>
                                            <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Scope 3</span></td>
                                            <td className="px-4 py-3 text-gray-500">CPCB India (2023)</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 font-medium text-gray-900">Passenger Vehicle (Petrol)</td>
                                            <td className="px-4 py-3">0.17</td>
                                            <td className="px-4 py-3">kg CO₂e / km-pax</td>
                                            <td className="px-4 py-3"><span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold">Scope 3</span></td>
                                            <td className="px-4 py-3 text-gray-500">MoRTH / BEE (2023)</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );

            case 'quality':
                return (
                    <div className="flex flex-col gap-6 animate-fade-in-up">
                        <div className="mb-2">
                            <h3 className="text-xl font-semibold text-gray-900">Data Quality & Completeness</h3>
                            <p className="text-sm text-gray-500 mt-1">Review the confidence levels and interpolation policies used across the dashboard.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-gray-400" /> Confidence Legend
                                </h4>
                                <ul className="space-y-4 text-sm">
                                    <li className="flex gap-3 items-start">
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 mt-1 shrink-0 shadow-sm"></span>
                                        <div>
                                            <p className="font-medium text-gray-900">High Confidence</p>
                                            <p className="text-gray-500 mt-0.5">Directly metered data or direct utility billing records (`meter`, `bill`). Minimal uncertainty.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="w-3 h-3 rounded-full bg-amber-400 mt-1 shrink-0 shadow-sm"></span>
                                        <div>
                                            <p className="font-medium text-gray-900">Medium Confidence</p>
                                            <p className="text-gray-500 mt-0.5">Data derived from comprehensive surveys or generalized log matching (`survey`, `log`).</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3 items-start">
                                        <span className="w-3 h-3 rounded-full bg-rose-500 mt-1 shrink-0 shadow-sm"></span>
                                        <div>
                                            <p className="font-medium text-gray-900">Low / Estimated Confidence</p>
                                            <p className="text-gray-500 mt-0.5">Gaps filled by area × intensity benchmarks or heavily extrapolated assumptions (`estimate`).</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-gray-400" /> Missing Data Policy
                                </h4>
                                <div className="text-sm text-gray-600 space-y-3">
                                    <p>The dashboard automatically employs standard gap-filling techniques to ensure continuous reporting:</p>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="font-medium text-gray-900">Single Month Gap (e.g., late bill)</p>
                                        <p className="text-gray-500 mt-0.5">Interpolates using the average of the 3 preceding months. Marked with a trailing asterisk (*).</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="font-medium text-gray-900">No Historical Meter</p>
                                        <p className="text-gray-500 mt-0.5">Estimates based on `Building Area (m²) × Regional Average Intensity factor`. Triggers Low Confidence tag.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'audit':
                return (
                    <div className="flex flex-col gap-6 animate-fade-in-up h-full">
                        <div className="mb-2 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">System Integrity Log</h3>
                                <p className="text-sm text-gray-500 mt-1">Immutable record of changes to constants, emission factors, and manual overrides.</p>
                            </div>
                            <button className="text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 font-medium hover:bg-gray-50 shadow-sm">
                                Export Log
                            </button>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-1">
                            <div className="overflow-x-auto h-full">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3">Timestamp</th>
                                            <th className="px-4 py-3">User</th>
                                            <th className="px-4 py-3">Parameter / Field</th>
                                            <th className="px-4 py-3">Old Value</th>
                                            <th className="px-4 py-3">New Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-700">
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Mar 02, 2026 14:32</td>
                                            <td className="px-4 py-3 font-medium">jsmith@admin</td>
                                            <td className="px-4 py-3">Campus Built Area</td>
                                            <td className="px-4 py-3 text-rose-600 line-through">1,420,000 m²</td>
                                            <td className="px-4 py-3 text-emerald-600 font-medium">1,450,000 m²</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Feb 15, 2026 09:12</td>
                                            <td className="px-4 py-3 font-medium">SYSTEM_AUTO</td>
                                            <td className="px-4 py-3">EF `Grid Electricity`</td>
                                            <td className="px-4 py-3 text-rose-600 line-through">0.86 — EPA eGRID (2022)</td>
                                            <td className="px-4 py-3 text-emerald-600 font-medium">0.85 — BEE / MoEFCC (2023)</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Jan 01, 2026 10:00</td>
                                            <td className="px-4 py-3 font-medium">admin_sustainability</td>
                                            <td className="px-4 py-3">Student Headcount</td>
                                            <td className="px-4 py-3 text-rose-600 line-through">21,800</td>
                                            <td className="px-4 py-3 text-emerald-600 font-medium">22,500</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Nov 12, 2025 16:45</td>
                                            <td className="px-4 py-3 font-medium">admin_sustainability</td>
                                            <td className="px-4 py-3">Reporting Framework</td>
                                            <td className="px-4 py-3 text-rose-600 line-through">EPA Center for Corporate Climate Leadership</td>
                                            <td className="px-4 py-3 text-emerald-600 font-medium">NAAC Green Audit Framework</td>
                                        </tr>
                                        <tr className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3 text-gray-500 whitespace-nowrap">Oct 05, 2025 11:20</td>
                                            <td className="px-4 py-3 font-medium">admin_sustainability</td>
                                            <td className="px-4 py-3">Campus Identity</td>
                                            <td className="px-4 py-3 text-rose-600 line-through">Northwestern Main Campus</td>
                                            <td className="px-4 py-3 text-emerald-600 font-medium">DY Patil College of Engineering</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="w-full h-[calc(100vh-140px)] flex flex-col pb-4 animate-fade-in-up">

            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Platform Configuration & Assumptions</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage underlying data standards, transparency settings, and system audit logs.</p>
                </div>
            </div>

            <div className="w-full flex-1 bg-white border border-gray-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col md:flex-row">

                {/* Lateral Settings Menu */}
                <div className="w-full md:w-64 bg-gray-50/50 border-r border-gray-100 p-6 flex flex-col gap-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'general' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                    >
                        <SettingsIcon className={`w-4 h-4 ${activeTab === 'general' ? 'text-indigo-600' : 'text-gray-400'}`} /> General
                    </button>

                    <button
                        onClick={() => setActiveTab('factors')}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'factors' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                    >
                        <Database className={`w-4 h-4 ${activeTab === 'factors' ? 'text-indigo-600' : 'text-gray-400'}`} /> Emission Factors
                    </button>

                    <button
                        onClick={() => setActiveTab('quality')}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'quality' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                    >
                        <Shield className={`w-4 h-4 ${activeTab === 'quality' ? 'text-indigo-600' : 'text-gray-400'}`} /> Data Quality & Audit
                    </button>

                    <button
                        onClick={() => setActiveTab('audit')}
                        className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium text-sm
                            ${activeTab === 'audit' ? 'bg-white shadow-sm text-gray-900 border border-gray-200' : 'text-gray-600 hover:bg-gray-100 border border-transparent'}`}
                    >
                        <History className={`w-4 h-4 ${activeTab === 'audit' ? 'text-indigo-600' : 'text-gray-400'}`} /> Change Log
                    </button>

                    <div className="mt-8 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-800">
                        <p className="flex items-center gap-1.5 font-semibold mb-1">
                            <BookOpen className="w-3.5 h-3.5" /> Documentation
                        </p>
                        <p className="opacity-80 leading-relaxed">
                            Refer to the Campus Sustainability methodology guide for EF justifications.
                        </p>
                    </div>
                </div>

                {/* Main Settings Panel */}
                <div className="flex-1 p-8 overflow-y-auto bg-gray-50/10">
                    {renderTabContent()}
                </div>

            </div>
        </div>
    );
}