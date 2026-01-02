import React from 'react';
import { Shimmer, ShimmerBox, ShimmerText } from '../Shimmer';
import CustomIcon from '../CustomIcon';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function PropertyDetailShimmer() {
  return (
    <div className="min-h-screen bg-background">
      <header className="glass-effect sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <CustomIcon src="/images/orglogo.png" className="h-12 w-12 sm:h-14 sm:w-14" alt="InstaMakaan Logo" />
              <span className="text-2xl font-bold">InstaMakaan</span>
            </Link>
            <ShimmerBox width="80px" height="36px" className="rounded-full" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" className="mb-6 rounded-full" asChild>
          <Link to="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Properties
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
              <ShimmerBox height="256px" className="col-span-2 rounded-2xl" />
              <ShimmerBox height="256px" className="rounded-2xl" />
              <ShimmerBox height="256px" className="rounded-2xl" />
            </div>

            {/* Property Details Card */}
            <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-6">
              {/* Badge */}
              <ShimmerBox width="120px" height="28px" className="rounded-full" />
              
              {/* Title */}
              <div className="space-y-2">
                <ShimmerBox height="36px" width="70%" />
                <ShimmerBox height="20px" width="60%" />
              </div>

              {/* Beds/Baths/Area */}
              <div className="flex items-center gap-6">
                <ShimmerBox width="80px" height="24px" />
                <ShimmerBox width="80px" height="24px" />
                <ShimmerBox width="100px" height="24px" />
              </div>

              {/* Description */}
              <div className="space-y-3">
                <ShimmerBox height="24px" width="150px" />
                <ShimmerText lines={4} />
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <ShimmerBox height="24px" width="120px" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <ShimmerBox key={i} width="100px" height="20px" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Rent Info and Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card p-8 rounded-2xl border shadow-sm space-y-6">
              {/* Rent Amount */}
              <div>
                <ShimmerBox width="100px" height="16px" className="mb-2" />
                <ShimmerBox height="48px" width="60%" />
              </div>

              {/* Security Deposit */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between">
                  <ShimmerBox width="120px" height="16px" />
                  <ShimmerBox width="80px" height="16px" />
                </div>
              </div>

              {/* Visit Request Form */}
              <div className="pt-4 border-t space-y-4">
                <ShimmerBox height="24px" width="180px" />
                
                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <ShimmerBox width="80px" height="16px" />
                    <ShimmerBox height="40px" className="rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <ShimmerBox width="100px" height="16px" />
                    <ShimmerBox height="40px" className="rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <ShimmerBox width="110px" height="16px" />
                    <ShimmerBox height="40px" className="rounded-md" />
                  </div>
                  <div className="space-y-2">
                    <ShimmerBox width="120px" height="16px" />
                    <ShimmerBox height="80px" className="rounded-md" />
                  </div>
                  <ShimmerBox height="48px" className="rounded-full" />
                </div>
              </div>

              {/* Footer Text */}
              <ShimmerBox width="100%" height="12px" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyDetailShimmer;

