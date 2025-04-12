
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, UserCheck, BarChart2, Activity } from "lucide-react";
import { Friend } from "@/types/user";
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface FriendsListProps {
  friends: Friend[];
  onViewStats: (friendId: string) => void;
}

const FriendsList = ({ friends, onViewStats }: FriendsListProps) => {
  if (!friends.length) {
    return (
      <div className="bg-card p-6 rounded-lg text-center shadow-sm">
        <UserPlus className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium mb-1">Keine Freunde gefunden</h3>
        <p className="text-muted-foreground text-sm">
          Suche nach Benutzern und sende Freundschaftsanfragen, um deine Freundesliste zu erweitern.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="all">Alle Freunde</TabsTrigger>
        <TabsTrigger value="active">Kürzlich Aktiv</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="space-y-3">
        {friends.map(friend => (
          <Card key={friend.id} className="overflow-hidden hover:shadow transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{friend.username}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    <span>{friend.rank || friend.stats?.rank || 'Beginner'}</span>
                    {friend.since && (
                      <span className="ml-2">· Freunde seit {new Date(friend.since).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}</span>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="gap-1"
                onClick={() => onViewStats(friend.id)}
              >
                <BarChart2 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistiken</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </TabsContent>
      
      <TabsContent value="active" className="space-y-3">
        {friends
          .filter(friend => {
            const lastActive = friend.lastActive || friend.stats?.lastActive;
            return lastActive && (new Date().getTime() - new Date(lastActive).getTime()) < 7 * 24 * 60 * 60 * 1000;
          })
          .map(friend => {
            const lastActive = friend.lastActive || friend.stats?.lastActive;
            return (
              <Card key={friend.id} className="overflow-hidden hover:shadow transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="relative">
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-1 ring-white"></div>
                      <AvatarFallback>{friend.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{friend.username}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>Zuletzt aktiv:</span> 
                        <span className="font-medium">
                          {lastActive ? formatDistanceToNow(new Date(lastActive), { addSuffix: true, locale: de }) : 'Unbekannt'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-1"
                    onClick={() => onViewStats(friend.id)}
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Statistiken</span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
      </TabsContent>
    </Tabs>
  );
};

export default FriendsList;
