import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, Calendar, Trophy } from 'lucide-react';

interface StatsProps {
  stats: {
    totalApplications: number;
    todayApplications: number;
    interviews: number;
    offers: number;
  };
}

const StatsOverview: React.FC<StatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Briefcase,
      description: 'All time applications sent',
    },
    {
      title: "Today's Applications",
      value: stats.todayApplications,
      icon: Calendar,
      description: 'Applications sent today',
    },
    {
      title: 'Interviews',
      value: stats.interviews,
      icon: Users,
      description: 'Interview invitations received',
    },
    {
      title: 'Offers',
      value: stats.offers,
      icon: Trophy,
      description: 'Job offers received',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatsOverview;