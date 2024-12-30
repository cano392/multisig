// Copyright 2017-2024 @polkadot/react-params authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Registry, TypeDef } from '@polkadot/types/types';
import type { ComponentMap, RawParam, RawParamOnChangeValue, RawParams } from './types.js';

import React, { useCallback } from 'react';

import Param from './Param/index.js';
import { styled } from '@polkadot/react-components';

interface Props {
  defaultValue: RawParam;
  index: number;
  isDisabled?: boolean;
  isError?: boolean;
  name?: string;
  onChange: (index: number, value: RawParamOnChangeValue) => void;
  onEnter?: () => void;
  onEscape?: () => void;
  overrides?: ComponentMap;
  registry: Registry;
  type: TypeDef;
  values?: RawParams | null;
}

function ParamComp ({ defaultValue, index, isDisabled, isError, name, onChange, onEnter, onEscape, overrides, registry, type }: Props): React.ReactElement<Props> {
  const _onChange = useCallback(
    (value: RawParamOnChangeValue): void =>
      onChange(index, value),
    [index, onChange]
  );
  
  return (
    <StyledDiv className={`ui--Param-composite`}>
      <Param
        className={`${name == 'dest' && 'hidden_dest'}`}
        defaultValue={defaultValue}
        isDisabled={isDisabled}
        isError={isError}
        key={`input:${index}`}
        name={name}
        onChange={_onChange}
        onEnter={onEnter}
        onEscape={onEscape}
        overrides={overrides}
        registry={registry}
        type={type}
      />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  .hidden_dest > .ui--Labelled{    
    display: none !important;    
  }
`;
export default React.memo(ParamComp);
