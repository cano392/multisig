// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressFlags } from '@polkadot/react-hooks/types';

import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';

import { useToggle } from '@polkadot/react-hooks';

import AccountName from '../AccountName.js';
import Button from '../Button/index.js';
import IdentityIcon from '../IdentityIcon/index.js';
import Input from '../Input.js';
import { useTranslation } from '../translate.js';
import { styled } from '@polkadot/react-components';
import Balances from './Balances.js';

interface Props {
  value: string,
  editingName: boolean,
  defaultValue: string,
  onChange: (value: string) => void,
  flags: AddressFlags,
  accountIndex: string | undefined,
}

function AddressSection({ accountIndex, defaultValue, editingName, flags, onChange, value }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isCopyShown, toggleIsCopyShown] = useToggle();
  const NOOP = () => undefined;

  return (
    <StyledAddressSection className='ui--AddressSection'>
      <IdentityIcon
        size={80}
        value={value}
      />
      <div className='ui--AddressSection__AddressColumn'>
        <AccountName
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
        <div className='ui--AddressMenu-addr'
            data-testid='short-address'
        >
          <div className='ui--Value'>
            {value.toString().slice(0, 40)}
          </div>
          <div className='ui--Copy'>
            <CopyToClipboard
              text={value}
            >
              <span className='copy-btn'>
                  <Button
                    icon={isCopyShown ? 'check' : 'copy'}
                    label={isCopyShown ? t('Copied') : t('')}
                    onClick={isCopyShown ? NOOP : toggleIsCopyShown}
                    onMouseLeave={isCopyShown ? toggleIsCopyShown : NOOP}
                  />
              </span>
            </CopyToClipboard>
          </div>
        </div>
        {accountIndex && (
          <div className='ui--AddressMenu-index'>
            <label>{t('index')}:</label> {accountIndex}
          </div>
        )}
          
      </div>
      <Balances 
        address={value} 
        className='ui--Balance-Info'
      />
    </StyledAddressSection>
  );
}

const StyledAddressSection = styled.div`
  width: calc(100% - 360px);
  .copy-btn {
    margin-left: 0rem;
    .ui--Button {
      border: none !important;
    }
  }
  
  .ui--AddressMenu-addr {
    display: flex;
  }
  .ui--Balance-Info {
    flex-basis: 17rem;
    padding: 0 1.5rem;
  }

  .ui--Value {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    align-content: center;
  }
  .ui--Copy {
    flex-basis: 50px;
  }
  
  @media only screen and (max-width: 1600px) {
    width: calc(100% - 160px);
  }
`

export default React.memo(AddressSection);
