
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus } from 'lucide-react';

const Friends = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Freunde</h1>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Freund hinzufügen
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Freundesliste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Noch keine Freunde hinzugefügt
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Friends;
