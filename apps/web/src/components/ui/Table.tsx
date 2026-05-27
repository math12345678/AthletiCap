import React from 'react';
import clsx from 'clsx';

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  striped?: boolean;
  hover?: boolean;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, striped = true, hover = true, ...props }, ref) => (
    <table
      ref={ref}
      className={clsx(
        'w-full text-sm',
        className
      )}
      {...props}
    />
  )
);

Table.displayName = 'Table';

interface TableHeadProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableHead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={clsx(
        'border-b border-border-color bg-bg-primary',
        className
      )}
      {...props}
    />
  )
);

TableHead.displayName = 'TableHead';

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={clsx(
        'divide-y divide-border-color',
        className
      )}
      {...props}
    />
  )
);

TableBody.displayName = 'TableBody';

interface TableFooterProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={clsx(
        'border-t border-border-color bg-bg-secondary font-semibold',
        className
      )}
      {...props}
    />
  )
);

TableFooter.displayName = 'TableFooter';

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx(
        'hover:bg-bg-elevated transition-colors',
        className
      )}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

interface TableHeaderProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

const TableHeader = React.forwardRef<HTMLTableCellElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={clsx(
        'px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider',
        className
      )}
      {...props}
    />
  )
);

TableHeader.displayName = 'TableHeader';

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={clsx(
        'px-6 py-4 text-text-primary',
        className
      )}
      {...props}
    />
  )
);

TableCell.displayName = 'TableCell';

export { Table, TableHead, TableBody, TableFooter, TableRow, TableHeader, TableCell };
