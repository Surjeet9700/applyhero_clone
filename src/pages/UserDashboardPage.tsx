import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Briefcase, BarChart as ChartBar, Settings, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';

// Import components
import ApplicationsTable from '@/components/dashboard/ApplicationsTable';
import StatsOverview from '@/components/dashboard/StatsOverview';
import ResumeManager from '@/components/dashboard/ResumeManager';
import SettingsPanel from '@/components/dashboard/SettingsPanel';

const UserDashboardPage = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalApplications: 0,
    todayApplications: 0,
    interviews: 0,
    offers: 0,
  });

  useEffect(() => {
    if (!user || loading) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch stats
        const statsData = await api.job.getStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
        <Button onClick={() => navigate('/login')}>Log In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={() => setActiveTab('settings')}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-4 gap-4 bg-muted p-1 rounded-lg">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <ChartBar className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="resumes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Resumes
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StatsOverview stats={stats} />
        </TabsContent>

        <TabsContent value="applications">
          <ApplicationsTable />
        </TabsContent>

        <TabsContent value="resumes">
          <ResumeManager />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboardPage;