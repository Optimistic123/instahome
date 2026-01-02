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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">My Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <ShimmerBox width="100px" height="36px" className="rounded-full" />
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

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Requests</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="bg-card rounded-xl border p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <ShimmerBox width="150px" height="20px" />
                      </TableCell>
                      <TableCell>
                        <ShimmerBox width="120px" height="20px" />
                      </TableCell>
                      <TableCell>
                        <ShimmerBox width="80px" height="24px" className="rounded-full" />
                      </TableCell>
                      <TableCell>
                        <ShimmerBox width="100px" height="24px" className="rounded-full" />
                      </TableCell>
                      <TableCell>
                        <ShimmerBox width="100px" height="20px" />
                      </TableCell>
                      <TableCell>
                        <ShimmerBox width="90px" height="32px" className="rounded-md" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default TenantDashboardShimmer;

