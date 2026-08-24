import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Sparkles,
  ChevronRight,
  Search,
  GraduationCap,
  Star,
} from "lucide-react";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { ProtoTeacherReviewModal } from "../components/ProtoTeacherReviewModal";
import {
  getCommunityById,
  getStudyYear,
  getProfessorsForStudyYear,
  type MockTeacher,
} from "../data/mockAcademicData";

export default function ProtoStudyYearPage() {
  const { communityId = "fmi-info-id", yearId = "1" } = useParams();
  const navigate = useNavigate();

  const [activeSemester, setActiveSemester] = useState<1 | 2>(1);
  const [selectedTeacher, setSelectedTeacher] = useState<MockTeacher | null>(null);
  const [filterSearch, setFilterSearch] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  const community = getCommunityById(communityId);
  const studyYear = getStudyYear(communityId, yearId);
  const yearProfessors = getProfessorsForStudyYear(yearId);

  if (!community || !studyYear) {
    return <div className="p-6">Study Year not found.</div>;
  }

  const semesterOfferings = studyYear.courseOfferings.filter(
    (co) => co.semester === activeSemester
  );

  const filteredOfferings = semesterOfferings.filter((co) => {
    const matchesSearch =
      co.courseName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      co.courseAbbr.toLowerCase().includes(filterSearch.toLowerCase()) ||
      co.teachers.some((t) => t.lastName.toLowerCase().includes(filterSearch.toLowerCase()));
    const matchesDiff = selectedDifficulty ? co.passingDifficulty === selectedDifficulty : true;
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Breadcrumb & UX Notes */}
      <PrototypeBanner />

      {/* Year Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border bg-card p-6 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-bold text-primary">
              {studyYear.studyYearName.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground">{community.name}</span>
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {studyYear.displayName}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            Curriculum, assigned faculty roster, and passing policies for Anul 1 (60 ECTS total).
          </p>
        </div>

        {/* Semester Toggle Switcher */}
        <div className="flex items-center rounded-xl bg-muted p-1 border">
          <button
            type="button"
            onClick={() => setActiveSemester(1)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSemester === 1
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semestrul 1 ({studyYear.courseOfferings.filter((c) => c.semester === 1).length} Courses)
          </button>
          <button
            type="button"
            onClick={() => setActiveSemester(2)}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              activeSemester === 2
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semestrul 2 ({studyYear.courseOfferings.filter((c) => c.semester === 2).length} Courses)
          </button>
        </div>
      </div>

      {/* SECTION 1: LIST OF PROFESSORS IN THIS SPECIFIC STUDY YEAR (Core Requirement) */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" /> Faculty Teaching in {studyYear.displayName.split(" ")[0]} {studyYear.displayName.split(" ")[1]}
            </h2>
            <p className="text-xs text-muted-foreground">
              Professors assigned to year {studyYear.id} courses with 5-metric student evaluations.
            </p>
          </div>

          <span className="text-xs text-muted-foreground">
            {yearProfessors.length} Professors Assigned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {yearProfessors.map((prof) => (
            <div
              key={prof.id}
              onClick={() => setSelectedTeacher(prof)}
              className="flex items-center justify-between rounded-xl border bg-muted/15 p-3.5 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-primary text-[10px] font-bold">
                    {prof.avatarInitials || prof.lastName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    Prof. {prof.firstName} {prof.lastName}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-[190px]">
                  {prof.coursesTaughtNames?.[0] || prof.department}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                <span>{prof.averageRating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: ACTUAL COURSES FOR THIS STUDY YEAR */}
      <div className="space-y-4">
        {/* Search & Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses or professors..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="w-full rounded-xl border bg-card pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDifficulty(null)}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                selectedDifficulty === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              All Courses ({semesterOfferings.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDifficulty(selectedDifficulty === "easy" ? null : "easy")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition-colors cursor-pointer ${
                selectedDifficulty === "easy" ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
              }`}
            >
              Easy Passing
            </button>
          </div>
        </div>

        {/* Courses Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOfferings.map((offering) => {
            const teacher = offering.teachers[0];
            return (
              <div
                key={offering.id}
                onClick={() =>
                  navigate(
                    `/proto/communities/${community.id}/year/${studyYear.id}/course/${offering.id}`
                  )
                }
                className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md hover:border-primary/60 transition-all cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  {/* Acronym & Badges */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                      {offering.courseAbbr}
                    </span>

                    <div className="flex items-center gap-2">
                      {offering.passingDifficulty && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            offering.passingDifficulty === "easy"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          Passing: {offering.passingDifficulty}
                        </span>
                      )}
                      <span className="text-xs font-medium text-muted-foreground">
                        {offering.creditPoints || 5} ECTS
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {offering.courseName}
                  </h3>

                  {/* Database Passing Strategy */}
                  {offering.description ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs leading-relaxed text-foreground">
                      <p className="font-semibold text-primary mb-0.5 flex items-center gap-1.5">
                        <Sparkles className="size-3.5" /> Passing Strategy & Exam Rules:
                      </p>
                      <p className="text-muted-foreground line-clamp-3">
                        {offering.description}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Standard syllabus requirements. Check course hub for details.
                    </p>
                  )}
                </div>

                {/* Footer with Professor info & Action */}
                <div className="pt-4 border-t flex items-center justify-between text-xs">
                  {teacher ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeacher(teacher);
                      }}
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                        {teacher.lastName.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">
                        Prof. {teacher.lastName}
                      </span>
                      <span className="flex items-center text-amber-500 font-bold">
                        ★ {teacher.averageRating.toFixed(1)}
                      </span>
                    </button>
                  ) : (
                    <span className="text-muted-foreground italic">Faculty TBD</span>
                  )}

                  <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Course Hub <ChevronRight className="size-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teacher Rating Modal */}
      <ProtoTeacherReviewModal
        teacher={selectedTeacher}
        onClose={() => setSelectedTeacher(null)}
      />
    </div>
  );
}
