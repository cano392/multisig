// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressFlags } from '@polkadot/react-hooks/types';

import React, { useCallback } from 'react';

import { useToggle } from '@polkadot/react-hooks';

import Button from '../Button/index.js';
import { TransferModal } from '../modals/index.js';
import { styled } from '../styled.js';
import { useTranslation } from '../translate.js';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Props {
  value: string,
  className?: string;
  flags: AddressFlags;
  isEditingName: boolean;
  isEditing: boolean;
  toggleIsEditingName: () => void;
  toggleIsEditingTags: () => void;
  onCancel: () => void;
  onSaveName: () => void;
  onSaveTags: () => void;
  onForgetAddress: () => void;
  onUpdateName?: (() => void) | null;
  recipientId: string;
}

function AccountMenuButtons ({value, className = '', flags, isEditing, isEditingName, onCancel, onForgetAddress, onSaveName, onSaveTags, onUpdateName, recipientId, toggleIsEditingName, toggleIsEditingTags }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isTransferOpen, toggleIsTransferOpen] = useToggle();
  const [isCopyShown, toggleIsCopyShown] = useToggle();
  const NOOP = () => undefined;

  const _onForgetAddress = useCallback(
    (): void => {
      onForgetAddress();
      onUpdateName && onUpdateName();
    },
    [onForgetAddress, onUpdateName]
  );

  const toggleIsEditing = useCallback(() => {
    flags.isEditable && toggleIsEditingName();
    toggleIsEditingTags();
  }, [flags.isEditable, toggleIsEditingName, toggleIsEditingTags]);

  const _onUpdateName = useCallback(
    (): void => {
      onSaveName();
      onUpdateName && onUpdateName();
    },
    [onSaveName, onUpdateName]
  );

  const updateName = useCallback(() => {
    if (isEditingName && (flags.isInContacts || flags.isOwned)) {
      _onUpdateName();
      toggleIsEditingName();
    }
  }, [isEditingName, flags.isInContacts, flags.isOwned, _onUpdateName, toggleIsEditingName]);

  const onEdit = useCallback(() => {
    if (isEditing) {
      updateName();
      onSaveTags();
    }

    toggleIsEditing();
  }, [isEditing, toggleIsEditing, updateName, onSaveTags]);

  return (
    <StyledDiv className={`${className} ui--AddressMenu-buttons`}>
      {isEditing
        ? (
          <Button.Group className='ui--AddressMenu-buttons'>
            <CopyToClipboard
              text={value}
            >
              <Button.Group>
                <Button
                  icon={isCopyShown ? 'check' : 'copy'}
                  label={isCopyShown ? t('Copied') : t('Copy')}
                  onClick={isCopyShown ? NOOP : toggleIsCopyShown }
                  onMouseLeave={isCopyShown ? toggleIsCopyShown : NOOP }
                />
              </Button.Group>
            </CopyToClipboard>
            <Button
              icon='times'
              label={t('Cancel')}
              onClick={onCancel}
            />
            <Button
              icon='save'
              label={t('Save')}
              onClick={onEdit}
            />
          </Button.Group>
        )
        : (
          <Button.Group className='ui--AddressMenu-buttons'>
            <CopyToClipboard
              text={value}
            >
              <span>
                <Button.Group>
                  <Button
                    icon={isCopyShown ? 'check' : 'copy'}
                    label={isCopyShown ? t('Copied') : t('Copy')}
                    onClick={isCopyShown ? NOOP : toggleIsCopyShown }
                    onMouseLeave={isCopyShown ? toggleIsCopyShown : NOOP }
                  />
                </Button.Group>
              </span>
            </CopyToClipboard>
            {!flags.isOwned && !flags.isInContacts && (
              <Button
                icon='plus'
                isDisabled={isEditing}
                label={t('Save')}
                onClick={_onUpdateName}
              />
            )}
            {!flags.isOwned && flags.isInContacts && (
              <Button
                icon='ban'
                isDisabled={isEditing}
                label={t('Remove')}
                onClick={_onForgetAddress}
              />
            )}
            <Button
              icon='edit'
              isDisabled={!flags.isEditable}
              label={t('Edit')}
              onClick={onEdit}
            />
          </Button.Group>
        )
      }
      {isTransferOpen && (
        <TransferModal
          key='modal-transfer'
          onClose={toggleIsTransferOpen}
          recipientId={recipientId}
        />
      )}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  width: 28%;
  padding-right: 3rem;
  align-content: center;
  
  .ui--Button-Group {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 0;
    margin-top: 0 !important;
  }
  
  @media only screen and (max-width: 1921px) {
    width: 30%;
  }

  @media only screen and (max-width: 1700px) {
    width: 34%;
  }

  @media only screen and (max-width: 1580px) {
    width: 36%;
  }

  @media only screen and (max-width: 1400px) {
    width: 40%;
  }
`;

export default React.memo(AccountMenuButtons);
