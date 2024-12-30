// Copyright 2017-2024 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0


import React from 'react';
import { styled } from '@polkadot/react-components';
import { useApi } from '@polkadot/react-hooks';

interface Props {
    className?: string;
}

function Footer({ className = '' }: Props): React.ReactElement<Props> {
    const apiProps = useApi();

    return (
        <StyledDiv className={`${className}${(!apiProps.isApiReady || !apiProps.isApiConnected) ? ' isLoading' : ''}`}>
            <div className='menuContainer'>
              <div className='footer-item'>
                  <span className='content-center'>@2021-2024. All rights reserved</span>
                  <span className='content-center'>SecureSign by Tenet Crypto Lab</span>
                  <img src='/logo-footer.webp' width={100} alt='footer' />
              </div>
            </div>
        </StyledDiv>
    );
}

const StyledDiv = styled.div`
  width: 100%;
  .content-center {
    align-content: center
  }
  z-index: 220;
  position: relative;
  .smallShow {
    display: none;
  }
  background-color: var(--bg-page);

  .menuContainer {
    background: var(--bg-footer);
    color: var(--color-footer);
    padding: 0.6rem 1rem;
    width: 100%;
  }

  .footer-item {
    display: flex;
    justify-content: space-between;

  }
  &.isLoading {
    .menuActive {
      background: var(--bg-page);
    }

    &:before {
      filter: grayscale(1);
    }

    .menuItems {
      filter: grayscale(1);
    }
  }

  .menuSection {
    align-items: center;
    display: flex;
    .menuItems {
      list-style: none;
      margin: 0 0 0 0;
      padding: 0;
      font-size: var(--font-size-h1);
      color: var(--color-text-hover);
      font-weight: var(--font-weight-normal);
      text-transform: uppercase;
    }
  }

  .menuActive {
    background: var(--bg-tabs);
    border-bottom: none;
    border-radius: 0.25rem 0.25rem 0 0;
    color: var(--color-text);
    padding: 1rem 1.5rem;
    margin: 0 1rem -1px;
    z-index: 1;

    .ui--Icon {
      margin-right: 0.5rem;
    }
  }

  .ui--NodeInfo {
    align-self: center;
  }

  @media only screen and (max-width: 800px) {

    .smallShow {
      display: initial;
    }

    .smallHide {
      display: none;
    }
  }
`;

export default React.memo(Footer);
