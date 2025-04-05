
import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FriendRequest } from "@/types/user";
import { Check, X } from "lucide-react";

interface FriendRequestsProps {
  requests: FriendRequest[];
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
}

const FriendRequests = ({ requests, onAccept, onDecline }: FriendRequestsProps) => {
  if (!requests.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">Keine ausstehenden Anfragen</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-card p-4 rounded-lg flex items-center justify-between shadow-sm"
        >
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {request.fromUsername.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{request.fromUsername}</p>
              <p className="text-xs text-muted-foreground">
                Gesendet am {new Date(request.sentAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onDecline(request.id)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onAccept(request.id)}
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FriendRequests;
