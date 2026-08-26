import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap,
  Search,
  Star,
  Users,
  BookOpen,
  Filter,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { ProtoTeacherDetailModal } from "../components/ProtoTeacherDetailModal";
import {
  DETAILED_TEACHERS,
  type DetailedTeacher,
  type TeacherStudentReview,
} from "../data/mockTeachersData";
import { MOCK_COMMUNITIES } from "../data/mockAcademicData";

export default function ProtoTeachersPage() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState<DetailedTeacher[]>(DETAILED_TEACHERS);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"RATING_DESC" | "REVIEWS_DESC" | "NAME_ASC">("RATING_DESC");
  const [selectedTeacher, setSelectedTeacher] = useState<DetailedTeacher | null>(null);
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);

  // Handle adding a review to local state
  const handleAddReview = (teacherId: string, newReview: TeacherStudentReview) => {
    setTeachers((prev) =>
      prev.map((t) => {
        if (t.id !== teacherId) return t;
        const updatedReviews = [newReview, ...t.reviews];
        const newRatingsCount = t.ratingsCount + 1;
        const newAverage =
          (t.averageRating * t.ratingsCount + newReview.rating) / newRatingsCount;
        return {
          ...t,
          ratingsCount: newRatingsCount,
          averageRating: parseFloat(newAverage.toFixed(1)),
          reviews: updatedReviews,
        };
      })
    );
  };

  // Filter teachers based on community ID, search query, min rating
  const filteredTeachers = teachers.filter((teacher) => {
    // Community filter
    if (selectedCommunityId !== "all" && !teacher.communityIds.includes(selectedCommunityId)) {
      return false;
    }

    // Min rating filter
    if (minRatingFilter > 0 && teacher.averageRating < minRatingFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName =
        teacher.firstName.toLowerCase().includes(q) ||
        teacher.lastName.toLowerCase().includes(q) ||
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(q);
      const matchDept = teacher.department.toLowerCase().includes(q);
      const matchCourses = teacher.coursesTaught.some(
        (c) =>
          c.courseName.toLowerCase().includes(q) ||
          c.courseAbbr.toLowerCase().includes(q)
      );
      const matchCommunities = teacher.communities.some((c) =>
        c.communityName.toLowerCase().includes(q)
      );
      if (!matchName && !matchDept && !matchCourses && !matchCommunities) {
        return false;
      }
    }

    return true;
  });

  // Sort filtered teachers
  const sortedTeachers = [...filteredTeachers].sort((a, b) => {
    if (sortBy === "RATING_DESC") {
      return b.averageRating - a.averageRating;
    }
    if (sortBy === "REVIEWS_DESC") {
      return b.ratingsCount - a.ratingsCount;
    }
    return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
  });

  const activeCommunity = MOCK_COMMUNITIES.find((c) => c.id === selectedCommunityId);

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Flow Banner */}
      <PrototypeBanner />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-emerald-800 to-slate-900 p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-xs font-medium">
              <GraduationCap className="size-3.5 text-amber-300 animate-pulse" />
              <span>Faculty Directory • 5-Metric Professor Intelligence</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
              Professors & Faculty Roster
            </h1>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed">
              Explore professors across your academic communities. Check verified ratings, 5-metric statistical breakdowns, courses taught, and student exam advice.
            </p>

            {/* Quick Context Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="rounded-md bg-white/20 px-2.5 py-1 font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <Users className="size-3.5" /> {sortedTeachers.length} Professors Found
              </span>
              <span className="rounded-md bg-white/15 px-2.5 py-1 backdrop-blur-xs">
                {activeCommunity ? `Community: ${activeCommunity.name}` : "All Communities Active"}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/proto/calendar")}
              className="bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-xs flex items-center justify-center gap-1.5"
            >
              <BookOpen className="size-4 text-primary" /> View Academic Calendar ↗
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/proto/communities")}
              className="border-white/30 text-white hover:bg-white/10 flex items-center justify-center gap-1.5"
            >
              <Users className="size-4" /> All Communities
            </Button>
          </div>
        </div>

        {/* Ambient Decorative Background Glows */}
        <div className="absolute -right-12 -bottom-12 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -left-12 -top-12 size-64 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      {/* Control & Filter Toolbar */}
      <div className="rounded-2xl border bg-card p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input (Main Requirement 2: Can search teacher) */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search teacher by name, department, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          {/* Filter Controls (Main Requirement 1: Display a list of teachers based on a community id) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Community Selector */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                Community:
              </label>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="rounded-xl border bg-background px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="all">All Communities ({MOCK_COMMUNITIES.length})</option>
                {MOCK_COMMUNITIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1">
                <ArrowUpDown className="size-3" /> Sort:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "RATING_DESC" | "REVIEWS_DESC" | "NAME_ASC")}
                className="rounded-xl border bg-background px-3 py-1.5 text-xs font-medium focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="RATING_DESC">Highest Rated (★ 5.0 - 1.0)</option>
                <option value="REVIEWS_DESC">Most Reviews</option>
                <option value="NAME_ASC">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Rating Filter Chips */}
        <div className="flex flex-wrap items-center justify-between border-t pt-3 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-semibold text-[11px] mr-1 flex items-center gap-1">
              <Filter className="size-3" /> Min Rating:
            </span>
            <button
              type="button"
              onClick={() => setMinRatingFilter(0)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                minRatingFilter === 0
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setMinRatingFilter(4.5)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                minRatingFilter === 4.5
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              ★ 4.5+
            </button>
            <button
              type="button"
              onClick={() => setMinRatingFilter(4.0)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                minRatingFilter === 4.0
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              ★ 4.0+
            </button>
          </div>

          <div className="text-[11px] text-muted-foreground">
            Displaying <strong>{sortedTeachers.length}</strong> professors
          </div>
        </div>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sortedTeachers.map((teacher) => (
          <div
            key={teacher.id}
            onClick={() => setSelectedTeacher(teacher)}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-card p-5 hover:border-primary/60 hover:shadow-md transition-all cursor-pointer shadow-xs"
          >
            <div className="space-y-3.5">
              {/* Card Top: Avatar, Name, Rating */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-12 items-center justify-center rounded-xl font-bold text-white text-base shadow-xs shrink-0 ${teacher.avatarColor}`}
                  >
                    {teacher.avatarInitials}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                      {teacher.academicTitle}
                    </span>
                    <h3 className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {teacher.firstName} {teacher.lastName}
                    </h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {teacher.department}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-amber-600 dark:text-amber-400 shrink-0 font-bold text-xs">
                  <Star className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{teacher.averageRating.toFixed(1)}</span>
                </div>
              </div>

              {/* 5 Metrics Mini Progress Breakdown */}
              <div className="space-y-1.5 pt-1 border-t border-dashed">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>Teaching Ability</span>
                  <span className="font-bold text-foreground">
                    {teacher.metrics.find((m) => m.metricId === 1)?.score.toFixed(1)}/5.0
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${teacher.metrics.find((m) => m.metricId === 1)?.percentage || 90}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold pt-0.5">
                  <span>Grading Fairness</span>
                  <span className="font-bold text-foreground">
                    {teacher.metrics.find((m) => m.metricId === 5)?.score.toFixed(1)}/5.0
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${teacher.metrics.find((m) => m.metricId === 5)?.percentage || 90}%`,
                    }}
                  />
                </div>
              </div>

              {/* Courses Taught Badges */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Courses Taught:
                </span>
                <div className="flex flex-wrap gap-1">
                  {teacher.coursesTaught.slice(0, 3).map((c) => (
                    <span
                      key={c.courseAbbr}
                      className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold text-foreground border shadow-2xs"
                    >
                      {c.courseAbbr}
                    </span>
                  ))}
                  {teacher.coursesTaught.length > 3 && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      +{teacher.coursesTaught.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Communities Badges */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Communities:
                </span>
                <div className="flex flex-wrap gap-1">
                  {teacher.communities.map((comm) => (
                    <span
                      key={comm.communityId}
                      className="rounded bg-primary/5 text-primary border border-primary/20 px-1.5 py-0.5 text-[10px] font-medium"
                    >
                      {comm.communityName.split(" - ")[1] || comm.communityName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Footer: Reviews Count & Action */}
            <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
              <span className="text-muted-foreground text-[11px]">
                <strong>{teacher.ratingsCount}</strong> verified reviews
              </span>
              <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                Detailed Stats <ChevronRight className="size-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Detailed Profile Modal */}
      <ProtoTeacherDetailModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
        onAddReview={handleAddReview}
      />
    </div>
  );
}
