import React from 'react';
import { Shimmer, ShimmerBox } from '../Shimmer';
import CustomIcon from '../CustomIcon';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function PropertyListingShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
              <CustomIcon src="/images/orglogo.png" className="h-12 w-12 sm:h-14 sm:w-14" alt="InstaMakaan Logo" />
              <span className="text-2xl font-bold">InstaMakaan</span>
            </Link>
            <ShimmerBox width="80px" height="36px" className="rounded-full" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <ShimmerBox height="48px" width="300px" className="mb-4" />
          <ShimmerBox height="20px" width="250px" />
        </div>

        {/* Filter Section */}
        <div className="bg-card p-6 rounded-2xl border shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ShimmerBox height="40px" className="rounded-md" />
            <ShimmerBox height="40px" className="rounded-md" />
            <ShimmerBox height="40px" className="rounded-md" />
          </div>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border overflow-hidden shadow-sm"
            >
              {/* Image */}
              <ShimmerBox height="224px" className="w-full" />
              
              {/* Content */}
              <div className="p-6 space-y-3">
                <ShimmerBox width="80px" height="24px" className="rounded-full" />
                <ShimmerBox height="24px" width="90%" />
                <ShimmerBox height="16px" width="70%" />
                <div className="flex items-center gap-4">
                  <ShimmerBox width="60px" height="16px" />
                  <ShimmerBox width="60px" height="16px" />
                  <ShimmerBox width="80px" height="16px" />
                </div>
                <ShimmerBox height="40px" className="rounded-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PropertyListingShimmer;

