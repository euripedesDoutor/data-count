import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, FileText, Map, LogOut, Users, PieChart, BarChart3, Menu, X, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const roleNames = {
        ADMIN: 'Administrador',
        CLIENT: 'Cliente',
        INTERVIEWER: 'Coletor',
        SUPERVISOR: 'Supervisor'
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-30 w-64 bg-brazil-blue text-white flex flex-col transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
                print:hidden
            `}>
                <div className="p-6 text-center border-b border-blue-800 flex justify-between items-center md:block">
                    <div className="flex justify-center items-center mb-2">
                        <PieChart className="w-10 h-10 text-brazil-yellow mr-2" />
                        <h1 className="text-2xl font-bold text-brazil-yellow">DataCount</h1>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-white">
                        <X className="w-6 h-6" />
                    </button>
                    <p className="text-sm text-gray-300 hidden md:block">Sistema de Pesquisas</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3 text-brazil-yellow" />
                        Dashboard
                    </Link>
                    {user?.role === 'ADMIN' && (
                        <Link to="/clients" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                            <Users className="w-5 h-5 mr-3 text-brazil-yellow" />
                            Clientes
                        </Link>
                    )}
                    {(user?.role === 'ADMIN' || user?.role === 'CLIENT') && (
                        <Link to="/collectors" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                            <Users className="w-5 h-5 mr-3 text-brazil-yellow" />
                            Coletores
                        </Link>
                    )}
                    <Link to="/surveys" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                        <FileText className="w-5 h-5 mr-3 text-brazil-yellow" />
                        Pesquisas
                    </Link>
                    <Link to="/reports" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                        <BarChart3 className="w-5 h-5 mr-3 text-brazil-yellow" />
                        Relatórios
                    </Link>
                    <Link to="/heatmap" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                        <Map className="w-5 h-5 mr-3 text-brazil-yellow" />
                        Mapa de Calor
                    </Link>
                    <Link to="/change-password" onClick={() => setIsSidebarOpen(false)} className="flex items-center p-3 rounded hover:bg-blue-800 transition-colors">
                        <Lock className="w-5 h-5 mr-3 text-brazil-yellow" />
                        Alterar Senha
                    </Link>
                </nav>

                <div className="p-4 border-t border-blue-800">
                    <button
                        onClick={logout}
                        className="flex items-center w-full p-3 rounded hover:bg-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto flex flex-col w-full print:overflow-visible print:h-auto print:block">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center border-b-4 border-brazil-green sticky top-0 z-10 print:hidden">
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="mr-4 md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 truncate">Painel Administrativo</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                            <div className="text-xs text-gray-500">{roleNames[user?.role as keyof typeof roleNames] || user?.role}</div>
                        </div>
                        <div className="w-8 h-8 bg-brazil-green rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="p-4 md:p-6 flex-1 overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
