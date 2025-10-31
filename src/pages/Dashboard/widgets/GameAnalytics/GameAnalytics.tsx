import React, { useState, useMemo } from 'react';
import { OutputContainer, Button } from 'components';
import { useGetAllAddresses, useGetAddressDetails } from 'hooks/analytics';
import { useGetTopScores } from 'hooks/transactions/useGetTopScores';
import { Address, useGetAccount, useGetLoginInfo } from 'lib';

export const GameAnalytics: React.FC = () => {
  const { addresses, loading, error, refetch } = useGetAllAddresses();
  const { data: topScores } = useGetTopScores();
  const { address: userAddress } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { details, loading: detailsLoading } = useGetAddressDetails(selectedAddress);
  
  // Helper function to normalize addresses to bech32 format
  const normalizeAddress = (addr: string): string => {
    try {
      if (addr.startsWith('erd1')) return addr; // Already bech32
      // Try to convert hex to bech32
      let hex = addr;
      if (addr.startsWith('0x')) hex = addr.slice(2);
      return new Address(hex).toBech32();
    } catch {
      // If conversion fails, return as is
      return addr;
    }
  };
  
  // Create a map of blockchain scores (from top 10 scoreboard)
  // Use both original and normalized addresses as keys
  const blockchainScoresMap = useMemo(() => {
    const map = new Map<string, { score: number; position: number }>();
    if (topScores && topScores.length > 0) {
      topScores.forEach((item, index) => {
        const normalized = normalizeAddress(item.address);
        // Store with both formats for matching
        map.set(normalized.toLowerCase(), { score: item.score, position: index + 1 });
        map.set(item.address.toLowerCase(), { score: item.score, position: index + 1 });
      });
    }
    return map;
  }, [topScores]);
  
  // Merge addresses with blockchain data
  const addressesWithBlockchain = useMemo(() => {
    return addresses.map(addr => {
      const normalizedAddr = normalizeAddress(addr.address).toLowerCase();
      const blockchainData = blockchainScoresMap.get(normalizedAddr) || 
                            blockchainScoresMap.get(addr.address.toLowerCase());
      
      return {
        ...addr,
        onChainBestScore: blockchainData?.score || null,
        onChainPosition: blockchainData?.position || null
      };
    });
  }, [addresses, blockchainScoresMap]);
  
  // Sort addresses:
  // 1. Top 10 on-chain positions first (sorted by position 1-10)
  // 2. Then addresses with on-chain scores but not in top 10 (sorted by on-chain score desc)
  // 3. Finally addresses without on-chain scores (sorted by bestScore desc)
  const sortedAddresses = useMemo(() => {
    return [...addressesWithBlockchain].sort((a, b) => {
      // Top 10 on-chain positions first
      const aInTop10 = a.onChainPosition !== null && a.onChainPosition <= 10;
      const bInTop10 = b.onChainPosition !== null && b.onChainPosition <= 10;
      
      if (aInTop10 && bInTop10) {
        return a.onChainPosition! - b.onChainPosition!; // Sort by position ascending (1, 2, 3...)
      }
      if (aInTop10) return -1; // a is in top 10, b is not
      if (bInTop10) return 1;  // b is in top 10, a is not
      
      // Both not in top 10, check if they have on-chain scores
      if (a.onChainBestScore !== null && b.onChainBestScore !== null) {
        return b.onChainBestScore - a.onChainBestScore; // Sort by on-chain score descending
      }
      if (a.onChainBestScore !== null) return -1; // a has on-chain score, b doesn't
      if (b.onChainBestScore !== null) return 1; // b has on-chain score, a doesn't
      
      // Both don't have on-chain scores, sort by bestScore descending
      return b.bestScore - a.bestScore;
    });
  }, [addressesWithBlockchain]);
  
  // Filter addresses based on search query
  const filteredAddresses = sortedAddresses.filter(addr =>
    addr.address.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Count how many wallets have on-chain scores
  const walletsWithOnChainScore = sortedAddresses.filter(addr => addr.onChainBestScore !== null).length;
  
  // Limit to first 15 wallets for performance
  const displayedAddresses = filteredAddresses.slice(0, 15);
  
  // Calculate position for each wallet
  const addressesWithPosition = displayedAddresses.map((addr, index) => {
    let position: number | null = null;
    let positionColor: 'yellow' | 'blue' = 'yellow';
    
    if (addr.onChainPosition !== null && addr.onChainPosition <= 10) {
      // Has on-chain position (top 10) - use yellow label
      position = addr.onChainPosition;
      positionColor = 'yellow';
    } else {
      // No on-chain position - assign position with blue label
      // Count how many on-chain wallets come before this one
      const onChainBeforeThis = displayedAddresses.slice(0, index).filter(
        a => a.onChainPosition !== null && a.onChainPosition <= 10
      ).length;
      // Position = total on-chain wallets + position in list - on-chain wallets before this
      position = walletsWithOnChainScore + (index + 1) - onChainBeforeThis;
      positionColor = 'blue';
    }
    
    return {
      ...addr,
      displayPosition: position,
      positionColor
    };
  });

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (addr: string) => {
    if (addr.length <= 10) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold"></h3>
          <Button onClick={refetch}>Refresh</Button>
        </div>
        <OutputContainer>
          <div className="text-center py-8 opacity-70">Loading...</div>
        </OutputContainer>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold"></h3>
          <Button onClick={refetch}>Refresh</Button>
        </div>
        <OutputContainer>
          <div className="text-center py-8 text-red-500">
            Error: {error}
            <br />
            <span className="text-sm opacity-70">Make sure the backend API is running</span>
          </div>
        </OutputContainer>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold"></h3>
        <Button onClick={refetch}>Refresh</Button>
      </div>


      <OutputContainer>
        {selectedAddress ? (
          // Detail view for selected address
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Address Details: {formatAddress(selectedAddress)}</h4>
              <button
                onClick={() => setSelectedAddress(null)}
                className="w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center transition-colors"
                title="Close"
              >
                <span className="text-white text-lg leading-none">×</span>
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-center py-8 opacity-70">Loading details...</div>
            ) : details ? (
              <>
                {/* Statistics */}
                {(() => {
                  // Get blockchain data for selected address
                  const normalizedSelectedAddr = normalizeAddress(selectedAddress).toLowerCase();
                  const blockchainData = blockchainScoresMap.get(normalizedSelectedAddr) || 
                                       blockchainScoresMap.get(selectedAddress.toLowerCase());
                  
                  return (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="p-4 rounded border border-white/10 bg-black/20">
                        <div className="text-xs opacity-70 mb-1">Total Games</div>
                        <div className="text-2xl font-bold">{details.statistics.totalGames}</div>
                      </div>
                      <div className="p-4 rounded border border-white/10 bg-black/20">
                        <div className="text-xs opacity-70 mb-1">Best Score</div>
                        <div className="text-2xl font-bold">{details.statistics.bestScore.toLocaleString()}</div>
                      </div>
                      <div className="p-4 rounded border border-white/10 bg-black/20">
                        <div className="text-xs opacity-70 mb-1">Best On-Chain Score</div>
                        <div className="text-2xl font-bold">
                          {blockchainData?.score ? blockchainData.score.toLocaleString() : '—'}
                        </div>
                      </div>
                      <div className="p-4 rounded border border-white/10 bg-black/20">
                        <div className="text-xs opacity-70 mb-1">On-Chain Position</div>
                        <div className="text-2xl font-bold">
                          {blockchainData?.position ? `#${blockchainData.position}` : '—'}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Scoring Sessions */}
                <div>
                  <h5 className="text-md font-semibold mb-3">Scoring Sessions ({details.sessions.length})</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left opacity-70 border-b">
                          <th className="py-2 px-3">Session ID</th>
                          <th className="py-2 px-3">Score</th>
                          <th className="py-2 px-3">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {details.sessions.length > 0 ? (
                          details.sessions.map((session) => (
                            <tr key={session.sessionId} className="border-b">
                              <td className="py-2 px-3 font-mono text-xs">
                                {session.sessionId.slice(0, 8)}...
                              </td>
                              <td className="py-2 px-3">{session.score.toLocaleString()}</td>
                              <td className="py-2 px-3">{formatTimestamp(session.timestamp)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="py-4 text-center opacity-70">
                              No scoring sessions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </>
            ) : (
              <div className="text-center py-8 opacity-70">No details found for this address</div>
            )}
          </div>
        ) : (
          // List view of all addresses
          <>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold">wallets ({filteredAddresses.length})</h4>
            </div>
            
            {/* Legend */}
            <div className="mb-4 flex items-center gap-6 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-400/50"></span>
                <span className="text-white/70">on-chain score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-blue-500/20 border border-blue-400/50"></span>
                <span className="text-white/70">off-chain score</span>
              </div>
              {displayedAddresses.length < filteredAddresses.length && (
                <span className="text-white/50 ml-auto">showing top 15</span>
              )}
            </div>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="search by address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded border border-white/20 bg-black/30 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
            
            {addressesWithPosition.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left opacity-70 border-b">
                      <th className="py-2 px-3">address</th>
                      <th className="py-2 px-3">games</th>
                      <th className="py-2 px-3">best score</th>
                      <th className="py-2 px-3">on chain score</th>
                      <th className="py-2 px-3">position</th>
                      <th className="py-2 px-3">last game</th>
                      <th className="py-2 px-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {addressesWithPosition.map((addr) => {
                      const isCurrentUser = isLoggedIn && userAddress && (
                        normalizeAddress(addr.address).toLowerCase() === normalizeAddress(userAddress).toLowerCase() ||
                        addr.address.toLowerCase() === userAddress.toLowerCase()
                      );
                      
                      return (
                      <tr 
                        key={addr.address} 
                        className={`border-b hover:bg-white/5 cursor-pointer ${isCurrentUser ? 'bg-yellow-500/10 border-yellow-500/30' : ''}`}
                      >
                        <td className="py-2 px-3 font-mono text-xs flex items-center gap-2">
                          {isCurrentUser && (
                            <span className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0"></span>
                          )}
                          {formatAddress(addr.address)}
                        </td>
                        <td className="py-2 px-3">{addr.totalGames}</td>
                        <td className="py-2 px-3">{addr.bestScore.toLocaleString()}</td>
                        <td className="py-2 px-3">
                          {addr.onChainBestScore !== null ? addr.onChainBestScore.toLocaleString() : '—'}
                        </td>
                        <td className="py-2 px-3">
                          {addr.displayPosition !== null && (
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              addr.positionColor === 'yellow' 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              #{addr.displayPosition}
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-xs">{formatTimestamp(addr.lastGameTimestamp)}</td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => setSelectedAddress(addr.address)}
                            className="px-3 py-1 rounded border border-white/20 hover:bg-white/10 text-xs"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 opacity-70">
                {searchQuery ? 'No addresses found matching your search' : 'No addresses found'}
              </div>
            )}
          </>
        )}
      </OutputContainer>
    </div>
  );
};

export default GameAnalytics;

