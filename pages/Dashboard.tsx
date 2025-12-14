import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { ComplaintStatus } from '../types';
import { mockResidents, mockComplaints, mockMaintenance, mockNotifications } from '../mockData';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState({
    residents: 0,
    pendingComplaints: 0,
    maintenanceDue: 0,
    totalMaintenanceCollected: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);

  useEffect(() => {
    // Calculate stats from mock data
    const residentsCount = mockResidents.length;
    const pendingComplaintsCount = mockComplaints.filter(c => c.status === ComplaintStatus.Pending).length;
    
    let due = 0;
    let collected = 0;
    mockMaintenance.forEach(m => {
      if (m.status === 'Paid') {
        collected += m.amount;
      } else {
        due += m.amount;
      }
    });

    const events = mockNotifications
        .filter(n => new Date(n.date) > new Date()) // Future events
        .slice(0, 3);

    setStats({
        residents: residentsCount,
        pendingComplaints: pendingComplaintsCount,
        maintenanceDue: due,
        totalMaintenanceCollected: collected
    });
    setUpcomingEvents(events);
  }, []);

  const chartData = [
    { name: 'Jan', Collected: 280000, Due: 100000 },
    { name: 'Feb', Collected: 290000, Due: 10000 },
    { name: 'Mar', Collected: 300000, Due: 0 },
    { name: 'Apr', Collected: 285000, Due: 15000 },
    { name: 'May', Collected: 295000, Due: 5000 },
    { name: 'Jun', Collected: 280000, Due: 20000 },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-medium text-text-secondary">Total Residents</h3>
          <p className="mt-2 text-3xl font-bold text-text-primary">{stats.residents}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-text-secondary">Pending Complaints</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.pendingComplaints}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-text-secondary">Total Maintenance Due</h3>
          <p className="mt-2 text-3xl font-bold text-red-500">₹{stats.maintenanceDue.toLocaleString('en-IN')}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Maintenance Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">Monthly Maintenance Collection (Trend)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} />
                <YAxis tick={{ fill: '#d1d5db' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend wrapperStyle={{ color: '#d1d5db' }}/>
                <Bar dataKey="Collected" fill="#4f46e5" />
                <Bar dataKey="Due" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">Upcoming Events & Notices</h3>
          <div className="space-y-4">
             {upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-background rounded-lg">
                    <p className="font-semibold text-primary">{event.title}</p>
                    <p className="text-sm text-text-secondary">{event.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(event.date).toLocaleDateString()}</p>
                </div>
             ))}
             {upcomingEvents.length === 0 && <p className="text-text-secondary">No upcoming events found.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;