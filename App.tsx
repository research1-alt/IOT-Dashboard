
import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ProfileSelectionPage from './components/ProfileSelectionPage';
import SignupPage from './components/SignupPage';
import { Member, UserRole, Device } from './types';
import { mockMembers } from './data/mock-members';
import { mockDevices } from './data/mock-devices';


const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<Member | null>(null);
    const [profileSelected, setProfileSelected] = useState<boolean>(false);
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');

    // --- Centralized State Management ---
    const [devices, setDevices] = useState<Device[]>(() => {
        const saved = localStorage.getItem('fleetDevices');
        return saved ? JSON.parse(saved) : mockDevices;
    });

    const [members, setMembers] = useState<Member[]>(() => {
        const saved = localStorage.getItem('fleetMembers');
        return saved ? JSON.parse(saved) : mockMembers;
    });

    // --- Data Persistence Effects ---
    useEffect(() => {
        localStorage.setItem('fleetDevices', JSON.stringify(devices));
    }, [devices]);

    useEffect(() => {
        localStorage.setItem('fleetMembers', JSON.stringify(members));
    }, [members]);

    // --- Session & Navigation Handlers ---
    const handleLoginSuccess = (user: Member) => {
        setCurrentUser(user);
        setProfileSelected(false);
        setAuthView('login'); // Reset view on successful login
    };
    
    const handleSignup = (name: string, email: string, password: string): Member => {
        const newMember: Member = {
            id: `user-${Date.now()}`,
            name,
            email,
            password,
            role: 'Customer', // New users default to the 'Customer' role.
            assignedDevices: []
        };
        setMembers(prev => [...prev, newMember]);
        return newMember;
    };


    const handleProfileSelect = (role: UserRole) => {
        if (currentUser) {
            const freshUserData = members.find(m => m.id === currentUser.id);
            if (freshUserData) {
                const updatedUser = { ...freshUserData, role };
                setCurrentUser(updatedUser);
                setProfileSelected(true);
            } else {
                console.error("Critical Error: Logged-in user not found in the master list. Forcing logout.");
                handleLogout();
            }
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setProfileSelected(false);
        setAuthView('login');
    };
    
    const handleChangeProfile = () => {
        setProfileSelected(false);
    };
    
    // --- Data Management Handlers (Moved from Dashboard) ---
    const handleAddDevice = (deviceId: string) => {
        if (deviceId && !devices.find(d => d.id === deviceId)) {
            const newDevice: Device = { id: deviceId, status: 'Offline', location: 'N/A' };
            setDevices(prev => [...prev, newDevice]);
        }
    };
    
    const handleAddMultipleDevices = (deviceIds: string[]): { added: number, duplicates: number } => {
        const existingDeviceIds = new Set(devices.map(d => d.id));
        const newDeviceIds = deviceIds.filter(id => id && !existingDeviceIds.has(id));

        if (newDeviceIds.length === 0) {
            return { added: 0, duplicates: deviceIds.length };
        }
        
        const newDevices: Device[] = newDeviceIds.map(id => ({
            id,
            status: 'Offline',
            location: 'N/A'
        }));

        setDevices(prev => [...prev, ...newDevices]);

        return {
            added: newDeviceIds.length,
            duplicates: deviceIds.length - newDeviceIds.length
        };
    };

    const handleRemoveDevice = (deviceId: string) => {
        setDevices(prev => prev.filter(d => d.id !== deviceId));
        const updatedMembers = members.map(member => ({
            ...member,
            assignedDevices: member.assignedDevices.filter(id => id !== deviceId)
        }));
        setMembers(updatedMembers);

        if (currentUser && currentUser.assignedDevices.includes(deviceId)) {
            setCurrentUser({
                ...currentUser,
                assignedDevices: currentUser.assignedDevices.filter(id => id !== deviceId)
            });
        }
    };

    const handleResetAllDevices = () => {
        setDevices(mockDevices);
        setMembers(prev => prev.map(m => ({ ...m, assignedDevices: [] })));
        if (currentUser) {
            setCurrentUser({ ...currentUser, assignedDevices: [] });
        }
    };

    const handleAddMember = (name: string, email: string, role: UserRole) => {
        const newMember: Member = {
            id: `user-${Date.now()}`,
            name,
            email,
            password: 'password123',
            role,
            assignedDevices: []
        };
        setMembers(prev => [...prev, newMember]);
    };

    const handleRemoveMember = (memberId: string) => {
        setMembers(prev => prev.filter(m => m.id !== memberId));
    };

    const handleUpdateMemberRole = (memberId: string, role: UserRole) => {
        const updatedMembers = members.map(m => m.id === memberId ? { ...m, role } : m);
        setMembers(updatedMembers);

        if (currentUser && currentUser.id === memberId) {
           setCurrentUser(prevUser => prevUser ? { ...prevUser, role } : null);
        }
    };
    
    const handleUpdateMemberAssignments = (memberId: string, assignedDevices: string[]) => {
        const updatedMembers = members.map(m => m.id === memberId ? { ...m, assignedDevices } : m);
        setMembers(updatedMembers);
        
        if (currentUser && currentUser.id === memberId) {
            setCurrentUser(prevUser => prevUser ? { ...prevUser, assignedDevices } : null);
        }
    };

    // --- Render Logic ---
    if (!currentUser) {
        if (authView === 'login') {
            return <LoginPage members={members} onLoginSuccess={handleLoginSuccess} onNavigateToSignup={() => setAuthView('signup')} />;
        } else {
            return <SignupPage members={members} onSignup={handleSignup} onSignupSuccess={handleLoginSuccess} onNavigateToLogin={() => setAuthView('login')} />;
        }
    }
    
    if (!profileSelected) {
        return <ProfileSelectionPage currentUser={currentUser} onProfileSelect={handleProfileSelect} onLogout={handleLogout} />;
    }

    return (
        <Dashboard 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            onChangeProfile={handleChangeProfile} 
            devices={devices}
            members={members}
            onAddDevice={handleAddDevice}
            onAddMultipleDevices={handleAddMultipleDevices}
            onRemoveDevice={handleRemoveDevice}
            onResetAllDevices={handleResetAllDevices}
            onAddMember={handleAddMember}
            onRemoveMember={handleRemoveMember}
            onUpdateMemberRole={handleUpdateMemberRole}
            onUpdateMemberAssignments={handleUpdateMemberAssignments}
        />
    );
};

export default App;
