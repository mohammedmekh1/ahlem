'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface InviteUserFormProps {
  organizations: { id: string, name: string }[];
  allowedRoles: string[];
}

export function InviteUserForm({ organizations, allowedRoles }: InviteUserFormProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(allowedRoles[0]);
  const [orgId, setOrgId] = useState(organizations[0]?.id || '');
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, organization_id: orgId, role }),
      });

      if (response.ok) {
        toast.success('تم إرسال الدعوة بنجاح');
        setEmail('');
      } else {
        const error = await response.json();
        toast.error(`خطأ: ${error.error}`);
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء إرسال الدعوة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>دعوة مستخدم جديد</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">البريد الإلكتروني</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">المنظمة</label>
            <Select value={orgId} onValueChange={setOrgId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المنظمة" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">الدور</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدور" />
              </SelectTrigger>
              <SelectContent>
                {allowedRoles.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'إرسال دعوة'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
