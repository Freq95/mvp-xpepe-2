// src/hooks/transactions/useSendScoreboardTransaction.ts
import { contractAddressScoreBoard } from 'config';
import { signAndSendTransactions } from 'helpers';
import {
  AbiRegistry,
  Address,
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  Token,
  TokenTransfer,
  ProxyNetworkProvider,
  SmartContractController,
  useGetAccount,
  useGetNetworkConfig
} from 'lib';
import scoreboardAbi from 'contracts/scoreboard.abi.json';

const SCOREBOARD_TRANSACTION_INFO = {
  processingMessage: 'Sending score transaction...',
  errorMessage: 'Error sending score transaction',
  successMessage: 'Score submitted successfully ✅',
};

export function useSendScoreboardTransaction() {
  const { network } = useGetNetworkConfig();
  const { address } = useGetAccount();
  const proxy = new ProxyNetworkProvider(network.apiAddress);

  const getSmartContractFactory = async () => {
    // Use the imported ABI instead of trying to fetch it via HTTP
    const abi = AbiRegistry.create(scoreboardAbi);
    const scFactory = new SmartContractTransactionsFactory({
      config: new TransactionsFactoryConfig({
        chainID: network.chainId
      }),
      abi
    });

    return scFactory;
  };

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

  async function submitScoreFromAbi(score: number, minFeeWei: string | bigint) {
    // Always use BigInt for ESDT transfer amount: NEVER use Number for ESDT base units
    // Handle scientific notation in string format
    const feeString = typeof minFeeWei === 'bigint' ? minFeeWei.toString() : minFeeWei;
    const bigIntFee = typeof minFeeWei === 'bigint' 
      ? minFeeWei 
      : BigInt(scientificToBigIntString(feeString));
    console.log("DEBUG submitScoreFromAbi: score:", score, "minFeeWei:", minFeeWei, "as BigInt:", bigIntFee);

    const scFactory = await getSmartContractFactory();
    // fetch accepted token dynamically from SC
    const abiForQuery = AbiRegistry.create(scoreboardAbi);
    const scController = new SmartContractController({
      chainID: network.chainId,
      networkProvider: proxy,
      abi: abiForQuery
    });
    const [paymentTokenValue] = await scController.query({
      contract: new Address(contractAddressScoreBoard),
      function: 'getPaymentToken',
      arguments: []
    });
    const tokenIdentifier = String(paymentTokenValue?.valueOf?.() ?? '');
    
    const scoreTransaction = await scFactory.createTransactionForExecute(
      new Address(address),
      {
        gasLimit: BigInt(20_000_000),
        function: 'submitScore',
        contract: new Address(contractAddressScoreBoard),
        // send xPEPE ESDT payment instead of native EGLD
        tokenTransfers: [
          new TokenTransfer({
            token: new Token({ identifier: tokenIdentifier }),
            amount: bigIntFee
          })
        ],
        arguments: [BigInt(Number(score) >>> 0)] // ENSURE this argument is also correct type
      }
    );

    const sessionId = await signAndSendTransactions({
      transactions: [scoreTransaction],
      transactionsDisplayInfo: SCOREBOARD_TRANSACTION_INFO,
    });

    return sessionId;
  }

  return { submitScoreFromAbi };
}