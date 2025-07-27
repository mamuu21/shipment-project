import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../utils/api';

const DashboardCharts = () => {
  const [activeTab, setActiveTab] = useState("air");
  const [chartData, setChartData] = useState({
    revenueData: [],
    airVehicleData: [],
    marineVehicleData: []
  });

  const COLORS = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949'];

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await api.get('/chart-data/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChartData(res.data);
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
      }
    };

    fetchChartData();
    const interval = setInterval(fetchChartData, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, []);

  const vehicleData = activeTab === "air" ? chartData.airVehicleData : chartData.marineVehicleData;

  return (
    <div className="row mb-4">
      {/* Revenue Trend */}
      <div className="col-lg-6 mb-3">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Revenue Trend</h5>
            <div style={{ height: '250px' }}>
              {chartData.revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="air" stackId="a" fill="#7F56D9" name="Air" />
                    <Bar dataKey="sea" stackId="a" fill="#3B82F6" name="Sea" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted text-center mt-5">No revenue data available.</div>
              )}
            </div>
            <div className="mt-3 small text-muted">
              <div><span className="text-success fw-semibold">+5%</span> increase in kilograms and CBM with total 2700 shipped.</div>
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
              {vehicleData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {vehicleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted text-center mt-5">No vehicle data available.</div>
              )}
            </div>

            <div className="mt-2 text-center text-muted small">based on parcels/month</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
