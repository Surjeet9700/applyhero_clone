import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, JobApplication } from '../services/api'; // Import api and JobApplication type
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns'; // For date formatting
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"; // For modal
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // For status dropdown
import { Trash2, Edit, Eye } from 'lucide-react'; // Icons

const UserDashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for logging a new job manually (optional, primarily for testing/manual entry)
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobCompany, setNewJobCompany] = useState('');
  const [newJobUrl, setNewJobUrl] = useState('');
  const [loggingJob, setLoggingJob] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);
  const [logSuccess, setLogSuccess] = useState(false);

  // State for viewing application details in a modal
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // State for editing application status/notes
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);
  const [editedStatus, setEditedStatus] = useState<JobApplication['status']>('Applied');
  const [editedNotes, setEditedNotes] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // State for deleting application
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingApplication, setDeletingApplication] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);


  // Fetch applied jobs on component mount or when user/auth status changes
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user || authLoading) {
        setLoading(authLoading);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.job.getAppliedJobs();
        setApplications(data);
      } catch (err: any) {
        console.error('Error fetching applied jobs:', err);
        setError(err.message || 'Failed to fetch applied jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [user, authLoading]); // Re-run effect if user or authLoading changes

  // Handle manual job logging (optional feature)
  const handleLogJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobCompany) {
      setLogError('Title and Company are required.');
      return;
    }

    setLoggingJob(true);
    setLogError(null);
    setLogSuccess(false);

    try {
      // Note: This manual log doesn't have AI generation or extension details (success, details, coverLetter, resumeUrl)
      // It's a basic manual entry. The extension will log with more details.
      // We'll set success to true for manual logs for simplicity here.
      const logDetails = {
        title: newJobTitle,
        company: newJobCompany,
        jobUrl: newJobUrl,
        success: true, // Assume manual log is 'successful' in terms of recording
        details: 'Manually logged',
        // coverLetterContent and resumeUrlUsed would be missing here
      };
      // The backend logJobApplication expects these fields, so we'll pass them even if empty
      const response = await api.job.logJobApplication(logDetails as any); // Cast as any to match backend expected type

      setLogSuccess(true);
      setNewJobTitle('');
      setNewJobCompany('');
      setNewJobUrl('');

      // Refresh the list of applications
      const updatedApplications = await api.job.getAppliedJobs();
      setApplications(updatedApplications);

    } catch (err: any) {
      console.error('Error logging job:', err);
      setLogError(err.message || 'Failed to log job.');
    } finally {
      setLoggingJob(false);
    }
  };

  // Handle opening the details modal
  const handleViewDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setIsDetailsModalOpen(true);
  };

  // Handle opening the edit modal
  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application);
    setEditedStatus(application.status);
    setEditedNotes(application.notes || '');
    setIsEditingModalOpen(true);
    setEditError(null); // Clear previous errors
  };

  // Handle saving edits
  const handleSaveEdit = async () => {
    if (!editingApplication) return;

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const updatedApp = await api.job.updateJobApplication(editingApplication._id, {
        status: editedStatus,
        notes: editedNotes,
      });

      // Update the applications list with the saved changes
      setApplications(applications.map(app =>
        app._id === updatedApp.application._id ? updatedApp.application : app
      ));

      setIsEditingModalOpen(false);
      setEditingApplication(null); // Clear editing state
      // Optionally show a success toast/message
    } catch (err: any) {
      console.error('Error saving edit:', err);
      setEditError(err.message || 'Failed to save changes.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle opening the delete confirmation modal
  const handleDelete = (application: JobApplication) => {
    setDeletingApplication(application);
    setIsDeleteModalOpen(true);
    setDeleteError(null); // Clear previous errors
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!deletingApplication) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.job.deleteJobApplication(deletingApplication._id);

      // Remove the deleted application from the list
      setApplications(applications.filter(app => app._id !== deletingApplication._id));

      setIsDeleteModalOpen(false);
      setDeletingApplication(null); // Clear deleting state
      // Optionally show a success toast/message
    } catch (err: any) {
      console.error('Error deleting application:', err);
      setDeleteError(err.message || 'Failed to delete application.');
    } finally {
      setIsDeleting(false);
    }
  };


  if (authLoading || loading) {
    return <div className="container mx-auto py-8 text-center">Loading applications...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="container mx-auto py-8 text-center">Please log in to view your dashboard.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Applied Jobs</h1>

      {/* Optional: Manual Job Logging Form */}
      {/* <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Manually Log a Job</h2>
        <form onSubmit={handleLogJob} className="grid gap-4">
          <div>
            <Label htmlFor="newJobTitle">Job Title</Label>
            <Input
              id="newJobTitle"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              disabled={loggingJob}
            />
          </div>
          <div>
            <Label htmlFor="newJobCompany">Company</Label>
            <Input
              id="newJobCompany"
              value={newJobCompany}
              onChange={(e) => setNewJobCompany(e.target.value)}
              disabled={loggingJob}
            />
          </div>
           <div>
            <Label htmlFor="newJobUrl">Job URL (Optional)</Label>
            <Input
              id="newJobUrl"
              value={newJobUrl}
              onChange={(e) => setNewJobUrl(e.target.value)}
              disabled={loggingJob}
            />
          </div>
          {logError && <p className="text-red-500">{logError}</p>}
          {logSuccess && <p className="text-green-500">Job logged successfully!</p>}
          <Button type="submit" disabled={loggingJob}>
            {loggingJob ? 'Logging...' : 'Log Job'}
          </Button>
        </form>
      </div> */}

      {applications.length === 0 ? (
        <div className="text-center text-gray-600">No applications logged yet. Use the browser extension to start applying!</div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Auto-Apply Success</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell>{format(new Date(app.applicationDate), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{app.title}</TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.status}</TableCell>
                  <TableCell>{app.success ? 'Yes' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                       <Button variant="outline" size="sm" onClick={() => handleViewDetails(app)} title="View Details">
                         <Eye className="h-4 w-4" />
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => handleEdit(app)} title="Edit Status/Notes">
                         <Edit className="h-4 w-4" />
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => handleDelete(app)} title="Delete Application">
                         <Trash2 className="h-4 w-4 text-red-500" />
                       </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Application Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Details for the application to {selectedApplication?.company} - {selectedApplication?.title}.
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="grid gap-4 py-4 text-sm">
              <div>
                <strong>Date:</strong> {format(new Date(selectedApplication.applicationDate), 'yyyy-MM-dd HH:mm')}
              </div>
              <div>
                <strong>Job Title:</strong> {selectedApplication.title}
              </div>
              <div>
                <strong>Company:</strong> {selectedApplication.company}
              </div>
              <div>
                <strong>Status:</strong> {selectedApplication.status}
              </div>
              <div>
                <strong>Auto-Apply Success:</strong> {selectedApplication.success ? 'Yes' : 'No'}
              </div>
              {selectedApplication.details && (
                 <div>
                   <strong>Details:</strong> {selectedApplication.details}
                 </div>
              )}
              {selectedApplication.jobUrl && (
                <div>
                  <strong>Job URL:</strong> <a href={selectedApplication.jobUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplication.jobUrl}</a>
                </div>
              )}
               {selectedApplication.resumeUrlUsed && (
                <div>
                  <strong>Resume Used:</strong> <a href={selectedApplication.resumeUrlUsed} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{selectedApplication.resumeUrlUsed}</a>
                </div>
              )}
              {selectedApplication.coverLetterContent && (
                <div>
                  <strong>Generated Cover Letter:</strong>
                  <div className="mt-2 p-4 bg-gray-100 rounded-md whitespace-pre-wrap text-xs">
                    {selectedApplication.coverLetterContent}
                  </div>
                </div>
              )}
               {selectedApplication.notes && (
                <div>
                  <strong>Your Notes:</strong>
                  <div className="mt-2 p-4 bg-gray-100 rounded-md whitespace-pre-wrap text-xs">
                    {selectedApplication.notes}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Edit Modal */}
       <Dialog open={isEditingModalOpen} onOpenChange={setIsEditingModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>
              Edit status and notes for this application.
            </DialogDescription>
          </DialogHeader>
          {editingApplication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editStatus" className="text-right">
                  Status
                </Label>
                 <Select value={editedStatus} onValueChange={(value: JobApplication['status']) => setEditedStatus(value)} disabled={isSavingEdit}>
                   <SelectTrigger id="editStatus" className="col-span-3">
                     <SelectValue placeholder="Select status" />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Applied">Applied</SelectItem>
                     <SelectItem value="Interviewing">Interviewing</SelectItem>
                     <SelectItem value="Rejected">Rejected</SelectItem>
                     <SelectItem value="Offer">Offer</SelectItem>
                     <SelectItem value="Other">Other</SelectItem>
                   </SelectContent>
                 </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="editNotes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="editNotes"
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="col-span-3"
                  disabled={isSavingEdit}
                />
              </div>
               {editError && <p className="text-red-500 col-span-4 text-center">{editError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingModalOpen(false)} disabled={isSavingEdit}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Application Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the application for "{deletingApplication?.title}" at "{deletingApplication?.company}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
           {deleteError && <p className="text-red-500 text-center">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default UserDashboardPage;
