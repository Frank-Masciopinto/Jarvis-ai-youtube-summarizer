import { IS_SAFARI } from '../env';
import { reinstallButtons, summaryReadyManager } from './add-button';
import {
  addSummarizeBlock,
  subscribeToMessages,
  sendVideoIdToIframe,
  getVideoId,
} from './sidebar';

// Clickbait score is turned off for now
// To enable it, uncomment the line below and change isClickbaitScoreFeatureEnabled default value to true in ClickbaitChecker
// import './clickbait-score';

const styling = `
    .jarvis-summarize-button {
        color: white;
        background-color: rgba(251, 101, 30, 1);
        transition: background-color 0.2s;
        padding: 0 15px;
    }
    .jarvis-preparing .jarvis-summarize-button {
        color: #FB651E;
        background-color: #FFEAE0;
    }
    .jarvis-btn-ready,
    .jarvis-btn-preparing {
        display: none;
        align-items: center;
    }
    .jarvis-btn-idle {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .jarvis-btn-idle svg,
    .jarvis-btn-ready svg {
        margin-right: 6px;
    }
    .jarvis-round-loader {
        margin-right: 6px;
        margin-left: 4px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid #FB651E;
        border-top-color: #FFEAE0;
        animation: jarvis-round-loader-spin 1s ease-in-out infinite;
    }
    @keyframes jarvis-round-loader-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    .jarvis-preparing .jarvis-btn-preparing {
        display: flex;
    }
    .jarvis-ready .jarvis-btn-ready {
        display: flex;
    }
    .jarvis-preparing .jarvis-btn-idle,
    .jarvis-ready .jarvis-btn-idle {
        display: none;
    }
    .jarvis-summarize-button:hover {
        background-color: rgba(251, 101, 30, 0.8);
    }
    .jarvis-btn-ready {
        margin: 0 10px 0 9px;
    }
    #columns #secondary {
        display: flex;
        flex-direction: column;
    }
    #jarvis-block-embedded {
        width: 100%;
        height: 52px;
        margin-bottom: 8px;
        order: -1;
    }
    #jarvis-block-overlay {
        height: 100%;
        width: 427px;
        z-index: 6999;
        position: fixed;
        margin-bottom: 8px;
        right: 0;
        top: 0;
        box-shadow: -8px 0px 24px rgba(0, 0, 0, 0.12);
        background-color: white;
        opacity: 0;
        transform: translateX(100%);
    }
    #jarvis-block-overlay.jarvis-visible {
        transform: translateX(0);
        opacity: 1;
    }
    #jarvis-block-overlay.jarvis-visible #jarvis-close {
        display: flex;
    }
    #jarvis-iframe {
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 20px;
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: block;
    }
    #jarvis-iframe.jarvis-theme-dark {
      border: 1px solid rgba(255, 255, 255, 0.16);
    }
    #jarvis-close {
      display: none;
      position: absolute;
      top: 9px;
      right: 8px;
      left: -58px;
      width: 44px;
      height: 44px;
      cursor: pointer;
      background: #FFFFFF;
      box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.12);
      border-radius: 48px;
      font-size: 18px;
      color: rgba(0, 0, 0, 0.64);
      justify-content: center;
      align-items: center;
    }
    #jarvis-close:hover {
        color: rgba(0, 0, 0, 0.8);
    }`;

// Init everything
reinstallButtons();
subscribeToMessages();
addSummarizeBlock();

setInterval(() => {
  reinstallButtons();
}, 1500);

// Add css to the document
const style = document.createElement('style');
style.innerHTML = styling;
document.head.appendChild(style);

// Reinstalling buttons on navigation
const events = ['yt-navigate', 'yt-navigate-finish'];
for (const event of events) {
  window.addEventListener(event, () => {
    reinstallButtons();
  });
}

let sentVideoId: string | null = null;

const sendVideoIdTojarvisIframe = (force: boolean = false) => {
  const videoId = getVideoId();
  if (sentVideoId !== videoId) {
    sendVideoIdToIframe(videoId);
    // Check this, because it's initial sent if it's null or ''
    if (sentVideoId) {
      summaryReadyManager.setSummaryReady(false);
    }
    sentVideoId = videoId;
  }
};

// Observe element <ytd-app> for changes, and on change send videoId to iframe
// It's more reliable than waiting for yt-navigate-finish
const app = document.querySelector('ytd-app');
if (!app) {
  console.error('ytd-app not found');
} else {
  const observer = new MutationObserver(() => {
    sendVideoIdTojarvisIframe();
  });
  observer.observe(app as Node, {
    childList: true,
    subtree: true,
  });
}

if (IS_SAFARI) {
  chrome.storage.sync.set({
    is_safari: 'true',
  });

  setInterval(() => {
    sendVideoIdTojarvisIframe(true);
  }, 1000);
}

export {};
