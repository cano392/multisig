// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AddressFlags } from '@polkadot/react-hooks/types';

import React, { useCallback } from 'react';

import { useApi, useToggle } from '@polkadot/react-hooks';
import { isFunction } from '@polkadot/util';

import Button from '../Button/index.js';
import { TransferModal } from '../modals/index.js';
import { styled } from '../styled.js';
import { useTranslation } from '../translate.js';

interface Props {
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
  toggleProxyOverview: () => void;
}

function AccountMenuButtons ({ className = '', flags, isEditing, isEditingName, onCancel, onForgetAddress, onSaveName, onSaveTags, onUpdateName, recipientId, toggleIsEditingName, toggleIsEditingTags, toggleProxyOverview }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const [isTransferOpen, toggleIsTransferOpen] = useToggle();
  const api = useApi();

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
          <Button.Group>
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
          <Button.Group>
            {(isFunction(api.api.tx.balances?.transferAllowDeath) || isFunction(api.api.tx.balances?.transfer)) && (
              <Button
                icon='paper-plane'
                isDisabled={isEditing}
                label={t('Send')}
                onClick={toggleIsTransferOpen}
              />
            )}
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
            <Button
                icon='sitemap'
                isDisabled={isEditing}
                label={t('Add proxy')}
                onClick={toggleProxyOverview}
              />
          </Button.Group>
        )
      }
      {isTransferOpen && (
        <TransferModal
          key='modal-transfer'
          onClose={toggleIsTransferOpen}
          senderId={recipientId}
        />
      )}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
  flex-basis: 360px;
  .ui--Button-Group {
    display: flex;
    justify-content: flex-start;
    margin: 0;
  }

  @media only screen and (max-width: 1600px) {
    .ui--Button-Group {
      flex-direction: column;
      row-gap: 1rem;
      flex-basis: 160px
    }
  }
`;

export default React.memo(AccountMenuButtons);
