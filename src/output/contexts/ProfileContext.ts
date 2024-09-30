import {createContext} from 'react';

interface ActiveSubscription {
  name: string;
  expiresAt: string;
  cancelAt?: string;
  customerPortalUrl: string;
}

interface Profile {
  activeSubscription: ActiveSubscription | null;
}

interface ProfileContextData {
  profile: Profile | null;
}

export const ProfileContext = createContext<ProfileContextData>({
  profile: null,
});
