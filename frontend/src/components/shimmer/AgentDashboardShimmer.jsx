import React from 'react';
import { ShimmerBox } from '../Shimmer';
import { Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function AgentDashboardShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Agent Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <ShimmerBox width="120px" height="16px" />
              <ShimmerBox width="80px" height="32px" className="rounded-full" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <ShimmerBox height="36px" width="250px" className="mb-2" />
          <ShimmerBox height="20px" width="300px" />
        </div>

        {/* Filter */}
        <div className="flex items-center justify-end mb-4">
          <ShimmerBox width="192px" height="40px" className="rounded-md" />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Property</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <ShimmerBox width="120px" height="20px" />
                  </TableCell>
                  <TableCell>
                    <ShimmerBox width="100px" height="24px" className="rounded-full" />
                  </TableCell>
                  <TableCell>
                    <ShimmerBox width="100px" height="20px" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ShimmerBox width="160px" height="40px" className="rounded-md" />
                      <ShimmerBox width="40px" height="40px" className="rounded-md" />
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

