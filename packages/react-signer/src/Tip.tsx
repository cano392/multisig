// Copyright 2017-2024 @polkadot/react-signer authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { BN } from '@polkadot/util';

import React, { useEffect } from 'react';

import { BN_ZERO } from '@polkadot/util';

interface Props {
  className?: string;
  onChange: (tip?: BN) => void;
}

function Tip ({ onChange }: Props): React.ReactElement<Props> | null {

  useEffect((): void => {
    onChange(BN_ZERO);
  }, [onChange]);
  
  return (
    <></>
  );
}

export default React.memo(Tip);
