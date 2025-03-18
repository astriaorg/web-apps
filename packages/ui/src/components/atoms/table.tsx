import * as React from "react";

import { ChevronDownSmallIcon } from "../../icons";
import { cn } from "../../utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("transition-colors", className)} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "text-xs/3 text-typography-subdued font-medium tracking-wider uppercase align-middle h-12 px-3 first:pl-6 ",
      className,
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "h-[72px] px-3 first:pl-6 border-t border-stroke-default text-sm",
      className,
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

interface TableSortIconProps extends React.HTMLAttributes<HTMLDivElement> {
  isActive: boolean;
  isAscending: boolean;
}

const TableSortIcon = React.forwardRef<HTMLDivElement, TableSortIconProps>(
  ({ className, isActive, isAscending, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "cursor-pointer text-typography-subdued hover:text-typography-default hover:opacity-100",
        "transform transition-transform duration-200",
        isActive ? "opacity-100" : "opacity-0",
        isAscending && "rotate-180",
        className,
      )}
      {...props}
    >
      <ChevronDownSmallIcon aria-label="Sort" size={16} />
    </div>
  ),
);
TableSortIcon.displayName = "TableSortIcon";

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortIcon,
};
