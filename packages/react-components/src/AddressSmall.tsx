// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountId, Address } from '@polkadot/types/interfaces';

import React from 'react';

import IdentityIcon from './IdentityIcon/index.js';
import AccountName from './AccountName.js';
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
}

function AddressSmall ({ children, className = '', defaultName, overrideName, parentAddress, toggle, value, withShortAddress = false, withSidebar = true }: Props): React.ReactElement<Props> {
  return (
    <StyledDiv className={`${className} ui--AddressSmall ${(parentAddress || withShortAddress) ? 'withPadding' : ''}`}>
      <span className='ui--AddressSmall-icon'>
        <IdentityIcon value={value as Uint8Array} size={40}/>
      </span>
      <span className='ui--AddressSmall-info'>
        {parentAddress && (
          <div className='parentName'>
            <ParentAccount address={parentAddress} />
          </div>
        )}
        <AccountName
          className={`accountName ${withSidebar ? 'withSidebar' : ''}`}
          defaultName={defaultName}
          // onClick={onClickName}
          override={overrideName}
          toggle={toggle}
          value={value}
          withSidebar={withSidebar}
        >
          {children}
        </AccountName>
        {value && withShortAddress && (
          <div
            className='shortAddress media--1400'
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
  // white-space: nowrap;

  &.withPadding {
    // padding: 0.75rem 0;
    display: flex;
    // padding-right: 2rem;
    width: 100%;
  }

  .accountName {
    font-size: var(--font-size-account-name);
  }
  .ui--AddressSmall-icon {
    display: flex;
    align-items: center;
    .ui--IdentityIcon {
      // margin-right: 0.5rem;
      vertical-align: middle; 
    }
  }

  .ui--AddressSmall-info {
    // position: relative;
    display: flex;
    align-items: center;
    // column-gap: 2rem;
    padding-left: 1rem;
    width: calc(100% - 42px);

    .parentName {
      left: 0;
      position: absolute;
      top: -0.80rem;
    }

    .shortAddress {
      font-size: var(--font-size-account-name);
      width: 70%;
      padding-left: 2rem;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .ui--AccountName {
    overflow: hidden;
    vertical-align: middle;
    // white-space: nowrap;
    width: 30%;

    &.withSidebar {
      cursor: help;
    }
      
    @media only screen and (max-width: 1400px) {
      width: 100%;
    }
  }

`;

export default React.memo(AddressSmall);
