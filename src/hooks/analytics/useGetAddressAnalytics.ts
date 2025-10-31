import { useState, useEffect } from 'react';
import axios from 'axios';
import { ANALYTICS_API_URL } from 'config/sharedConfig';

export interface AddressSummary {
  address: string;
  totalGames: number;
  bestScore: number;
  lastGameTimestamp: string | null;
}

export interface ScoringSession {
  sessionId: string;
  score: number;
  timestamp: string;
  duration: number | null;
}

export interface AddressDetails {
  address: string;
  statistics: {
    totalGames: number;
    bestScore: number;
    lastGameTimestamp: string | null;
  };
  sessions: ScoringSession[];
}

export function useGetAllAddresses() {
  const [addresses, setAddresses] = useState<AddressSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${ANALYTICS_API_URL}/api/addresses`);
      setAddresses(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch addresses:', err);
      setError(err.message || 'Failed to fetch addresses');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return { addresses, loading, error, refetch: fetchAddresses };
}

export function useGetAddressDetails(address: string | null) {
  const [details, setDetails] = useState<AddressDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!address) {
      setDetails(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${ANALYTICS_API_URL}/api/addresses/${address}`);
      setDetails(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch address details:', err);
      setError(err.message || 'Failed to fetch address details');
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [address]);

  return { details, loading, error, refetch: fetchDetails };
}

