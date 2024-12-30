// Copyright 2017-2024 @polkadot/app-extrinsics authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsic, SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { RawParam } from '@polkadot/react-params/types';
import type { DecodedExtrinsic } from './types.js';

import React, { useCallback, useState } from 'react';

import { useApi } from '@polkadot/react-hooks';
import { Extrinsic } from '@polkadot/react-params';

import { useTranslation } from './translate.js';
import { styled } from '@polkadot/react-components';

interface Props {
  className?: string;
  defaultValue: DecodedExtrinsic | null;
}

interface DefaultExtrinsic {
  defaultArgs?: RawParam[];
  defaultFn: SubmittableExtrinsicFunction<'promise'>;
}

function extractDefaults(value: DecodedExtrinsic | null, defaultFn: SubmittableExtrinsicFunction<'promise'>): DefaultExtrinsic {
  if (!value) {
    return { defaultFn };
  }

  return {
    defaultArgs: value.call.args.map((value) => ({
      isValid: true,
      value
    })),
    defaultFn: value.fn
  };
}

function Selection({ className, defaultValue }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { apiDefaultTxSudo } = useApi();
  const { api } = useApi();
  const [error, setError] = useState<string | null>(null);
  const [extrinsicUpper, setExtrinsicUpper] = useState<SubmittableExtrinsic<'promise'> | null>(null);
  const [{ defaultArgs, defaultFn }] = useState<DefaultExtrinsic>(() => extractDefaults(defaultValue, apiDefaultTxSudo));

  const _onExtrinsicChange = useCallback(
    (method?: SubmittableExtrinsic<'promise'>) =>
      setExtrinsicUpper(() => method || null),
    []
  );

  const _onExtrinsicError = useCallback(
    (error?: Error | null) =>
      setError(error ? error.message : null),
    []
  );

  return (
    <StyledDiv className={className}>
      {
        api.runtimeChain.toString() == 'commune' || api.runtimeChain.toString() == 'Bittensor' ?
          <>
            <h1 style={{ paddingLeft: '2rem'}}>Fill in the below fields</h1>
            <Extrinsic
              defaultArgs={defaultArgs}
              defaultValue={defaultFn}
              label={t('Extrinsic')}
              onChange={_onExtrinsicChange}
              onError={_onExtrinsicError}
              extrinsicUpper={extrinsicUpper}
              error={error}
            />
          </> :
          <div className='empty-account'>
            <div className='detail'>
              <svg width="25" height="25" viewBox="0 0 25 25">
                <path fill="var(--color-icon)" d="M12.5 2c0.5 0 1 0.15 1.4 0.4l7.6 4.4c0.9 0.5 1.4 1.4 1.4 2.4v6.4c0 1-0.5 1.9-1.4 2.4l-7.6 4.4c-0.4 0.25-0.9 0.4-1.4 0.4s-1-0.15-1.4-0.4l-7.6-4.4c-0.9-0.5-1.4-1.4-1.4-2.4v-6.4c0-1 0.5-1.9 1.4-2.4l7.6-4.4c0.4-0.25 0.9-0.4 1.4-0.4z" />
                <path fill="var(--bg-page)" d="M11.5 8h2v7h-2zM11.5 16h2v2h-2z" />
              </svg>
              <p>Extrinsics does not support this network.</p>
            </div>
          </div>
      }
    </StyledDiv>
  );
}

export default React.memo(Selection);

const StyledDiv = styled.div`
  .extrinsics--Extrinsic {
    display: flex;
    .ui.selection.dropdown {
      word-wrap: normal !important;
    }
    .ui--Params-Container {
      .ui--Params-Content {
        display: flex;
        flex-direction: column;
        row-gap: 3rem;
      }
    }
    .ui--Address-Extrinsic {
      width: 100%;
      background-color: var(--bg-menubar);
      padding: 5rem;
      margin: 2rem;
      border-radius: 1rem;

    }
    .ui--Params-Decoded-Button {
      width: 100%;
      background-color: var(--bg-menubar);
      padding: 4rem 5rem 3rem 5rem;
      margin: 2rem;
      border-radius: 1rem;
      display: flex;
      flex-direction: column;
      row-gap: 2rem;
      .ui--Button-Group {
        margin: 0;
        .ui--Button {
          margin: 0;
        }
        .hasLabel {
          padding: 0.7rem;
        }
      }
      .ui--InputFile {
        padding: 1rem !important;
      }
    }
    .ui--Input-Container {
      margin-top: 6rem;
      .ui--DropdownLinked-Items {
        .ui {
          padding-left: 1rem !important;
          .search {
            padding-left: 1rem !important;
          }
        }
      }
    }
    .is50 {
      .ui--Column {
        max-width: 100%;
      }
    }
    .withBorder {
      padding-left: 0;
    }
  }
  .ui--Columar {
    .ui--Column {
      .ui--Output {
        .ui--Labelled-content {
          .ui {
            padding-left: 1rem !important;
            padding-top: 1.2rem;
          }
        }
      }
    }
  }
  .ui--CopyButton {
    top: 1rem !important;
    right: 1.3rem !important;
    .ui--Button {
      padding: 0 !important;
    }
  }
  .default {
    left: -3rem !important;
  }
  .address {
    width: 70%;
    padding-top: 0.3rem;
  }
  .empty-account {
    width: 100%;
    height: 4rem;
    display: flex;
    padding: 1rem 2rem 1rem 1rem;
    border-radius: 1rem;
    background-color: var(--bg-menubar);
    justify-content: space-between;
    align-items: center;
    text-align: center;
    .detail {
      display: flex;
      font-size: var(--font-size-h3);  
      p {
        padding-left: 1rem;
      } 
    }
  }

  @media only screen and (max-width: 1440px) {
    > .name {
      margin-left: 2rem;
    }
  }
`
