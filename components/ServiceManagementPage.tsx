
import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';

interface Ticket {
    id: string;
    ticketId: string;
    vin: string;
    dealerName: string;
    location: string;
    raisedBy: string;
    raisedAt: string;
    status: 'Open' | 'Closed';
}

const ServiceManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'Open' | 'Closed'>('Open');
    const [searchTerm, setSearchTerm] = useState('');

    const tickets: Ticket[] = [
        // Mock data
        { id: '1', ticketId: 'TKT-001', vin: 'OSM-VIN-001', dealerName: 'OSM Delhi', location: 'Delhi', raisedBy: 'Admin', raisedAt: '2026-04-01 10:00', status: 'Open' },
        { id: '2', ticketId: 'TKT-002', vin: 'OSM-VIN-002', dealerName: 'OSM Mumbai', location: 'Mumbai', raisedBy: 'User1', raisedAt: '2026-04-02 11:30', status: 'Open' },
        { id: '3', ticketId: 'TKT-003', vin: 'OSM-VIN-003', dealerName: 'OSM Bangalore', location: 'Bangalore', raisedBy: 'Admin', raisedAt: '2026-04-03 09:15', status: 'Closed' },
    ];

    const filteredTickets = tickets.filter(t => 
        t.status === activeTab && 
        (t.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) || 
         t.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
         t.dealerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex-1 flex flex-col p-10 space-y-8 bg-slate-50/50 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Service Management</h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage and track your vehicle service tickets</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
                    <Plus className="w-5 h-5 mr-2" />
                    Raise Ticket
                </button>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        <button 
                            onClick={() => setActiveTab('Open')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'Open' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Open
                        </button>
                        <button 
                            onClick={() => setActiveTab('Closed')}
                            className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'Closed' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            Closed
                        </button>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative group">
                            <input 
                                type="text" 
                                placeholder="Search tickets..." 
                                className="bg-slate-50 border border-slate-100 rounded-2xl py-2.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-80 text-sm text-slate-700 placeholder:text-slate-400 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Search className="w-5 h-5" />
                            </div>
                        </div>
                        <button className="p-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 transition-all">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Sr. No.</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Ticket ID</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">VIN</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Dealer Name</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Location</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Raised By</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Raised At</th>
                                <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.length > 0 ? (
                                filteredTickets.map((ticket, index) => (
                                    <tr key={ticket.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="py-5 px-4 text-sm font-medium text-slate-500">{index + 1}</td>
                                        <td className="py-5 px-4 text-sm font-bold text-slate-900">{ticket.ticketId}</td>
                                        <td className="py-5 px-4 text-sm font-medium text-slate-600">{ticket.vin}</td>
                                        <td className="py-5 px-4 text-sm font-medium text-slate-600">{ticket.dealerName}</td>
                                        <td className="py-5 px-4 text-sm font-medium text-slate-600">{ticket.location}</td>
                                        <td className="py-5 px-4 text-sm font-medium text-slate-600">{ticket.raisedBy}</td>
                                        <td className="py-5 px-4 text-sm font-medium text-slate-600">{ticket.raisedAt}</td>
                                        <td className="py-5 px-4">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${ticket.status === 'Open' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6">
                                                <Search className="w-10 h-10 text-slate-200" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">No tickets found</p>
                                            <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Showing {filteredTickets.length} of {tickets.length} entries</p>
                    <div className="flex items-center space-x-2">
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20">1</button>
                        <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagementPage;
