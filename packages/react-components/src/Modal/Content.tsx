// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import { styled } from '../styled.js';

interface Props {
  className?: string;
  children: React.ReactNode;
}

function Content ({ children, className = '' }: Props): React.ReactElement<Props> {
  return (
    <StyledDiv className={`${className} ui--Modal-Content`}>
      <div className='ui--Modal-content-body'>
        {children}
      </div>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  .ui--Modal-content-body {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
    padding-top: 2rem;
    width: 88%;
  }
`;

export default React.memo(Content);
