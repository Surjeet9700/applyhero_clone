import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Plus, FileText } from 'lucide-react';

const ResumeManager = () => {
  const [resumes, setResumes] = useState([
    { id: 1, name: 'Software Engineer Resume', lastModified: '2025-05-13' },
    { id: 2, name: 'Product Manager Resume', lastModified: '2025-05-12' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Resumes</h2>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add New Resume
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {resumes.map((resume) => (
          <Card key={resume.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {resume.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Last modified: {resume.lastModified}
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">Download</Button>
                <Button variant="outline" size="sm" className="text-red-600">Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-full py-6">
            <Upload className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">Drop a file here or click to upload</p>
            <Input type="file" className="hidden" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeManager;