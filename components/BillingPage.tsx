
import React from 'react';

const BillingPage: React.FC = () => {
    return (
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                <div className="bg-card p-8 rounded-lg shadow-sm text-center">
                    <h3 className="text-xl font-semibold text-gray-800">Financial Overview</h3>
                    <p className="mt-4 text-gray-600">
                        This is where billing information, subscription plans, payment history, and financial reports will be displayed.
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                        (This feature is currently under development.)
                    </p>
                </div>
            </div>
        </main>
    );
};

export default BillingPage;
