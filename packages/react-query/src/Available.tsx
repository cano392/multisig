// Copyright 2017-2024 @polkadot/react-query authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import React from 'react';

import { useApi, useCall } from '@polkadot/react-hooks';

import FormatBalance from './FormatBalance.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  label?: React.ReactNode;
  params?: AccountId | AccountIndex | Address | string | Uint8Array | null;
  setMaxAmount?: (numner: BN | undefined) => void;
}

function AvailableDisplay ({ children, className = '', label, params, setMaxAmount }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const allBalances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [params]);

  setMaxAmount &&
  setMaxAmount(allBalances?.transferable || allBalances?.availableBalance)
  return (
    <FormatBalance
      className={className}
      label={label}
      value={allBalances?.transferable || allBalances?.availableBalance}
    >
      {children}
    </FormatBalance>
  );
}

export default React.memo(AvailableDisplay);
