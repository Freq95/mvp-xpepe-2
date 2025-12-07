import classNames from 'classnames';
import { useEffect, useState, useRef } from 'react';
import { DashboardHeader, LeftPanel, Widget } from './components';

import { WidgetType } from 'types/widget.types';
import { GameScoreSubmitOnChoice } from './widgets/SubmitGameScore';
import { NftDashboard } from './widgets/NftDashboard';
import styles from './dashboard.styles';
import { useGetAccount, useGetLoginInfo } from 'lib';
import { useRecordUserConnection } from 'hooks/analytics';

import {
  Transactions,
  MarketAnalysis,
  GameAnalytics
} from './widgets';

const widgetsBySection: Record<string, WidgetType[]> = {
  scoreboard: [
    { title: 'top players', widget: GameAnalytics, description: '', reference: '' }
  ],
  xpepe: [
    { title: 'xPEPE game', widget: GameScoreSubmitOnChoice, description: '', reference: '' }
  ],
  nfts: [
    { title: 'NFT dashboard', widget: NftDashboard, description: '', reference: '' }
  ],
  transactions: [
    { title: 'wallet transactions', widget: (props) => <Transactions identifier='transactions-ping-pong' {...props} />, description: '', reference: '' }
  ],
  market: [
    { title: 'market analysis', widget: MarketAnalysis, description: '', reference: '' }
  ],
};

export const Dashboard = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('xpepe');
  const { address } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const { recordConnection } = useRecordUserConnection();
  const hasRecordedConnection = useRef(false);

  // Track user connection when they log in
  useEffect(() => {
    if (isLoggedIn && address && !hasRecordedConnection.current) {
      recordConnection(address);
      hasRecordedConnection.current = true;
    }
    // Reset when user logs out
    if (!isLoggedIn) {
      hasRecordedConnection.current = false;
    }
  }, [isLoggedIn, address, recordConnection]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className={styles.dashboardContainer}>
      <div
        className={classNames(
          styles.mobilePanelContainer,
          styles.desktopPanelContainer
        )}
      >
        <LeftPanel
          isOpen={isMobilePanelOpen}
          setIsOpen={setIsMobilePanelOpen}
          onSectionChange={handleSectionChange}
        />
      </div>

      <div
        className={classNames(styles.dashboardContent, {
          [styles.dashboardContentMobilePanelOpen]: isMobilePanelOpen
        })}
        style={{
          backgroundImage: 'url(src/assets/img/background.svg)',
          justifyContent: 'flex-start'
        }}
      >
        <DashboardHeader />

        <div className={styles.dashboardWidgets} style={{ minHeight: '70vh' }}>
          {Object.entries(widgetsBySection).map(([section, widgets]) =>
            widgets.map((element) => (
              <div
                key={`${section}-${element.title}`}
                style={{
                  display: section === activeSection ? 'block' : 'none'
                }}
              >
                <Widget {...element} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
