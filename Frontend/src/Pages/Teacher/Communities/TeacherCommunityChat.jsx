import { useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle } from "lucide-react";
import CommunityFeed from "@/Pages/Community/CommunityFeed";

export default function TeacherCommunityChat() {
  const { communityId } = useParams(); 

  // Since CommunityFeed likely handles its own scrolling (for chat history),
  // we provide the Header and a container that takes the remaining height.
  // We pass a className or wrapper style to ensure the feed fits.

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Community Chat</h1>
            <p className="text-xs text-slate-500">Connected to: {communityId}</p>
          </div>
        </div>
      </header>

      {/* FEED WRAPPER */}
      {/* Assuming CommunityFeed takes up space or is scrollable */}
      <div className="flex-1 overflow-hidden relative bg-white">
        {/* 
           Note: We assume CommunityFeed can adapt or we apply styling here. 
           If CommunityFeed is a full-screen component itself, this wrapper might be redundant, 
           but keeping it maintains consistency with other pages.
        */}
        <div className="h-full w-full">
           <CommunityFeed
             communityId={communityId}
             isTeacher={true}
           />
        </div>
      </div>
    </div>
  );
}