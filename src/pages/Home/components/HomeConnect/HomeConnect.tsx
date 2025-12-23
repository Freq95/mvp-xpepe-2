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
import { useHandleThemeManagement } from 'hooks/useHandleThemeManagement';
import { ConnectCard, ExtensionConnect, ExtensionConnect2 } from './components';

// prettier-ignore
const styles = {
  howToConnectContainer: 'how-to-connect-container flex flex-col items-center w-full justify-center gap-16 lg:gap-20 px-2 lg:px-6 pb-2 lg:pb-6 pt-20 lg:pt-32 bg-primary rounded-4xl transition-all duration-200 ease-out',
  howToConnectHeader: 'how-to-connect-header flex flex-col gap-4 items-center justify-center',
  howToConnectTitle: 'how-to-connect-title text-primary text-center text-4xl xxs:text-5xl xs:text-6xl font-medium leading-[1] tracking-[-1.92px] transition-all duration-200 ease-out',
  howToConnectDescription: 'how-to-connect-description text-secondary text-s leading-[1.5] tracking-[-0.21px] transition-all duration-200 ease-out',
  howToConnectContent: 'how-to-connect-content flex flex-col gap-6 items-center justify-center w-full',
  howToConnectContentCards: 'how-to-connect-content-cards grid grid-cols-1 items-stretch justify-center lg:grid-cols-3 gap-2 lg:gap-6',
  roadmapSection: 'roadmap-section flex flex-col items-center justify-center w-full max-w-full gap-6 lg:gap-8',
  roadmapTitle: 'roadmap-title text-primary text-center text-3xl lg:text-4xl font-medium leading-[1] tracking-[-0.96px] transition-all duration-200 ease-out',
  roadmapImageContainer: 'roadmap-image-container relative flex flex-col items-center justify-center w-full max-w-full overflow-hidden md:overflow-x-auto overflow-y-hidden rounded-2xl bg-secondary p-2 sm:p-4 md:p-6 lg:p-8 gap-1',
  roadmapImage: 'roadmap-image w-full h-auto max-w-full object-contain transition-all duration-200 ease-out max-w-[90vw] sm:max-w-full',
  roadmapOverlay: 'roadmap-overlay absolute inset-0 flex items-center justify-center',
  roadmapPhase: 'roadmap-phase absolute flex flex-col items-start gap-1 sm:gap-2',
  roadmapPhaseNumber: 'roadmap-phase-number text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-none transition-all duration-200 ease-out',
  roadmapTimeline: 'roadmap-timeline text-xs sm:text-sm md:text-base font-semibold transition-all duration-200 ease-out',
  roadmapFeatures: 'roadmap-features flex flex-col gap-0.5 sm:gap-1 text-[10px] sm:text-xs md:text-sm font-normal leading-tight transition-all duration-200 ease-out',
  roadmapSpacer: 'roadmap-spacer w-full flex-shrink-0 pointer-events-none h-[180px] sm:h-[160px] md:h-[140px] lg:h-[120px]'
} satisfies Record<string, string>;

export const HomeConnect = () => {
  const walletAddress = getNetworkConfig().network.walletAddress;
  const { activeTheme } = useHandleThemeManagement();

  const detectedBrowser = getDetectedBrowser();
  const isFirefox = detectedBrowser === BrowserEnum.Firefox;

  const connectCards = [
    {
      icon: Chart,
      title: 'charts and memes',
      description:
        'numbers lie, memes don’t',
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

        <div className={styles.roadmapSection}>
          <div className={styles.roadmapImageContainer}>
            <h2 className={styles.roadmapTitle}>roadmap</h2>
            <div style={{ width: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <img
                src="/roadmap.svg"
                alt="xPEPE Roadmap"
                className={styles.roadmapImage}
                style={{
                  filter: activeTheme?.identifier === 'mvx:dark-theme'
                    ? 'brightness(1.1) contrast(1.05)'
                    : activeTheme?.identifier === 'mvx:vibe-theme'
                    ? 'brightness(1.05) contrast(1.1)'
                    : activeTheme?.identifier === 'mvx:light-theme'
                    ? 'brightness(0.95) contrast(1.15)'
                    : 'none',
                  width: '100%',
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>
            {/* Spacer to ensure container is tall enough for absolutely positioned content below image */}
            <div className={styles.roadmapSpacer} />
            
            {/* Phase 01 - Q4 2025 */}
            <div
              className={styles.roadmapPhase}
              style={{
                left: 'clamp(4%, 6%, 8%)',
                top: 'clamp(45%, 55%, 68%)',
                width: 'clamp(18%, 20%, 22%)',
                maxWidth: '220px',
                marginLeft: 'clamp(20px, 8vw, 115px)',
                marginTop: 'clamp(-5px, 0vh, 20px)'
              }}
            >
              <div
                className={styles.roadmapTimeline}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#666666' : '#FFFFFF'
                }}
              >
                Q4 2025
              </div>
              <div
                className={styles.roadmapFeatures}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#333333' : '#E0E0E0',
                  marginTop: '4px'
                }}
              >
                <div>dApp release</div>
                <div>off-chain gameplay</div>
                <div>revamped website</div>
              </div>
            </div>

            {/* Phase 02 - Q4 2025 */}
            <div
              className={styles.roadmapPhase}
              style={{
                left: 'clamp(24%, 26%, 28%)',
                top: 'clamp(45%, 55%, 68%)',
                width: 'clamp(18%, 20%, 22%)',
                maxWidth: '220px',
                marginLeft: 'clamp(25px, 8.5vw, 125px)',
                marginTop: 'clamp(-5px, 0vh, 20px)'
              }}
            >
              <div
                className={styles.roadmapTimeline}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#666666' : '#FFFFFF'
                }}
              >
                Q1 2026
              </div>
              <div
                className={styles.roadmapFeatures}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#333333' : '#E0E0E0',
                  marginTop: '4px'
                }}
              >
                <div>supernova-ready upgrade</div>
                <div>on-chain gameplay</div>
                <div>seasons enabled</div>
                <div>community rewards</div>
              </div>
            </div>

            {/* Phase 03 - Q1 2026 */}
            <div
              className={styles.roadmapPhase}
              style={{
                left: 'clamp(44%, 46%, 48%)',
                top: 'clamp(45%, 55%, 68%)',
                width: 'clamp(18%, 20%, 22%)',
                maxWidth: '220px',
                marginLeft: 'clamp(30px, 10vw, 145px)',
                marginTop: 'clamp(-5px, 0vh, 20px)'
              }}
            >
              <div
                className={styles.roadmapTimeline}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#666666' : '#FFFFFF'
                }}
              >
                Q2 2026
              </div>
              <div
                className={styles.roadmapFeatures}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#333333' : '#E0E0E0',
                  marginTop: '4px'
                }}
              >
                <div>NFT launch</div>
                <div>more rewards</div>
                <div>more fun</div>
                <div>expanded gameplay</div>
              </div>
            </div>

            {/* Phase 04 - Q2 2026 */}
            <div
              className={styles.roadmapPhase}
              style={{
                left: 'clamp(64%, 66%, 68%)',
                top: 'clamp(45%, 55%, 68%)',
                width: 'clamp(18%, 20%, 22%)',
                maxWidth: '220px',
                marginLeft: 'clamp(35px, 10.5vw, 155px)',
                marginTop: 'clamp(-5px, 0vh, 20px)'
              }}
            >
              <div
                className={styles.roadmapTimeline}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#666666' : '#FFFFFF'
                }}
              >
                Q3 2026
              </div>
              <div
                className={styles.roadmapFeatures}
                style={{
                  color: activeTheme?.identifier === 'mvx:light-theme' ? '#333333' : '#E0E0E0',
                  marginTop: '4px'
                }}
              >
                <div>game add-ons</div>
                <div>new dApp features</div>
              </div>
            </div>
          </div>
        </div>

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
