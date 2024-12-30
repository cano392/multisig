// Copyright 2017-2024 @polkadot/app-addresses authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AppProps as Props } from '@polkadot/react-components/types';

import React from 'react';
import { Route, Routes } from 'react-router';

import { styled } from '@polkadot/react-components';
import Contacts from './Contacts/index.js';

function AddressesApp ({ basePath, onStatusChange }: Props): React.ReactElement<Props> {

  return (
    <StyledDiv>
      <Routes>
        <Route path={basePath}>
          <Route
            element={
              <Contacts onStatusChange={onStatusChange} />
            }
            index
          />
        </Route>
      </Routes>
    </StyledDiv>
  );
}

const StyledDiv = styled.main`
  height: 100%;
`;

export default React.memo(AddressesApp);
