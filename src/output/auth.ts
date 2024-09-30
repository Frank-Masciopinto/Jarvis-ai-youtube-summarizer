import ENV from './env';

export function onSignIn() {
  const url = new URL(`${ENV.landingUrl}/auth-start`);
  url.searchParams.append('user_created_redirect_uri', `${ENV.landingUrl}onboarding/demo`);
  url.searchParams.append('redirect_uri', `${ENV.landingUrl}onboarding/demo`);

  chrome.tabs.create({url: url.toString()}).catch((error) => {
    console.error(error);
  });
}
