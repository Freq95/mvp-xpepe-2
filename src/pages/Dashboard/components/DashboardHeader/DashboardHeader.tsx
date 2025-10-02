import {
  REACT_LINK,
  XPEPE_LINK,
  SDK_DAPP_PACKAGE_LINK,
  TYPESCRIPT_LINK
} from 'localConstants';

import { DashboardHeaderTextLink } from './components/DashboardHeaderTextLink';

// prettier-ignore
const styles = {
  dashboardHeaderContainer: 'dashboard-header-container flex flex-col p-8 lg:p-10 justify-center items-center gap-6 self-stretch',
  dashboardHeaderTitle: 'dashboard-header-title text-primary transition-all duration-300 text-center text-3xl xs:text-5xl lg:text-6xl font-medium',
  dashboardHeaderDescription: 'dashboard-header-description text-secondary transition-all duration-300 text-center text-base xs:text-lg lg:text-xl font-medium',
  dashboardHeaderDescriptionText: 'dashboard-header-description-text mx-1'
} satisfies Record<string, string>;

export const DashboardHeader = () => (
  <div className={styles.dashboardHeaderContainer}>
    <div className={styles.dashboardHeaderTitle}>welcome to xPEPE dApp</div>

    <div className={styles.dashboardHeaderDescription}>
      <span className={styles.dashboardHeaderDescriptionText}>
        have some fun @
      </span>

      <DashboardHeaderTextLink linkAddress={XPEPE_LINK}>
        xpepeonmvx.com
      </DashboardHeaderTextLink>

    </div>
  </div>
);
