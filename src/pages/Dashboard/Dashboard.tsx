import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { DashboardHeader, LeftPanel, Widget } from './components';

import { WidgetType } from 'types/widget.types';
import { GameScoreSubmitOnChoice } from './widgets/SubmitGameScore';
import { NftDashboard } from './widgets/NftDashboard';
import styles from './dashboard.styles';

import {
  Transactions,
  Top10Scoreboard,
  MarketAnalysis
} from './widgets';

const widgetsBySection: Record<string, WidgetType[]> = {
  scoreboard: [
    { title: 'top 10 scoreboard', widget: Top10Scoreboard, description: '', reference: '' }
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
  ]
};

export const Dashboard = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('scoreboard');

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
