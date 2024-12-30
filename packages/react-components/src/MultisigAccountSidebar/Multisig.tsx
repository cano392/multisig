// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringJson$Meta } from '@polkadot/ui-keyring/types';

import React from 'react';

import AddressMini from '../AddressMini.js';
import {styled} from '../styled.js';

interface Props {
  isMultisig: boolean;
  meta?: KeyringJson$Meta;
}

function Multisig ({ isMultisig, meta }: Props): React.ReactElement<Props> | null {

  if (!isMultisig || !meta) {
    return null;
  }

  const { threshold, who } = meta;

  return (
    <StyledSection className='ui--AddressMenu-multisig withDivider'>
      {/* <div className='ui--AddressMenu-sectionHeader'>
        {t('multisig')}
      </div> */}
      <div className='ui--AddressMenu-multisigTable'>
        <div className='tr'>
          <div className='th threshold'>
            <span className='subTitle'>Threshold:</span>
            <span>{threshold}/{who?.length}</span>
          </div>
        </div>
        <div className='tr'>
          <div className='th signatories'>Signatories:</div>
          <div className='td'>
            {who?.map((address) => (
              <AddressMini
                key={address}
                value={address}
              />
            ))}
          </div>
        </div>
      </div>
    </StyledSection>
  );
}

export default React.memo(Multisig);

const StyledSection = styled.section`
  background-color: var(--bg-subCard);
  .signatories {
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-cardBtn);
  }
  height: 20rem;
  border-radius: 1rem;
  .threshold {
    display: flex;
    margin-bottom: 2rem;
    .subTitle {
      margin-right: 1rem;
    } 
  }
`