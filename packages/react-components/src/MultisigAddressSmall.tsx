// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, Address } from '@polkadot/types/interfaces';

import React from 'react';

import IdentityIcon from './IdentityIcon/index.js';
import MultisigAccountName from './MultisigAccountName.js';
import ParentAccount from './ParentAccount.js';
import { styled } from './styled.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  defaultName?: string;
  onClickName?: () => void;
  overrideName?: React.ReactNode;
  parentAddress?: string;
  withSidebar?: boolean;
  withShortAddress?: boolean;
  toggle?: unknown;
  value?: string | Address | AccountId | null;
  isActive: boolean;
}

function MultisigAddressSmall ({ children, className = '', defaultName, onClickName, overrideName, parentAddress, toggle, value, withShortAddress = false, withSidebar = true, isActive }: Props): React.ReactElement<Props> {
  return (
    <StyledDiv className={`${className} ui--AddressSmall ${(parentAddress || withShortAddress) ? 'withPadding' : ''} ${isActive ? 'selected' : ''}`}>
      <span className='ui--AddressSmall-icon'>
        <IdentityIcon value={value as Uint8Array} size={50}/>
      </span>
      <span className='ui--AddressSmall-info'>
        {parentAddress && (
          <div className='parentName'>
            <ParentAccount address={parentAddress} />
          </div>
        )}
        <MultisigAccountName
          className={`accountName ${withSidebar ? 'withSidebar' : ''}`}
          defaultName={defaultName}
          onClick={onClickName}
          override={overrideName}
          toggle={toggle}
          value={value}
          withSidebar={withSidebar}
        >
          {children}
        </MultisigAccountName>
        {value && withShortAddress && (
          <div
            className='shortAddress'
            data-testid='short-address'
          >
            {value.toString()}
          </div>
        )}
      </span>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 1rem;
  background-color: var(--bg-page);
  border-radius: 1rem 0rem 0rem 1rem;

  &:hover {
    background-color: var(--item-active);
    color: var(--color-text-hover);
  }

  &:active {
    background-color: var(--item-active);
    color: var(--color-text-hover);
  }
  
  &.selected {
    background-color: var(--item-active);
    color: var(--color-text-hover);
    &.withPadding {
      padding: 0.3rem 0rem 1.5rem 1.2rem;
    }
  }

  &.withPadding {
    padding: 0rem 0rem 1.2rem 1.2rem;
  }

  .ui--AddressSmall-icon {
    .ui--IdentityIcon {
      margin-right: 0.5rem;
      vertical-align: middle;
    }
  }

  .ui--AddressSmall-info {
    position: relative;
    vertical-align: middle;

    .parentName, .shortAddress {
      font-size: var(--font-size-tiny);
    }

    .parentName {
      left: 0;
      position: absolute;
      top: -0.80rem;
    }

    .shortAddress {
      bottom: -0.95rem;
      color: #8B8B8B;
      display: inline-block;
      left: 0;
      min-width: 100%;
      max-width: 100%;
      position: absolute;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--color-input);
    }
  }

  .ui--AccountName {
    overflow: hidden;
    vertical-align: bottom;
    white-space: nowrap;
  }
`;

export default React.memo(MultisigAddressSmall);
