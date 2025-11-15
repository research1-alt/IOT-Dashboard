
import React from 'react';
import { UserRole, Member } from '../types';
import { AdminIcon, OemManagerIcon, FinanceManagerIcon, FleetManagerIcon, DealerIcon, CustomerIcon, ArrowLeftIcon } from './Icons';

interface ProfileSelectionPageProps {
    currentUser: Member;
    onProfileSelect: (role: UserRole) => void;
    onLogout: () => void;
}

const allRoles: UserRole[] = [
    'Admin',
    'OEM Manager',
    'Finance Manager',
    'Fleet Manager',
    'Dealer',
    'Customer',
];

const roleHierarchy: Record<UserRole, number> = {
    'Admin': 6,
    'OEM Manager': 5,
    'Finance Manager': 4,
    'Fleet Manager': 3,
    'Dealer': 2,
    'Customer': 1,
};

const roleIcons: Record<UserRole, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    'Admin': AdminIcon,
    'OEM Manager': OemManagerIcon,
    'Finance Manager': FinanceManagerIcon,
    'Fleet Manager': FleetManagerIcon,
    'Dealer': DealerIcon,
    'Customer': CustomerIcon,
};

const RoleCard: React.FC<{ role: UserRole; onClick: () => void }> = ({ role, onClick }) => {
    const Icon = roleIcons[role];
    return (
        <button
            onClick={onClick}
            className="w-full flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:bg-primary-50 hover:shadow-lg hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
            <div className="bg-primary-100 p-4 rounded-full mb-4">
                 <Icon className="w-10 h-10 text-primary-600" />
            </div>
            <p className="font-semibold text-gray-800 text-lg">{role}</p>
        </button>
    );
};


const ProfileSelectionPage: React.FC<ProfileSelectionPageProps> = ({ currentUser, onProfileSelect, onLogout }) => {
    const getAvailableRoles = (): UserRole[] => {
        const userBaseRole = currentUser.role;

        // If user is Admin, they can be anyone
        if (userBaseRole === 'Admin') {
            return allRoles;
        }

        // If user has a generic 'Member' role, default them to the lowest access
        const effectiveRole = userBaseRole === 'Member' ? 'Customer' : userBaseRole;
        const userLevel = roleHierarchy[effectiveRole];
        
        // Filter roles to only include the user's level and below, and never 'Admin'
        return allRoles.filter(role => {
            if (role === 'Admin') return false;
            return roleHierarchy[role] <= userLevel;
        });
    };
    
    const availableRoles = getAvailableRoles();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-4xl p-8 sm:p-12 space-y-8 bg-card rounded-2xl shadow-lg relative max-h-[90vh] overflow-y-auto">
                 <button 
                    onClick={onLogout} 
                    className="absolute top-6 left-6 text-gray-500 hover:text-primary-600 transition-colors"
                    aria-label="Go back to login"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome, {currentUser.name}!</h1>
                    <p className="mt-2 text-gray-600">Please select your role for this session to continue.</p>
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                     {availableRoles.map(role => (
                        <RoleCard
                            key={role}
                            role={role}
                            onClick={() => onProfileSelect(role)}
                        />
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button onClick={onLogout} className="text-sm text-gray-500 hover:text-primary-600 hover:underline">
                        Not you? Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSelectionPage;