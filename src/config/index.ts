import { EnvironmentsEnum } from 'lib';

export * from './sharedConfig';

export const API_URL = 'https://devnet-template-api.multiversx.com';
export const contractAddress =
  'erd1qqqqqqqqqqqqqpgq4t8a5vgr0jz8dtmvcj88jrw9pex5f7avswhqsp0kjg';

// al 4-lea SC v4 cu send scor si afisare top 10[fix la out of range] + withdraw function
export const contractAddressScoreBoard =
  'erd1qqqqqqqqqqqqqpgq4t8a5vgr0jz8dtmvcj88jrw9pex5f7avswhqsp0kjg';

export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];

// Set to true to show "Under Development" message instead of the app
// When ready to launch, set this to false and redeploy
export const IS_UNDER_DEVELOPMENT = false;