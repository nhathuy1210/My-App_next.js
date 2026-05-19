'use client';

import { redirect } from 'next/navigation';

export default function ManageUsersPage() {
  // Redirect /manage-users về /dashboard (staff dashboard)
  redirect('/dashboard');
}