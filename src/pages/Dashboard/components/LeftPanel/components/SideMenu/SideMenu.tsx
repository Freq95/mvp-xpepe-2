import {
  faChevronUp,
  faGamepad,
  faImagePortrait,
  faTrophy,
  faWallet,
  faChartLine
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useState } from 'react';

import styles from './sideMenu.styles';
import { ItemIcon } from './components';

type SideMenuPropsType = {
  setIsOpen: (open: boolean) => void;
  onSectionChange: (id: string) => void;
};

const menuItems = [
  { title: 'scoreboard', icon: faTrophy, id: 'scoreboard' },
  { title: 'xPEPE game', icon: faGamepad, id: 'xpepe' },
  { title: 'NFTs', icon: faImagePortrait, id: 'nfts' },
  { title: 'transactions', icon: faWallet, id: 'transactions' },
  { title: 'market analysis', icon: faChartLine, id: 'market' }
];

export const SideMenu = ({ setIsOpen, onSectionChange }: SideMenuPropsType) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('scoreboard');

  const toggleCollapse = () => {
    setIsCollapsed((isCollapsed) => !isCollapsed);
  };

  const handleMenuItemClick = (id: string) => {
    setIsOpen(false);
    setActiveItem(id);
    onSectionChange(id);
  };

  return (
    <div className={styles.sideMenuContainer}>
      <div className={styles.sideMenuHeader}>
        <h2 className={styles.sideMenuHeaderTitle}>library</h2>

        <FontAwesomeIcon
          icon={faChevronUp}
          className={classNames(styles.sideMenuHeaderIcon, {
            [styles.sideMenuHeaderIconRotated]: isCollapsed
          })}
          onClick={toggleCollapse}
        />
      </div>

      <div
        className={classNames(styles.sideMenuItems, {
          [styles.sideMenuItemsHidden]: isCollapsed
        })}
      >
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={classNames(styles.sideMenuItem, {
              [styles.sideMenuItemActive]: item.id === activeItem
            })}
          >
            {item.icon && <ItemIcon icon={item.icon} />}
            <div className={styles.sideMenuItemTitle}>{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};