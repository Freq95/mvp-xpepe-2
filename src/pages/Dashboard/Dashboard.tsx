import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { DashboardHeader, LeftPanel, Widget } from './components';

import { contractAddress } from 'config';
import { WidgetType } from 'types/widget.types';
import { contractAddressScoreBoard } from 'config';
import DinoGameComponent from '../../components/Xpepe/Xpepe';
import { GameScoreSubmitOnChoice } from './widgets/SubmitGameScore';
import { NftDashboard } from './widgets/NftDashboard';
import styles from './dashboard.styles';

import {
  Account,
  BatchTransactions,
  NativeAuth,
  PingPongAbi,
  PingPongRaw,
  PingPongService,
  SignMessage,
  Transactions,
  Top10Scoreboard,
  MarketAnalysis
} from './widgets';

const dashboardWidgets: WidgetType[] = [
  // {
  //   title: 'Ping & Pong (Manual)',
  //   widget: PingPongRaw,
  //   description:
  //     'Smart Contract interactions using manually formulated transactions',
  //   reference:
  //     'https://docs.multiversx.com/sdk-and-tools/indices/es-index-transactions/'
  // },
  // {
  //   title: 'Ping & Pong (ABI)',
  //   widget: PingPongAbi,
  //   description:
  //     'Smart Contract interactions using the ABI generated transactions',
  //   reference:
  //     'https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-cookbook/#using-interaction-when-the-abi-is-available'
  // },
 
  // {
  //   title: 'Ping & Pong (Backend)',
  //   widget: PingPongService,
  //   description:
  //     'Smart Contract interactions using the backend generated transactions',
  //   reference: 'https://github.com/multiversx/mx-ping-pong-service'
  // },
  // {
  //   title: 'Sign message',
  //   widget: SignMessage,
  //   description: 'Message signing using the connected account',
  //   reference: 'https://docs.multiversx.com/sdk-and-tools/sdk-dapp/#account-1'
  // },
  // {
  //   title: 'Native auth',
  //   widget: NativeAuth,
  //   description:
  //     'A secure authentication token can be used to interact with the backend',
  //   reference: 'https://github.com/multiversx/mx-sdk-js-native-auth-server'
  // },
  // {
  //   title: 'Batch Transactions',
  //   widget: BatchTransactions,
  //   description:
  //     'For complex scenarios transactions can be sent in the desired group/sequence',
  //   reference:
  //     'https://github.com/multiversx/mx-sdk-dapp#sending-transactions-synchronously-in-batches'
  // },
  // {
  //   title: 'Transactions (All)',
  //   widget: () => <Transactions identifier='transactions-all' />,
  //   description: 'List transactions for the connected account',
  //   reference:
  //     'https://api.multiversx.com/#/accounts/AccountController_getAccountTransactions'
  // },
   {
    title: 'NFT dashboard',
    widget: NftDashboard,
    description: '',
    reference: 'https://api.multiversx.com/#/accounts/AccountController_getAccountNfts'
  },
  {
  title: 'xPEPE game',
  widget: GameScoreSubmitOnChoice,
  description: '',
  reference: 'https://docs.multiversx.com/developers/smart-contracts/'
  },
  {
    title: 'top 10 scoreboard',
    widget: Top10Scoreboard,
    description: '',
    reference: 'https://docs.multiversx.com/developers/smart-contracts/'
  },
  {
    title: 'wallet transactions',
    widget: (props) => (
      <Transactions identifier='transactions-ping-pong' {...props} />
    ),
    description: '',
    reference: 'https://youtube.com' // sau lasă gol
  },
  {
    title: 'market analysis',
    widget: MarketAnalysis,
    description: '',
    reference: 'https://docs.multiversx.com/developers/smart-contracts/'
  },
];

export const Dashboard = () => {
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

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
        />
      </div>

      <div
        style={{ backgroundImage: 'url(src/assets/img/background.svg)' }}
        className={classNames(styles.dashboardContent, {
          [styles.dashboardContentMobilePanelOpen]: isMobilePanelOpen
        })}
      >
        <DashboardHeader />

        <div className={styles.dashboardWidgets}>
          {dashboardWidgets.map((element) => (
            <Widget key={element.title} {...element} />
          ))}
        </div>
      </div>
    </div>
  );
};