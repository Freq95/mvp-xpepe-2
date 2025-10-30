// src/hooks/transactions/useSendScoreboardTransaction.ts
import axios from 'axios';

import { contractAddressScoreBoard } from 'config';
import { signAndSendTransactions } from 'helpers';
import {
  AbiRegistry,
  Address,
  GAS_PRICE,
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
    const response = await axios.get('src/contracts/scoreboard.abi.json');
    const abi = AbiRegistry.create(response.data);
    const scFactory = new SmartContractTransactionsFactory({
      config: new TransactionsFactoryConfig({
        chainID: network.chainId
      }),
      abi
    });

    return scFactory;
  };

  async function submitScoreFromAbi(score: number, minFeeWei: string | bigint) {
    // Always use BigInt for ESDT transfer amount: NEVER use Number for ESDT base units
    const bigIntFee = typeof minFeeWei === 'bigint' ? minFeeWei : BigInt(minFeeWei);
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