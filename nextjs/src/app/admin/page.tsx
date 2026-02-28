'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, Shield, Settings, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Users', value: '0', icon: Users },
    { name: 'Active Sessions', value: '0', icon: Activity },
    { name: 'Admin Roles', value: '1', icon: Shield },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin Overview</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border p-8 text-center text-gray-500">
            User list and permission controls will appear here.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
