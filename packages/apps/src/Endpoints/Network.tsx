// Copyright 2017-2024 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Network } from './types.js';

import React, { useCallback } from 'react';

import { ChainImg, styled } from '@polkadot/react-components';

import store from 'store';

interface Props {
  affinity?: string;
  apiUrl: string;
  className?: string;
  setApiUrl: (network: string, apiUrl: string) => void;
  settings: any;
  hasUrlChanged: boolean;
  value: Network;
}

function NetworkDisplay({ setApiUrl, settings, value: { isChild, isUnreachable, name, providers, ui } }: Props): React.ReactElement<Props> {
  const _selectUrl = useCallback(
    () => {
      const filteredProviders = providers.filter(({ url }) => !url.startsWith('light://'));
      const selectUrl = filteredProviders[Math.floor(Math.random() * filteredProviders.length)].url;
      store.set('localFork', '');
      settings.set({ ...(settings.get()), selectUrl });
      setApiUrl(name, selectUrl);
      
      return window.location.assign(`${window.location.origin}${window.location.pathname}?rpc=${encodeURIComponent(selectUrl)}${window.location.hash}`);
    },
    [name, providers, setApiUrl]
  );

  return (
    <StyledDiv className={``}>
      <div
        className={`endpointSection${isChild ? ' isChild' : ''}`}
        onClick={isUnreachable ? undefined : _selectUrl}
      >
        <ChainImg
          className='endpointIcon'
          isInline
          logo={ui.logo || 'empty'}
          withoutHl
        />
        <div className='endpointValue'>
          <div>{name}</div>
        </div>
      </div>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  border: 1px solid var(--border-table);
  border-radius: 1rem;
  cursor: pointer;
  margin: 0 0 2rem 0;
  padding: 0.5rem 0.5rem 0.5rem 1rem;
  position: relative;

  &.isUnreachable {
    opacity: var(--opacity-light);
  }

  &.isSelected,
  &:hover {
    background: var(--bg-menu-hover);
  }

  .endpointSection {
    align-items: center;
    display: flex;
    justify-content: flex-start;
    position: relative;

    &+.ui--Toggle {
      margin-top: 1rem;
    }

    &.isChild .endpointIcon {
      margin-left: 1.25rem;
    }

    &+.endpointProvider {
      margin-top: -0.125rem;
    }

    .endpointValue {
      .endpointExtra {
        font-size: var(--font-size-small);
        opacity: var(--opacity-light);
      }
    }
  }

  // we jiggle our labels somewhat...
  label {
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-normal);
    text-transform: none;
  }
`;

export default React.memo(NetworkDisplay);
