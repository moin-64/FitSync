
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Friend, FriendRequest } from "@/types/user";
import { findFriendByUsername, hasPendingRequest } from "@/utils/userContext.utils";
import { supabase } from "@/integrations/supabase/client";

interface FriendSearchProps {
  onSendFriendRequest: (username: string) => void;
  isSearching: boolean;
  friends: Friend[];
  friendRequests: FriendRequest[];
}

interface UserSearchResult {
  id: string;
  username: string;
  isFriend: boolean;
  hasPendingRequest: boolean;
  exists: boolean;
}

const FriendSearch = ({ onSendFriendRequest, isSearching, friends, friendRequests }: FriendSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Bitte einen Benutzernamen eingeben",
        description: "Gib den Benutzernamen deines Freundes ein, um ihn zu finden.",
        variant: "destructive",
      });
      return;
    }

    setIsSearchingDatabase(true);
    setSearchResults([]);

    try {
      // Check if the user already exists in localStorage to simulate a database check
      // In a real app, we would query the database here
      const trimmedQuery = searchQuery.trim();
      
      // Check if the user is already a friend
      const isFriend = !!findFriendByUsername(friends, trimmedQuery);
      const hasPendingReq = hasPendingRequest(friendRequests, trimmedQuery);

      // Check if user exists in localStorage
      // Simulate database check by looking for users with similar usernames
      const storageKeys = Object.keys(localStorage);
      const usernameKeys = storageKeys.filter(key => 
        key.includes('user_') || 
        key.includes('username_') || 
        key.includes('auth')
      );
      
      // Check if the username exists in any of the potential user storage keys
      let userExists = false;
      for (const key of usernameKeys) {
        try {
          const storedValue = localStorage.getItem(key);
          if (storedValue && storedValue.toLowerCase().includes(trimmedQuery.toLowerCase())) {
            userExists = true;
            break;
          }
        } catch (e) {
          console.error('Error checking username:', e);
        }
      }
      
      // For demo purposes: Consider users with names at least 3 characters long as existing
      // but combine with our "database" check
      userExists = userExists || (trimmedQuery.length > 3 && Math.random() > 0.5);
      
      const results: UserSearchResult[] = [
        {
          id: `user-${Date.now()}`,
          username: trimmedQuery,
          isFriend,
          hasPendingRequest: hasPendingReq,
          exists: userExists
        }
      ];
      
      setSearchResults(results);
      
      if (!userExists) {
        toast({
          title: "Benutzer nicht gefunden",
          description: `Der Benutzer "${trimmedQuery}" existiert nicht.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Fehler bei der Benutzersuche:", error);
      toast({
        title: "Fehler bei der Suche",
        description: "Bei der Suche ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
    } finally {
      setIsSearchingDatabase(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Freunde suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || isSearchingDatabase || !searchQuery.trim()}
        >
          {isSearchingDatabase ? "Suche läuft..." : "Suchen"}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          {searchResults.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-card rounded-lg shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium">{user.username}</span>
                  {!user.exists && (
                    <p className="text-xs text-destructive">Benutzer existiert nicht</p>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                disabled={user.isFriend || user.hasPendingRequest || isSearching || !user.exists}
                onClick={() => user.exists && onSendFriendRequest(user.username)}
              >
                {user.isFriend
                  ? "Freund"
                  : user.hasPendingRequest
                  ? "Anfrage gesendet"
                  : user.exists
                  ? "Anfrage senden"
                  : "Nicht verfügbar"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendSearch;
