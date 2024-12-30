// Copyright 2017-2024 @polkadot/app-addresses authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { ModalProps as Props } from '../types.js';

import React, { useCallback, useMemo, useState } from 'react';

import { Button, Input, InputAddress, Modal, styled } from '@polkadot/react-components';
import { useApi, useCall } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { hexToU8a } from '@polkadot/util';
import { ethereumEncode } from '@polkadot/util-crypto';

import { useTranslation } from '../translate.js';

interface AddrState {
  address: string;
  addressInput: string;
  isAddressExisting: boolean;
  isAddressValid: boolean;
  isPublicKey: boolean;
}

interface NameState {
  isNameValid: boolean;
  name: string;
}

function Create ({ onClose, onStatusChange }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api, isEthereum } = useApi();
  const [{ isNameValid, name }, setName] = useState<NameState>({ isNameValid: false, name: '' });
  const [{ address, addressInput, isAddressExisting, isAddressValid }, setAddress] = useState<AddrState>({ address: '', addressInput: '', isAddressExisting: false, isAddressValid: false, isPublicKey: false });
  const info = useCall<DeriveAccountInfo>(!!address && isAddressValid && api.derive.accounts.info, [address]);
  const isValid = useMemo(() => (isAddressValid && isNameValid) && !!info?.accountId, [isAddressValid, isNameValid, info]);

  const _onChangeAddress = useCallback(
    (addressInput: string): void => {
      let address = '';
      let isAddressValid = true;
      let isAddressExisting = false;
      let isPublicKey = false;

      try {
        if (isEthereum) {
          const rawAddress = hexToU8a(addressInput);

          address = ethereumEncode(rawAddress);
          isPublicKey = rawAddress.length === 20;
        } else {
          const publicKey = keyring.decodeAddress(addressInput);

          address = keyring.encodeAddress(publicKey);
          isPublicKey = publicKey.length === 32;
        }

        if (!isAddressValid) {
          const old = keyring.getAddress(address);

          if (old) {
            const newName = old.meta.name || name;

            isAddressExisting = true;
            isAddressValid = true;
            setName({ isNameValid: !!(newName || '').trim(), name: newName });
          }
        }
      } catch {
        isAddressValid = false;
      }

      setAddress({ address: isAddressValid ? address : '', addressInput, isAddressExisting, isAddressValid, isPublicKey });
    },
    [isEthereum, name]
  );

  const _onChangeName = useCallback(
    (name: string) => setName({ isNameValid: !!name.trim(), name }),
    []
  );

  const _onCommit = useCallback(
    (): void => {
      const status = { action: 'create' } as ActionStatus;

      if (!isValid || !info?.accountId) {
        return;
      }

      try {
        const address = info.accountId.toString();

        keyring.saveAddress(address, { genesisHash: keyring.genesisHash, name: name.trim(), tags: [] });

        status.account = address;
        status.status = address ? 'success' : 'error';
        status.message = isAddressExisting
          ? t('address edited')
          : t('address created');

        InputAddress.setLastValue('address', address);
      } catch (error) {
        status.status = 'error';
        status.message = (error as Error).message;
      }

      onStatusChange(status);
      onClose();
    },
    [info, isAddressExisting, isValid, name, onClose, onStatusChange, t]
  );

  return (
    <StyledModal
      header={t('Add an address')}
      onClose={onClose}
    >
      <Modal.Content className='modal-content'>
        <div className='ui--Label-Input'>
          <div className='ui--lable'>
            <span>Address:</span>
          </div>
          <Input
            autoFocus
            className='full'
            isError={!isAddressValid}
            onChange={_onChangeAddress}
            onEnter={_onCommit}
            value={addressInput}
          />
        </div>
        <div className='ui--Label-Input'>
          <div className='ui--lable'>
            <span>Name:</span>
          </div>
          <Input
            className='full'
            isError={!isNameValid}
            onChange={_onChangeName}
            onEnter={_onCommit}
            value={name}
          />
        </div>
      </Modal.Content>
      <Modal.Actions className='modal-Bg'>
        <Button
          icon='save'
          isDisabled={!isValid}
          label={t('Save')}
          onClick={_onCommit}
        />
      </Modal.Actions>
    </StyledModal>
  );
}

const StyledModal = styled(Modal)`
  .ui--Modal-content-body {
    width: 100% !important;

  }
  .full  {
    padding-left: 0 !important;
    width: 100%
  }
  .ui--Label-Input {
    width: 100%;
    display: flex;
    align-items: center;
    .ui--lable {
      width: 10rem;
      font-size: var(--font-size-h2);
    }
    .ui--Labelled {
      .ui.input.error input {
          background-color: var(--bg-modal-input) !important;
          border: none !important;
      }
    }
  }
  .ui--Button-Group {
    margin: 3rem 0 0 0!important
  }
`;
export default React.memo(Create);
