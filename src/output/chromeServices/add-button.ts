import { Const } from '../const';
import { embedModeManager, getVideoId, showSummarizeBlock } from './sidebar';

const summarizeButtonHtml = `
  <button class="jarvis-summarize-button yt-spec-button-shape-next yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m yt-spec-button-shape-next--icon-leading" aria-label="Summarize">
    <div class="jarvis-btn-idle">
        <svg class="jarvis-eyes" width="20" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M0.969401 13.3454C0.187664 11.064 0.0949427 8.9334 0.691238 6.95367C1.28753 4.97394 2.60418 3.63509 4.64118 2.93711C6.00597 2.46946 7.28251 2.44176 8.4708 2.85401C9.67947 3.25928 10.7242 4.01661 11.6051 5.12599C11.7412 2.66664 12.8888 1.06704 15.048 0.327178C16.8202 -0.280064 18.4837 -0.0420254 20.0385 1.04129C21.6137 2.11763 22.7433 3.65393 23.4273 5.65019C24.1253 7.68719 24.1855 9.58993 23.6078 11.3584C23.0372 13.1473 21.8759 14.3418 20.1241 14.9421C18.0056 15.668 16.108 15.1119 14.4311 13.2737C14.3613 16.3249 13.0023 18.3042 10.3542 19.2116C8.27648 19.9235 6.39183 19.7044 4.70028 18.5541C3.00872 17.4038 1.7651 15.6676 0.969401 13.3454ZM4.0249 12.2985C4.43671 13.5003 5.10784 14.3629 6.03831 14.8862C6.96877 15.4096 8.02473 15.4689 9.20619 15.064C10.3876 14.6592 11.1752 13.9683 11.5688 12.9912C11.9623 12.0142 11.9567 10.9349 11.5519 9.75346C11.154 8.59237 10.4829 7.72978 9.53849 7.16568C8.61444 6.59461 7.56168 6.51148 6.38022 6.91631C5.62521 7.17502 5.02834 7.55615 4.58961 8.05971C4.67212 8.05265 4.75596 8.05211 4.84068 8.05852C5.80533 8.13141 6.52034 9.07701 6.4377 10.1706C6.35507 11.2641 5.50608 12.0915 4.54143 12.0186C4.3033 12.0006 4.08038 11.9295 3.88092 11.816C3.92132 11.9754 3.96932 12.1362 4.0249 12.2985ZM14.2207 8.87315C14.5696 9.89165 15.134 10.6087 15.9138 11.0244C16.7005 11.4604 17.5827 11.5109 18.5605 11.1759C19.4772 10.8618 20.109 10.2811 20.456 9.43386C20.8234 8.57961 20.836 7.65341 20.494 6.65529C20.152 5.65716 19.5842 4.92989 18.7905 4.47348C17.9967 4.01708 17.1212 3.9529 16.1638 4.28095C15.9814 4.34345 15.8102 4.41573 15.6502 4.49781C16.4866 4.63088 17.1422 5.43443 17.1661 6.42168C17.1926 7.51803 16.4301 8.42577 15.463 8.44917C14.847 8.46407 14.2966 8.11663 13.9712 7.57909C13.9866 8.00133 14.0697 8.43269 14.2207 8.87315Z" fill="white"></path>
        </svg>
        <span role="text">Summarize</span>
    </div>
    <div class="jarvis-btn-preparing">
        <div class="jarvis-round-loader"></div>
        <span role="text">Preparing</span>
    </div>
    <div class="jarvis-btn-ready">
        <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.6875 10.2657C0.6875 10.4168 0.739583 10.5444 0.84375 10.6485C0.947917 10.7475 1.08333 10.797 1.25 10.797H5.66406L3.33594 17.1251C3.25781 17.3282 3.24219 17.5027 3.28906 17.6485C3.34115 17.7944 3.42708 17.8985 3.54688 17.961C3.67188 18.0287 3.8099 18.0418 3.96094 18.0001C4.11719 17.9636 4.26042 17.8647 4.39063 17.7032L11.4922 8.82822C11.6276 8.65635 11.6953 8.48968 11.6953 8.32822C11.6953 8.17718 11.6432 8.05218 11.5391 7.95322C11.4349 7.84906 11.2995 7.79697 11.1328 7.79697L6.71875 7.79697L9.04688 1.46885C9.125 1.27093 9.13802 1.09906 9.08594 0.953223C9.03906 0.807389 8.95312 0.703223 8.82812 0.640723C8.70833 0.573014 8.57031 0.557389 8.41406 0.593848C8.26302 0.630306 8.1224 0.731868 7.99219 0.898535L0.890625 9.76572C0.755208 9.94281 0.6875 10.1095 0.6875 10.2657Z" fill="white"/>
        </svg>
        <span role="text">Summary</span>
    </div>
  </button>
`;

const summaryReadyManager = {
  summaryReady: false,

  setSummaryReady(isReady: boolean) {
    this.summaryReady = isReady;

    if (this.summaryReady) {
      // Find all summarizeButtons and add jarvis-ready class to them
      const summarizeButtons = document.querySelectorAll(
        '#jarvis-summarize-button'
      );

      // For each button change text to "Preparing" and then after short timeout to "> Summary"
      // Button is <button> element inside #jarvis-summarize-button
      summarizeButtons.forEach((summarizeButton) => {
        summarizeButton.classList.remove('jarvis-ready');
        summarizeButton.classList.add('jarvis-preparing');
        if (embedModeManager.getEmbedMode() == 'overlay') {
          setTimeout(() => {
            summarizeButton.classList.remove('jarvis-preparing');
            summarizeButton.classList.add('jarvis-ready');
          }, 3000);
        } else {
          summarizeButton.classList.remove('jarvis-preparing');
          summarizeButton.classList.add('jarvis-ready');
        }
      });
    } else {
      // Find all summarizeButtons and remove jarvis-ready class from them
      const summarizeButtons = document.querySelectorAll(
        '#jarvis-summarize-button'
      );
      summarizeButtons.forEach((summarizeButton) => {
        summarizeButton.classList.remove('jarvis-ready');
        summarizeButton.classList.remove('jarvis-preparing');
      });
    }
  },

  getSummaryReady() {
    return this.summaryReady;
  },
};

const findShareButton = (selector: string) => {
  // Find the SVG element with the specified path substring
  const svgPossibleSubstrings = ['M15,5.63L20.66', 'M15 5.63 20.66'];
  // Search for svg elements within selector
  const svgElements = document.querySelectorAll(`${selector} svg path`);

  let targetSvgElement;
  for (let i = 0; i < svgElements.length; i++) {
    const svgElement = svgElements[i];
    const d = svgElement.getAttribute('d');
    // Check if d attribute contains any of the possible substrings
    if (svgPossibleSubstrings.some((substring) => d?.includes(substring))) {
      targetSvgElement = svgElement;
      break;
    }
  }

  if (targetSvgElement) {
    // Find the closest button element
    const closestButton = targetSvgElement?.closest(
      'ytd-button-renderer, yt-button-renderer'
    );

    if (closestButton) {
      return closestButton;
    }
  }

  // 2024-01-24 - new interface
  const buttonViewElements = document.querySelectorAll(
    `${selector} yt-button-view-model`
  );

  const shareButtonViewElement = Array.from(buttonViewElements).find(
    (buttonViewElement) => {
      const shareButtonEl = buttonViewElement.querySelector(
        `button[title="Share"]`
      );

      return !!shareButtonEl;
    }
  );

  if (shareButtonViewElement) {
    return shareButtonViewElement;
  }

  return null;
};

const handleSummarizeClick = () => {
  // If summary is ready, just show it (also it can be partial, don't waste a credit)
  if (!summaryReadyManager.getSummaryReady()) {
    // Find #jarvis-iframe and send a message to it "summarize"
    const iframe = document.querySelector(
      Const.jarvisIframeSelector
    ) as HTMLIFrameElement;
    if (!iframe) {
      return;
    }
    iframe.contentWindow?.postMessage(
      {
        type: 'summarize',
      },
      '*'
    );
  }

  // Show summarize block
  showSummarizeBlock();
};

// Function that accepts querySelector waits until element is found in DOM and returns it
const waitForElement = (selector: string, onlyVideoPage: boolean = false) => {
  return new Promise((resolve) => {
    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element && (!onlyVideoPage || getVideoId())) {
        resolve(element);
        observer.disconnect();
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
};

const reinstallButtons = () => {
  const selectorsToInstall = [
    // '#bottom-actions #actions', do not add Summarize button in the new interface -- Feb 2024
    '#secondary-metadata #actions', // new interface -- most narrow
    '#secondary-inner #actions', // new interface -- Jun 2024
    '#primary #bottom #actions', // new interface -- middle
    '#metadata-side #actions', // new interface -- widest
    '#below #actions', // old interface
  ];

  for (const selector of selectorsToInstall) {
    const parentElement = document.querySelector(selector);

    if (!parentElement) {
      continue;
    }

    waitForElement(`${selector}`).then((ywm: any) => {
      addSummarizeButton(selector);

      const observer = new MutationObserver(() => {
        addSummarizeButton(selector);

        setTimeout(() => {
          addSummarizeButton(selector);
        }, 100);
      });

      observer.observe(ywm, {
        childList: true,
        subtree: true,
      });
    });
  }
};

const addSummarizeButton = (selector: string) => {
  const parentElement = document.querySelector(selector) as HTMLElement;

  if (parentElement) {
    // Check if the button already exists
    if (parentElement.querySelector('#jarvis-summarize-button')) {
      return true;
    }

    // Find share button withing selector
    const shareButton = findShareButton(selector) as HTMLElement;
    if (!shareButton) {
      return false;
    }

    const summarizeButton = document.createElement('div');
    summarizeButton.id = 'jarvis-summarize-button';
    summarizeButton.classList.add('item');
    summarizeButton.style.marginLeft = '8px';
    summarizeButton.style.marginRight = '8px';
    summarizeButton.innerHTML = summarizeButtonHtml;

    if (summaryReadyManager.getSummaryReady()) {
      summarizeButton.classList.add('jarvis-ready');
    }

    shareButton.before(summarizeButton);

    // Add 1px padding to the right of id=actions element
    // It forces Youtube to rerender "..." button (bug workaround)
    parentElement.style.paddingRight = '1px';

    // Remove text from the share button (to fit it all)
    // <span class="yt-core-attributed-string yt-core-attributed-string--white-space-no-wrap" role="text">Share</span>
    // It's relevant only for old interface
    const shareButtonSpan = shareButton.querySelector('span[role="text"]');
    if (shareButtonSpan) {
      shareButtonSpan.innerHTML = '';
      // Find <button> inside and make padding-right 5px
      const shareButtonInner = shareButton.querySelector('button');
      if (shareButtonInner) {
        shareButtonInner.style.paddingRight = '5px';
      }
    }

    // Create a MutationObserver instance
    let observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          Array.from(mutation.removedNodes).some(
            (node) => node === summarizeButton
          )
        ) {
          setTimeout(() => {
            addSummarizeButton(selector);
          }, 0);
          setTimeout(() => {
            addSummarizeButton(selector);
          }, 50);
        }
      });
    });

    // Options for the observer (which mutations to observe)
    let config = { childList: true };

    // Start observing the target node for configured mutations
    observer.observe(summarizeButton.parentElement!, config);

    summarizeButton.addEventListener('click', handleSummarizeClick);
    return true;
  }
};

export { reinstallButtons, summaryReadyManager, waitForElement };
