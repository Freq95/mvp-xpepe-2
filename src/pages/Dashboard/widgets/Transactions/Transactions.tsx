import { useEffect } from 'react';

import { OutputContainer, TransactionsTable, Button } from 'components';
import { getActiveTransactionsStatus } from 'lib';
import { ItemsIdentifiersEnum } from 'pages/Dashboard/dashboard.types';

import { useGetTransactions } from './hooks';

// prettier-ignore
const styles = {
  transactionsContainer: 'transactions-container flex flex-col border border-secondary rounded-xl transition-all duration-200 ease-out',
  transactionsTable: 'transactions-table w-full h-full overflow-x-auto shadow rounded-lg'
} satisfies Record<string, string>;

export interface TransactionsPropsType {
  receiver?: string;
  identifier?: `${ItemsIdentifiersEnum}`;
}

export const Transactions = (props: TransactionsPropsType) => {
  const { success } = getActiveTransactionsStatus();
  const { isLoading, getTransactions, transactions } =
    useGetTransactions(props);

  useEffect(() => {
    if (success) {
      getTransactions();
    }
  }, [success]);

  useEffect(() => {
    getTransactions();
  }, []);

  if (!isLoading && transactions.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold"></h3>
          <Button onClick={getTransactions}>Refresh</Button>
        </div>
        <OutputContainer>
          <p>No transactions found</p>
        </OutputContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold"></h3>
        <Button onClick={getTransactions}>Refresh</Button>
      </div>
      <div id={props.identifier} className={styles.transactionsContainer}>
        <OutputContainer isLoading={isLoading} className='p-0'>
          <div className={styles.transactionsTable}>
            <TransactionsTable transactions={transactions} />
          </div>
        </OutputContainer>
      </div>
    </div>
  );
};
