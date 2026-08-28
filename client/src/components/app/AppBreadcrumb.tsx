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
  }

  const decoded = decodeURIComponent(segment);
  return decoded.charAt(0).toUpperCase() + decoded.slice(1);
}

interface Crumb {
  label: string;
  url: string;
}

export interface AppBreadcrumbProps {
  className?: string;
}

export function AppBreadcrumb({ className }: AppBreadcrumbProps) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  // If not inside /communities, don't render or render simple root
  if (segments.length === 0 || segments[0] !== "communities") {
    return null;
  }

  const communitySlug = segments[1];
  const isStudyYears = segments[2] === "study-years";
  const studyYearSlug = isStudyYears ? segments[3] : undefined;
  const isCourses = isStudyYears && segments[4] === "courses";
  const courseSlug = isCourses ? segments[5] : undefined;

  const crumbs: Crumb[] = [{ label: "Communities", url: "/communities" }];

  if (communitySlug) {
    crumbs.push({
      label: formatSegment(communitySlug),
      url: `/communities/${communitySlug}`,
    });
  }

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
    <Breadcrumb className={cn("text-sm", className)}>
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
