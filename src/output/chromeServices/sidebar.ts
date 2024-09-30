import ENV, { IS_SAFARI } from '../env';
import { Const } from '../const';
import { summaryReadyManager, waitForElement } from './add-button';

let summarizeBlock: HTMLDivElement | null = null;

const jarvisUrl = ENV.extensionUrl;

const getYoutubePageTheme = () => {
  if (document.documentElement.hasAttribute('dark')) {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const getSummaryBlockHtml = (token: string, theme: string) => {
  const url = new URL(jarvisUrl);

  if (theme) {
    url.searchParams.set('theme', theme);
  }

  if (token) {
    url.searchParams.set('token', token);
  }

  if (IS_SAFARI) {
    url.searchParams.set('is_safari', 'true');
  }

  return `<div id="jarvis-close" title="Close">✕</div>
    <iframe
        id="jarvis-iframe"
        class="jarvis-theme-${theme}"
        src="${url}"
        frameborder="0"
        allowfullscreen
        scrolling="no"
        allow="clipboard-write"
    ></iframe>`;
};

const embedModeManager = {
  embedMode: null as string | null,

  setEmbedMode(embedMode: string | null) {
    this.embedMode = embedMode;
    if (embedMode) {
      sendEmbedModeToIframe(embedMode);
    }
  },

  getEmbedMode() {
    return this.embedMode;
  },
};

const getSafariAuthToken = () => {
  return new Promise((resolve, reject) => {
    let interval: NodeJS.Timer | null = null;

    interval = setInterval(() => {
      chrome.runtime.sendMessage({ type: 'get_auth_token' }, (response) => {
        if (response) {
          resolve(response);
          if (interval) {
            clearInterval(interval);
          }
        } else {
          reject();
        }
      });
    }, 1000);
  });
};

const subscribeToMessages = () => {
  const messageHandler = (event: MessageEvent) => {
    const type = event.data.type;
    const startTime = event.data.startTime;
    const seekBar = document.querySelector('.ytp-progress-bar');

    if (type === 'seek') {
      if (seekBar) {
        if (startTime === -1) {
          seekBar.dispatchEvent(
            new MouseEvent('mouseout', {
              bubbles: true,
            })
          );
        } else {
          // Get seekBar width
          const width = seekBar.getBoundingClientRect().width;
          // Get the x position of the seekBar
          const x = seekBar.getBoundingClientRect().x;
          const durationElement = document.querySelector('video');
          if (!durationElement) {
            return;
          }
          const duration = durationElement.duration;
          const seekTo = Math.round((startTime / duration) * width + x);
          const event1 = new MouseEvent('mouseover', {
            bubbles: true,
            clientX: seekTo,
          });
          const event2 = new MouseEvent('mousemove', {
            bubbles: true,
            clientX: seekTo,
          });
          seekBar.dispatchEvent(event1);
          seekBar.dispatchEvent(event2);
        }
      }
    }

    // goto the time in the video and play it
    if (type === 'goto') {
      const video = document.querySelector('video');
      if (video) {
        video.currentTime = startTime;
        video.play();
        // smoothly scroll to the top of the page
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    }

    if (type === 'storage') {
      const { key, value } = event.data;
      chrome.storage.sync.set({
        [key]: value,
      });
    }

    if (type === 'get-from-storage') {
      const key = event.data.key as string;
      chrome.storage.sync.get(key).then((result) => {
        const value = result[key];
        const iframe = document.querySelector(
          Const.jarvisIframeSelector
        ) as HTMLIFrameElement;
        iframe?.contentWindow?.postMessage({ type, key, value }, '*');
      });
    }

    if (type === 'view-port-height') {
      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );
      const iframe = document.querySelector(
        Const.jarvisIframeSelector
      ) as HTMLIFrameElement;
      iframe?.contentWindow?.postMessage({ type, value: vh }, '*');
    }

    if (type === 'show-block') {
      showSummarizeBlock();
    }

    if (type === 'summary-ready') {
      summaryReadyManager.setSummaryReady(true);
    }

    if (type === 'height') {
      const { height } = event.data;
      // #jarvis-iframe
      const iframe = document.querySelector(
        '#jarvis-block-embedded'
      ) as HTMLDivElement;
      if (iframe) {
        iframe.style.height = `${height}px`;
      }
    }
  };

  // Subscribe to iframe messages
  window.addEventListener('message', messageHandler);
};

const getVideoId = () => {
  const link = window.location.href;
  // https://www.youtube.com/watch?v=QH2-TGUlwu4 and https://youtu.be/QH2-TGUlwu4
  const videoIdRegex = /(?:v=|be\/)([a-zA-Z0-9_-]{11})/;
  const match = link.match(videoIdRegex);
  if (match) {
    return match[1];
  } else {
    return '';
  }
};

const sendMessageToIframe = (message: { type: string; [key: string]: any }) => {
  const iframe = document.querySelector(
    Const.jarvisIframeSelector
  ) as HTMLIFrameElement;
  if (iframe) {
    iframe.contentWindow?.postMessage(message, '*');
  }
};

const sendVideoIdToIframe = (videoId: string) => {
  sendMessageToIframe({ type: 'videoId', videoId });
};

const sendLanguageToIframe = (language: string) => {
  sendMessageToIframe({ type: 'language', language });
};

const sendEmbedModeToIframe = (embedMode: string) => {
  setTimeout(() => {
    if (summarizeBlock) {
      const iframe = summarizeBlock.querySelector(
        Const.jarvisIframeSelector
      ) as HTMLIFrameElement;

      if (iframe) {
        // If the iframe is loaded, send the message immediately.
        if (iframe.contentWindow) {
          setTimeout(() => {
            sendMessageToIframe({ type: 'embedMode', embedMode });
          }, 100);
        } else {
          // If the iframe is not loaded, wait for the 'load' event.
          iframe.addEventListener(
            'load',
            () => {
              sendMessageToIframe({ type: 'embedMode', embedMode });
            },
            { once: true }
          );
        }
      }
    }
  }, 0);
};

const addSummarizeBlock = () => {
  if (summarizeBlock || document.getElementById('jarvis-iframe')) {
    return false;
  }

  // Create the block and append it to the body
  // 'jarvis-block-overlay' is default id, we change it if it's old interface
  const block = document.createElement('div');
  block.id = 'jarvis-block-overlay';
  summarizeBlock = block;

  chrome.storage.sync.get(['language', 'token'], async (result) => {
    if (IS_SAFARI) {
      const safariAuthToken = await getSafariAuthToken();
      result.token = safariAuthToken;
    }

    const theme = getYoutubePageTheme();

    block.innerHTML = getSummaryBlockHtml(result.token, theme);

    // On click to #jarvis-close, hide the block
    const close = block.querySelector('#jarvis-close');
    close?.addEventListener('click', () => {
      hideSummarizeBlock();
    });

    // sendVideoIdToIframe to iframe after it's loaded
    block
      .querySelector(Const.jarvisIframeSelector)
      ?.addEventListener('load', () => {
        setTimeout(() => {
          sendVideoIdToIframe(getVideoId());
          sendLanguageToIframe(result.language);
        }, 0);
      });
  });

  // Add "transition: transform 0.3s, opacity 0.3s;" to the block after timeout
  // Otherwise, the block will be visible on page load
  setTimeout(() => {
    block.style.transition = 'transform 0.3s, opacity 0.3s, height 0.5s';
  }, 300);

  // Create a MutationObserver instance
  let observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.removedNodes) {
        setTimeout(() => {
          addSummarizeBlock();
        }, 0);
        setTimeout(() => {
          addSummarizeBlock();
        }, 50);
      }
    });
  });

  // Options for the observer (which mutations to observe)
  let config = { childList: true };

  // Start observing the target node for configured mutations
  observer.observe(summarizeBlock, config);

  waitForElement('#columns #secondary', true).then((secondary: any) => {
    const fixedSecondary = (secondary as HTMLElement).querySelector(
      '#fixed-secondary'
    );
    const secondaryInner = (secondary as HTMLElement).querySelector(
      '#secondary-inner'
    );

    // fixed sidebar update (Feb 2024)
    if (fixedSecondary && secondaryInner) {
      secondaryInner.prepend(block);
    } else {
      secondary.prepend(block);
    }

    block.id = 'jarvis-block-embedded';
    embedModeManager.setEmbedMode('embedded');
  });

  waitForElement('#fixed-columns-secondary #secondary', true).then(
    (secondary: any) => {
      const fixedSecondary = (secondary as HTMLElement).querySelector(
        '#fixed-secondary'
      );
      const secondaryInner = (secondary as HTMLElement).querySelector(
        '#secondary-inner'
      );

      // Jun 2024
      if (fixedSecondary && secondaryInner) {
        secondary.prepend(block);
      }

      block.id = 'jarvis-block-embedded';
      embedModeManager.setEmbedMode('embedded');
    }
  );
};

const showSummarizeBlock = () => {
  if (summarizeBlock) {
    summarizeBlock.classList.add('jarvis-visible');
  }
};

const hideSummarizeBlock = () => {
  if (summarizeBlock) {
    summarizeBlock.classList.remove('jarvis-visible');
  }
};

export {
  addSummarizeBlock,
  subscribeToMessages,
  sendVideoIdToIframe,
  getVideoId,
  showSummarizeBlock,
  embedModeManager,
};
