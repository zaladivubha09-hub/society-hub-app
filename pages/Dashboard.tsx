import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { db } from '../firebase';
import {
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import { ComplaintStatus, Notification } from '../types';

interface Maintenance {
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  paidAt?: any;
}

const Dashboard: React.FC = () => {
  const [residentsCount, setResidentsCount] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /* ------------------ FETCH RESIDENT COUNT ------------------ */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'residents'), snap => {
      setResidentsCount(snap.size);
    });
    return unsub;
  }, []);

  /* ------------------ FETCH PENDING COMPLAINTS ------------------ */
  useEffect(() => {
    const q = query(
      collection(db, 'complaints'),
      where('status', '==', ComplaintStatus.Pending)
    );

    const unsub = onSnapshot(q, snap => {
      setPendingComplaints(snap.size);
    });

    return unsub;
  }, []);

  /* ------------------ FETCH MAINTENANCE ------------------ */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'maintenance'), snap => {
      const data: Maintenance[] = snap.docs.map(doc => doc.data() as Maintenance);
      setMaintenance(data);
    });
    return unsub;
  }, []);

  /* ------------------ FETCH NOTIFICATIONS ------------------ */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'notifications'), snap => {
      const data = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((n: any) => new Date(n.date) > new Date())
        .slice(0, 3);

      setNotifications(data as Notification[]);
    });
    return unsub;
  }, []);

  /* ------------------ CALCULATIONS ------------------ */
  const maintenanceDue = useMemo(() => {
    return maintenance
      .filter(m => m.status !== 'Paid')
      .reduce((acc, m) => acc + m.amount, 0);
  }, [maintenance]);

  const chartData = useMemo(() => {
    const monthly: any = {};

    maintenance.forEach(m => {
      if (!m.paidAt) return;
      const month = new Date(m.paidAt.seconds * 1000).toLocaleString('en-IN', { month: 'short' });

      if (!monthly[month]) {
        monthly[month] = { name: month, Collected: 0, Due: 0 };
      }

      if (m.status === 'Paid') monthly[month].Collected += m.amount;
      else monthly[month].Due += m.amount;
    });

    return Object.values(monthly);
  }, [maintenance]);

  return (
    <div>
      <PageHeader title="Dashboard" />

      {/* ------------------ STATS ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-medium text-text-secondary">Total Residents</h3>
          <p className="mt-2 text-3xl font-bold text-text-primary">
            {residentsCount}
          </p>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-text-secondary">Pending Complaints</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-400">
            {pendingComplaints}
          </p>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-text-secondary">Total Maintenance Due</h3>
          <p className="mt-2 text-3xl font-bold text-red-500">
            ₹{maintenanceDue.toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* ------------------ CHART + EVENTS ------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-semibold mb-4 text-text-primary">
            Monthly Maintenance Collection
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: '#d1d5db' }} />
                <YAxis tick={{ fill: '#d1d5db' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                <Legend wrapperStyle={{ color: '#d1d5db' }} />
                <Bar dataKey="Collected" />
                <Bar dataKey="Due" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Events */}
        <Card>
          <h3 className="text-xl font-semibold mb-4 text-text-primary">
            Upcoming Events & Notices
          </h3>
          <div className="space-y-4">
            {notifications.map(event => (
              <div key={event.id} className="p-3 bg-background rounded-lg">
                <p className="font-semibold text-primary">{event.title}</p>
                <p className="text-sm text-text-secondary">{event.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(event.date).toLocaleDateString()}
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-text-secondary">No upcoming events.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
