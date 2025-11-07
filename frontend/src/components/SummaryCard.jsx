import React from 'react';

/**
 * Reusable summary card component for displaying key metrics
 */
const SummaryCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    red: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        {icon && (
          <div className="text-4xl opacity-75">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
