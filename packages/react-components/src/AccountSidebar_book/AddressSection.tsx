// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressFlags } from '@polkadot/react-hooks/types';

import React from 'react';

import { useBalancesAll } from '@polkadot/react-hooks';

import AccountName from '../AccountName.js';
import IdentityIcon from '../IdentityIcon/index.js';
import Input from '../Input.js';
import { useTranslation } from '../translate.js';
import { AddressInfo, styled } from '@polkadot/react-components';

interface Props {
  value: string,
  editingName: boolean,
  defaultValue: string,
  onChange: (value: string) => void,
  flags: AddressFlags,
  accountIndex: string | undefined,
}

const BAL_OPTS_DEFAULT = {
  available: true,
  bonded: true,
  // locked: true,
  // redeemable: false,
  // reserved: true,
  // total: true,
  // unlocking: false,
  // vested: false
};

function AddressSection({ accountIndex, defaultValue, editingName, flags, onChange, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const balancesAll = useBalancesAll(value);

  return (
    <StyledAddressSection>
      <div className='ui--AddressBook-Icon-Name'>
        <IdentityIcon
          className='ui--IdentityIcon-RightPadding'
          size={40}
          value={value}
        />
        <AccountName
          className='ui--AccountName-LeftPadding'
          override={
            editingName
              ? (
                <Input
                  className='name--input'
                  defaultValue={defaultValue}
                  label='name-input'
                  onChange={onChange}
                  withLabel={false}
                />
              )
              : flags.isEditable
                ? (defaultValue.toUpperCase() || t('<unknown>'))
                : undefined
          }
          value={value}
          withSidebar={false}
        />
        {accountIndex && (
          <div className='ui--AddressMenu-index'>
            <label>{t('index')}:</label> {accountIndex}
          </div>
        )}
      </div>
      <div className='ui--AddressBook-Address-Copy'>
        <div className='ui--AddressMenu-addr media--1400'>
          {value}
        </div>
        <div className='ui--AddressMenu-copyaddr'>      
          <AddressInfo
            address={value}
            balancesAll={balancesAll}
            withBalance={BAL_OPTS_DEFAULT}
            withLabel
          />      
        </div>
      </div>
    </StyledAddressSection>
  );
}

const StyledAddressSection = styled.div`
  display: flex;
  width: 72%;
  padding-right: 3rem;

  @media only screen and (max-width: 1921px) {
    width: 70%;
  }

  @media only screen and (max-width: 1700px) {
    width: 68%;
  }
  
  @media only screen and (max-width: 1580px) {
    width: 64%;
  }

  @media only screen and (max-width: 1400px) {
    width: 60%;
  }

  .ui--AddressBook-Icon-Name {
    display: flex;
    align-items: center;
    width: 20%;

    @media only screen and (max-width: 1580px) {
      width: 16%;
    }

    @media only screen and (max-width: 1400px) {
      width: 30%;
    }
  }
  .ui--AddressBook-Address-Copy {
    display: flex;
    align-items: center;
    width: 80%;
    justify-content: space-between;
    font-size: var(--font-size-account-name);

    @media only screen and (max-width: 1580px) {
      width: 84%;
    }

    @media only screen and (max-width: 1400px) {
      width: 70%;
      justify-content: end;
    }

    .ui--AddressMenu-copyaddr {
      display: flex;
      width: 40%;
      justify-content: center;
      .ui--AddressInfo {
        align-items: center;
      }
      
      @media only screen and (max-width: 1801px) {
        width: 42%;
      }

      @media only screen and (max-width: 1760px) {
        width: 45%;
      }

      @media only screen and (max-width: 1680px) {
        width: 48%;
      }

      @media only screen and (max-width: 1580px) {
        width: 52%;
      }

      @media only screen and (max-width: 1520px) {
        width: 55%;
      }

      @media only screen and (max-width: 1400px) {
        width: 90%;
      }
    }

    .ui--AddressMenu-addr {
      width: 60%;
      padding-right: 3rem;
      padding-left: 1rem;
      word-break: break-all;

      @media only screen and (max-width: 1801px) {
        width: 58%;
      }
      
      @media only screen and (max-width: 1760px) {
        width: 55%;
      }

      @media only screen and (max-width: 1680px) {
        width: 52%;
      }

      @media only screen and (max-width: 1580px) {
        width: 48%;
      }

      @media only screen and (max-width: 1520px) {
        width: 45%;
      }
    }
  }  
  .ui--AccountName-LeftPadding {
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
    word-break: break-word;
    font-size: var(--font-size-account-name);
  }
  .ui--IdentityIcon-RightPadding {
    padding-right: 1rem;
    border: none;
  }
`

export default React.memo(AddressSection);
