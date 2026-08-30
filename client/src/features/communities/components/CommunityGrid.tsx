import { CommunityCard } from "./CommunityCard";
import type { Community } from "../api/types";

interface CommunityGridProps {
  communities: Community[];
  onJoinClick?: (community: Community) => void;
}

export function CommunityGrid({ communities, onJoinClick }: CommunityGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {communities.map((community) => (
        <CommunityCard
          key={community.id}
          community={community}
          onJoinClick={onJoinClick}
        />
      ))}
    </div>
  );
}
