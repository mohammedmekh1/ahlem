'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { InviteUserForm } from '@/components/invitations/InviteUserForm';
import { InvitationList } from '@/components/invitations/InvitationList';
import { createClient } from '@/lib/supabase/client';
import { Users, ShieldCheck } from 'lucide-react';

export default function TeamManagement() {
  const [members, setMembers] = useState<any[]>([]);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myOrgs } = await supabase
        .from('organization_members')
        .select('organization_id, role, organizations(name)')
        .eq('user_id', user.id);

      if (myOrgs) {
        const leadOrgs = myOrgs
          .filter(m => ['owner', 'admin', 'teacher'].includes(m.role))
          .map(m => ({ id: m.organization_id, name: (m as any).organizations.name }));
        setOrganizations(leadOrgs);

        if (leadOrgs.length > 0) {
          const { data: team } = await supabase
            .from('organization_members')
            .select('*, profiles(full_name, email)')
            .eq('organization_id', leadOrgs[0].id);
          if (team) setMembers(team);
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [supabase]);

  if (loading) return <div className="p-6">جاري التحميل...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">إدارة فريق العمل</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              أعضاء الفريق الحاليين
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{(m as any).profiles?.full_name || 'مستخدم جديد'}</p>
                  <p className="text-xs text-gray-500">{(m as any).profiles?.email}</p>
                </div>
                <Badge variant="outline">{m.role}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <InviteUserForm
            organizations={organizations}
            allowedRoles={['teacher', 'assistant', 'member']}
          />
          <InvitationList organizationId={organizations[0]?.id} />
        </div>
      </div>
    </div>
  );
}
