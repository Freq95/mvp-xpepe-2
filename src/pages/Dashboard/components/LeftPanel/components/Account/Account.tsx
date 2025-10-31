import {
  faChevronUp,
  faLayerGroup,
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ReactNode, useState, useEffect } from 'react';
import axios from 'axios';

import { ReactComponent as XLogo } from 'assets/img/x-logo.svg';
import { Label } from 'components';
import { FormatAmount, MvxTrim, useGetAccount, useGetNetworkConfig } from 'lib';
import { DataTestIdsEnum } from 'localConstants';

import { Username } from './components';
import { useGetUserHerotag } from './hooks/useGetUserHerotag';
import styles from './account.styles';

interface AccountDetailsType {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export const Account = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [xpepeBalance, setXpepeBalance] = useState<string | null>(null);
  const [paymentTokenId, setPaymentTokenId] = useState<string | null>(null);

  const { address, balance, shard } = useGetAccount();
  const { network } = useGetNetworkConfig();
  const { herotag, profileUrl } = useGetUserHerotag();

  // Fetch payment token and xPEPE balance
  useEffect(() => {
    if (!address || !network) return;

    const fetchPaymentTokenAndBalance = async () => {
      try {
        // Get payment token from SC
        const { contractAddressScoreBoard } = await import('config');
        const scoreboardAbi = await import('contracts/scoreboard.abi.json');
        const { AbiRegistry, Address, ProxyNetworkProvider, SmartContractController } = await import('lib');
        
        const proxy = new ProxyNetworkProvider(network.apiAddress);
        const abi = AbiRegistry.create(scoreboardAbi.default || scoreboardAbi);
        const scController = new SmartContractController({
          chainID: network.chainId,
          networkProvider: proxy,
          abi
        });

        const [paymentTokenValue] = await scController.query({
          contract: new Address(contractAddressScoreBoard),
          function: 'getPaymentToken',
          arguments: []
        });
        const tokenId = String(paymentTokenValue?.valueOf?.() ?? '');
        setPaymentTokenId(tokenId);

        // Get xPEPE token balance
        try {
          const accountResponse = await axios.get(`${network.apiAddress}/accounts/${address}/tokens/${tokenId}`);
          const tokenBalance = accountResponse.data?.balance || '0';
          setXpepeBalance(tokenBalance);
        } catch (tokenError) {
          // If token not found or error, assume 0 balance
          setXpepeBalance('0');
        }
      } catch (error) {
        console.error('Failed to fetch payment token or balance:', error);
        setXpepeBalance('0');
      }
    };

    fetchPaymentTokenAndBalance();
  }, [address, network]);

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const img = profileUrl && (
    <img src={profileUrl} className={styles.connectedAccountDetailsHerotag} />
  );

  const accountDetails: AccountDetailsType[] = [
    {
      icon: (
        <FontAwesomeIcon
          icon={faWallet}
          className={styles.connectedAccountDetailsIcon}
        />
      ),
      label: 'address',
      value: (
        <MvxTrim
          dataTestId='accountAddress'
          text={address}
          className={styles.connectedAccountDetailsTrimAddress}
        />
      )
    },
    {
      icon: herotag ? img || herotag.slice(0, 3) : '@',
      label: 'herotag',
      value: <Username />
    },
    {
      icon: (
        <FontAwesomeIcon
          icon={faLayerGroup}
          className={styles.connectedAccountDetailsIcon}
        />
      ),
      label: 'shard',
      value: <span data-testid={DataTestIdsEnum.addressShard}>{shard}</span>
    },
    {
      icon: <XLogo className={styles.connectedAccountDetailsXLogo} />,
      label: 'balance',
      value: (
        <FormatAmount
          value={balance}
          data-testid='balance'
          decimalClass='opacity-70'
          labelClass='opacity-70'
          showLabel={true}
        />
      )
    },
    ...(xpepeBalance !== null ? [{
      icon: <XLogo className={styles.connectedAccountDetailsXLogo} />,
      label: 'xpepe balance',
      value: (() => {
        try {
          const balanceValue = Number(xpepeBalance) / 1e18;
          
          let formatted: string;
          if (balanceValue >= 1000000000) {
            // Billions
            formatted = (balanceValue / 1000000000).toFixed(2) + 'B';
          } else if (balanceValue >= 1000000) {
            // Millions
            formatted = (balanceValue / 1000000).toFixed(2) + 'M';
          } else if (balanceValue >= 1000) {
            // Thousands
            formatted = (balanceValue / 1000).toFixed(2) + 'K';
          } else {
            // Less than 1000
            formatted = balanceValue.toFixed(2);
          }
          
          return <span data-testid='xpepeBalance'>{formatted} xPEPE</span>;
        } catch {
          return <span data-testid='xpepeBalance'>0 xPEPE</span>;
        }
      })()
    }] : [])
  ];

  return (
    <div className={styles.connectedAccountContainer}>
      <div className={styles.connectedAccountHeader}>
        <h2 className={styles.connectedAccountHeaderTitle}>
          connected account details
        </h2>

        <FontAwesomeIcon
          icon={faChevronUp}
          onClick={toggleCollapse}
          className={classNames(styles.connectedAccountHeaderIcon, {
            [styles.connectedAccountHeaderIconRotated]: isCollapsed
          })}
        />
      </div>

      <div
        data-testid='topInfo'
        className={classNames(styles.connectedAccountDetails, {
          [styles.connectedAccountDetailsHidden]: isCollapsed
        })}
      >
        {accountDetails.map((accountDetail, index) => (
          <div key={index} className={styles.connectedAccountInfo}>
            <div className={styles.connectedAccountInfoIcon}>
              {accountDetail.icon}
            </div>

            <div className={styles.connectedAccountInfoText}>
              <Label>{accountDetail.label}</Label>

              <span className={styles.connectedAccountInfoTextValue}>
                {accountDetail.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
