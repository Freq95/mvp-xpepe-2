import classNames from 'classnames';
import { ReactComponent as XpepeLogo } from '../../assets/icons/pepe_small_4.svg'

// prettier-ignore
const styles = {
  logo: 'logo flex items-center justify-center gap-3 cursor-pointer hover:opacity-75',
  logoIcon: 'logo-icon relative -bottom-0.75 w-8 h-8', // dimensiuni pentru svg
  logoText: 'logo-text text-xl lg:text-2xl font-medium flex text-primary relative -top-0.5 leading-none transition-all duration-200 ease-in-out lg:top-0',
  logoTextHidden: 'logo-text-hidden hidden lg:!flex'
} satisfies Record<string, string>;

interface LogoPropsType {
  hideTextOnMobile?: boolean;
}

export const Logo = ({ hideTextOnMobile }: LogoPropsType) => (
  <div className={styles.logo}>
    <XpepeLogo className="logo-icon w-8 h-8 text-primary" />

    <div
      className={classNames(styles.logoText, {
        [styles.logoTextHidden]: hideTextOnMobile
      })}
    >
      $xPEPE
    </div>
  </div>
);
