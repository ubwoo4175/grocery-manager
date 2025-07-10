import React from 'react';

// --- ICONS ---
const ChefHatIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M19.8 11.7a2.4 2.4 0 0 0-1.2-2.1l-6.1-3.3a2.4 2.4 0 0 0-2.9 0L3.4 9.6a2.4 2.4 0 0 0-1.2 2.1v4.8a2.4 2.4 0 0 0 2.4 2.4h13.6a2.4 2.4 0 0 0 2.4-2.4v-4.8Z"></path><path d="M9.6 18.5V6.3"></path><path d="M14.4 18.5V6.3"></path><path d="M12 18.5V6.3"></path><path d="M12 6.3a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"></path>
    </svg>
);


const Navbar: React.FC = () => {
    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 md:px-8 max-w-4xl">
                <div className="flex items-center justify-between h-16">
                    <a href="/" className="flex items-center space-x-3 text-gray-800 hover:text-blue-600 transition-colors">
                        <ChefHatIcon />
                        <span className="text-xl font-bold">Recipe Manager</span>
                    </a>
                    {/* You can add more nav links here in the future */}
                    <div>
                        <a href="/recipes/new" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                            Add Recipe
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
