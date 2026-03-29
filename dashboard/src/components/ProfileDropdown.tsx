import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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

    const menuItems = [
        {
            label: 'My Profile',
            icon: User,
            onClick: () => { navigate('/profile'); setIsOpen(false); },
        },
        {
            label: 'Account Settings',
            icon: Settings,
            onClick: () => { navigate('/settings'); setIsOpen(false); },
        },
        {
            label: 'Help & Support',
            icon: HelpCircle,
            onClick: () => { setIsOpen(false); },
        },
    ];

    const handleSignOut = () => {
        setIsOpen(false);
        // In a real app this would clear auth state and redirect
        alert('Signed out successfully!');
    };

    return (
        <div ref={menuRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 ml-1 rounded-full overflow-hidden border-2 border-white shadow-md cursor-pointer hover:border-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
                <img
                    src="https://ui-avatars.com/api/?name=Jatin+Sharma&size=96&background=6366f1&color=fff&bold=true&font-size=0.4"
                    alt="user avatar"
                    className="w-full h-full object-cover"
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="dropdown-panel absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden"
                    >
                        {/* User Info Header */}
                        <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                                <img
                                    src="https://ui-avatars.com/api/?name=Jatin+Sharma&size=96&background=6366f1&color=fff&bold=true&font-size=0.4"
                                    alt="user avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">Jatin Sharma</p>
                                <p className="text-xs text-gray-500 truncate">jatin.sharma@dypatil.edu</p>
                            </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-1.5">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <item.icon className="w-4 h-4 text-gray-400" />
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Sign Out */}
                        <div className="border-t border-gray-100 py-1.5">
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
