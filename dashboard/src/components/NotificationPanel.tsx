import { useState, useRef, useEffect } from 'react';
import { Bell, AlertTriangle, TrendingUp, FileCheck, Database, CheckCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Notification {
    id: number;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        iconBg: 'bg-red-50',
        title: 'Energy threshold exceeded',
        description: 'Science Complex electricity usage exceeded monthly target by 12%.',
        time: '2 hours ago',
        read: false,
    },
    {
        id: 2,
        icon: FileCheck,
        iconColor: 'text-green-500',
        iconBg: 'bg-green-50',
        title: 'Monthly report ready',
        description: 'Your February 2026 GHG footprint report is ready to download.',
        time: '5 hours ago',
        read: false,
    },
    {
        id: 3,
        icon: Database,
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-50',
        title: 'Data import complete',
        description: 'Utility bills for Q4 2025 have been successfully imported.',
        time: '1 day ago',
        read: false,
    },
    {
        id: 4,
        icon: TrendingUp,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-50',
        title: 'Transport emissions rising',
        description: 'Fleet emissions up 4.2% month-over-month — review recommended.',
        time: '2 days ago',
        read: true,
    },
    {
        id: 5,
        icon: AlertTriangle,
        iconColor: 'text-purple-500',
        iconBg: 'bg-purple-50',
        title: 'Waste diversion rate drop',
        description: 'Recycling rate fell below 40% target in February.',
        time: '3 days ago',
        read: true,
    },
];

export default function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const panelRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const markRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div ref={panelRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="export-btn relative w-8 h-8 flex items-center justify-center bg-white shadow-sm rounded-full border border-gray-200 text-gray-600 hover:text-black hover:shadow-md transition-all"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full px-1 ring-2 ring-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="dropdown-panel absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="dropdown-header flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                                >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.map((notif) => {
                                const Icon = notif.icon;
                                return (
                                    <button
                                        key={notif.id}
                                        onClick={() => markRead(notif.id)}
                                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${!notif.read ? 'bg-primary/[0.03]' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg ${notif.iconBg} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <Icon className={`w-4 h-4 ${notif.iconColor}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                    {notif.title}
                                                </span>
                                                {!notif.read && (
                                                    <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.description}</p>
                                            <span className="text-[10px] text-gray-400 mt-1 block">{notif.time}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-100 px-4 py-2.5">
                            <button className="w-full text-center text-xs text-primary font-medium hover:text-primary/80 transition-colors">
                                View all notifications
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
