// import { ReactComponent as PasskeyIcon } from 'assets/img/passkey-icon.svg';
import { ReactComponent as LedgerIcon } from 'assets/img/ledger-icon.svg';
import { ReactComponent as MetamaskIcon } from 'assets/img/metamask-icon.svg';
import { ReactComponent as WebWalletIcon } from 'assets/img/web-wallet-icon.svg';
import { ReactComponent as XPortalIcon } from 'assets/img/xportal-icon.svg';
import { ReactComponent as Fire } from 'assets/img/fire_54.svg';
import { ReactComponent as Chart } from 'assets/img/chart_54.svg';

import {
  CHROME_METAMASK_EXTENSION_LINK,
  FIREFOX_METAMASK_ADDON_LINK,
  GET_LEDGER,
  GET_XPORTAL
} from 'localConstants';
import { BrowserEnum, getDetectedBrowser, getNetworkConfig } from 'lib';
import { ConnectCard, ExtensionConnect, ExtensionConnect2 } from './components';

// prettier-ignore
const styles = {
  howToConnectContainer: 'how-to-connect-container flex flex-col items-center w-full justify-center gap-16 lg:gap-20 px-2 lg:px-6 pb-2 lg:pb-6 pt-20 lg:pt-32 bg-primary rounded-4xl transition-all duration-200 ease-out',
  howToConnectHeader: 'how-to-connect-header flex flex-col gap-4 items-center justify-center',
  howToConnectTitle: 'how-to-connect-title text-primary text-center text-4xl xxs:text-5xl xs:text-6xl font-medium leading-[1] tracking-[-1.92px] transition-all duration-200 ease-out',
  howToConnectDescription: 'how-to-connect-description text-secondary text-s leading-[1.5] tracking-[-0.21px] transition-all duration-200 ease-out',
  howToConnectContent: 'how-to-connect-content flex flex-col gap-6 items-center justify-center w-full',
  howToConnectContentCards: 'how-to-connect-content-cards grid grid-cols-1 items-stretch justify-center lg:grid-cols-3 gap-2 lg:gap-6'
} satisfies Record<string, string>;

export const HomeConnect = () => {
  const walletAddress = getNetworkConfig().network.walletAddress;

  const detectedBrowser = getDetectedBrowser();
  const isFirefox = detectedBrowser === BrowserEnum.Firefox;

  const connectCards = [
    {
      icon: Chart,
      title: 'charts and memes',
      description:
        'explore the evolution of memes on multiversx blockchain',
      linkTitle: 'xPEPE chart',
      linkDownloadAddress: 'https://e-compass.io/token/XPEPE-0fd22a'
    },
    {
      icon: Fire,
      title: 'liquidity pool burned',
      description:
        'the easiest way to build trust',
      linkTitle: 'proof of burn',
      linkDownloadAddress: 'https://explorer.multiversx.com/transactions/d6b8cc8503e626e929e08f2302de59a66f4afe6360888cd6fd2f40b5fb2f47ff'
    },
    {
      icon: Fire,
      title: '$xPEPE burned',
      description:
        '136 million $xPEPE burned forever',
      linkTitle: 'proof of burn',
      linkDownloadAddress: 'https://explorer.multiversx.com/transactions/edd94dbfa891903aceda954303dcc5b704d667f713b98c8ea915287281ee229c'
    },
    // {
    //   icon: WebWalletIcon,
    //   title: 'MultiversX Web Wallet',
    //   description:
    //     'Store, swap, and transfer tokens or NFTs. Connect to Web3 apps on MultiversX blockchain.',
    //   linkTitle: 'Get MultiversX Wallet',
    //   linkDownloadAddress: walletAddress
    // }
  ];

  return (
    <div className={styles.howToConnectContainer}>
      <div className={styles.howToConnectHeader}>
        <h1 className={styles.howToConnectTitle}>more about $xPEPE</h1>

        <p className={styles.howToConnectDescription}>
          there is no such thing as too much $xPEPE
        </p>
      </div>

      <div className={styles.howToConnectContent}>
        <ExtensionConnect />
        <ExtensionConnect2 />
        <div className={styles.howToConnectContentCards}>
          {connectCards.map((card, index) => (
            <ConnectCard
              key={index}
              icon={card.icon}
              title={card.title}
              description={card.description}
              linkTitle={card.linkTitle}
              linkDownloadAddress={card.linkDownloadAddress}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
