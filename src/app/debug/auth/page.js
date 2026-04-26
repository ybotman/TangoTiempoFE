/**
 * /debug/auth — TEMPORARY diagnostic page for TIEMPO-431 SL missing-from-dropdown bug.
 * Renders the live AuthContext user state on-screen so Safari mobile users can
 * screenshot the data without needing DevTools console.
 *
 * REMOVE this route after diagnosis is complete.
 */

'use client';

import React, { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { RoleContext } from '@/contexts/RoleContext';

export default function DebugAuthPage() {
  const { user, loading } = useContext(AuthContext);
  const { roles, selectedRole } = useContext(RoleContext);

  const currentAppId = process.env.NEXT_PUBLIC_APPLICATION_ID || '(unset)';

  if (loading) {
    return <div style={{ padding: 16, fontFamily: 'monospace' }}>Loading auth context…</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 16, fontFamily: 'monospace' }}>
        <h1>/debug/auth</h1>
        <p>Not logged in. Visit <a href="/auth/login">/auth/login</a> first.</p>
      </div>
    );
  }

  // Compute what my filter would do for each role in backendInfo.roleIds
  const roleIds = user.backendInfo?.roleIds || [];
  const filterTrace = roleIds.map((r, idx) => {
    if (!r || typeof r !== 'object') {
      return { idx, type: typeof r, dropped: 'not-an-object' };
    }
    const appIdValue = r.appId;
    const appIdType = typeof appIdValue;
    const matches = appIdValue == null || String(appIdValue) === String(currentAppId);
    return {
      idx,
      _id: r._id,
      roleName: r.roleName,
      appId: appIdValue,
      appIdType,
      matches,
      dropped: matches ? null : `appId mismatch: ${JSON.stringify(appIdValue)} !== ${JSON.stringify(currentAppId)}`,
      keys: Object.keys(r).slice(0, 20),
    };
  });

  const block = {
    label: 'TIEMPO-431 SL diagnosis',
    timestamp: new Date().toISOString(),
    currentAppId,
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
    'user.roles (post-filter, in mergedUser)': user.roles,
    'RoleContext.roles (rendered in dropdown)': roles,
    'RoleContext.selectedRole': selectedRole,
    'backendInfo.roleIds.length (raw from BE)': roleIds.length,
    'backendInfo.roleIds (raw)': roleIds,
    'filterTrace (per-role)': filterTrace,
    'backendInfo top-level keys': Object.keys(user.backendInfo || {}),
  };

  return (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: '12px', wordBreak: 'break-word' }}>
      <h1 style={{ fontSize: '18px' }}>/debug/auth — TIEMPO-431 SL diagnosis</h1>
      <p style={{ background: '#fffae6', padding: 8, border: '1px solid #f0c000' }}>
        Screenshot this page and send to Sarah (TT FE) so we can see exactly which role is missing
        and why my filter is/isn&apos;t passing it. This page is temporary; will be removed after fix.
      </p>
      <pre
        style={{
          background: '#f5f5f5',
          padding: 12,
          border: '1px solid #ccc',
          whiteSpace: 'pre-wrap',
          maxWidth: '100%',
          overflowX: 'auto',
        }}
      >
        {JSON.stringify(block, null, 2)}
      </pre>
    </div>
  );
}
