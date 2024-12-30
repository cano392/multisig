// Copyright 2017-2024 @polkadot/app-extrinsics authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic } from '@polkadot/api/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { Inspect } from '@polkadot/types/types';
import type { HexString } from '@polkadot/util/types';

import React, { useMemo } from 'react';

import { Columar, Output, styled } from '@polkadot/react-components';
import { u8aToHex } from '@polkadot/util';

import { useTranslation } from './translate.js';

interface Props {
  className?: string;
  extrinsic?: SubmittableExtrinsic<'promise'> | null;
  isCall: boolean;
  payload?: ExtrinsicPayload | null;
  withData?: boolean;
  withHash?: boolean;
}

function extract (isCall: boolean, extrinsic?: SubmittableExtrinsic<'promise'> | null, payload?: ExtrinsicPayload | null): [HexString, HexString, Inspect | null] {
  if (!extrinsic) {
    return ['0x', '0x', null];
  }

  const u8a = extrinsic.method.toU8a();
  let inspect = isCall
    ? extrinsic.method.inspect()
    : extrinsic.inspect();

  if (payload) {
    const prev = inspect;

    inspect = payload.inspect();
    inspect.inner?.map((entry, index) => {
      if (index === 0) {
        // replace the method inner
        entry.inner = prev.inner;
        entry.outer = undefined;
      }

      return entry;
    });
  }

  // don't use the built-in hash, we only want to convert once
  return [
    u8aToHex(u8a),
    extrinsic.registry.hash(u8a).toHex(),
    inspect
  ];
}

function Decoded ({ className, extrinsic, isCall, payload, withData = true }: Props): React.ReactElement<Props> | null {
  const { t } = useTranslation();

  const [hex, inspect] = useMemo(
    () => extract(isCall, extrinsic, payload),
    [extrinsic, isCall, payload]
  );

  if (!inspect) {
    return null;
  }

  return (
    <StyledColumar
      className={className}
      isPadded={false}
    >
      <hr className='divider'></hr>
      <Columar.Column>
        {withData && (
          <Output
            isDisabled
            isTrimmed
            label={t('encoded call data')}
            value={hex}
            withCopy
          />
        )}
        {/* {withHash && (
          <Output
            isDisabled
            label={t('encoded call hash')}
            value={hash}
            withCopy
          />
        )} */}
      </Columar.Column>
      {/* <Columar.Column>
        <DecodedInspect
          hex={hex}
          inspect={inspect}
          label={t('encoding details')}
        />
      </Columar.Column> */}
    </StyledColumar>
  );
}

const StyledColumar = styled(Columar)`
  .divider {
    width: 100%;
    margin-bottom: 3.5rem;
    margin-top: 0;
    border-color: var(--border-input);
  }
`;

export default React.memo(Decoded);
