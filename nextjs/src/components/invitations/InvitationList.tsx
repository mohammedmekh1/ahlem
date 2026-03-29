'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';

export function InvitationList({ organizationId }: { organizationId?: string }) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchInvitations() {
      let query = supabase.from('invitations').select('*, organizations(name)');
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error) {
        setInvitations(data);
      }
      setLoading(false);
    }

    fetchInvitations();
  }, [organizationId, supabase]);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>قائمة الدعوات</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>المنظمة</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.email}</TableCell>
                <TableCell>{inv.organizations?.name}</TableCell>
                <TableCell>{inv.role}</TableCell>
                <TableCell>
                  <Badge variant={inv.status === 'pending' ? 'outline' : 'default'}>
                    {inv.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(inv.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {invitations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">لا توجد دعوات حالياً</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
