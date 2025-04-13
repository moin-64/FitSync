
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Friend, FriendRequest } from "@/types/user";
import { findFriendByUsername, hasPendingRequest } from "@/utils/userContext.utils";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Define a type for the Supabase profiles response
interface Profile {
  id: string;
  username: string;
}

const FriendSearch = ({ onSendFriendRequest, isSearching, friends, friendRequests }: FriendSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
      // Search for users in Supabase
      const trimmedQuery = searchQuery.trim();
      
      // Query users from the profiles table
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('id, username')
        .ilike('username', `%${trimmedQuery}%`)
        .limit(5) as { data: Profile[] | null, error: any };
      
      if (error) throw error;
      
      // Check if the user is already a friend
      let results: UserSearchResult[] = [];
      
      if (supabaseUsers && supabaseUsers.length > 0) {
        // Map supabase results to our format
        results = supabaseUsers.map(user => ({
          id: user.id,
          username: user.username,
          isFriend: !!findFriendByUsername(friends, user.username),
          hasPendingRequest: hasPendingRequest(friendRequests, user.username),
          exists: true
        }));
      } else {
        // If no users found, check if the exact username exists
        const { data: exactUser } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', trimmedQuery)
          .single() as { data: Profile | null, error: any };
        
        if (exactUser) {
          results = [{
            id: exactUser.id,
            username: exactUser.username,
            isFriend: !!findFriendByUsername(friends, exactUser.username),
            hasPendingRequest: hasPendingRequest(friendRequests, exactUser.username),
            exists: true
          }];
        } else {
          // No user found, show "not found" result
          results = [{
            id: `user-${Date.now()}`,
            username: trimmedQuery,
            isFriend: false,
            hasPendingRequest: false,
            exists: false
          }];
          
          toast({
            title: "Benutzer nicht gefunden",
            description: `Der Benutzer "${trimmedQuery}" existiert nicht.`,
            variant: "destructive",
          });
        }
      }
      
      setSearchResults(results);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className={`flex ${isMobile ? "flex-col" : "flex-row"} gap-2`}>
        <div className={`relative ${isMobile ? "w-full" : "flex-1"}`}>
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Freunde suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isSearching || isSearchingDatabase || !searchQuery.trim()}
          className={isMobile ? "w-full" : ""}
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
