'use client';

import { useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';

export type UserProfileDoc = {
  id: string;
  displayName?: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  tenantIds: string[];
  companyProfileId?: string;
};

export function useTenantProfile() {
  const firestore = useFirestore();
  const userState = useUser();

  const profileDocRef = useMemoFirebase(() => {
    if (!firestore || !userState.user) return null;
    return doc(firestore, 'userProfiles', userState.user.uid);
  }, [firestore, userState.user]);

  const profileState = useDoc<UserProfileDoc>(profileDocRef);

  const tenantId = useMemo(() => {
    if (!profileState.data?.tenantIds || profileState.data.tenantIds.length === 0) {
      return null;
    }
    return profileState.data.tenantIds[0];
  }, [profileState.data?.tenantIds]);

  return {
    ...userState,
    userProfile: profileState.data,
    profileDocRef,
    profileError: profileState.error,
    isProfileLoading: profileState.isLoading,
    tenantId,
    isTenantLoading: userState.isUserLoading || profileState.isLoading,
  };
}
