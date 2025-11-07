import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useGetTopScores } from 'hooks/transactions/useGetTopScores';
import { Button, OutputContainer } from 'components';
import { Address, getActiveTransactionsStatus } from 'lib';
import { useGetAllAddresses } from 'hooks/analytics';

function formatAddress(addr: string): string {
  try {
    if (addr.startsWith('erd1')) return addr; // deja bech32
    let hex = addr;
    if (addr.startsWith('0x')) {
      hex = addr.slice(2); // scoatem "0x"
    }
    return new Address(hex).toBech32();
  } catch {
    return addr; // fallback
  }
}

export const Top10Scoreboard: React.FC = () => {
  const { data, loading, error, refresh } = useGetTopScores();
  const { refetch: refetchBackendData } = useGetAllAddresses();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Track previous transaction success state to detect when transactions complete
  const prevSuccessRef = useRef<boolean>(false);

  // Handler to refresh both on-chain and backend data
  const handleRefresh = useCallback(async () => {
    console.log('🔄 Refreshing scoreboard - both on-chain and backend data...');
    setIsRefreshing(true);
    
    // Update refresh key BEFORE refresh to force immediate re-render
    setRefreshKey(prev => prev + 1);
    
    // Force refresh with cache-busting
    try {
      await Promise.all([
        refresh(true), // Refresh on-chain top scores with force flag
        refetchBackendData() // Refresh backend/DB data
      ]);
      
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update refresh key again AFTER refresh to ensure re-render with new data
      setRefreshKey(prev => prev + 1);
      console.log('✅ Scoreboard refresh complete');
    } catch (error) {
      console.error('❌ Error refreshing scoreboard:', error);
      // Still update key to show something happened
      setRefreshKey(prev => prev + 1);
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh, refetchBackendData]);

  // Poll transaction status periodically to detect completion
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout | null = null;
    
    const interval = setInterval(() => {
      const { success } = getActiveTransactionsStatus();
      
      // Only refresh if success changed from false to true (transaction just completed)
      if (success && !prevSuccessRef.current) {
        console.log('🔄 Transaction completed - will refresh scoreboard after delay...');
        
        // Clear any existing timeout
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
        }
        
        // Wait longer for the blockchain to update after transaction
        // Blockchain state propagation can take 5-10 seconds
        refreshTimeout = setTimeout(() => {
          console.log('🔄 Auto-refreshing scoreboard now...');
          handleRefresh();
        }, 5000); // 5 second delay to allow blockchain to process the transaction

        prevSuccessRef.current = success;
      } else if (!success) {
        // Reset the ref when success becomes false again
        prevSuccessRef.current = false;
        if (refreshTimeout) {
          clearTimeout(refreshTimeout);
          refreshTimeout = null;
        }
      }
    }, 1000); // Check every second

    return () => {
      clearInterval(interval);
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [handleRefresh]);


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold"></h3>
        <Button onClick={handleRefresh} disabled={isRefreshing || loading}>
          {isRefreshing || loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      <OutputContainer>
        {(loading || isRefreshing) && <p>Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}
        <div className="overflow-x-auto" key={`table-container-${refreshKey}`}>
          <table className="w-full text-sm" key={`scoreboard-table-${refreshKey}`}>
            <thead>
              <tr className="text-left opacity-70">
                <th className="py-2">#</th>
                <th className="py-2">Address</th>
                <th className="py-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((r, i) => (
                <tr key={`${r.address}-${r.score}-${refreshKey}-${i}`} className="border-t">
                  <td className="py-2 pr-2 w-10">{i + 1}</td>
                  <td className="py-2 break-all font-mono">
                    {formatAddress(r.address)}
                  </td>
                  <td className="py-2 text-right font-semibold">{r.score}</td>
                </tr>
              ))}
              {(!data || data.length === 0) && !loading && (
                <tr>
                  <td colSpan={3} className="py-6 text-center opacity-70">
                    No entries
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </OutputContainer>
    </div>
  );
};
