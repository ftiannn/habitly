import { useState } from "react";

export const UserAvatar = ({ user }) => {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold mr-4 overflow-hidden relative">
        {user.photoUrl && !imageError ? (
          <img 
            src={user.photoUrl} 
            alt={user.name}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={(e) => {
              console.log('Image error:', e.target);
              setImageError(true);
            }}
          />
        ) : (
          <span>{user.name.charAt(0)}</span>
        )}
      </div>
    );
  };