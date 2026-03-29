import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Period = 'month' | 'quarter' | 'year' | 'custom';

interface DashboardContextType {
    period: Period;
    setPeriod: (period: Period) => void;
    isScopeView: boolean;
    setIsScopeView: (isScopeView: boolean) => void;
    isTonnes: boolean;
    setIsTonnes: (isTonnes: boolean) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDarkMode: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
    const [period, setPeriod] = useState<Period>('month');
    const [isScopeView, setIsScopeView] = useState(false);
    const [isTonnes, setIsTonnes] = useState(false);

    // Initialize dark mode from localStorage or system preference
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        // Here you could check localStorage or system preference initially
        const isDark = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDarkMode]);

    return (
        <DashboardContext.Provider
            value={{
                period,
                setPeriod,
                isScopeView,
                setIsScopeView,
                isTonnes,
                setIsTonnes,
                isDarkMode,
                setIsDarkMode,
            }}
        >
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider');
    }
    return context;
}
