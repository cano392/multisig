// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This is for the use of `Ledger`
//
/* eslint-disable deprecation/deprecation */

import type { DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { ProxyDefinition } from '@polkadot/types/interfaces';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { AccountBalance, Delegation } from '../types.js';

import React, { useCallback, useEffect, useMemo } from 'react';

import { AddressInfo, AddressSmall, Button, Forget, styled, TransferModal } from '@polkadot/react-components';
import { useAccountInfo, useApi, useBalancesAll, useStakingInfo, useToggle } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { BN, BN_ZERO, isFunction } from '@polkadot/util';

import Backup from '../modals/Backup.js';
import ChangePass from '../modals/ChangePass.js';
import DelegateModal from '../modals/Delegate.js';
import Derive from '../modals/Derive.js';
import IdentityMain from '../modals/IdentityMain.js';
import IdentitySub from '../modals/IdentitySub.js';
import MultisigApprove from '../modals/MultisigApprove.js';
import ProxyOverview from '../modals/ProxyOverview.js';
import RecoverAccount from '../modals/RecoverAccount.js';
import RecoverSetup from '../modals/RecoverSetup.js';
import UndelegateModal from '../modals/Undelegate.js';
import { useTranslation } from '../translate.js';
import useMultisigApprovals from './useMultisigApprovals.js';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Props {
  account: KeyringAddress;
  className?: string;
  delegation?: Delegation;
  filter: string;
  isFavorite: boolean;
  proxy?: [ProxyDefinition[], BN];
  setBalance: (address: string, value: AccountBalance) => void;
  toggleFavorite: (address: string) => void;
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

// const BAL_OPTS_EXPANDED = {
//   available: true,
//   bonded: true,
//   locked: true,
//   nonce: true,
//   redeemable: true,
//   reserved: true,
//   total: false,
//   unlocking: true,
//   vested: true
// };

function calcVisible(filter: string, name: string, tags: string[]): boolean {
  if (filter.length === 0) {
    return true;
  }

  const _filter = filter.toLowerCase();

  return tags.reduce((result: boolean, tag: string): boolean => {
    return result || tag.toLowerCase().includes(_filter);
  }, name.toLowerCase().includes(_filter));
}

function calcUnbonding(stakingInfo?: DeriveStakingAccount) {
  if (!stakingInfo?.unlocking) {
    return BN_ZERO;
  }

  const filtered = stakingInfo.unlocking
    .filter(({ remainingEras, value }) => value.gt(BN_ZERO) && remainingEras.gt(BN_ZERO))
    .map((unlock) => unlock.value);
  const total = filtered.reduce((total, value) => total.iadd(value), new BN(0));

  return total;
}

function Account({ account: { address, meta }, className = '', delegation, filter, proxy, setBalance }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const balancesAll = useBalancesAll(address);
  const stakingInfo = useStakingInfo(address);
  const multiInfos = useMultisigApprovals(address);
  const { flags: { isMultisig }, name: accName, tags } = useAccountInfo(address);
  const [isBackupOpen, toggleBackup] = useToggle();
  const [isDeriveOpen, toggleDerive] = useToggle();
  const [isForgetOpen, toggleForget] = useToggle();
  const [isIdentityMainOpen, toggleIdentityMain] = useToggle();
  const [isIdentitySubOpen, toggleIdentitySub] = useToggle();
  const [isMultisigOpen, toggleMultisig] = useToggle();
  const [isProxyOverviewOpen, toggleProxyOverview] = useToggle();
  const [isPasswordOpen, togglePassword] = useToggle();
  const [isRecoverAccountOpen, toggleRecoverAccount] = useToggle();
  const [isRecoverSetupOpen, toggleRecoverSetup] = useToggle();
  const [isTransferOpen, toggleTransfer] = useToggle();
  const [isDelegateOpen, toggleDelegate] = useToggle();
  const [isUndelegateOpen, toggleUndelegate] = useToggle();

  const [isCopyShown, toggleIsCopyShown] = useToggle();
  const NOOP = () => undefined;

  useEffect((): void => {
    if (balancesAll) {      
      setBalance(address, {
        // some chains don't have "active" in the Ledger
        bonded: stakingInfo?.stakingLedger.active?.unwrap() || BN_ZERO,
        locked: balancesAll.lockedBalance,
        redeemable: stakingInfo?.redeemable || BN_ZERO,
        total: balancesAll.freeBalance.add(balancesAll.reservedBalance),
        transferable: balancesAll.transferable || balancesAll.availableBalance,
        unbonding: calcUnbonding(stakingInfo)
      });
    }
  }, [address, api, balancesAll, setBalance, stakingInfo]);

  const isVisible = useMemo(
    () => calcVisible(filter, accName, tags),
    [accName, filter, tags]
  );

  const _onForget = useCallback(
    (): void => {
      if (!address) {
        return;
      }

      const status: Partial<ActionStatus> = {
        account: address,
        action: 'forget'
      };

      try {
        keyring.forgetAccount(address);
        status.status = 'success';
        status.message = t('account forgotten');
      } catch (error) {
        status.status = 'error';
        status.message = (error as Error).message;
      }
    },
    [address, t]
  );
  if (!isVisible) {
    return null;
  }
  
  return (
    <>
      <StyledTr className={`${className} isExpanded isFirst packedBottom`}>
        <td className='address all ui--SmallAddress-Copy-Balance'>
          <AddressSmall
            parentAddress={meta.parentAddress}
            value={address}
            withShortAddress
          />
          {isBackupOpen && (
            <Backup
              address={address}
              key='modal-backup-account'
              onClose={toggleBackup}
            />
          )}
          {isDelegateOpen && (
            <DelegateModal
              key='modal-delegate'
              onClose={toggleDelegate}
              previousAmount={delegation?.amount}
              previousConviction={delegation?.conviction}
              previousDelegatedAccount={delegation?.accountDelegated}
              previousDelegatingAccount={address}
            />
          )}
          {isDeriveOpen && (
            <Derive
              from={address}
              key='modal-derive-account'
              onClose={toggleDerive}
            />
          )}
          {isForgetOpen && (
            <Forget
              address={address}
              key='modal-forget-account'
              onClose={toggleForget}
              onForget={_onForget}
            />
          )}
          {isIdentityMainOpen && (
            <IdentityMain
              address={address}
              key='modal-identity-main'
              onClose={toggleIdentityMain}
            />
          )}
          {isIdentitySubOpen && (
            <IdentitySub
              address={address}
              key='modal-identity-sub'
              onClose={toggleIdentitySub}
            />
          )}
          {isPasswordOpen && (
            <ChangePass
              address={address}
              key='modal-change-pass'
              onClose={togglePassword}
            />
          )}
          {isTransferOpen && (
            <TransferModal
              key='modal-transfer'
              onClose={toggleTransfer}
              senderId={address}
            />
          )}
          {isProxyOverviewOpen && (
            <ProxyOverview
              key='modal-proxy-overview'
              onClose={toggleProxyOverview}
              previousProxy={proxy}
              proxiedAccount={address}
            />
          )}
          {isMultisig && isMultisigOpen && multiInfos && multiInfos.length !== 0 && (
            <MultisigApprove
              address={address}
              key='multisig-approve'
              onClose={toggleMultisig}
              ongoing={multiInfos}
              threshold={meta.threshold}
              who={meta.who}
            />
          )}
          {isRecoverAccountOpen && (
            <RecoverAccount
              address={address}
              key='recover-account'
              onClose={toggleRecoverAccount}
            />
          )}
          {isRecoverSetupOpen && (
            <RecoverSetup
              address={address}
              key='recover-setup'
              onClose={toggleRecoverSetup}
            />
          )}
          {isUndelegateOpen && (
            <UndelegateModal
              accountDelegating={address}
              key='modal-delegate'
              onClose={toggleUndelegate}
            />
          )}
        </td>
        <td className='actions button ui--Copy-Balance'>
          <div className='ui--Copy-Address'>
            <AddressInfo
              address={address}
              balancesAll={balancesAll}
              withBalance={BAL_OPTS_DEFAULT}
              withLabel
            />
            <CopyToClipboard
              text={address}
            >
              <span>
                <Button.Group>
                  <Button
                    icon={isCopyShown ? 'check' : 'copy'}
                    label={isCopyShown ? t('Copied') : t('Copy')}
                    onClick={isCopyShown ? NOOP : toggleIsCopyShown}
                    onMouseLeave={isCopyShown ? toggleIsCopyShown : NOOP}
                  />
                </Button.Group>
              </span>
            </CopyToClipboard>
          </div>
          <Button.Group>
            {(isFunction(api.tx.balances?.transferAllowDeath) || isFunction(api.tx.balances?.transfer)) && (
              <Button
                className='send-button'
                icon='paper-plane'
                label={t('Send')}
                onClick={toggleTransfer}
              />
            )}
          </Button.Group>
        </td>
      </StyledTr>
    </>
  );
}

const StyledTr = styled.tr`
  .devBadge {
    opacity: var(--opacity-light);
  }
  border-radius: 1rem;
  padding: 1rem 3rem 0 3rem;
  display: flex;

  .ui--SmallAddress-Copy-Balance {
    display: flex;
    width: 65% !important;
  }
  .ui--Copy-Balance {
    display: flex;
    justify-content: space-between;
    width: 35%;

    .ui--Copy-Address {
      display: flex;
      justify-content: space-between;
      width: 70%;

      @media only screen and (max-width: 1520px) {
        width: 75%;
      }

      @media only screen and (max-width: 1400px) {
        width: 65%;
      }
    }
  }
  .ui--Balance {
    display: flex;
  }
  .ui--FormatBalance-value {
    font-size: var(--font-size-balance) !important;
  }
  @media only screen and (max-width: 1920px) {
    .ui--SmallAddress-Copy-Balance {
      width: 60% !important;
    }
    .ui--Copy-Balance {
      width: 40%;
    }
  }
  @media only screen and (max-width: 1650px) {
    .ui--SmallAddress-Copy-Balance {
      width: 55% !important;
    }
    .ui--Copy-Balance {
      width: 45%;
    }
  }

  @media only screen and (max-width: 1520px) {
    .ui--SmallAddress-Copy-Balance {
      width: 50% !important;
    }
    .ui--Copy-Balance {
      width: 50%;
    }
  }
  @media only screen and (max-width: 1400px) {
    .ui--SmallAddress-Copy-Balance {
      width: 30% !important;
    }
    .ui--Copy-Balance {
      width: 70%;
    }
  }
`;

export default React.memo(Account);
