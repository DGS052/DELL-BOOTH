'use client';

import React from 'react';

export default function ITSecurityDashboard() {
  return (
    <div className="w-full flex flex-col gap-5 relative">
      <div className="h-24 bg-white/[0.03] border border-white/10 rounded-2xl w-full" />
      <div className="h-40 bg-white/[0.03] border border-white/10 rounded-2xl w-full" />
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_1fr] gap-5">
        <div className="h-[500px] bg-white/[0.03] border border-white/10 rounded-2xl w-full" />
        <div className="h-[500px] bg-white/[0.03] border border-white/10 rounded-2xl w-full" />
        <div className="h-[500px] bg-white/[0.03] border border-white/10 rounded-2xl w-full" />
      </div>
    </div>
  );
}
