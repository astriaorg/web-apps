import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "../../icons";
import { cn } from "../../utils";
import { buttonVariants } from "./button";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PaginationGroup = ({
  className,
  ...props
}: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
PaginationGroup.displayName = "PaginationGroup";

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  isDisabled?: boolean;
} & React.ComponentProps<"a">;

const PaginationLink = ({
  className,
  isActive,
  isDisabled,
  ...props
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "secondary",
      }),
      isDisabled && ["pointer-events-none opacity-50 shadow-none"],
      className,
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    className={cn("h-10 w-12 text-icon-subdued", className)}
    {...props}
  >
    <ArrowLeftIcon className="h-4 w-4" />
    <span className="sr-only">Previous</span>
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    className={cn("h-10 w-12 text-icon-subdued", className)}
    {...props}
  >
    <span className="sr-only">Next</span>
    <ArrowRightIcon className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

const EllipsisPagination = ({
  totalPages,
  currentPage,
  setCurrentPage,
}: PaginationProps) => {
  const paginationItems = [];
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }
  } else {
    paginationItems.push(
      <PaginationItem key={1}>
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={() => setCurrentPage(1)}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    );

    if (currentPage > 3) {
      paginationItems.push(<PaginationEllipsis key="start-ellipsis" />);
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={() => setCurrentPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (currentPage < totalPages - 2) {
      paginationItems.push(<PaginationEllipsis key="end-ellipsis" />);
    }

    paginationItems.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          href="#"
          isActive={currentPage === totalPages}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>,
    );
  }

  return (
    <PaginationGroup>
      <PaginationContent className="gap-1">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => setCurrentPage(currentPage - 1)}
            isDisabled={currentPage === 1}
          />
        </PaginationItem>
        {paginationItems}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => setCurrentPage(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationGroup>
  );
};

const Pagination = ({
  totalPages,
  currentPage,
  setCurrentPage,
}: PaginationProps) => {
  return (
    <PaginationGroup>
      <PaginationContent className="gap-4">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => setCurrentPage(currentPage - 1)}
            isDisabled={currentPage === 1}
          />
        </PaginationItem>
        <span className="text-base/4">
          {currentPage} of {totalPages}
        </span>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => setCurrentPage(currentPage + 1)}
            isDisabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationGroup>
  );
};

export { EllipsisPagination, Pagination };
