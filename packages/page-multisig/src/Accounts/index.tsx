// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { BN } from '@polkadot/util';
import type { AccountBalance, Delegation, SortedAccount } from '../types.js';
import type { SortCategory } from '../util.js';

import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { styled, MultisigTable } from '@polkadot/react-components';
import { getAccountCryptoType } from '@polkadot/react-components/util';
import { useAccounts, useDelegations, useFavorites, useNextTick, useProxies, useToggle } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../translate.js';
import { sortAccounts } from '../util.js';
import Account from './Account.js';
import Sidebar from '@polkadot/react-components/MultisigAccountSidebar/Sidebar';
import { AddressContext } from '@polkadot/react-components/MultisigAccountSidebar/index';
import useMultisigApprovals from '../../../page-multisig/src/Accounts/useMultisigApprovals.js';

interface Balances {
  accounts: Record<string, AccountBalance>;
  summary?: AccountBalance;
}

interface Props {
  className?: string;
  onStatusChange: (status: ActionStatus) => void;
}

interface SortControls {
  sortBy: SortCategory;
  sortFromMax: boolean;
}

type GroupName = 'hardware' | 'multisig' | 'testing';

const DEFAULT_SORT_CONTROLS: SortControls = { sortBy: 'date', sortFromMax: true };

const STORE_FAVS = 'accounts:favorites';

const GROUP_ORDER: GroupName[] = ['hardware', 'multisig', 'testing'];

function groupAccounts(accounts: SortedAccount[]): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    hardware: [],
    multisig: [],
    testing: []
  };

  for (let i = 0, count = accounts.length; i < count; i++) {
    const { address } = accounts[i];
    const cryptoType = getAccountCryptoType(address);
    if (cryptoType === 'multisig') {
      ret.multisig.push(address);
    }
  }

  return ret;
}

function Overview({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAccounts } = useAccounts();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS);
  const [balances, setBalances] = useState<Balances>({ accounts: {} });
  const filterOn = '';
  const [sortedAccounts, setSorted] = useState<SortedAccount[]>([]);
  const { sortBy, sortFromMax } = DEFAULT_SORT_CONTROLS;
  const delegations = useDelegations();
  const proxies = useProxies();
  const isNextTick = useNextTick();
  const [isMultisigOpen, toggleMultisig] = useToggle();

  const { multisigAddress, onUpdateName } = useContext(AddressContext)
  const multiInfos = useMultisigApprovals(multisigAddress || '');
  const [isProxyOverviewOpen, toggleProxyOverview] = useToggle();

  const setBalance = useCallback(
    (account: string, balance: AccountBalance) =>
      setBalances(({ accounts }: Balances): Balances => {
        accounts[account] = balance;

        const aggregate = (key: keyof AccountBalance) =>
          Object.values(accounts).reduce((total: BN, value: AccountBalance) => total.add(value[key]), BN_ZERO);

        return {
          accounts,
          summary: {
            bonded: aggregate('bonded'),
            locked: aggregate('locked'),
            redeemable: aggregate('redeemable'),
            total: aggregate('total'),
            transferable: aggregate('transferable'),
            unbonding: aggregate('unbonding')
          }
        };
      }),
    []
  );

  // We use favorites only to check if it includes some element,
  // so Object is better than array for that because hashmap access is O(1).
  const favoritesMap = useMemo(
    () => Object.fromEntries(favorites.map((x) => [x, true])),
    [favorites]
  );

  const accountsMap = useMemo(
    () => allAccounts
      .map((address, index): Omit<SortedAccount, 'account'> & { account: KeyringAddress | undefined } => {
        const deleg = delegations && delegations[index]?.isDelegating && delegations[index]?.asDelegating;
        const delegation: Delegation | undefined = (deleg && {
          accountDelegated: deleg.target.toString(),
          amount: deleg.balance,
          conviction: deleg.conviction
        }) || undefined;

        return {
          account: keyring.getAccount(address),
          address,
          delegation,
          isFavorite: favoritesMap[address ?? ''] ?? false
        };
      })
      .filter((a): a is SortedAccount => !!a.account)
      .reduce((ret: Record<string, SortedAccount>, x) => {
        ret[x.address] = x;

        return ret;
      }, {}),
    [allAccounts, favoritesMap, delegations]
  );

  const header = useMemo(
    (): Record<GroupName, [React.ReactNode?, string?, number?, (() => void)?][]> => {
      const ret: Record<GroupName, [React.ReactNode?, string?, number?, (() => void)?][]> = {
        hardware: [[<>{t('hardware')}<div className='sub'>{t('accounts managed via hardware devices')}</div></>]],
        multisig: [[<>{t('Multisignature')}<div className='sub'>{t('')}</div></>]],
        testing: [[<>{t('development')}<div className='sub'>{t('accounts derived via development seeds')}</div></>]]
      };

      Object.values(ret).forEach((a): void => {
        a[0][1] = 'start';
        a[0][2] = 4;
      });

      return ret;
    },
    [t]
  );

  const grouped = useMemo(
    () => groupAccounts(sortedAccounts),
    [sortedAccounts]
  );

  const accounts = useMemo(
    () => Object.values(accountsMap).reduce<Record<string, React.ReactNode>>((all, { account, address, delegation, isFavorite }, index) => {
      all[address] = (
        <Account
          account={account}
          delegation={delegation}
          filter={filterOn}
          isFavorite={isFavorite}
          key={address}
          proxy={proxies?.[index]}
          setBalance={setBalance}
          toggleFavorite={toggleFavorite}
          isMultisigOpen={isMultisigOpen}
          toggleMultisig={toggleMultisig}
          toggleProxyOverview={toggleProxyOverview}
          isProxyOverviewOpen={isProxyOverviewOpen}
          multisigAddress={multisigAddress}
        />
      );

      return all;
    }, {}),
    [accountsMap, filterOn, proxies, setBalance, toggleFavorite, toggleMultisig, isMultisigOpen, toggleProxyOverview, isProxyOverviewOpen, multisigAddress]
  );

  const groups = useMemo(
    () => GROUP_ORDER.reduce<Record<string, React.ReactNode[]>>((groups, group) => {
      const items = grouped[group];

      if (items.length) {
        groups[group] = items.map((account) => accounts[account]);
      }

      return groups;
    }, {}),
    [grouped, accounts]
  );

  useEffect((): void => {
    setSorted((prev) => [
      ...prev
        .map((x) => accountsMap[x.address])
        .filter((x): x is SortedAccount => !!x),
      ...Object
        .keys(accountsMap)
        .filter((a) => !prev.find((y) => a === y.address))
        .map((a) => accountsMap[a])
    ]);
  }, [accountsMap]);

  useEffect((): void => {
    setSorted((sortedAccounts) =>
      sortAccounts(sortedAccounts, accountsMap, balances.accounts, sortBy, sortFromMax));
  }, [accountsMap, balances, sortBy, sortFromMax]);

  return (
    <StyledDiv className={className}>
      {grouped['multisig'][0] === undefined ? (
        <div className='empty-account'>
          <div className='detail'>
            <svg width="25" height="25" viewBox="0 0 25 25">
              <path fill="var(--color-icon)" d="M12.5 2c0.5 0 1 0.15 1.4 0.4l7.6 4.4c0.9 0.5 1.4 1.4 1.4 2.4v6.4c0 1-0.5 1.9-1.4 2.4l-7.6 4.4c-0.4 0.25-0.9 0.4-1.4 0.4s-1-0.15-1.4-0.4l-7.6-4.4c-0.9-0.5-1.4-1.4-1.4-2.4v-6.4c0-1 0.5-1.9 1.4-2.4l7.6-4.4c0.4-0.25 0.9-0.4 1.4-0.4z" />
              <path fill="var(--bg-page)" d="M11.5 8h2v7h-2zM11.5 16h2v2h-2z" />
            </svg>
            <p>No Multisig accounts</p>
          </div>
        </div>
      ) : (
        <>
          <div className='multisig_list'>
            {!isNextTick || !sortedAccounts.length
              ? (
                <MultisigTable
                  empty={isNextTick && sortedAccounts && t("You don't have any accounts. Some features are currently hidden and will only become available once you have accounts.")}
                  header={header.multisig}
                />
              )
              : GROUP_ORDER.map((group) =>
                groups[group] && (
                  <MultisigTable
                    empty={t('No accounts')}
                    header={header[group]}
                    isSplit
                    key={group}
                  >
                    {groups[group]}
                  </MultisigTable>
                )
              )
            }
          </div>
          <div className='multisig_detail'>
            {multisigAddress !== null ? (
              <>
                {multiInfos && multiInfos.length !== 0 ? (
                  <Sidebar
                    address={multisigAddress || ''}
                    dataTestId='account-sidebar'
                    ongoing={multiInfos}
                    onUpdateName={onUpdateName}
                    toggleMultisig={toggleMultisig}
                    toggleProxyOverview={toggleProxyOverview}
                  />
                ) : (
                  <>
                    <Sidebar
                      address={multisigAddress || ''}
                      dataTestId='account-sidebar'
                      ongoing={[]}
                      onUpdateName={onUpdateName}
                      toggleMultisig={toggleMultisig}
                      toggleProxyOverview={toggleProxyOverview}
                    />
                  </>
                )}
              </>
            ) : (
              <></>
            )}

          </div>
        </>
      )}

    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  height: 100%;
  // border: 1px solid var(--border-card);
  border-radius: 1rem;
  padding-top: 0px !important;
  .ui--Dropdown {
    width: 15rem;
  }
  .header-box {
    .dropdown-section {
      display: flex;
      flex-direction: row;
      align-items: center;
    }

    .ui--Button-Group {
      margin-left: auto;
    }
  }
  .multisig_detail {
    // border-left: 2px solid var(--border-table);
    width: 70%;
    padding-left: 15px !important;
    
    // @media only screen and (max-width: 1400px) {
    //   width: 76%;
    // }

  }
  
  .multisig_list {
    width: 30%;
    background-color: var(--bg-menubar);
    border-radius: 1rem;

    .start {
      padding-left: 0 !important;
    }
    // @media only screen and (max-width: 1400px) {
    //   width: 24%;
    // }
  }
  .empty-account {
    width: 100%;
    height: 4rem;
    display: flex;
    padding: 1rem 2rem 1rem 1rem;
    border-radius: 1rem;
    background-color: var(--bg-menubar);
    justify-content: space-between;
    align-items: center;
    text-align: center;
    .detail {
      display: flex;
      font-size: var(--font-size-h3);  
      p {
        padding-left: 1rem;
      }
    }
    span {
      color: var(--subcolor-text);
    }
  }
`;

export default React.memo(Overview);
