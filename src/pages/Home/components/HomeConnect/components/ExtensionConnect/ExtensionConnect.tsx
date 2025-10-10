import { faArrowRightLong } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FunctionComponent, SVGProps, useState } from 'react';

import { useHandleThemeManagement } from 'hooks';

import { ReactComponent as Chart } from 'assets/img/pie-chart-54.svg';
import { ReactComponent as ArcLogo } from 'assets/img/arc-logo.svg';
import { ReactComponent as BraveLogo } from 'assets/img/brave-logo.svg';
import { ReactComponent as ChromeLogo } from 'assets/img/chrome-logo.svg';
import { ReactComponent as Circles } from 'assets/img/circles.svg';
import extensionImage from 'assets/img/extension-image.png';
import { ReactComponent as FirefoxLogo } from 'assets/img/firefox-logo.svg';
import { ReactComponent as WalletBraveLogo } from 'assets/img/wallet-brave-logo.svg';
import { ReactComponent as WalletChromeLogo } from 'assets/img/wallet-chrome-logo.svg';
import { ReactComponent as WalletFirefoxLogo } from 'assets/img/wallet-firefox-logo.svg';
import { ReactComponent as WalletIcon } from 'assets/img/web-wallet-icon.svg';
import { CHROME_EXTENSION_LINK, FIREFOX_ADDON_LINK } from 'localConstants';
import { BrowserEnum, getDetectedBrowser } from 'lib';

import { BrowserFrame } from './components';
import styles from './extensionConnect.styles';

// Recharts imports
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BrowserLogo {
  icon: FunctionComponent<SVGProps<SVGSVGElement>>;
}

const browserLogos: BrowserLogo[] = [
  { icon: ChromeLogo },
  { icon: FirefoxLogo },
  { icon: ArcLogo },
  { icon: BraveLogo }
];

const getBrowserIcon = (browser?: BrowserEnum) => {
  switch (browser) {
    case BrowserEnum.Firefox:
      return <WalletFirefoxLogo />;
    case BrowserEnum.Brave:
      return <WalletBraveLogo />;
    case BrowserEnum.Chrome:
      return <WalletChromeLogo />;
    default:
      return <WalletIcon />;
  }
};

export const ExtensionConnect = () => {
  const detectedBrowser = getDetectedBrowser();
  const isFirefox = detectedBrowser === BrowserEnum.Firefox;
  const icon = getBrowserIcon(detectedBrowser);

  return (
    <div className={styles.extensionCardContainer}>
      <div className={styles.extensionCardContent}>
        {/* <WalletIcon/> */}

        <div className={styles.extensionCardText}>
          <h2 className={styles.extensionCardTitle}>
            meet xPEPE
          </h2>

          <p className={styles.extensionCardDescription}>
            he comes to multiversx to bring hopium and fun, welcoming a billion frens who will join the network!
          </p>
        </div>

        <div className={styles.extensionCardDownloadSection}>
          <a
            href={'https://xexchange.com/trade?firstToken=XPEPE-0fd22a&secondToken=EGLD'}
            target="_blank"
            className={styles.extensionCardLink}
          >
            <span className={styles.extensionCardLinkTitle}>buy xPEPE</span>
            <FontAwesomeIcon icon={faArrowRightLong} />
          </a>
        </div>
      </div>

      <div className={styles.extensionCardImage}>
        {/* <Circles className={styles.extensionCardCircles} /> */}
        {/* <BrowserFrame /> */}
        <img src={extensionImage} style={{ width: '80%', height: 'auto' }} />
      </div>
    </div>
  );
};

const data = [
  { name: 'Public Sale', value: 42.5 },
  { name: 'Liquidity Pool', value: 42.5 },
  { name: 'Team', value: 7.5 },
  { name: 'Marketing', value: 7.5 }
];

const COLORS = ['#74E1D4', '#1DD2BC', '#18A998', '#107367'];

export const ExtensionConnect2 = () => {
  const { activeTheme } = useHandleThemeManagement();

  const detectedBrowser = getDetectedBrowser();
  const icon = getBrowserIcon(detectedBrowser);
  const [activeIndex, setActiveIndex] = useState(-1);

  return (
    <div className={styles.extensionCardContainer}>
      <div className={styles.extensionCardContent}>
        {/* <Chart/> */}

        <div className={styles.extensionCardText}>
          <h2 className={styles.extensionCardTitle}>
            xPEPEnomiks
          </h2>

          <p className={styles.extensionCardDescription}>
            <p>total supply - 8 billions</p> 
            <p>ticker - XPEPE-0fd22a</p> 
          </p>
        </div>

        <div className={styles.extensionCardDownloadSection}>
          <a
            href={'https://explorer.multiversx.com/tokens/XPEPE-0fd22a'}
            target="_blank"
            className={styles.extensionCardLink}
          >
            <span className={styles.extensionCardLinkTitle}>xPEPE explorer</span>
            <FontAwesomeIcon icon={faArrowRightLong} />
          </a>
        </div>
      </div>

      <div className={styles.extensionCardImage}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '20%',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            height: '400px',
            zIndex: 2
          }}>
          {/* Glow background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(0,245,255,0.15), transparent 70%)',
            filter: 'blur(40px)',
            animation: 'pulse 3s ease-in-out infinite'
          }} />
          
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="25%"
                outerRadius="80%"
                paddingAngle={3}
                isAnimationActive={true}
                animationBegin={0}
                animationDuration={1500}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index]}
                    stroke="none"
                    style={{
                      filter: activeIndex === index 
                        ? `drop-shadow(0 0 12px ${COLORS[index]})` 
                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                      transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '10%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '200px',
          zIndex: 3
        }}>
          {data.map((entry, index) => (
            <div key={entry.name}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: activeTheme?.identifier === 'mvx:light-theme' ? 'rgba(233, 233, 233, 0.6)' 
                  : activeTheme?.identifier === 'mvx:dark-theme' ? 'rgba(20, 20, 20, 0.6)'
                  : 'rgba(0, 75, 62, 0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: '8px',
                padding: '6px 10px',
                cursor: 'pointer',
                transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
                border: activeIndex === index ? `2px solid ${COLORS[index]}` : '2px solid transparent'
              }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: COLORS[index],
                boxShadow: `0 0 8px ${COLORS[index]}80`
              }} />
              <span style={{ 
                color: activeTheme?.identifier === 'mvx:light-theme' ? '#202020ff' : '#d1d5db', 
                fontSize: '11px', 
                fontWeight: 500, 
                flex: 1 
              }}>
                {entry.name}
              </span>
              <span style={{ 
                color: activeTheme?.identifier === 'mvx:light-theme' ? '#202020ff' : '#d1d5db', 
                fontSize: '11px', 
                fontWeight: 700 
              }}>
                {entry.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};