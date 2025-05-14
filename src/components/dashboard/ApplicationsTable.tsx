import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Eye, Edit, Trash } from 'lucide-react';

const ApplicationsTable = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await api.job.getAppliedJobs();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-800',
      Interviewing: 'bg-yellow-100 text-yellow-800',
      Rejected: 'bg-red-100 text-red-800',
      Offer: 'bg-green-100 text-green-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.Other;
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{format(new Date(app.applicationDate), 'MMM d, yyyy')}</TableCell>
              <TableCell>{app.company}</TableCell>
              <TableCell>{app.title}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(app.status)}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationsTable;