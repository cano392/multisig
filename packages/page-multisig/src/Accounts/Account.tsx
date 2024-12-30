// Copyright 2017-2024 @polkadot/app-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

// This is for the use of `Ledger`
//
/* eslint-disable deprecation/deprecation */

import type { ApiPromise } from '@polkadot/api';
import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { DeriveDemocracyLock, DeriveStakingAccount } from '@polkadot/api-derive/types';
import type { ActionStatus } from '@polkadot/react-components/Status/types';
import type { Option } from '@polkadot/types';
import type { ProxyDefinition, RecoveryConfig } from '@polkadot/types/interfaces';
import type { KeyringAddress } from '@polkadot/ui-keyring/types';
import type { AccountBalance, Delegation } from '../types.js';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import useAccountLocks from '@polkadot/app-referenda/useAccountLocks';
import { MultisigAddressSmall, Badge, Forget, styled, TransferModal } from '@polkadot/react-components';
import { useAccountInfo, useApi, useBalancesAll, useBestNumber, useCall, useStakingInfo, useToggle } from '@polkadot/react-hooks';
import { keyring } from '@polkadot/ui-keyring';
import { BN, BN_ZERO, formatBalance, formatNumber } from '@polkadot/util';

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
import useProxies from './useProxies.js';

interface Props {
  account: KeyringAddress;
  className?: string;
  delegation?: Delegation;
  filter: string;
  isFavorite: boolean;
  proxy?: [ProxyDefinition[], BN];
  setBalance: (address: string, value: AccountBalance) => void;
  toggleFavorite: (address: string) => void;
  toggleMultisig: () => void;
  isMultisigOpen: boolean;
  toggleProxyOverview: () => void;
  isProxyOverviewOpen: boolean;
  multisigAddress: string | null;
}

interface DemocracyUnlockable {
  democracyUnlockTx: SubmittableExtrinsic<'promise'> | null;
  ids: BN[];
}

interface ReferendaUnlockable {
  referendaUnlockTx: SubmittableExtrinsic<'promise'> | null;
  ids: [classId: BN, refId: BN][];
}

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

function createClearDemocracyTx(api: ApiPromise, address: string, ids: BN[]): SubmittableExtrinsic<'promise'> | null {
  return api.tx.utility && ids.length
    ? api.tx.utility.batch(
      ids
        .map((id) => api.tx.democracy.removeVote(id))
        .concat(api.tx.democracy.unlock(address))
    )
    : null;
}

function createClearReferendaTx(api: ApiPromise, address: string, ids: [BN, BN][], palletReferenda = 'convictionVoting'): SubmittableExtrinsic<'promise'> | null {
  if (!api.tx.utility || !ids.length) {
    return null;
  }

  const inner = ids.map(([classId, refId]) => api.tx[palletReferenda].removeVote(classId, refId));

  ids
    .reduce((all: BN[], [classId]) => {
      if (!all.find((id) => id.eq(classId))) {
        all.push(classId);
      }

      return all;
    }, [])
    .forEach((classId): void => {
      inner.push(api.tx[palletReferenda].unlock(classId, address));
    });

  return api.tx.utility.batch(inner);
}

const transformRecovery = {
  transform: (opt: Option<RecoveryConfig>) => opt.unwrapOr(null)
};

function Account({ account: { address, meta }, className = '', delegation, filter, proxy, setBalance, toggleMultisig, isMultisigOpen, isProxyOverviewOpen, toggleProxyOverview, multisigAddress }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();
  const { api } = useApi();
  const bestNumber = useBestNumber();
  const balancesAll = useBalancesAll(address);
  const stakingInfo = useStakingInfo(address);
  const democracyLocks = useCall<DeriveDemocracyLock[]>(api.derive.democracy?.locks, [address]);
  const recoveryInfo = useCall<RecoveryConfig | null>(api.query.recovery?.recoverable, [address], transformRecovery);
  const multiInfos = useMultisigApprovals(address);
  const proxyInfo = useProxies(address);
  const { flags: { isDevelopment, isMultisig, isProxied }, name: accName, tags } = useAccountInfo(address);
  const convictionLocks = useAccountLocks('referenda', 'convictionVoting', address);
  const [{ democracyUnlockTx }, setDemocracyUnlock] = useState<DemocracyUnlockable>({ democracyUnlockTx: null, ids: [] });
  const [{ referendaUnlockTx }, setReferandaUnlock] = useState<ReferendaUnlockable>({ ids: [], referendaUnlockTx: null });
  const [vestingVestTx, setVestingTx] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [isBackupOpen, toggleBackup] = useToggle();
  const [isDeriveOpen, toggleDerive] = useToggle();
  const [isForgetOpen, toggleForget] = useToggle();
  const [isIdentityMainOpen, toggleIdentityMain] = useToggle();
  const [isIdentitySubOpen, toggleIdentitySub] = useToggle();
  const [isPasswordOpen, togglePassword] = useToggle();
  const [isRecoverAccountOpen, toggleRecoverAccount] = useToggle();
  const [isRecoverSetupOpen, toggleRecoverSetup] = useToggle();
  const [isTransferOpen, toggleTransfer] = useToggle();
  const [isDelegateOpen, toggleDelegate] = useToggle();
  const [isUndelegateOpen, toggleUndelegate] = useToggle();

  useEffect(() => {
    if(democracyUnlockTx && referendaUnlockTx && vestingVestTx) {}
  },[])


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

      api.tx.vesting?.vest && setVestingTx(() =>
        balancesAll.vestingLocked.isZero()
          ? null
          : api.tx.vesting.vest()
      );
    }
  }, [address, api, balancesAll, setBalance, stakingInfo]);

  useEffect((): void => {
    bestNumber && democracyLocks && setDemocracyUnlock(
      (prev): DemocracyUnlockable => {
        const ids = democracyLocks
          .filter(({ isFinished, unlockAt }) => isFinished && bestNumber.gt(unlockAt))
          .map(({ referendumId }) => referendumId);

        if (JSON.stringify(prev.ids) === JSON.stringify(ids)) {
          return prev;
        }

        return {
          democracyUnlockTx: createClearDemocracyTx(api, address, ids),
          ids
        };
      }
    );
  }, [address, api, bestNumber, democracyLocks]);

  useEffect((): void => {
    bestNumber && convictionLocks && setReferandaUnlock(
      (prev): ReferendaUnlockable => {
        const ids = convictionLocks
          .filter(({ endBlock }) => endBlock.gt(BN_ZERO) && bestNumber.gt(endBlock))
          .map(({ classId, refId }): [classId: BN, refId: BN] => [classId, refId]);

        if (JSON.stringify(prev.ids) === JSON.stringify(ids)) {
          return prev;
        }

        return {
          ids,
          referendaUnlockTx: createClearReferendaTx(api, address, ids)
        };
      }
    );
  }, [address, api, bestNumber, convictionLocks]);

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
        <td className='address all relative'>
          <MultisigAddressSmall
            parentAddress={meta.parentAddress}
            value={address}
            withShortAddress
            isActive={multisigAddress === address ? true : false}
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
          <div className='absolute'>
            {meta.genesisHash
              ? <Badge color='transparent' />
              : isDevelopment
                ? (
                  <Badge
                    className='warning'
                    hover={t('This is a development account derived from the known development seed. Do not use for any funds on a non-development network.')}
                    icon='wrench'
                  />
                )
                : (
                  <Badge
                    className='warning'
                    hover={
                      <div>
                        <p>{t('This account is available on all networks. It is recommended to link to a specific network via the account options ("only this network" option) to limit availability. For accounts from an extension, set the network on the extension.')}</p>
                        <p>{t('This does not send any transaction, rather it only sets the genesis in the account JSON.')}</p>
                      </div>
                    }
                    icon='exclamation-triangle'
                  />
                )
            }
            {recoveryInfo && (
              <Badge
                className='recovery'
                hover={
                  <div>
                    <p>{t('This account is recoverable, with the following friends:')}</p>
                    <div>
                      {recoveryInfo.friends.map((friend, index): React.ReactNode => (
                        <MultisigAddressSmall
                          key={index}
                          value={friend}
                          isActive={multisigAddress === address ? true : false}
                        />
                      ))}
                    </div>
                    <table>
                      <tbody>
                        <tr>
                          <td>{t('threshold')}</td>
                          <td>{formatNumber(recoveryInfo.threshold)}</td>
                        </tr>
                        <tr>
                          <td>{t('delay')}</td>
                          <td>{formatNumber(recoveryInfo.delayPeriod)}</td>
                        </tr>
                        <tr>
                          <td>{t('deposit')}</td>
                          <td>{formatBalance(recoveryInfo.deposit)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                }
                icon='redo'
              />
            )}
            {isProxied && proxyInfo?.isEmpty && (
              <Badge
                className='important'
                hover={t('Proxied account has no owned proxies')}
                icon='sitemap'
                info='0'
              />
            )}
            {isMultisig && multiInfos && multiInfos.length !== 0 && (
              <Badge
                className='important'
                color='purple'
                // hover={t('Multisig approvals pending')}
                // hoverAction={t('View pending approvals')}
                icon='file-signature'
                onClick={() => { }}
              />
            )}
            {delegation?.accountDelegated && (
              <Badge
                className='information'
                hover={t('This account has a governance delegation')}
                hoverAction={t('Manage delegation')}
                icon='calendar-check'
                onClick={toggleDelegate}
              />
            )}
            {proxy && proxy[0].length !== 0 && api.tx.utility && (
              <Badge
                className='information'
                hover={
                  proxy[0].length === 1
                    ? t('This account has a proxy set')
                    : t('This account has {{proxyNumber}} proxies set', { replace: { proxyNumber: proxy[0].length } })
                }
                hoverAction={t('Manage proxies')}
                icon='sitemap'
                onClick={toggleProxyOverview}
              />
            )}
          </div>
        </td>
      </StyledTr>
    </>
  );
}

const StyledTr = styled.tr`
  .devBadge {
    opacity: var(--opacity-light);
  }
  .proxyItem {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
`;

export default React.memo(Account);
