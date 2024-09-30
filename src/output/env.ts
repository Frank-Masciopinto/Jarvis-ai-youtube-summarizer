type Environment = {
  name: string;
  landingUrl: string;
  extensionUrl: string;
  backendUrl: string;
  googleClientId: string;
};

const devEnvironment: Environment = {
  name: 'development',
  landingUrl: 'http://localhost:3000/',
  extensionUrl: 'http://localhost:3001/',
  backendUrl: 'http://localhost:3000/',
  googleClientId:
    '597554026151-c066gd413dp46ljl175ckdon830com91.apps.googleusercontent.com',
};

const localTunnelEnvironment: Environment = {
  name: 'local-tunnel',
  landingUrl: 'https://jarvis-app.loca.lt',
  extensionUrl: 'https://jarvis-app.loca.lt/',
  backendUrl: 'https://jarvis-app.loca.lt/',
  googleClientId:
    '597554026151-c066gd413dp46ljl175ckdon830com91.apps.googleusercontent.com',
};

const prodEnvironment: Environment = {
  name: 'production',
  landingUrl: 'https://jarvis.app/',
  extensionUrl: 'https://frontend.jarvis.app/',
  backendUrl: 'https://backend.jarvis.app/',
  googleClientId:
    '1063652249170-5q1tm9ojotgncdqitr8g43ln0p5dj421.apps.googleusercontent.com',
};

// ⚠️ WARNING! ⚠️
// CHECK THAT PROD ENVIRONMENT IS SET WHEN YOU DO NEW RELEASE OF THE PLUGIN
const ENV = prodEnvironment;

// ⚠️ WARNING! ⚠️
// THIS FLAG IS SET AUTOMATICALLY BY THE BUILD SCRIPT
export const IS_SAFARI = false;

export default ENV;
