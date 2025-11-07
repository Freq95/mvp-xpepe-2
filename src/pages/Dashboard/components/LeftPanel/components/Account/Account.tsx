import {
  faChevronUp,
  faLayerGroup,
  faWallet
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { ReactNode, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

import { ReactComponent as XLogo } from 'assets/img/x-logo.svg';
import { Label } from 'components';
import { FormatAmount, MvxTrim, useGetAccount, useGetNetworkConfig, getActiveTransactionsStatus } from 'lib';
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

  // Function to fetch payment token and xPEPE balance
  const fetchPaymentTokenAndBalance = useCallback(async () => {
    if (!address || !network) return;

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
      // Add cache-busting parameter to ensure fresh data
      try {
        const accountResponse = await axios.get(
          `${network.apiAddress}/accounts/${address}/tokens/${tokenId}`,
          { 
            params: { _t: Date.now() }, // Cache busting
            headers: { 'Cache-Control': 'no-cache' }
          }
        );
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
  }, [address, network]);

  // Track previous transaction success state to detect when transactions complete
  const prevSuccessRef = useRef<boolean>(false);
  const { success } = getActiveTransactionsStatus();

  // Fetch payment token and xPEPE balance on mount and when address/network changes
  useEffect(() => {
    fetchPaymentTokenAndBalance();
  }, [fetchPaymentTokenAndBalance]);

  // Refresh balance after transactions complete
  useEffect(() => {
    // Only refresh if success changed from false to true (transaction just completed)
    if (success && !prevSuccessRef.current && address && network) {
      // Wait a bit for the blockchain to update after transaction
      const timeoutId = setTimeout(() => {
        fetchPaymentTokenAndBalance();
      }, 2000); // 2 second delay to allow blockchain to process the transaction

      prevSuccessRef.current = success;
      
      return () => clearTimeout(timeoutId);
    }
    
    // Update ref to track current state
    prevSuccessRef.current = success;
  }, [success, address, network, fetchPaymentTokenAndBalance]);

  // Periodic balance refresh (every 30 seconds) as a fallback
  // This ensures balance stays updated even if transaction status tracking fails
  useEffect(() => {
    if (!address || !network) return;

    const intervalId = setInterval(() => {
      fetchPaymentTokenAndBalance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [address, network, fetchPaymentTokenAndBalance]);

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
          // Use BigInt to avoid precision loss with large numbers
          // JavaScript Number can only safely represent integers up to 2^53-1
          // For 1B tokens with 18 decimals, we have 1e27 which exceeds this
          const balanceWei = BigInt(xpepeBalance || '0');
          const oneEther = BigInt('1000000000000000000'); // 1e18
          
          // Convert wei to tokens with 2 decimal precision using BigInt
          // Multiply by 100 first to preserve 2 decimals, then divide
          const balanceScaled = (balanceWei * BigInt('100')) / oneEther;
          const balanceValue = Number(balanceScaled) / 100;
          
          let formatted: string;
          if (balanceValue >= 1000000000) {
            // Billions - format as X.XX B with 2 decimals
            formatted = (balanceValue / 1000000000).toFixed(2) + 'B';
          } else if (balanceValue >= 1000000) {
            // Millions - format as X.XX M with 2 decimals
            formatted = (balanceValue / 1000000).toFixed(2) + 'M';
          } else if (balanceValue >= 1000) {
            // Thousands - format as X.XX K with 2 decimals
            formatted = (balanceValue / 1000).toFixed(2) + 'K';
          } else {
            // Less than 1000 - format with 2 decimals
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
