import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import { authService } from '../utils/authService';

/**
 * Shared Admin top navbar used across all admin sub-pages.
 * Provides: logo → "Admin" breadcrumb → current page title, and a Logout button.
 * Props:
 *   user       – current auth user object
 *   pageTitle  – name of the current admin sub-page, e.g. "Store Management"
 */
export default function AdminNavbar({ user, pageTitle }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-full px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Left: Logo + Breadcrumb */}
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to="/admin" className="flex items-center gap-2 hover:opacity-80 transition shrink-0">
                            <img src={logoImg} alt="Morya Medical" className="h-8 w-8" />
                            <span className="text-base font-bold text-primary-600 hidden sm:block">Morya Medical</span>
                        </Link>
                        <span className="text-gray-300 hidden sm:block">/</span>
                        <Link
                            to="/admin"
                            className="text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-primary-600 transition-colors hidden sm:block"
                        >
                            Admin
                        </Link>
                        {pageTitle && (
                            <>
                                <span className="text-gray-300 hidden sm:block">/</span>
                                <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider truncate hidden sm:block">
                                    {pageTitle}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Right: User + Logout */}
                    <div className="flex items-center gap-3 shrink-0">
                        {user?.name && (
                            <span className="hidden sm:block text-sm text-gray-500 font-medium">
                                {user.name}
                            </span>
                        )}
                        <Link
                            to="/admin"
                            className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 font-medium transition-colors border border-gray-200 px-3 py-1.5 rounded-sm hover:border-primary-300"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Dashboard
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-1.5 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-sm hover:bg-gray-800 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
