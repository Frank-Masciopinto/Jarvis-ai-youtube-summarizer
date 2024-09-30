import './SubscriptionPage.css';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import ENV from '../../env';
import { onSignIn } from '../../auth';

import infinity from '../../images/infinity.svg';
import earth from '../../images/earth.svg';
import gift from '../../images/gift.svg';
import clock from '../../images/clock.svg';
import TabLink from '../../components/TabLink/TabLink';
import { ProfileContext } from '../../contexts/ProfileContext';
import { _ } from '../../localization';

interface Price {
  lookup_key: string;
  amount: number;
  price_id: string;
  name: 'Annual' | 'Monthly';
  price: number;
}

function formatDate(value: string) {
  const date = new Date(value);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthIndex = date.getMonth();
  const month = months[monthIndex];
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

function currentPriceLocalizedName(name: string) {
  switch (name) {
    case 'Annual':
      return _('annualSubscriptionName');
    case 'Monthly':
      return _('monthlySubscriptionName');
    default:
      return name;
  }
}

function SubscriptionPage() {
  const { profile } = useContext(ProfileContext);
  let [isLoading, setIsLoading] = useState(true);

  const [prices, setPrices] = useState<Price[] | null>(null);

  const subscription = useMemo(
    () => (profile ? profile.activeSubscription : null),
    [profile]
  );
  const currentPrice = useMemo(
    () =>
      prices && subscription
        ? prices.find((price) => price.name === subscription?.name)
        : null,
    [prices, subscription]
  );

  useEffect(() => {
    fetch(`${ENV.backendUrl}prices`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.status === 401) {
          onSignIn();
          return;
        }

        setPrices(r.prices);
      })
      .catch(() => {
        onSignIn();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const subscriptionTitle = useMemo(() => {
    if (!currentPrice || !subscription) {
      return null;
    }

    return _('planIsActive', currentPriceLocalizedName(currentPrice.name));
  }, [currentPrice, subscription]);

  const subscriptionDescription = useMemo(() => {
    if (!currentPrice || !subscription) {
      return null;
    }

    if (subscription?.cancelAt) {
      return _('activePlanDescription', formatDate(subscription.cancelAt));
    }

    return _('activePlanNextBillingDescription', [
      currentPrice.price.toFixed(2),
      formatDate(subscription.expiresAt),
    ]);
  }, [currentPrice, subscription]);

  return (
    <main className="container subscription-page">
      <header className="subscription-page__header">
        {!subscription && (
          <img
            width={137}
            height={32}
            alt="jarvis Logo"
            src={'../../images/icon128.png'}
          />
        )}
        {!!subscription && (
          <img
            width={176}
            height={32}
            alt="jarvis Logo Pro"
            src={'../../images/icon128.png'}
          />
        )}
      </header>

      <section className="subscription-page__content">
        <div>
          {isLoading && (
            <div className="subscription-page__loader-container">
              <div className="subscription-page__loader"></div>
            </div>
          )}

          {!isLoading && subscription && (
            <Fragment>
              {!!currentPrice && (
                <>
                  <h1 className="subscription-page__title">
                    {subscriptionTitle}
                  </h1>

                  <p className="subscription-page__description">
                    {subscriptionDescription}
                  </p>
                </>
              )}

              <ul className="subscription-page__perks-list">
                <li className="subscription-page__perk">
                  <div className="subscription-page__perk-icon">
                    <img src={infinity} alt="Infinity Icon" />
                  </div>
                  <span className="subscription-page__perk-text">
                    {_('subscriptionPerkUnlimitedSummaries')}
                  </span>
                </li>
                <li className="subscription-page__perk">
                  <div className="subscription-page__perk-icon">
                    <img src={clock} alt="Clock Icon" />
                  </div>
                  <span className="subscription-page__perk-text">
                    {_('subscriptionPerkAnyLengthVideo')}
                  </span>
                </li>
                <li className="subscription-page__perk">
                  <div className="subscription-page__perk-icon">
                    <img src={earth} alt="Earth Icon" />
                  </div>

                  <span className="subscription-page__perk-text">
                    {_('subscriptionPerkSummaryTranslations')}
                  </span>
                </li>
              </ul>

              <div className="subscription-page__actions">
                <TabLink
                  className="subscription-page__primary-button"
                  url="https://www.youtube.com"
                >
                  {_('subscriptionYoutubeLinkTitle')}
                </TabLink>
              </div>
            </Fragment>
          )}

          {!isLoading && !subscription && (
            <Fragment>
              <h1 className="subscription-page__title">
                {_('noActivePlanTitle')}
              </h1>

              <ul className="subscription-page__perks-list">
                <li className="subscription-page__perk">
                  <div className="subscription-page__perk-icon">
                    <img src={gift} alt="Gift Icon" />
                  </div>
                  <span className="subscription-page__perk-text">
                    {_('noActivePlanTermOneSummaryPerDay')}
                  </span>
                </li>
              </ul>

              <div className="subscription-page__actions">
                <TabLink
                  className="subscription-page__primary-button"
                  url={`${ENV.landingUrl}onboarding/offer`}
                >
                  {_('subscribeToPlanActionTitle')}
                </TabLink>
                <TabLink
                  className="subscription-page__secondary-button"
                  url="https://www.youtube.com"
                >
                  {_('subscriptionYoutubeLinkTitle')}
                </TabLink>
              </div>
            </Fragment>
          )}
        </div>
      </section>

      <footer className="subscription-page__footer">
        <a
          className="subscription-page__footer-link"
          href="mailto:support@jarvis.app"
        >
          {_('contactSupportActionTitle')}
        </a>
        {!!subscription && (
          <TabLink
            className="subscription-page__footer-link"
            url={subscription.customerPortalUrl}
          >
            {_('manageSubscriptionActionTitle')}
          </TabLink>
        )}
      </footer>
    </main>
  );
}

export default SubscriptionPage;
