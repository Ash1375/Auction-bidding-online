import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * Reusable chart component for displaying analytics data
 * Supports line and bar chart types
 */
const ChartComponent = ({ data, type = 'line', dataKey, xKey = 'date', title, color = '#8884d8' }) => {
  const Chart = type === 'bar' ? BarChart : LineChart;
  const DataComponent = type === 'bar' ? Bar : Line;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <Chart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <DataComponent
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            strokeWidth={2}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartComponent;
