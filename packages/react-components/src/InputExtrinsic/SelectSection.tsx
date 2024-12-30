// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { DropdownOptions } from '../util/types.js';

import React, { useEffect } from 'react';

import { useApi } from '@polkadot/react-hooks';

interface Props {
  className?: string;
  defaultValue?: string;
  isDisabled?: boolean;
  isError?: boolean;
  onChange?: (value: string) => void;
  options: DropdownOptions;
  value: SubmittableExtrinsicFunction<'promise'>;
}

function setSectionFromChain (chain: string, onChange: (value: string) => void) {
  switch (chain) {
    case 'commune':
      onChange('subspaceModule');
      break;
    case 'Bittensor':
      onChange('subtensorModule');
      break;
    default:
      break;
  }
}

function isBitOrCom (chain: string): any {
  switch (chain) {
    case 'commune':
      return true;
    case 'Bittensor':
      return true;
    default:
      return false;
  }
}

function SelectSection ({ onChange }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  useEffect(() => {
    onChange && isBitOrCom(api.runtimeChain.toString()) &&
    setSectionFromChain(api.runtimeChain.toString(), onChange);
  }, [])
  return (
    <></>
  );
}

export default React.memo(SelectSection);
