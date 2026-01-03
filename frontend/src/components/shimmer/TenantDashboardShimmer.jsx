import React from 'react';
import { ShimmerBox } from '../Shimmer';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

function TenantDashboardShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="text-base sm:text-2xl font-bold truncate">My Dashboard</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-4">
              <ShimmerBox width="32px" height="32px" className="sm:w-36 rounded-full" />
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

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-initial">Active Requests</TabsTrigger>
            <TabsTrigger value="archived" className="flex-1 sm:flex-initial">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="bg-card rounded-xl border p-4 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Property</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[120px]">Location</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                      <TableHead className="min-w-[100px]">Stage</TableHead>
                      <TableHead className="hidden lg:table-cell">Requested On</TableHead>
                      <TableHead className="min-w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <ShimmerBox width="150px" height="20px" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <ShimmerBox width="120px" height="20px" />
                        </TableCell>
                        <TableCell>
                          <ShimmerBox width="80px" height="24px" className="rounded-full" />
                        </TableCell>
                        <TableCell>
                          <ShimmerBox width="100px" height="24px" className="rounded-full" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <ShimmerBox width="100px" height="20px" />
                        </TableCell>
                        <TableCell>
                          <ShimmerBox width="70px" height="32px" className="sm:w-24 rounded-md" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TenantDashboardShimmer;

