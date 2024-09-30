import React, {useEffect, useState} from 'react';
import './App.css';
import SubscriptionPage from './pages/Subscription/SubscriptionPage';
import SignInPage from './pages/SignIn/SignInPage';
import Loader from './components/Loader/Loader';
import {ProfileContext} from "./contexts/ProfileContext";
import ENV from './env';

type AppState = 'loading' | 'sign-in' | 'subscription';

function App() {
  const [state, setState] = React.useState<AppState>('loading');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`${ENV.backendUrl}profile`, {
      credentials: 'include'
    })
      .then(async (r) => {
        if (r.status === 401) {
          setState('sign-in');
          return;
        }

        const profile = await r.json();
        setProfile(profile);
        setState('subscription');
      })
      .catch(() => {
        setState('sign-in');
      });

  }, [])

  return (
    <ProfileContext.Provider value={{profile}}>
      {state === 'loading' && (<div className="app__loader-container"><Loader size={40}/></div>)}
      {state === 'sign-in' && <SignInPage/>}
      {state === 'subscription' && <SubscriptionPage/>}
    </ProfileContext.Provider>
  );
}

export default App;
