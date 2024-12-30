// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { HexString } from '@polkadot/util/types';
import type { ModalProps } from '../types.js';

import React, { useCallback, useState } from 'react';

import { Button, Input, InputAddressMulti_newmultisig, InputNumber_newmultisig, styled } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { BN } from '@polkadot/util';

import useKnownAddresses from '../Accounts/useKnownAddresses.js';
import { useTranslation } from '../translate.js';

interface Props extends ModalProps {
  className?: string;
  onClose: () => void;
  onStatusChange: (status: ActionStatus) => void;
}

interface CreateOptions {
  genesisHash?: HexString;
  name: string;
  tags?: string[];
}

interface UploadedFileData {
  isUploadedFileValid: boolean;
  uploadedFileError: string;
  uploadedSignatories: string[];
}

const MAX_SIGNATORIES = 100;
const BN_TWO = new BN(2);


function createMultisig(signatories: string[], threshold: BN | number, { genesisHash, name, tags = [] }: CreateOptions, success: string): ActionStatus {
  // we will fill in all the details below
  const status = { action: 'create' } as ActionStatus;

  try {
    const result = keyring.addMultisig(signatories, threshold, { genesisHash, name, tags });
    const { address } = result.pair;

    status.account = address;
    status.status = 'success';
    status.message = success;
  } catch (error) {
    status.status = 'error';
    status.message = (error as Error).message;

    console.error(error);
  }

  return status;
}

function Multisig({ className = '', onClose, onStatusChange }: Props): React.ReactElement<Props> {
  const { api, isDevelopment } = useApi();
  const { t } = useTranslation();
  const availableSignatories = useKnownAddresses();
  const [{ isNameValid, name }, setName] = useState({ isNameValid: false, name: '' });
  const [{ isUploadedFileValid, uploadedFileError }, setUploadedFile] = useState<UploadedFileData>({
    isUploadedFileValid: true,
    uploadedFileError: '',
    uploadedSignatories: []
  });
  const [signatories, setSignatories] = useState<string[]>(['']);
  const [selectedSignatories, SetSelectedSignatoris] = useState<number>(0);
  const [{ isThresholdValid, threshold }, setThreshold] = useState({ isThresholdValid: true, threshold: BN_TWO });

  const _createMultisig = useCallback(
    (): void => {
      const options = { genesisHash: isDevelopment ? undefined : api.genesisHash.toHex(), name: name.trim() };
      const status = createMultisig(signatories, threshold, options, t('created multisig'));

      onStatusChange(status);
      onClose();
    },
    [api.genesisHash, isDevelopment, name, onClose, onStatusChange, signatories, t, threshold]
  );

  const _onChangeName = useCallback(
    (name: string) => setName({ isNameValid: (name.trim().length >= 3), name }),
    []
  );

  const _onChangeThreshold = useCallback(
    (threshold: BN | undefined) =>
      threshold && setThreshold({ isThresholdValid: threshold.gte(BN_TWO) && threshold.lten(signatories.length), threshold }),
    [signatories]
  );

  const resetFileUpload = useCallback(
    () => {
      setUploadedFile({
        isUploadedFileValid,
        uploadedFileError,
        uploadedSignatories: []
      });
    },
    [uploadedFileError, isUploadedFileValid]
  );

  const _onChangeAddressMulti = useCallback(
    (items: string[]) => {
      resetFileUpload();
      setSignatories(items);
    },
    [resetFileUpload]
  );

  const isValid = isNameValid && isThresholdValid;
  
  return (
    <StyledDiv
      className={className}
    >
      <div className='signatory'>
        <div className='detail'>
          <svg width="25" height="25" viewBox="0 0 25 25">
            <path fill="var(--color-icon)" d="M12.5 2c0.5 0 1 0.15 1.4 0.4l7.6 4.4c0.9 0.5 1.4 1.4 1.4 2.4v6.4c0 1-0.5 1.9-1.4 2.4l-7.6 4.4c-0.4 0.25-0.9 0.4-1.4 0.4s-1-0.15-1.4-0.4l-7.6-4.4c-0.9-0.5-1.4-1.4-1.4-2.4v-6.4c0-1 0.5-1.9 1.4-2.4l7.6-4.4c0.4-0.25 0.9-0.4 1.4-0.4z" />
            <path fill="var(--bg-page)" d="M11.5 8h2v7h-2zM11.5 16h2v2h-2z" />
          </svg>
          <p>The Members of a mutisig are called singatories</p>
        </div>
        <span>You must choose 2 accounts at least</span>
      </div>
      <InputAddressMulti_newmultisig
        available={availableSignatories}
        availableLabel={t('New signatory:')}
        maxCount={MAX_SIGNATORIES}
        onChange={_onChangeAddressMulti}
        valueLabel={t('Selected signatories:')}
        setSelectedSignatoris={SetSelectedSignatoris}
        selectedSignatories={selectedSignatories}
      />
      <div className='input_btn input_btn_margintop'>
        <InputNumber_newmultisig
          isError={!isThresholdValid}
          label={t('Threshold:')}
          onChange={_onChangeThreshold}
          value={threshold}
          className='threshold'
          totalSignatories={selectedSignatories}
        />
        <Input
          autoFocus
          className='full name'
          isError={!isNameValid}
          label={t('Name:')}
          onChange={_onChangeName}
          placeholder='Multisig name'

        />

      </div>
      <div className='input_btn button_end'>
        <Button
          icon='plus'
          isDisabled={!isValid}
          label={t('Create')}
          onClick={_createMultisig}
          className='create'
        />
      </div>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  .signaturesFileToggle {
    width: 100%;
    text-align: right;
  }
  .title {
    margin-bottom: 2rem; 
    font-size: var(--font-size-h1);
  }
  .ui--AccountName, .address-text {
    font-size: var(--font-size-account-name) !important;
  }
  .button_end {
    justify-content: flex-end !important;
    .ui--Icon {
      background: var(--bg-base) !important;
    }
  }
  .input_btn_margintop {
    font-size: var(--font-size-base) !important;
    .ui.input>input {
      font-size: var(--font-size-base) !important;
      background: var(--bg-menubar) !important;
    }
  }
  .input_btn {
    margin-top: 1.5rem;
    display: flex;
    column-gap: 50px;
    width: 100%;
    justify-content: space-between;
    .create {
      float: right;
      background-color: var(--bg-page);
      border: 1px solid var(--border-button);
      border-radius: 0.5rem;
    }
    .ui.input.error input {
      background-color: var(--bg-menubar) !important;
      font-size: var(--font-size-base) !important;
    }
    .ui.input.error>input {
      color: var(--color-text) !important;
    }
  }
  .threshold {
    width: 50%;
  }
  .name {
    width: 50%;
  }
  .signatory {
    display: flex;
    padding: 1rem 2rem 1rem 1rem;
    border-radius: 1rem;
    background-color: var(--bg-menubar);
    justify-content: space-between;
    align-items: center;
    text-align: center;
    .detail {
      display: flex;
      font-size: var(--font-size-h3);  
      font-weight: 600;
      p {
        padding-left: 1rem;
      }
    }
    span {
      color: var(--subcolor-text);
    }
  }  
`;

export default React.memo(Multisig);
