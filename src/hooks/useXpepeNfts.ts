import { useEffect, useState } from 'react';
import { useGetAccount, useGetLoginInfo, useGetNetworkConfig } from 'lib';

export function useXpepeNfts(collection = 'XPEPE-937414') {
  const { address } = useGetAccount();
  const { isLoggedIn } = useGetLoginInfo();
  const { network } = useGetNetworkConfig();
  const [nftSprites, setNftSprites] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!isLoggedIn || !address) return setNftSprites([]);
      try {
        const res = await fetch(`${network.apiAddress}/accounts/${address}/nfts?collections=${collection}`);
        const data = await res.json();
        setNftSprites(Array.isArray(data) ? data : []);
      } catch {
        setNftSprites([]);
      }
    };
    load();
  }, [isLoggedIn, address, network, collection]);

  const hasAnyNft = nftSprites.length > 0;
  const ownsBringsAdoption = nftSprites.some((n: any) => (n?.name || '').toLowerCase().includes('xpepe_brings_adoption'));
  const ownsIzBack = nftSprites.some((n: any) => (n?.name || '').toLowerCase().includes('xpepe_iz_back'));

  return { nftSprites, hasAnyNft, ownsBringsAdoption, ownsIzBack };
}


