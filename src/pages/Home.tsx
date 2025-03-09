import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle } from 'lucide-react';

const Home = () => {
  const { profile, workouts, history } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="container max-w-3xl mx-auto space-y-6">
        {/* Header with profile link */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Home</h1>
          <Button variant="ghost" onClick={() => navigate('/profile')}>
            <UserCircle className="h-6 w-6" />
            <span className="sr-only">Profile</span>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome, {profile.birthdate}!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Workouts: {workouts.length}</p>
            <p>History: {history.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
