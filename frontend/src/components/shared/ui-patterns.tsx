"use client";

import { Button } from "@/components/ui/button";

export const darkOutlineButtonClass =
  "border-white/20 bg-[#1A1C22] text-white hover:bg-[#222632] hover:text-white";

export const tableHeadTextClass = "px-4 py-3 !text-white/60";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }).map((_, index) => {
        const pageNumber = index + 1;
        const active = pageNumber === page;
        return (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-md px-3 py-1 ${
              active ? "bg-[#8F8AFF] text-[#171823]" : "text-white/70 hover:bg-white/10"
            }`}
          >
            {pageNumber}
          </button>
        );
      })}
    </div>
  );
}

type DarkOutlineButtonProps = React.ComponentProps<typeof Button>;

export function DarkOutlineButton({ className, ...props }: DarkOutlineButtonProps) {
  return <Button variant="outline" className={`${darkOutlineButtonClass} ${className ?? ""}`} {...props} />;
}
