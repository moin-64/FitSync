
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { Rank } from "../utils/rankingUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { X, UserCircle, Save, ArrowLeft } from "lucide-react";
import { formatDuration } from "../utils/trainingParametersUtils";

const UserProfile = () => {
  const { profile, history, workouts, updateProfile, addLimitation, removeLimitation, loading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [birthdate, setBirthdate] = useState<string | null>(profile.birthdate);
  const [height, setHeight] = useState<number | null>(profile.height);
  const [weight, setWeight] = useState<number | null>(profile.weight);
  const [experienceLevel, setExperienceLevel] = useState<Rank>(profile.rank);
  const [newLimitation, setNewLimitation] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Statistics calculations
  const completedWorkouts = history.length;
  const totalTime = history.reduce((total, workout) => total + workout.duration, 0);
  const averagePerformance = history.length > 0 
    ? Math.round(history.reduce((total, workout) => total + workout.performance, 0) / history.length) 
    : 0;

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      await updateProfile({
        birthdate,
        height,
        weight,
        experienceLevel,
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLimitation = async () => {
    if (!newLimitation.trim()) return;
    
    try {
      await addLimitation(newLimitation.trim());
      setNewLimitation("");
      
      toast({
        title: "Limitation added",
        description: "Your limitation has been added successfully",
      });
    } catch (error) {
      console.error("Failed to add limitation:", error);
      toast({
        title: "Failed to add limitation",
        description: "There was a problem adding your limitation",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLimitation = async (limitation: string) => {
    try {
      await removeLimitation(limitation);
      
      toast({
        title: "Limitation removed",
        description: "Your limitation has been removed successfully",
      });
    } catch (error) {
      console.error("Failed to remove limitation:", error);
      toast({
        title: "Failed to remove limitation",
        description: "There was a problem removing your limitation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-4 bg-background">
      <div className="container max-w-3xl mx-auto space-y-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            className="p-2" 
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-2xl font-bold text-center flex-1 pr-10">My Profile</h1>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-purple-50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-center text-sm font-medium text-muted-foreground">Workouts</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-center text-3xl font-bold">{completedWorkouts}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-center text-sm font-medium text-muted-foreground">Total Time</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-center text-3xl font-bold">{formatDuration(totalTime)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-center text-sm font-medium text-muted-foreground">Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-center text-3xl font-bold">{averagePerformance}%</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Profile Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                View and manage your profile details
              </CardDescription>
            </div>
            
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                Edit Profile
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center border">
                  <UserCircle className="h-24 w-24 text-muted-foreground" />
                </div>
                <Badge className="absolute bottom-1 right-1 bg-primary">
                  {profile.rank}
                </Badge>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Date of Birth</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={birthdate || ""}
                    onChange={(e) => setBirthdate(e.target.value)}
                    disabled={isSaving}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>150 cm</span>
                      <span>200 cm</span>
                    </div>
                    <Slider
                      id="height"
                      min={150}
                      max={200}
                      step={1}
                      value={height ? [height] : [175]}
                      onValueChange={(values) => setHeight(values[0])}
                      disabled={isSaving}
                    />
                    <div className="text-center font-medium">
                      {height || 175} cm
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>40 kg</span>
                      <span>150 kg</span>
                    </div>
                    <Slider
                      id="weight"
                      min={40}
                      max={150}
                      step={1}
                      value={weight ? [weight] : [70]}
                      onValueChange={(values) => setWeight(values[0])}
                      disabled={isSaving}
                    />
                    <div className="text-center font-medium">
                      {weight || 70} kg
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Level</Label>
                  <RadioGroup
                    id="experience"
                    value={experienceLevel}
                    onValueChange={(value: Rank) => setExperienceLevel(value)}
                    className="space-y-3"
                    disabled={isSaving}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="Beginner" id="beginner" />
                      <Label htmlFor="beginner" className="flex-1 cursor-pointer">
                        <div className="font-medium">Beginner</div>
                        <div className="text-sm text-muted-foreground">New to fitness or returning after a long break</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="Intermediate" id="intermediate" />
                      <Label htmlFor="intermediate" className="flex-1 cursor-pointer">
                        <div className="font-medium">Intermediate</div>
                        <div className="text-sm text-muted-foreground">Regular workouts for several months</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="Advanced" id="advanced" />
                      <Label htmlFor="advanced" className="flex-1 cursor-pointer">
                        <div className="font-medium">Advanced</div>
                        <div className="text-sm text-muted-foreground">Consistent training for years with good form</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="Expert" id="expert" />
                      <Label htmlFor="expert" className="flex-1 cursor-pointer">
                        <div className="font-medium">Expert</div>
                        <div className="text-sm text-muted-foreground">Dedicated athlete with specialized training</div>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 rounded-lg border hover:border-primary cursor-pointer">
                      <RadioGroupItem value="Master" id="master" />
                      <Label htmlFor="master" className="flex-1 cursor-pointer">
                        <div className="font-medium">Master</div>
                        <div className="text-sm text-muted-foreground">Elite level with years of advanced training</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                    <p className="font-medium">{birthdate || "Not set"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Height</h3>
                    <p className="font-medium">{height ? `${height} cm` : "Not set"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Weight</h3>
                    <p className="font-medium">{weight ? `${weight} kg` : "Not set"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Experience Level</h3>
                    <p className="font-medium">{experienceLevel}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          
          {isEditing && (
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {/* Limitations Card */}
        <Card>
          <CardHeader>
            <CardTitle>Limitations & Health Concerns</CardTitle>
            <CardDescription>
              Add any physical limitations or health concerns that might affect your workouts
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input 
                placeholder="Add limitation (e.g. back pain, knee injury)"
                value={newLimitation}
                onChange={(e) => setNewLimitation(e.target.value)}
                disabled={loading}
              />
              <Button 
                onClick={handleAddLimitation}
                disabled={!newLimitation.trim() || loading}
              >
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.limitations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No limitations added yet</p>
              ) : (
                profile.limitations.map((limitation, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="flex items-center gap-1 py-1.5"
                  >
                    {limitation}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 rounded-full p-0 ml-1"
                      onClick={() => handleRemoveLimitation(limitation)}
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </Badge>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
