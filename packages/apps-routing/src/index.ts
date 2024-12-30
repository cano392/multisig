// Copyright 2017-2024 @polkadot/apps-routing authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Routes, TFunction } from './types.js';

import accounts from './accounts.js';
import addresses from './addresses.js';
import extrinsics from './extrinsics.js';
import newMiltisig from './newMultisig.js'
import multisigAccounts from './multisigAccounts.js'

export default function create (t: TFunction): Routes {
  return [
    newMiltisig(t),
    multisigAccounts(t),
    accounts(t),
    addresses(t),
    extrinsics(t),
  ];
}
