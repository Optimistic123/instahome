import React from 'react';
import { ShimmerBox } from '../Shimmer';
import { Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function OwnerDashboardShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Owner Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <ShimmerBox width="120px" height="16px" />
              <ShimmerBox width="80px" height="32px" className="rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card p-6 rounded-xl border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <ShimmerBox width="120px" height="16px" className="mb-2" />
                  <ShimmerBox width="80px" height="36px" />
                </div>
                <ShimmerBox width="48px" height="48px" className="rounded-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Property Earnings Table */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <ShimmerBox height="32px" width="200px" />
            <div className="flex items-center gap-4">
              <ShimmerBox width="256px" height="40px" className="rounded-md" />
              <ShimmerBox width="160px" height="40px" className="rounded-md" />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Monthly Rent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Next Payment Due</TableHead>
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
                  <TableCell>
                    <ShimmerBox width="100px" height="20px" />
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

export default OwnerDashboardShimmer;

