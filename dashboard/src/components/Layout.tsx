import { Outlet, NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Zap,
    Car,
    Recycle,
    Sparkles,
    Settings as SettingsIcon,
    LogOut,
    Sun,
    Moon,
    Building2,
    ClipboardEdit
} from 'lucide-react';
import { useDashboard, Period } from '../context/DashboardContext';
import ExportMenu from './ExportMenu';
import NotificationPanel from './NotificationPanel';
import ProfileDropdown from './ProfileDropdown';

export default function Layout() {
    const {
        period,
        setPeriod,
        isScopeView,
        setIsScopeView,
        isTonnes,
        setIsTonnes,
        isDarkMode,
        setIsDarkMode
    } = useDashboard();

    // Sidebar navigation items
    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Overview' },
        { path: '/energy', icon: Zap, label: 'Energy' },
        { path: '/transport', icon: Car, label: 'Transport' },
        { path: '/waste', icon: Recycle, label: 'Waste' },
        { path: '/buildings', icon: Building2, label: 'Buildings' },
        { path: '/scenarios', icon: Sparkles, label: 'Scenarios' },
        { path: '/data-entry', icon: ClipboardEdit, label: 'Data Entry' },
        { path: '/settings', icon: SettingsIcon, label: 'Settings' },
    ];

    return (
        <div className="min-h-screen relative font-sans text-sm pb-8 pt-6 px-4 md:px-8 flex flex-col items-center select-none overflow-y-auto"
            style={{ background: 'radial-gradient(ellipse at center 20%, #2f0f15 0%, #11090a 100%)' }}>

            {/* Top Header Logo outside the App Container */}
            <div className="w-full max-w-[1440px] flex justify-between items-center mb-6 text-white px-2 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                        <div className="w-3 h-3 bg-white rounded-sm opacity-80" />
                        <div className="w-3 h-3 bg-white rounded-sm opacity-50" />
                        <div className="w-3 h-3 bg-white rounded-sm opacity-100" />
                    </div>
                    <span className="text-xl font-medium tracking-wide">CampusCarbon</span>
                </div>
                <div className="text-gray-300 font-medium hidden sm:block">GHG Footprint Dashboard</div>
            </div>

            {/* Main App Container */}
            <div className={`app-container w-full max-w-[1440px] rounded-[2rem] p-4 md:p-6 shadow-2xl relative flex flex-col md:flex-row min-h-[85vh] ${isDarkMode ? 'bg-[#1a1a1e]' : 'bg-[#e6e6e9]'}`}>

                {/* Left Sidebar inside container */}
                <div className={`sidebar w-16 flex flex-col items-center justify-between py-6 rounded-3xl mr-6 shadow-sm backdrop-blur-sm relative z-30 hidden md:flex shrink-0 ${isDarkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-white/40 border border-white/50'}`}>
                    <div className="flex flex-col gap-6 text-gray-400">
                        <NavLink to="/" className="logo-link w-8 h-8 flex items-center justify-center text-gray-800 mb-2">
                            {/* Logo block */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <rect x="2" y="2" width="8" height="8" rx="2" />
                                <rect x="14" y="2" width="8" height="8" rx="2" fillOpacity="0.5" />
                                <rect x="2" y="14" width="8" height="8" rx="2" fillOpacity="0.8" />
                                <rect x="14" y="14" width="8" height="8" rx="2" />
                            </svg>
                        </NavLink>

                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) => `group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${isActive ? (isDarkMode ? 'bg-white/10 shadow-sm text-primary nav-active' : 'bg-white shadow-sm text-primary nav-active') : 'hover:bg-white/60 hover:text-gray-900 cursor-pointer'}`}
                                title={item.label}
                            >
                                <item.icon className="w-5 h-5" />
                                {/* Tooltip */}
                                <span className="absolute left-14 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                    <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white/60 hover:text-gray-900 cursor-pointer transition-all">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col z-10 min-w-0">

                    {/* Global Top Bar Controls */}
                    <div className={`top-bar flex flex-col sm:flex-row justify-between items-center rounded-xl sm:rounded-full p-2 mb-6 shadow-sm gap-4 sm:gap-0 ${isDarkMode ? 'bg-[#232328] border border-white/[0.06]' : 'bg-[#f2f2f5] border border-white/60'}`}>

                        {/* Left Group: Period & View Toggles */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 px-2">
                            {/* Period Selector */}
                            <div className={`period-select-wrap relative rounded-full flex items-center px-3 py-1.5 shadow-sm ${isDarkMode ? 'bg-white/[0.08] border border-white/10 text-gray-300' : 'bg-white border border-gray-200 text-gray-700'}`}>
                                <select
                                    className="bg-transparent appearance-none outline-none font-medium pr-6 cursor-pointer text-sm"
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value as Period)}
                                >
                                    <option value="month">This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                    <option value="custom">Custom Range...</option>
                                </select>
                                <div className="absolute right-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>

                            <div className={`w-px h-5 mx-1 hidden sm:block ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>

                            {/* Scope Toggle */}
                            <div className={`toggle-pill flex rounded-full p-1 text-sm font-medium ${isDarkMode ? 'bg-white/[0.08] border border-white/[0.06]' : 'bg-gray-200/60 border border-gray-300/40'}`}>
                                <button
                                    onClick={() => setIsScopeView(false)}
                                    className={`px-3 py-1 rounded-full transition-all ${!isScopeView ? (isDarkMode ? 'bg-white/12 text-white pill-active' : 'bg-white shadow-sm text-gray-800 pill-active') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                                >
                                    Category
                                </button>
                                <button
                                    onClick={() => setIsScopeView(true)}
                                    className={`px-3 py-1 rounded-full transition-all ${isScopeView ? (isDarkMode ? 'bg-white/12 text-white pill-active' : 'bg-white shadow-sm text-gray-800 pill-active') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                                >
                                    Scope View
                                </button>
                            </div>

                            <div className={`w-px h-5 mx-1 hidden md:block ${isDarkMode ? 'bg-white/10' : 'bg-gray-300'}`}></div>

                            {/* Unit Toggle */}
                            <div className={`toggle-pill flex rounded-full p-1 text-sm font-medium hidden md:flex ${isDarkMode ? 'bg-white/[0.08] border border-white/[0.06]' : 'bg-gray-200/60 border border-gray-300/40'}`}>
                                <button
                                    onClick={() => setIsTonnes(false)}
                                    className={`px-3 py-1 rounded-full text-xs transition-all ${!isTonnes ? (isDarkMode ? 'bg-white/12 text-white pill-active' : 'bg-white shadow-sm text-gray-800 pill-active') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                                >
                                    kg CO₂e
                                </button>
                                <button
                                    onClick={() => setIsTonnes(true)}
                                    className={`px-3 py-1 rounded-full text-xs transition-all ${isTonnes ? (isDarkMode ? 'bg-white/12 text-white pill-active' : 'bg-white shadow-sm text-gray-800 pill-active') : (isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700')}`}
                                >
                                    Tonnes
                                </button>
                            </div>
                        </div>

                        {/* Right Group: Export & Profile */}
                        <div className="flex items-center gap-2 sm:gap-3 px-2 shrink-0">

                            {/* Dark/Light mode toggle */}
                            <div className={`toggle-pill hidden lg:flex rounded-full p-1 mr-1 ${isDarkMode ? 'bg-white/[0.08] border border-white/[0.06]' : 'bg-gray-200/60 border border-gray-300/40'}`}>
                                <button
                                    onClick={() => setIsDarkMode(false)}
                                    className={`p-1 rounded-full transition-all ${!isDarkMode ? 'bg-white shadow-sm text-gray-700 pill-active' : 'text-gray-400 hover:text-gray-300'}`}
                                >
                                    <Sun className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setIsDarkMode(true)}
                                    className={`p-1 rounded-full transition-all ${isDarkMode ? 'bg-white/12 text-white pill-active' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <Moon className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Export Menu */}
                            <ExportMenu />

                            {/* Notifications */}
                            <NotificationPanel />

                            {/* Profile Dropdown */}
                            <ProfileDropdown />
                        </div>
                    </div>

                    {/* Page Content Outlet */}
                    <div className={`content-pane flex-1 flex flex-col min-w-0 rounded-2xl p-4 md:p-6 backdrop-blur-sm shadow-sm overflow-hidden relative ${isDarkMode ? 'bg-white/[0.03] border border-white/[0.06]' : 'bg-white/40 border border-white/50'}`}>
                        <Outlet />
                    </div>

                </div>

                {/* Global UI ambient map background effect */}
                <div className={`world-map-bg absolute top-0 right-0 w-[800px] h-[800px] bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] pointer-events-none z-0 ${isDarkMode ? 'opacity-[0.015]' : 'opacity-[0.03]'}`} style={{ backgroundSize: '150%', backgroundPosition: '-10% 20%' }} />

            </div>
        </div>
    );
}
