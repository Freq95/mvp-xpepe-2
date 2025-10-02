// src/hooks/nfts/useGetNFTs.ts
import { useState, useEffect } from 'react';
import { useGetNetworkConfig } from 'lib';

interface NFT {
  collection: string;
  identifier: string;
  name?: string;
  // add more fields as needed
}

export const useGetNFTs = (address: string) => {
  const [nfts, setNfts] = useState<NFT[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { network } = useGetNetworkConfig();

  useEffect(() => {
    if (!address) {
      setNfts(null);
      return;
    }

    const fetchNFTs = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const apiUrl = network.apiAddress;
        const response = await fetch(
          `${apiUrl}/accounts/${address}/nfts?size=10000`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch NFTs');
        }
        
        const data = await response.json();
        setNfts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setNfts(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, network.apiAddress]);

  return { nfts, isLoading, error };
};