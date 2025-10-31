import { useCallback } from 'react';
import axios from 'axios';
import { ANALYTICS_API_URL } from 'config/sharedConfig';

export function useRecordScoringSession() {
  const recordSession = useCallback(async (address: string, score: number, duration?: number) => {
    try {
      const response = await axios.post(`${ANALYTICS_API_URL}/api/scoring-sessions`, {
        address,
        score,
        duration
      });
      return { success: true, data: response.data.data };
    } catch (error: any) {
      console.error('Failed to record scoring session:', error);
      // Don't throw - we don't want to break the game if analytics fails
      return { success: false, error: error.message };
    }
  }, []);

  return { recordSession };
}

