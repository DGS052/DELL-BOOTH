'use client';

import React from 'react';

export default function OthersDashboard() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="flex flex-col gap-4">
        <div className="h-10 bg-white/[0.03] border border-white/10 rounded w-1/3" />
        <div className="h-6 bg-white/[0.03] border border-white/10 rounded w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          <div className="h-40 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full" />
          <div className="h-40 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full" />
          <div className="h-40 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full" />
          <div className="h-40 bg-white/[0.03] border border-white/[0.08] rounded-2xl w-full" />
        </div>
      </div>
      <div className="h-[500px] bg-white/[0.03] border border-white/10 rounded-2xl w-full" />
    </div>
  );
}
