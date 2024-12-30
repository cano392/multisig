// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { IconName } from '@fortawesome/fontawesome-svg-core';

import React from 'react';

import { isString } from '@polkadot/util';

import { styled } from './styled.js';

interface Props {
  children?: React.ReactNode;
  className?: string;
  icon?: IconName;
  label?: React.ReactNode;
  type?: string;
  isMnemonic?: boolean;
  value?: React.ReactNode | null;
  toggleMultisig: () => void;
}


function MultisigViewDetail ({ children, className = '', value, toggleMultisig}: Props): React.ReactElement<Props> | null {


  if (!isString(value)) {
    return null;
  }

  return (
    <StyledDiv className={`${className} ui--CopyButton`}>
        <div className='copyContainer'>
          {children}
          <span className='copySpan'>
            {/* <Button
              className='icon-button show-on-hover review'
              // icon={``}
              isDisabled={!value}
              label={'Review'}
              onClick={toggleMultisig}
            /> */}
            <button className='review' onClick={toggleMultisig}>Review</button>
          </span>
        </div>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  // border: 1px solid var(--bg-subCard);
  .copySpan {
    white-space: nowrap;
    
  }
  .copyContainer {
    position: absolute;
    top: -0.45rem;
    right: -1rem;
  }
  .review {
    border: 1px solid var(--border-cardBtn);
    border-radius: 0.5rem;
    cursor: pointer;
    background-color: transparent;
    color: var(--color-text);
    padding: 0.8rem;

    &:hover {
      background-color: var(--bg-button-hover);
      color: var(--bg-input) !important;
    }
  }
`;

export default React.memo(MultisigViewDetail);
