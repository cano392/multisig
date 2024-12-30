// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';

import Button from '../Button/index.js';
import { styled } from '../styled.js';

interface Props {
  className?: string;
  header?: React.ReactNode;
  onClose: () => void;
}

function Header ({ className = '', onClose }: Props): React.ReactElement<Props> {
  return (
    <StyledDiv className={`${className} ui--Modal-Header`}>
      <Button
        dataTestId='close-modal'
        icon='times'
        onClick={onClose}
      />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export default React.memo(Header);
