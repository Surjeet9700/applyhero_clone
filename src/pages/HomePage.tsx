import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Zap, FileText, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "AI-Powered Applications",
      description: "Let our AI craft perfect cover letters and tailor your resume for each job.",
    },
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Multi-Platform Auto-Apply",
      description: "Automatically apply to jobs on LinkedIn, Indeed, and more with a single click.",
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Smart Resume Management",
      description: "Upload and manage multiple resume versions, optimized for different roles.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Track Your Progress",
      description: "Monitor all your applications, interviews, and offers in one centralized dashboard.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Land Your Dream Job, <span className="text-primary">Faster.</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stop wasting time on tedious applications. AutoApply AI uses cutting-edge artificial intelligence to automate your job search, from finding opportunities to submitting polished applications.
        </p>
        {user ? (
          <Button size="lg" asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        ) : (
          <div className="space-x-4">
            <Button size="lg" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-semibold text-center mb-10">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>1. Create Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Upload your resume, set your job preferences, and tell us about your dream role.</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>2. AI Magic Happens</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Our AI analyzes job postings and crafts personalized application materials for you.</CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>3. Auto-Apply & Track</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>We submit applications on your behalf and you track everything in your dashboard.</CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <section>
        <h2 className="text-3xl font-semibold text-center mb-12">Features You'll Love</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col md:flex-row items-start p-6">
              <div className="mr-0 md:mr-6 mb-4 md:mb-0 bg-primary/10 p-3 rounded-lg">
                {feature.icon}
              </div>
              <div>
                <CardTitle className="mb-2 text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="text-center mt-16 py-12 bg-gradient-to-r from-primary/80 to-primary rounded-lg">
        <h2 className="text-3xl font-semibold text-primary-foreground mb-6">Ready to Supercharge Your Job Hunt?</h2>
        <p className="text-lg text-primary-foreground/90 mb-8 max-w-xl mx-auto">
          Join thousands of job seekers who are finding success with AutoApply AI.
        </p>
        {user ? (
           <Button size="lg" variant="secondary" asChild>
            <Link to="/dashboard">Explore Dashboard</Link>
          </Button>
        ) : (
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">Sign Up Now</Link>
          </Button>
        )}
      </section>
    </div>
  );
};

export default HomePage;