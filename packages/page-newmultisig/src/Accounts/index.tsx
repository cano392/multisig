// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
// import type { KeyringAddress } from '@polkadot/ui-keyring/types';
// import type { Delegation, SortedAccount } from '../types.js';
// import type { SortCategory } from '../util.js';

import React from 'react';

import { styled} from '@polkadot/react-components';
// import { useAccounts, useDelegations, useFavorites } from '@polkadot/react-hooks';
// import { keyring } from '@polkadot/ui-keyring';

import Multisig from '../modals/MultisigCreate.js';
// import { sortAccounts } from '../util.js';

interface Props {
  className?: string;
  onStatusChange: (status: ActionStatus) => void;
}

// interface SortControls {
//   sortBy: SortCategory;
//   sortFromMax: boolean;
// }

// const DEFAULT_SORT_CONTROLS: SortControls = { sortBy: 'date', sortFromMax: true };

// const STORE_FAVS = 'accounts:favorites';


function Overview({ className = '', onStatusChange }: Props): React.ReactElement<Props> {
  // const { allAccounts } = useAccounts();
  // const [favorites, toggleFavorite] = useFavorites(STORE_FAVS);
  // const balances = { accounts: {} };
  // const [sortedAccounts, setSorted] = useState<SortedAccount[]>([]);
  // const { sortBy, sortFromMax } = DEFAULT_SORT_CONTROLS;
  // const delegations = useDelegations();

  // We use favorites only to check if it includes some element,
  // so Object is better than array for that because hashmap access is O(1).
  
  // console.log(toggleFavorite, sortedAccounts);
  
  // const favoritesMap = useMemo(
  //   () => Object.fromEntries(favorites.map((x) => [x, true])),
  //   [favorites]
  // );


  // const accountsMap = useMemo(
  //   () => allAccounts
  //     .map((address, index): Omit<SortedAccount, 'account'> & { account: KeyringAddress | undefined } => {
  //       const deleg = delegations && delegations[index]?.isDelegating && delegations[index]?.asDelegating;
  //       const delegation: Delegation | undefined = (deleg && {
  //         accountDelegated: deleg.target.toString(),
  //         amount: deleg.balance,
  //         conviction: deleg.conviction
  //       }) || undefined;

  //       return {
  //         account: keyring.getAccount(address),
  //         address,
  //         delegation,
  //         isFavorite: favoritesMap[address ?? ''] ?? false
  //       };
  //     })
  //     .filter((a): a is SortedAccount => !!a.account)
  //     .reduce((ret: Record<string, SortedAccount>, x) => {
  //       ret[x.address] = x;

  //       return ret;
  //     }, {}),
  //   [allAccounts, favoritesMap, delegations]
  // );

 
  // useEffect((): void => {
  //   setSorted((prev) => [
  //     ...prev
  //       .map((x) => accountsMap[x.address])
  //       .filter((x): x is SortedAccount => !!x),
  //     ...Object
  //       .keys(accountsMap)
  //       .filter((a) => !prev.find((y) => a === y.address))
  //       .map((a) => accountsMap[a])
  //   ]);
  // }, [accountsMap]);

  // useEffect((): void => {
  //   setSorted((sortedAccounts) =>
  //     sortAccounts(sortedAccounts, accountsMap, balances.accounts, sortBy, sortFromMax));
  // }, [accountsMap, balances, sortBy, sortFromMax]);

  return (
    <StyledDiv className={className}>
      <Multisig
        onClose={() =>{}}
        onStatusChange={onStatusChange}
      />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
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
`;

export default React.memo(Overview);
