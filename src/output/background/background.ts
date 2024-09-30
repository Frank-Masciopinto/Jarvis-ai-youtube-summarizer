import ENV, { IS_SAFARI } from '../env';

const jarvisUrl = ENV.backendUrl;

chrome.runtime.onInstalled.addListener(function (object) {
  let externalUrl = `${jarvisUrl}onboarding/signin`;

  if (IS_SAFARI) {
    externalUrl += '?is_safari=true';
  }

  if (object.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: externalUrl });
  }
});

const onExtensionLoad = () => {
  const fetchUrl = `${jarvisUrl}/event-all`;

  fetch(fetchUrl, {
    method: 'POST',
    credentials: 'include', // Include credentials
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Add any necessary data here
      eventName: 'extension-load',
      eventData: {
        loaded: true,
      },
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      const { tests } = data;

      if (tests) {
        chrome.storage.local.set({ tests: tests });
      }
    })
    .catch((error) => {
      console.error('jarvis failed to save event:', error);
    });
};

onExtensionLoad();

export {};
