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
      const apiUrl = `${ANALYTICS_API_URL}/api/addresses`;
      console.log('🔍 Fetching addresses from:', apiUrl);
      console.log('🔍 ANALYTICS_API_URL value:', ANALYTICS_API_URL);
      const response = await axios.get(apiUrl);
      console.log('✅ Successfully fetched addresses:', response.data);
      setAddresses(response.data.data || []);
    } catch (err: any) {
      console.error('❌ Failed to fetch addresses:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        url: err.config?.url
      });
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

export interface UserConnection {
  address: string;
  firstConnectedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function useGetAllConnectedUsers() {
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${ANALYTICS_API_URL}/api/user-connections`);
      setConnections(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch connected users:', err);
      setError(err.message || 'Failed to fetch connected users');
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return { connections, loading, error, refetch: fetchConnections };
}

