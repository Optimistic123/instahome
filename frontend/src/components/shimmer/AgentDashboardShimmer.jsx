import React from 'react';
import { ShimmerBox } from '../Shimmer';
import { Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function AgentDashboardShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-base sm:text-2xl font-bold truncate">Agent Dashboard</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <ShimmerBox width="80px" height="16px" className="hidden sm:block" />
              <ShimmerBox width="60px" height="16px" className="sm:hidden" />
              <ShimmerBox width="80px" height="32px" className="rounded-full hidden sm:block" />
              <ShimmerBox width="32px" height="32px" className="rounded-full sm:hidden" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <ShimmerBox height="32px" width="200px" className="sm:h-9 sm:w-64 mb-2" />
          <ShimmerBox height="16px" width="250px" className="sm:h-5 sm:w-80" />
        </div>

        {/* Filter */}
        <div className="flex items-center justify-end mb-4">
          <ShimmerBox width="100%" height="40px" className="sm:w-48 rounded-md" />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="min-w-[150px]">Property</TableHead>
                <TableHead className="min-w-[120px]">User</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="min-w-[100px]">Stage</TableHead>
                <TableHead className="hidden lg:table-cell">Last Updated</TableHead>
                <TableHead className="min-w-[180px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <ShimmerBox width="16px" height="16px" className="rounded-full" />
                  </TableCell>
                  <TableCell>
                    <ShimmerBox width="150px" height="20px" />
                  </TableCell>
                  <TableCell>
                    <ShimmerBox width="120px" height="20px" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <ShimmerBox width="120px" height="20px" />
                  </TableCell>
                  <TableCell>
                    <ShimmerBox width="100px" height="24px" className="rounded-full" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <ShimmerBox width="100px" height="20px" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <ShimmerBox width="128px" height="32px" className="sm:w-40 sm:h-10 rounded-md" />
                      <ShimmerBox width="32px" height="32px" className="sm:w-10 sm:h-10 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default AgentDashboardShimmer;

