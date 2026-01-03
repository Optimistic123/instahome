import React from 'react';
import { ShimmerBox } from '../Shimmer';
import { Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function OwnerDashboardShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-base sm:text-2xl font-bold truncate">Owner Dashboard</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card p-3 md:p-6 rounded-lg md:rounded-xl border shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <ShimmerBox width="80px" height="12px" className="mb-1 md:mb-2" />
                  <ShimmerBox width="50px" height="24px" className="md:h-9" />
                </div>
                <ShimmerBox width="32px" height="32px" className="rounded-full flex-shrink-0 ml-1 md:ml-2 md:w-12 md:h-12" />
              </div>
            </div>
          ))}
        </div>

        {/* Property Earnings Table */}
        <div className="bg-card rounded-xl border p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <ShimmerBox height="28px" width="180px" className="sm:h-8 sm:w-52" />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <ShimmerBox width="100%" height="40px" className="sm:w-64 rounded-md" />
              <ShimmerBox width="100%" height="40px" className="sm:w-40 rounded-md" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Property</TableHead>
                  <TableHead className="min-w-[100px]">Monthly Rent</TableHead>
                  <TableHead className="min-w-[80px]">Status</TableHead>
                  <TableHead className="min-w-[100px]">Payment Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Next Payment Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <ShimmerBox width="150px" height="20px" />
                    </TableCell>
                    <TableCell>
                      <ShimmerBox width="100px" height="20px" />
                    </TableCell>
                    <TableCell>
                      <ShimmerBox width="80px" height="24px" className="rounded-full" />
                    </TableCell>
                    <TableCell>
                      <ShimmerBox width="80px" height="24px" className="rounded-full" />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <ShimmerBox width="100px" height="20px" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboardShimmer;

