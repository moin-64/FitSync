
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from 'lucide-react';

interface ProfileHeaderProps {
  onSave: () => void;
}

const ProfileHeader = ({ onSave }: ProfileHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="glass border-b border-border/30 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Profile
          </h1>
        </div>
        
        <Button onClick={onSave} size="sm" className="gap-1">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </header>
  );
};

export default ProfileHeader;
