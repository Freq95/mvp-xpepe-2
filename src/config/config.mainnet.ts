import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://template-api.multiversx.com';
export const ID_API_URL = 'https://id-api.multiversx.com';
export const USERS_API_URL = '/users/api/v1/users/';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqtmcuh307t6kky677ernjj9ulk64zq74w9l5qxyhdn7';

// al 4-lea SC v4 cu send scor si afisare top 10[fix la out of range] + withdraw function
export const contractAddressScoreBoard =
  'erd1qqqqqqqqqqqqqpgqgqlctz6u0nspmr0srlfkvenumvpfnwhpswhq58stmr';

export const environment = EnvironmentsEnum.mainnet;
export const sampleAuthenticatedDomains = [API_URL];
