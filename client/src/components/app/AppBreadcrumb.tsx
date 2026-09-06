import * as React from "react";
import { Link, useLocation } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

function formatSegment(segment: string): string {
  const lower = segment.toLowerCase();
  if (lower.startsWith("year-")) {
    const num = lower.replace("year-", "");
    return `Year ${num}`;
  } else if (lower.startsWith("courses")) {
    return "Courses";
  }

  const decoded = decodeURIComponent(segment);
  return decoded;
}

interface Crumb {
  label: string;
  url: string;
}

export interface AppBreadcrumbProps {
  className?: string;
  variant?: "default" | "capsule";
}

export function AppBreadcrumb({
  className,
  variant = "default",
}: AppBreadcrumbProps) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // Breadcrumbs only appear starting from a specific community slug
  if (segments.length < 2 || segments[0] !== "communities") {
    return null;
  }

  const communitySlug = segments[1];
  const isStudyYears = segments[2] === "study-years";
  const studyYearSlug = isStudyYears ? segments[3] : undefined;
  const isCourses = isStudyYears && segments[4] === "courses";
  const courseSlug = isCourses ? segments[5] : undefined;

  const crumbs: Crumb[] = [
    {
      label: "Communities",
      url: "/communities",
    },
    {
      label: formatSegment(communitySlug),
      url: `/communities/${communitySlug}`,
    },
  ];

  if (studyYearSlug) {
    crumbs.push({
      label: formatSegment(studyYearSlug),
      url: `/communities/${communitySlug}/study-years/${studyYearSlug}`,
    });
  }

  if (courseSlug) {
    crumbs.push({
      label: formatSegment(courseSlug),
      url: `/communities/${communitySlug}/study-years/${studyYearSlug}/courses/${courseSlug}`,
    });
  }

  return (
    <Breadcrumb
      className={cn(
        "text-sm",
        variant === "capsule" &&
          "inline-flex items-center px-3 py-1 rounded-full bg-background/85 dark:bg-background/80 backdrop-blur-md border border-border/50 shadow-xs max-w-full",
        className,
      )}
    >
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <React.Fragment key={crumb.url}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={crumb.url} />}>
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default AppBreadcrumb;
