import { User, Mail, Phone, MapPin, Building2, Calendar, Shield, Award, Edit3 } from 'lucide-react';
import { useManualData } from '../context/DataContext';

export default function Profile() {
    const { buildingEntries, entries } = useManualData();
    return (
        <div className="w-full flex flex-col gap-6 animate-fade-in-up">

            {/* Header */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">My Profile</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your account details and preferences.</p>
                </div>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm transition-colors">
                    <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                    <div className="absolute -bottom-12 left-8">
                        <div className="w-24 h-24 rounded-2xl bg-white shadow-lg border-4 border-white flex items-center justify-center overflow-hidden">
                            <img
                                src="https://ui-avatars.com/api/?name=Jatin+Sharma&size=96&background=6366f1&color=fff&bold=true&font-size=0.4"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="pt-16 pb-6 px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Jatin Sharma</h2>
                            <p className="text-gray-500 text-sm">Sustainability Lead · DY Patil College of Engineering</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
                                <Shield className="w-3 h-3" /> Admin
                            </span>
                            <span className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full font-medium">
                                <Award className="w-3 h-3" /> Verified
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Personal Information */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500" /> Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm text-gray-800 font-medium">jatin.sharma@dypatil.edu</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Phone</p>
                                <p className="text-sm text-gray-800 font-medium">+91 98765 43210</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Location</p>
                                <p className="text-sm text-gray-800 font-medium">Pune, Maharashtra, India</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Joined</p>
                                <p className="text-sm text-gray-800 font-medium">August 2024</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Organization */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500" /> Organization
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-400">Institution</p>
                            <p className="text-sm text-gray-800 font-medium">DY Patil College of Engineering</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Department</p>
                            <p className="text-sm text-gray-800 font-medium">Sustainability & Environmental Science</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Role</p>
                            <p className="text-sm text-gray-800 font-medium">Sustainability Lead — Campus Carbon Reporting</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Reporting Framework</p>
                            <p className="text-sm text-gray-800 font-medium">NAAC Green Audit Framework</p>
                        </div>
                    </div>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:col-span-2">
                    <h3 className="text-base font-semibold text-gray-900 mb-5">Recent Activity</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                            <p className="text-2xl font-light text-gray-900">{buildingEntries.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Buildings Managed</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                            <p className="text-2xl font-light text-gray-900">{entries.length}</p>
                            <p className="text-xs text-gray-500 mt-1">Data Entries Logged</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                            <p className="text-2xl font-light text-gray-900">5</p>
                            <p className="text-xs text-gray-500 mt-1">Scenarios Created</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
