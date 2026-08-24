import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CommunitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  totalCount?: number;
}

export function CommunitySearch({
  value,
  onChange,
  placeholder = "Search communities by name (e.g. FMI, Informatica, AI, Master)...",
  totalCount,
}: CommunitySearchProps) {
  return (
    <div className="relative flex items-center w-full">
      <Search className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 pr-24 h-10 text-xs md:text-sm rounded-xl"
      />
      <div className="absolute right-2.5 flex items-center gap-1.5">
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onChange("")}
            className="text-muted-foreground hover:text-foreground"
            title="Clear search"
          >
            <X className="size-3.5" />
          </Button>
        )}
        {totalCount !== undefined && (
          <span className="text-[11px] font-semibold text-muted-foreground px-1 hidden sm:inline-block">
            {totalCount} {totalCount === 1 ? "result" : "results"}
          </span>
        )}
      </div>
    </div>
  );
}
