import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Calendar,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Star,
  Sparkles,
  Pin,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrototypeBanner } from "../components/PrototypeBanner";
import { ProtoTeacherReviewModal } from "../components/ProtoTeacherReviewModal";
import {
  getCommunityById,
  MOCK_TEACHERS,
  type MockTeacher,
} from "../data/mockAcademicData";

export default function ProtoCommunityPage() {
  const { communityId = "fmi-info-id" } = useParams();
  const navigate = useNavigate();
  const [selectedTeacher, setSelectedTeacher] = useState<MockTeacher | null>(null);
  const [isMember, setIsMember] = useState(true);

  const community = getCommunityById(communityId);
  if (!community) {
    return <div className="p-6">Community not found.</div>;
  }

  const totalCourses = community.studyYears.reduce(
    (acc, y) => acc + y.courseOfferings.length,
    0
  );

  return (
    <div className="min-h-full space-y-6">
      {/* Prototype Breadcrumb & UX Notes */}
      <PrototypeBanner />

      {/* Community Hero Header */}
      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${community.bannerGradient} p-6 md:p-8 text-white shadow-lg`}>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-300" /> Verified Academic Program
              </span>
              <span className="rounded-md bg-black/30 px-2.5 py-1 text-xs font-medium backdrop-blur-xs">
                {community.memberCount} enrolled members
              </span>
            </div>

            <Button
              size="sm"
              variant={isMember ? "secondary" : "default"}
              onClick={() => setIsMember(!isMember)}
              className="font-semibold shadow-xs"
            >
              {isMember ? "Joined ✓" : "Join Community"}
            </Button>
          </div>

          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-extrabold tracking-tight">
              {community.name}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-white/80 max-w-3xl leading-relaxed">
              {community.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-white/70 border-t border-white/15">
            <span>Owner: <strong className="text-white">{community.owner.fullName}</strong></span>
            <span>•</span>
            <span>Total Offerings: <strong className="text-white">{totalCourses} Courses</strong></span>
            <span>•</span>
            <span>Study Years: <strong className="text-white">{community.studyYears.length} Years Active</strong></span>
          </div>
        </div>
      </div>

      {/* FEATURE 1: PINNED COMMUNITY SYLLABUS & PASSING RULES */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Pin className="size-4 text-primary" />
          <span>Pinned Faculty Syllabus Guidelines & Exam Policies</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed">
          <div className="rounded-xl border bg-card p-3.5 space-y-1">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Project Passing Exemption
            </p>
            <p className="text-muted-foreground">
              For practical courses (ASC, ITBI, POO), scoring ≥ 5.0 on the semester practical project guarantees passing without mandatory written session exam attendance.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-3.5 space-y-1">
            <p className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-amber-500" /> Bonus Testing Points
            </p>
            <p className="text-muted-foreground">
              Courses like SAIF offer end-of-lecture mini quizzes yielding up to +3.2 bonus points applied directly to the final exam mark.
            </p>
          </div>
        </div>
      </div>

      {/* FEATURE 2: LIST OF STUDY YEARS (Core Requirement) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Calendar className="size-5 text-primary" /> Study Years
            </h2>
            <p className="text-xs text-muted-foreground">
              Select your academic year to view semester courses, grade formulas, and professor rosters.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {community.studyYears.map((year) => {
            const courseCount = year.courseOfferings.length;
            const sem1Count = year.courseOfferings.filter((c) => c.semester === 1).length;
            const sem2Count = year.courseOfferings.filter((c) => c.semester === 2).length;

            return (
              <div
                key={year.id}
                onClick={() => navigate(`/proto/communities/${community.id}/year/${year.id}`)}
                className="group relative flex flex-col justify-between rounded-2xl border bg-card p-6 shadow-xs hover:shadow-md hover:border-primary/60 transition-all cursor-pointer space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-bold text-primary">
                      {year.studyYearName.replace("_", " ")}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      {courseCount} Courses
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {year.displayName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Semestrul 1 ({sem1Count} courses) • Semestrul 2 ({sem2Count} courses)
                    </p>
                  </div>

                  {/* Preview Course Tags */}
                  {courseCount > 0 ? (
                    <div className="space-y-2 pt-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Courses in this Year:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {year.courseOfferings.slice(0, 6).map((co) => (
                          <span
                            key={co.id}
                            className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground"
                          >
                            {co.courseAbbr}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic pt-2">
                      Syllabus & materials rolling out for next academic session.
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    ECTS: {courseCount * 5 || 60} Total
                  </span>
                  <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Enter Year Hub <ArrowRight className="size-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FEATURE 3: FACULTY ROSTER & RATINGS SUMMARY */}
      <div className="rounded-2xl border bg-card p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" /> Faculty Roster & Student Reviews
            </h2>
            <p className="text-xs text-muted-foreground">
              Evaluated across 5 metrics: Teaching ability, Fairness, Punctuality, Knowledge, Communication.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.values(MOCK_TEACHERS).map((teacher) => (
            <div
              key={teacher.id}
              onClick={() => setSelectedTeacher(teacher)}
              className="flex items-center justify-between rounded-xl border bg-muted/15 p-3.5 hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">
                  Prof. {teacher.firstName} {teacher.lastName}
                </p>
                <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                  {teacher.coursesTaughtNames?.[0] || teacher.department?.split(" ")[0]}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                <span>{teacher.averageRating.toFixed(1)}</span>
              </div>
            </div>
          ))}
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
