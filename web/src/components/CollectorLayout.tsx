import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut, PieChart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CollectorLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-brazil-blue text-white shadow-md">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <PieChart className="w-8 h-8 text-brazil-yellow" />
                        <div>
                            <h1 className="text-xl font-bold leading-tight">DataCount</h1>
                            <p className="text-xs text-blue-200">Coletor</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <div className="text-sm font-medium">{user?.name}</div>
                            <div className="text-xs text-blue-200">Coletor</div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-blue-800 rounded-full transition-colors"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default CollectorLayout;
