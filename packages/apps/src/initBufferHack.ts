// Copyright 2017-2024 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { xglobal } from '@polkadot/x-global';

try {
  if (Buffer.from([1, 2, 3]).length === 3) {
    xglobal.Buffer = Buffer;
  }
} catch {
}
