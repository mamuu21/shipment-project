import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const revenueData = [
  { name: 'Jan', air: 400, sea: 240 },
  { name: 'Feb', air: 300, sea: 221 },
  { name: 'Mar', air: 200, sea: 229 },
  { name: 'Apr', air: 278, sea: 200 },
  { name: 'May', air: 400, sea: 218 },
  { name: 'June', air: 350, sea: 250 },
];

const airVehicleData = [
  { name: 'Tanzan - Air Cargo', value: 1300, color: '#7F56D9' },
  { name: 'KLM Cargo', value: 920, color: '#F79009' },
  { name: 'Turkish Airlines', value: 315, color: '#10B981' },
  { name: 'China Air', value: 610, color: '#D0D5DD' },
];

const marineVehicleData = [
  { name: 'Azam Marine I', value: 1300, color: '#7F56D9' },
  { name: 'Azam Marine II', value: 920, color: '#F79009' },
  { name: 'Azam Marine III', value: 315, color: '#10B981' },
  { name: 'Azam Marine IV', value: 610, color: '#D0D5DD' },
];

const DashboardCharts = () => {
  const [activeTab, setActiveTab] = useState("air");
  const chartData = activeTab === "air" ? airVehicleData : marineVehicleData;

  return (
    <div className="row mb-4">
      {/* Revenue Trend */}
      <div className="col-lg-6 mb-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Revenue Trend</h5>
            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="air" stackId="a" fill="#7F56D9" name="Air" />
                  <Bar dataKey="sea" stackId="a" fill="#3B82F6" name="Sea" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 small text-muted">
              <div><span className="text-success fw-semibold">+5%</span> increase in kilograms and CBM with total 2700 shipped.</div>
              <div>Increase in kilograms and CBM with total 2700 shipped.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Breakdown */}
      <div className="col-lg-6 mb-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">
                {activeTab === "air" ? "Air" : "Marine"} Vehicle Breakdown
              </h5>
              <div>
                <button
                  className={`btn btn-sm me-2 ${activeTab === "air" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("air")}
                >
                  Air
                </button>
                <button
                  className={`btn btn-sm ${activeTab === "marine" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("marine")}
                >
                  Marine
                </button>
              </div>
            </div>

            <div style={{ height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-center text-muted small">based on parcels/month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
