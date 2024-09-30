import React from 'react';
import ReactDOM from 'react-dom';
import { useState, useEffect } from 'react';
import { LS, isUserPremiumOrFreeACTIVE } from '../src/constants';

import Registration from './components/Registration.jsx';
import LogIn from './components/LogIn.jsx';
import UserDashboard from './components/userDashboard.jsx';

function App() {
  let [page, setpage] = useState();
  let [functionalityEnabled, setfunctionalityEnabled] = useState(true);
  let user_profile;
  async function setFirstPopupPage() {
    user_profile = await LS.getItem('User_Profile');
    let userLoggedIn = user_profile.is_user_logged_in;
    setpage('logIn')
    // if (userLoggedIn) {
    //   setpage('userDashboard');
    // } else {
    //   setpage('signUp');
    // }
  }
  async function isUserActive() {
    console.log('isUserActive()');
    if (await isUserPremiumOrFreeACTIVE()) setfunctionalityEnabled(false);
    else setfunctionalityEnabled(true);
  }
  useEffect(() => {
    setFirstPopupPage();
    isUserActive();
  }, []);
  function router() {
    if (page == 'signUp') return <Registration setpage={setpage} />;
    else if (page == 'logIn') return <LogIn setpage={setpage} />;
    else if (page == 'userDashboard')
      return <UserDashboard setpage={setpage} functionalityEnabled={functionalityEnabled} />;
  }
  return <div className="App">{router()}</div>;
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App />, rootElement);
