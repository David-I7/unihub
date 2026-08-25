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
  if (lower === "year" || lower === "course" || lower === "semester") {
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  const decoded = decodeURIComponent(segment);
  return decoded;
}

interface CommunityBreadcrumbProps {
  className?: string;
}

export function CommunityBreadcrumb({ className }: CommunityBreadcrumbProps) {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  const baseCommunityUrl = "/communities";

  const subSegments = segments.slice(1);

  if (subSegments.length === 0) {
    return (
      <Breadcrumb className={cn("text-sm", className)}>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-semibold text-foreground">
              Communities
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb className={cn("text-sm", className)}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to={baseCommunityUrl} />}>
            Communities
          </BreadcrumbLink>
        </BreadcrumbItem>

        {subSegments.map((segment, index) => {
          const isLast = index === subSegments.length - 1;
          const url = `${baseCommunityUrl}/${subSegments.slice(0, index + 1).join("/")}`;
          const label = formatSegment(segment);

          return (
            <React.Fragment key={url}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-semibold text-foreground">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link to={url} />}>
                    {label}
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
