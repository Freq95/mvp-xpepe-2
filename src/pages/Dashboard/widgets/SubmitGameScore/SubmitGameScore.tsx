// --- file: src/pages/Dashboard/widgets/SubmitGameScore/SubmitGameScore.tsx
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import DinoGameComponent from 'components/Xpepe/Xpepe';
import { Button, OutputContainer } from 'components';
import { useGetAccount, useGetLoginInfo, useGetNetworkConfig } from 'lib';
import { useGetMinFee } from 'hooks/transactions/useGetMinFee';
import { useSendScoreboardTransaction } from 'hooks/transactions/useSendScoreboardTransaction';
import { useRecordScoringSession } from 'hooks/analytics';
import axios from 'axios';

function toEgld(wei?: string | null, digits = 4) {
  if (!wei) return '—';
  try {
    const v = Number(wei) / 1e18;
    return v.toFixed(digits);
  } catch {
    return '—';
  }
}

// Convert scientific notation string to BigInt-safe string (integer only)
function scientificToBigIntString(value: string): string {
  if (!value.includes('e') && !value.includes('E')) {
    return value.split('.')[0]; // Return only integer part
  }
  
  const [base, exponent] = value.toLowerCase().split('e');
  const exp = parseInt(exponent, 10);
  const [intPart, decPart = ''] = base.split('.');
  
  if (exp > 0) {
    // Positive exponent: move decimal point right
    const totalDecimals = decPart.length;
    if (exp >= totalDecimals) {
      // No decimal part left, just add zeros
      return intPart + decPart + '0'.repeat(exp - totalDecimals);
    } else {
      // Some decimal part remains, but we only want integer part
      return intPart + decPart.slice(0, exp);
    }
  } else {
    // Negative exponent: result is less than 1, return 0 for BigInt
    return '0';
  }
}

function prettyTxError(err: any, opts: { minFeeWei?: string | null } = {}) {
  const msg = (typeof err === 'string' ? err : err?.message || '').toLowerCase();
  if (!msg) return 'Unknown error during signing/sending.';

  // Insufficient EGLD for gas fees
  if (msg.includes('insufficient') || msg.includes('not enough') || msg.includes('insuf') || msg.includes('balance')) {
    return 'Insufficient EGLD balance to pay for transaction gas fees. Please ensure you have enough EGLD in your wallet.';
  }
  // User cancellation
  if (msg.includes('cancel') || msg.includes('denied') || msg.includes('aborted') || msg.includes('reject')) {
    return 'Transaction signing was cancelled in wallet.';
  }
  // Session/Wallet issues
  if (msg.includes('not logged') || msg.includes('session') || msg.includes('provider') || msg.includes('wallet')) {
    return 'Wallet not initialized or session expired. Please log in again and try again.';
  }
  // Generic errors
  return 'Error during signing or sending. Please try again.';
}

export function GameScoreSubmitOnChoice(): JSX.Element {
  const { address, balance: egldBalance } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const { network } = useGetNetworkConfig();
  const minFeeWei = useGetMinFee(); // string (wei) din SC
  const { submitScoreFromAbi } = useSendScoreboardTransaction();
  const { recordSession } = useRecordScoringSession();

  const [lastFinal, setLastFinal] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);
  const [txOk, setTxOk] = useState(false);
  const [xpepeBalance, setXpepeBalance] = useState<string | null>(null);
  const [paymentTokenId, setPaymentTokenId] = useState<string | null>(null);
  const [balanceCheckStatus, setBalanceCheckStatus] = useState<{
    hasEnoughEgld: boolean;
    hasEnoughXpepe: boolean;
    message: string;
  } | null>(null);

  // Fetch payment token and xPEPE balance
  useEffect(() => {
    if (!address || !isLoggedIn || !network) return;

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

        // Get xPEPE token balance - try the API endpoint
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
  }, [address, isLoggedIn, network]);

  // Check balances before transaction
  useEffect(() => {
    if (!isLoggedIn || !address || !minFeeWei || minFeeWei === '0' || !egldBalance || !xpepeBalance) {
      setBalanceCheckStatus(null);
      return;
    }

    // Check EGLD balance (need ~0.002 EGLD for gas, conservative estimate)
    const minEgldForGas = BigInt(2000000000000000); // 0.002 EGLD
    const egldBalanceWei = BigInt(egldBalance || '0');
    const hasEnoughEgld = egldBalanceWei >= minEgldForGas;

    // Check xPEPE balance (need minFeeWei amount)
    // Convert minFeeWei to BigInt, handling scientific notation
    const minFeeStr = scientificToBigIntString(minFeeWei);
    const minFee = BigInt(minFeeStr.split('.')[0]); // Take only integer part
    const xpepeBalanceWei = BigInt(xpepeBalance || '0');
    const hasEnoughXpepe = xpepeBalanceWei >= minFee;

    let message = '';
    if (!hasEnoughEgld && !hasEnoughXpepe) {
      message = 'Insufficient EGLD for gas fees and insufficient xPEPE tokens for payment.';
    } else if (!hasEnoughEgld) {
      message = 'Insufficient EGLD balance to pay for transaction gas fees (~0.002 EGLD required).';
    } else if (!hasEnoughXpepe) {
      const needed = toEgld(minFeeWei, 6);
      message = `Insufficient xPEPE tokens. You need at least ${needed} xPEPE to submit score.`;
    } else {
      message = 'All requirements met: sufficient EGLD for gas and xPEPE for payment.';
    }

    setBalanceCheckStatus({
      hasEnoughEgld,
      hasEnoughXpepe,
      message
    });
  }, [isLoggedIn, address, minFeeWei, egldBalance, xpepeBalance]);

  const handleGameOver = useCallback((finalScore: number) => {
    setTxOk(false);
    setTxError(null);
    setLastFinal(finalScore);
    
    // Record scoring session in analytics (when game crashes/ends)
    if (address && isLoggedIn) {
      recordSession(address, finalScore).catch(err => {
        console.error('Failed to record scoring session:', err);
        // Don't show error to user - analytics is non-critical
      });
    }
  }, [address, isLoggedIn, recordSession]);

  const submitScore = useCallback(async () => {
    if (!isLoggedIn || !address || lastFinal == null) return;
    if (!minFeeWei || minFeeWei === '0') {
      setTxError('Minimum payment amount unavailable. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setTxError(null);
    setTxOk(false);
    
    try {
      await submitScoreFromAbi(lastFinal, minFeeWei);
      setTxOk(true);
    } catch (e: any) {
      const errorMsg = prettyTxError(e, { minFeeWei });
      setTxError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, [address, isLoggedIn, lastFinal, minFeeWei, submitScoreFromAbi]);

  const canSubmit = useMemo(
    () => isLoggedIn && !!address && lastFinal != null && !!minFeeWei && minFeeWei !== '0' && !isSubmitting,
    [isLoggedIn, address, lastFinal, minFeeWei, isSubmitting]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold"></h3>
          <Button
            onClick={submitScore}
            disabled={!canSubmit || true}
            style={{ visibility: 'hidden' }}
          >
            on-chain score coming soon
          </Button>

      </div>

      <OutputContainer className="p-0">
        <div className="flex flex-col gap-3">
          <DinoGameComponent onGameOver={handleGameOver} />

          {!isLoggedIn && (
            <div className="text-xs text-red-500">connect your wallet to save the score on-chain</div>
          )}

          {/* Balance check status - shown before transaction */}
          {balanceCheckStatus && !txOk && (
            <div className={`text-xs mt-2 p-2 rounded border ${
              balanceCheckStatus.hasEnoughEgld && balanceCheckStatus.hasEnoughXpepe
                ? 'text-green-500 bg-green-500/10 border-green-500/20'
                : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
            }`}>
              {balanceCheckStatus.message}
            </div>
          )}

          {txError && (
            <div className="text-xs text-red-500 mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
              {txError}
            </div>
          )}

          {/* Only show green success if both balances were sufficient */}
          {txOk && balanceCheckStatus?.hasEnoughEgld && balanceCheckStatus?.hasEnoughXpepe && (
            <div className="text-xs text-green-500 mt-2 p-2 rounded bg-green-500/10 border border-green-500/20">
              Transaction submitted successfully! Check notifications for details.
            </div>
          )}
        </div>
      </OutputContainer>
    </div>
  );
}
