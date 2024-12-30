// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { BN } from '@polkadot/util';
import type { AccountBalance, Delegation, SortedAccount } from '../types.js';
import type { SortCategory } from '../util.js';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { styled, Table } from '@polkadot/react-components';
import { getAccountCryptoType } from '@polkadot/react-components/util';
import { useAccounts, useDelegations, useFavorites, useNextTick, useProxies } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { BN_ZERO } from '@polkadot/util';

import { useTranslation } from '../translate.js';
import { sortAccounts } from '../util.js';
import Account from './Account.js';

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

type GroupName = 'accounts' | 'chopsticks' | 'hardware' | 'injected' | 'multisig' | 'proxied' | 'qr' | 'testing';

const DEFAULT_SORT_CONTROLS: SortControls = { sortBy: 'date', sortFromMax: true };

const STORE_FAVS = 'accounts:favorites';

const GROUP_ORDER: GroupName[] = ['accounts', 'injected', 'qr', 'hardware', 'proxied', 'multisig', 'testing', 'chopsticks'];

function groupAccounts(accounts: SortedAccount[]): Record<GroupName, string[]> {
  const ret: Record<GroupName, string[]> = {
    accounts: [],
    chopsticks: [],
    hardware: [],
    injected: [],
    multisig: [],
    proxied: [],
    qr: [],
    testing: []
  };

  for (let i = 0, count = accounts.length; i < count; i++) {
    const { address } = accounts[i];
    const cryptoType = getAccountCryptoType(address);
    if (cryptoType !== 'multisig') {
      ret.accounts.push(address);
    }
  }
  return ret;
}

function Overview({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAccounts } = useAccounts();
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS);
  const [balances, setBalances] = useState<Balances>({ accounts: {} });
  const [sortedAccounts, setSorted] = useState<SortedAccount[]>([]);
  const { sortBy, sortFromMax } = DEFAULT_SORT_CONTROLS
  const delegations = useDelegations();
  const proxies = useProxies();
  const isNextTick = useNextTick();

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
        accounts: [[<>{t('Accounts')}<div className='sub'>{t('')}</div></>]],
        chopsticks: [[<>{t('chopsticks')}<div className='sub'>{t('local accounts added via chopsticks fork')}</div></>]],
        hardware: [[<>{t('hardware')}<div className='sub'>{t('accounts managed via hardware devices')}</div></>]],
        injected: [[<>{t('extension')}<div className='sub'>{t('accounts available via browser extensions')}</div></>]],
        multisig: [[<>{t('multisig')}<div className='sub'>{t('on-chain multisig accounts')}</div></>]],
        proxied: [[<>{t('proxied')}<div className='sub'>{t('on-chain proxied accounts')}</div></>]],
        qr: [[<>{t('via qr')}<div className='sub'>{t('accounts available via mobile devices')}</div></>]],
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
          filter={''}
          isFavorite={isFavorite}
          key={address}
          proxy={proxies?.[index]}
          setBalance={setBalance}
          toggleFavorite={toggleFavorite}
        />
      );

      return all;
    }, {}),
    [accountsMap, proxies, setBalance, toggleFavorite]
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
      {!isNextTick || !sortedAccounts.length
        ? (
          <div className='detail'>
            <svg width="25" height="25" viewBox="0 0 25 25">
              <path fill="var(--color-icon)" d="M12.5 2c0.5 0 1 0.15 1.4 0.4l7.6 4.4c0.9 0.5 1.4 1.4 1.4 2.4v6.4c0 1-0.5 1.9-1.4 2.4l-7.6 4.4c-0.4 0.25-0.9 0.4-1.4 0.4s-1-0.15-1.4-0.4l-7.6-4.4c-0.9-0.5-1.4-1.4-1.4-2.4v-6.4c0-1 0.5-1.9 1.4-2.4l7.6-4.4c0.4-0.25 0.9-0.4 1.4-0.4z" />
              <path fill="var(--bg-page)" d="M11.5 8h2v7h-2zM11.5 16h2v2h-2z" />
            </svg>
            <p>No Accounts</p>
          </div>
        )
        : GROUP_ORDER.map((group) =>
          groups[group] && (
            <Table
              empty={t('No accounts')}
              header={header[group]}
              isSplit
              key={group}
            >
              {groups[group]}
            </Table>
          )
        )
      }
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  background-color: var(--bg-menubar);
  border-radius: 1rem;
  height: 100%;
  .ui--Dropdown {
    width: 15rem;
  }

  table:not(.isInline):not(.noMargin) {
    margin-bottom: 0 !important;
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
  .detail {
      padding: 1rem 2rem 1rem 1rem;
      height: 4rem;
      align-items: center;
      text-align: center;
      justity-content: center;
      display: flex;
      font-size: var(--font-size-h3);  
      p {
        padding-left: 1rem;
      }
    }
`;

export default React.memo(Overview);
