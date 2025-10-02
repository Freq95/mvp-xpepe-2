// src/hooks/transactions/useSendScoreboardTransaction.ts
import axios from 'axios';

import { contractAddress } from 'config';
import { signAndSendTransactions } from 'helpers';
import {
  AbiRegistry,
  Address,
  GAS_PRICE,
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
  useGetAccount,
  useGetNetworkConfig
} from 'lib';

const SCOREBOARD_TRANSACTION_INFO = {
  processingMessage: 'Sending score transaction...',
  errorMessage: 'Error sending score transaction',
  successMessage: 'Score submitted successfully ✅',
};

export function useSendScoreboardTransaction() {
  const { network } = useGetNetworkConfig();
  const { address } = useGetAccount();

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
    console.log("DEBUG score de trimis:", score);

    const scFactory = await getSmartContractFactory();
    
    const scoreTransaction = await scFactory.createTransactionForExecute(
      new Address(address),
      {
        gasLimit: BigInt(20_000_000),
        function: 'submitScore',
        contract: new Address(contractAddress),
        nativeTransferAmount: BigInt(minFeeWei),
        arguments: [Number(score) >>> 0]
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