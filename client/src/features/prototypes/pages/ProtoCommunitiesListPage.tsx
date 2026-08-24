import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Search,
  Plus,
  ArrowRight,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { MOCK_COMMUNITIES, type MockCommunity } from "../data/mockAcademicData";

export default function ProtoCommunitiesListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [communitiesList, setCommunitiesList] = useState<MockCommunity[]>(MOCK_COMMUNITIES);

  const allTags = Array.from(
    new Set(MOCK_COMMUNITIES.flatMap((c) => c.tags))
  );

  const handleToggleJoin = (e: React.MouseEvent, commId: string) => {
    e.stopPropagation();
    setCommunitiesList((prev) =>
      prev.map((c) => (c.id === commId ? { ...c, isJoined: !c.isJoined } : c))
    );
  };

  const filteredCommunities = communitiesList.filter((comm) => {
    const matchesSearch =
      comm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comm.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? comm.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Breadcrumb & UX Notes */}
      <PrototypeBanner />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-6 text-primary" /> University Communities Directory
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Search, join, and browse verified faculty programs, study years, and degree roadmaps.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-1.5 self-start md:self-auto shadow-xs"
          onClick={() => alert("Create community proposal submitted for admin verification.")}
        >
          <Plus className="size-4" /> Create New Community
        </Button>
      </div>

      {/* Search & Tag Filter Bar */}
      <div className="rounded-2xl border bg-card p-4 shadow-xs space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search communities by faculty name, program, or keyword (e.g. FMI, Informatica, AI, Master)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-xs md:text-sm focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

        {/* Tags Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-semibold flex items-center gap-1 shrink-0 mr-1">
            <Filter className="size-3" /> Filter by Track:
          </span>

          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`rounded-lg px-3 py-1 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedTag === null
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            All Communities ({communitiesList.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-lg px-3 py-1 font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((comm) => (
          <div
            key={comm.id}
            onClick={() => navigate(`/proto/communities/${comm.id}`)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs hover:shadow-md hover:border-primary/60 transition-all cursor-pointer"
          >
            {/* Gradient Banner Header */}
            <div className={`h-24 w-full bg-gradient-to-r ${comm.bannerGradient} p-4 flex items-end justify-between`}>
              <span className="rounded-md bg-black/40 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" /> Verified Hub
              </span>

              <button
                type="button"
                onClick={(e) => handleToggleJoin(e, comm.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  comm.isJoined
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-white text-slate-900 hover:bg-white/90"
                }`}
              >
                {comm.isJoined ? "Joined ✓" : "+ Join Hub"}
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {comm.name}
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {comm.memberCount} members
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {comm.description}
                </p>

                {/* Study Years Pill Preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {comm.studyYears.map((sy) => (
                    <span
                      key={sy.id}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground"
                    >
                      {sy.displayName.split(" ")[0]} {sy.displayName.split(" ")[1]}
                    </span>
                  ))}
                  {comm.studyYears.length === 0 && (
                    <span className="text-[11px] text-muted-foreground italic">
                      Curriculum setup in progress
                    </span>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t flex items-center justify-between text-xs mt-3">
                <span className="text-muted-foreground text-[11px]">
                  Lead: <strong className="text-foreground">{comm.owner.fullName}</strong>
                </span>

                <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Enter Community <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
