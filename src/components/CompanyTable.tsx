'use client'

import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Company } from '@/types/company'
import { useCompanies } from '@/hooks/useCompanies'
import { useTableState } from '@/hooks/useTableState'
import { ArrowUpDown, ExternalLink, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookmarkButton } from '@/components/BookmarkButton'
import Link from 'next/link'

export function CompanyTable() {
  const { companies, isLoading } = useCompanies()
  const { sorting, setSorting, pagination, setPagination } = useTableState()

  const columns = useMemo<ColumnDef<Company>[]>(
    () => [
      {
        id: 'bookmark',
        header: '',
        cell: ({ row }) => (
          <BookmarkButton companyId={row.original.id} size="sm" />
        ),
        size: 40,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Company
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <Link
              href={`/companies/${row.original.id}`}
              className="font-medium hover:underline"
            >
              {row.original.name}
            </Link>
            <p className="text-sm text-muted-foreground truncate max-w-xs">
              {row.original.tagline}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant="secondary">{row.original.category}</Badge>
        ),
      },
      {
        id: 'vcReport.overallScore',
        accessorKey: 'vcReport.overallScore',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Score
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const score = row.original.vcReport?.overallScore
          if (!score) return <span className="text-muted-foreground">-</span>

          let color = 'bg-gray-100 text-gray-800'
          if (score >= 8) color = 'bg-green-100 text-green-800'
          else if (score >= 6) color = 'bg-yellow-100 text-yellow-800'
          else if (score >= 4) color = 'bg-orange-100 text-orange-800'
          else color = 'bg-red-100 text-red-800'

          return (
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${color} inline-flex items-center gap-1`}>
              <Star className="h-3 w-3" />
              {score}/10
            </span>
          )
        },
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.vcReport?.overallScore ?? 0
          const b = rowB.original.vcReport?.overallScore ?? 0
          return a - b
        },
      },
      {
        accessorKey: 'founders',
        header: 'Founders',
        cell: ({ row }) => (
          <div className="max-w-xs">
            {row.original.founders.slice(0, 2).map((founder, i) => (
              <div key={i} className="text-sm">
                {founder.linkedin ? (
                  <a
                    href={founder.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-primary"
                  >
                    {founder.name}
                  </a>
                ) : (
                  founder.name
                )}
              </div>
            ))}
            {row.original.founders.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{row.original.founders.length - 2} more
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'funding.amount',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Funding
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.funding?.amount || 'N/A',
      },
      {
        accessorKey: 'metrics.employees',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Team
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.metrics?.employees || 'N/A',
      },
      {
        id: 'links',
        header: 'Links',
        cell: ({ row }) => (
          <div className="flex gap-1">
            {row.original.website && (
              <a
                href={row.original.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: companies,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading companies...</div>
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">No companies found</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t hover:bg-muted/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {companies.length}{' '}
          companies
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
