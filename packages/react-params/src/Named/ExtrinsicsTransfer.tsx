// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DeriveBalancesAll } from '@polkadot/api-derive/types';
import type { AccountInfoWithProviders, AccountInfoWithRefCount } from '@polkadot/types/interfaces';
import type { KeyringJson$Meta } from '@polkadot/ui-keyring/types';
import type { BN } from '@polkadot/util';

import React, { useEffect, useState } from 'react';

import { checkAddress } from '@polkadot/phishing';
import { useApi, useCall } from '@polkadot/react-hooks';
import { Available } from '@polkadot/react-query';
import { settings } from '@polkadot/ui-settings';
import { BN_HUNDRED, BN_ZERO, isFunction, nextTick } from '@polkadot/util';

import InputAddress from '../../../react-components/src/InputAddress/index.js';
import InputBalance from '../../../react-components/src/InputBalance.js';
import MarkError from '../../../react-components/src/MarkError.js';
import MarkWarning from '../../../react-components/src/MarkWarning.js';
import { styled } from '../../../react-components/src/styled.js';
import Toggle from '../../../react-components/src/Toggle.js';
import { useTranslation } from '../translate.js';
import TxButton from '../../../react-components/src/TxButton.js';
import { getAddressMeta } from '../../../react-components/src/util/getAddressMeta.js';

interface Props {
  className?: string;
  recipientId?: string;
  senderId?: string | null;
}

function isRefcount(accountInfo: AccountInfoWithProviders | AccountInfoWithRefCount): accountInfo is AccountInfoWithRefCount {
  return !!(accountInfo as AccountInfoWithRefCount).refcount;
}

async function checkPhishing(_senderId: string | null, recipientId: string | null): Promise<[string | null, string | null]> {
  return [
    null,
    recipientId
      ? await checkAddress(recipientId)
      : null
  ];
}

function ExtrinsicsTransfer({ className = '', recipientId: propRecipientId, senderId: propSenderId }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { api } = useApi();
  const [amount, setAmount] = useState<BN | undefined>(BN_ZERO);
  const [hasAvailable] = useState(true);
  const isProtected = true;
  const [isAll, setIsAll] = useState(false);
  const [senderIdMeta, setSenderIdMeta] = useState<KeyringJson$Meta>();
  const [[maxTransfer], setMaxTransfer] = useState<[BN | null, boolean]>([null, false]);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const senderId = null;
  const [[, recipientPhish], setPhishing] = useState<[string | null, string | null]>([null, null]);
  const balances = useCall<DeriveBalancesAll>(api.derive.balances?.all, [propSenderId || senderId]);
  const accountInfo = useCall<AccountInfoWithProviders | AccountInfoWithRefCount>(api.query.system.account, [propSenderId || senderId]);

  useEffect((): void => {
    const fromId = propSenderId || senderId;
    const toId = propRecipientId || recipientId;

    fromId && setSenderIdMeta(getAddressMeta(fromId));

    if (balances && balances.accountId?.eq(fromId) && fromId && toId && api.call.transactionPaymentApi && api.tx.balances) {
      nextTick(async (): Promise<void> => {
        try {
          const extrinsic = (api.tx.balances.transferAllowDeath || api.tx.balances.transfer)(toId, (balances.transferable || balances.availableBalance));
          const { partialFee } = await extrinsic.paymentInfo(fromId);
          const adjFee = partialFee.muln(110).div(BN_HUNDRED);
          const maxTransfer = (balances.transferable || balances.availableBalance).sub(adjFee);

          setMaxTransfer(
            api.consts.balances && maxTransfer.gt(api.consts.balances.existentialDeposit)
              ? [maxTransfer, false]
              : [null, true]
          );
        } catch (error) {
          console.error(error);
        }
      });
    } else {
      setMaxTransfer([null, false]);
    }

  }, [api, balances, propRecipientId, propSenderId, recipientId, senderId]);

  useEffect((): void => {
    checkPhishing(propSenderId || senderId, propRecipientId || recipientId)
      .then(setPhishing)
      .catch(console.error);
  }, [propRecipientId, propSenderId, recipientId, senderId]);

  const noReference = accountInfo
    ? isRefcount(accountInfo)
      ? accountInfo.refcount.isZero()
      : accountInfo.consumers.isZero()
    : true;
  const canToggleAll = !isProtected && balances && balances.accountId?.eq(propSenderId || senderId) && maxTransfer && noReference;

  return (
    <StyledDiv

    >
      <div className={`${className} ui--Modal-Column-Container`}>
        <label>To</label>
        <InputAddress
          className='toInput'
          defaultValue={propRecipientId}
          isDisabled={!!propRecipientId}
          labelExtra={
            <Available
              label={t('')}
              params={propRecipientId || recipientId}
            />
          }
          onChange={setRecipientId}
          type='allPlus'
        />
        {recipientPhish && (
          <MarkError content={t('The recipient is associated with a known phishing site on {{url}}', { replace: { url: recipientPhish } })} />
        )}
        <label>Amount</label>
        {canToggleAll && isAll
          ? (
            <InputBalance
              autoFocus
              defaultValue={maxTransfer}
              isDisabled
              key={maxTransfer?.toString()}
              label={t('transferable minus fees')}
            />
          )
          : (
            <>
              <InputBalance
                autoFocus
                isError={!hasAvailable}
                isZeroable
                maxValue={maxTransfer}
                onChange={setAmount}
              />
            </>
          )
        }
        {canToggleAll && (
          <Toggle
            className='typeToggle'
            label={t('Transfer the full account balance, reap the sender')}
            onChange={setIsAll}
            value={isAll}
          />
        )}
        {senderIdMeta && senderIdMeta.isHardware && (
          <MarkWarning content={t(`You are using the Ledger ${settings.ledgerApp.toUpperCase()} App. If you would like to switch it, please go the "manage ledger app" in the settings.`)} />
        )}
        {!isProtected && !noReference && (
          <MarkWarning content={t('There is an existing reference count on the sender account. As such the account cannot be reaped from the state.')} />
        )}
      </div>
      <TxButton
        className='sendBtn'
        accountId={propSenderId || senderId}
        icon='paper-plane'
        isDisabled={
          (!isAll && (!hasAvailable || !amount)) ||
          !(propRecipientId || recipientId) ||
          !!recipientPhish
        }
        label={t('Send')}
        params={
          canToggleAll && isAll
            ? isFunction(api.tx.balances?.transferAll)
              ? [propRecipientId || recipientId, false]
              : [propRecipientId || recipientId, maxTransfer]
            : [propRecipientId || recipientId, amount]
        }
        tx={
          canToggleAll && isAll && isFunction(api.tx.balances?.transferAll)
            ? api.tx.balances?.transferAll
            : isProtected
              ? api.tx.balances?.transferKeepAlive
              : api.tx.balances?.transferAllowDeath || api.tx.balances?.transfer
        }
      />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  .balance {
    margin-bottom: 0.5rem;
    text-align: right;
    padding-right: 1rem;

    .label {
      opacity: 0.7;
    }
  }
  .toInput {
    padding-bottom: 2rem;
  }
  .sendBtn {
    margin-top: 2rem;
    float: right;
  }
  .ui--Button-Group {
    margin: 0 !important;
  }
  .ui--Modal-Column-Container {
    display: flex;
    flex-direction: column;
    .ui--Labelled:not(.isSmall):not(.isOuter) >label {
      top: 1.1rem;
      left: -8rem;
      width: 10%;
    }
    .ui.input>input {
      background-color: var(--bg-modal-input) !important;
      border: none !important;
    }
    .ui.selection.dropdown {
      background-color: var(--bg-modal-input) !important;
      opacity: 1 !important;
      border: none !important;
    }
  }
  label.with-help {
    flex-basis: 10rem;
  }

  .typeToggle {
    text-align: right;
  }

  .typeToggle+.typeToggle {
    margin-top: 0.375rem;
  }
`;

export default React.memo(ExtrinsicsTransfer);
