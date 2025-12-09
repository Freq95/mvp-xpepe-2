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
    return value.split('.')[0];
  }

  const [base, exponent] = value.toLowerCase().split('e');
  const exp = parseInt(exponent, 10);
  const [intPart, decPart = ''] = base.split('.');

  if (exp > 0) {
    const totalDecimals = decPart.length;
    if (exp >= totalDecimals) {
      return intPart + decPart + '0'.repeat(exp - totalDecimals);
    } else {
      return intPart + decPart.slice(0, exp);
    }
  } else {
    return '0';
  }
}

function prettyTxError(err: any, _opts: { minFeeWei?: string | null } = {}) {
  const msg = (typeof err === 'string' ? err : err?.message || '').toLowerCase();
  if (!msg) return 'Unknown error during signing/sending.';
  if (msg.includes('insufficient') || msg.includes('balance')) {
    return 'Insufficient EGLD balance to pay for transaction gas fees.';
  }
  if (msg.includes('cancel') || msg.includes('denied')) {
    return 'Transaction signing was cancelled.';
  }
  if (msg.includes('wallet') || msg.includes('session')) {
    return 'Wallet not initialized or session expired.';
  }
  return 'Error during signing or sending.';
}

// NEW: Convert normal score → emoji keycaps
function scoreToEmoji(score: number): string {
  const map: Record<string, string> = {
    '0': '0️⃣',
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣'
  };

  return score
    .toString()
    .split('')
    .map(d => map[d] || d)
    .join('');
}

export function GameScoreSubmitOnChoice(): JSX.Element {
  const { address, balance: egldBalance } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const { network } = useGetNetworkConfig();
  const minFeeWei = useGetMinFee();
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

  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (!address || !isLoggedIn || !network) return;
    (async () => {
      try {
        const { contractAddressScoreBoard } = await import('config');
        const scoreboardAbi = await import('contracts/scoreboard.abi.json');
        const {
          AbiRegistry,
          Address,
          ProxyNetworkProvider,
          SmartContractController
        } = await import('lib');

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

        try {
          const accountResponse = await axios.get(
            `${network.apiAddress}/accounts/${address}/tokens/${tokenId}`
          );
          setXpepeBalance(accountResponse.data?.balance || '0');
        } catch {
          setXpepeBalance('0');
        }
      } catch {
        setXpepeBalance('0');
      }
    })();
  }, [address, isLoggedIn, network]);

  useEffect(() => {
    if (!isLoggedIn || !address || !minFeeWei || !egldBalance || !xpepeBalance) {
      setBalanceCheckStatus(null);
      return;
    }

    const minEgldForGas = BigInt(2000000000000000);
    const egldBalanceWei = BigInt(egldBalance);
    const hasEnoughEgld = egldBalanceWei >= minEgldForGas;

    const minFeeStr = scientificToBigIntString(minFeeWei);
    const minFee = BigInt(minFeeStr);
    const xpepeBalanceWei = BigInt(xpepeBalance);
    const hasEnoughXpepe = xpepeBalanceWei >= minFee;

    let message = '';
    if (!hasEnoughEgld && !hasEnoughXpepe) {
      message = 'Insufficient EGLD and insufficient xPEPE.';
    } else if (!hasEnoughEgld) {
      message = 'Insufficient EGLD for gas fees.';
    } else if (!hasEnoughXpepe) {
      message = 'Insufficient xPEPE tokens.';
    } else {
      message = 'All requirements met.';
    }

    setBalanceCheckStatus({
      hasEnoughEgld,
      hasEnoughXpepe,
      message
    });
  }, [isLoggedIn, address, minFeeWei, egldBalance, xpepeBalance]);

  const handleGameOver = useCallback(
    (finalScore: number) => {
      setTxOk(false);
      setTxError(null);
      setLastFinal(finalScore);

      if (address && isLoggedIn) {
        recordSession(address, finalScore).catch(() => {});
      }
    },
    [address, isLoggedIn, recordSession]
  );

  const submitScore = useCallback(async () => {
    if (!isLoggedIn || !address || lastFinal == null) return;
    if (!minFeeWei) {
      setTxError('Minimum payment amount unavailable.');
      return;
    }

    setIsSubmitting(true);
    setTxError(null);
    setTxOk(false);

    try {
      await submitScoreFromAbi(lastFinal, minFeeWei);
      setTxOk(true);
    } catch (e: any) {
      setTxError(prettyTxError(e));
    } finally {
      setIsSubmitting(false);
    }
  }, [address, isLoggedIn, lastFinal, minFeeWei, submitScoreFromAbi]);

  const canSubmit = useMemo(
    () => isLoggedIn && address && lastFinal != null && minFeeWei && !isSubmitting,
    [isLoggedIn, address, lastFinal, minFeeWei, isSubmitting]
  );

  const handleShareToTwitter = useCallback(() => {
    if (lastFinal == null || lastFinal <= 0) return;

    setIsSharing(true);
    try {
      const emojiScore = scoreToEmoji(lastFinal);
      const shareUrl = 'xpepeonmvx.com/\n\n';

      const baseText =
        `Just scored ${emojiScore} in the $xPEPE runner on MultiversX!\n\n` +
        `Join the fun and try to beat my score, for a change to win $eGLD!\n\n`;

      const hashtags = 'xpepeRunner,MultiversX';

      const tweetText = encodeURIComponent(baseText);
      const encodedUrl = encodeURIComponent(shareUrl);
      const encodedHashtags = encodeURIComponent(hashtags);

      const twitterShareUrl =
        `https://twitter.com/intent/tweet?text=${tweetText}` +
        `&url=${encodedUrl}&hashtags=${encodedHashtags}`;

      window.open(twitterShareUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setIsSharing(false);
    }
  }, [lastFinal]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold"></h3>
        <div className="flex items-center gap-2">
          <Button
            onClick={submitScore}
            disabled={!canSubmit || true}
            style={{ visibility: 'hidden' }}
          >
            on-chain score coming soon
          </Button>

          <Button onClick={handleShareToTwitter} disabled={lastFinal == null || isSharing}>
            {isSharing ? 'Preparing…' : 'share to WIN'}
          </Button>
        </div>
      </div>

      <OutputContainer className="p-0">
        <div className="flex flex-col gap-3">
          <DinoGameComponent onGameOver={handleGameOver} />

          {!isLoggedIn && (
            <div className="text-xs text-red-500">
              connect your wallet to save the score on-chain
            </div>
          )}

          {balanceCheckStatus && !txOk && (
            <div
              className={`text-xs mt-2 p-2 rounded border ${
                balanceCheckStatus.hasEnoughEgld && balanceCheckStatus.hasEnoughXpepe
                  ? 'text-green-500 bg-green-500/10 border-green-500/20'
                  : 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
              }`}
            >
              {balanceCheckStatus.message}
            </div>
          )}

          {txError && (
            <div className="text-xs text-red-500 mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
              {txError}
            </div>
          )}

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
