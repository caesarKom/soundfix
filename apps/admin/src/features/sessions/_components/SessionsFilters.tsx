import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, X, RefreshCw } from 'lucide-react';
import { useSessionStore } from '@/store/sessionStore';


interface SessionsFiltersProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function SessionsFilters({
  total,
  page,
  totalPages,
  onRefresh,
  isRefreshing,
}: SessionsFiltersProps) {
  const { query, setQuery, resetFilters } = useSessionStore();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setQuery({ search: value, page: 1 });
  }, 500);

  const handlePageChange = (newPage: number) => {
    setQuery({ page: newPage });
  };

  const handleStatusFilter = (value: any) => {
    setQuery({ isRevoked: value === 'all' ? undefined : value, page: 1 });
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by user or device..."
            defaultValue={query.search || ''}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={query.isRevoked ?? 'all'}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="false">Active</SelectItem>
            <SelectItem value="true">Revoked</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={handleClearFilters}
          className="h-10 w-10 text-black"
        >
          <X className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-10 w-10 text-black"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>

        <div className="ml-auto text-sm text-muted-foreground">
          {total} session{total !== 1 ? 's' : ''}
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}