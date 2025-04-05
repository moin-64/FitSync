
import React, { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Friend, FriendRequest } from "@/types/user";
import { findFriendByUsername, hasPendingRequest } from "@/utils/userContext.utils";

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
}

const FriendSearch = ({ onSendFriendRequest, isSearching, friends, friendRequests }: FriendSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
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

    // In a real app, this would query Supabase for matching usernames
    // For now, we'll simulate search results
    setTimeout(() => {
      // Check if user is already a friend
      const isFriend = !!findFriendByUsername(friends, searchQuery.trim());
      const hasPendingReq = hasPendingRequest(friendRequests, searchQuery.trim());
      
      const mockResults: UserSearchResult[] = [
        {
          id: `user-${Date.now()}`,
          username: searchQuery.trim(),
          isFriend,
          hasPendingRequest: hasPendingReq,
        },
      ];
      setSearchResults(mockResults);
    }, 500);
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
          disabled={isSearching || !searchQuery.trim()}
        >
          Suchen
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
                <span className="font-medium">{user.username}</span>
              </div>
              <Button
                size="sm"
                disabled={user.isFriend || user.hasPendingRequest || isSearching}
                onClick={() => onSendFriendRequest(user.username)}
              >
                {user.isFriend
                  ? "Freund"
                  : user.hasPendingRequest
                  ? "Anfrage gesendet"
                  : "Anfrage senden"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendSearch;
