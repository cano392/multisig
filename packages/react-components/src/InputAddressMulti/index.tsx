// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useCallback, useEffect, useState } from 'react';

import { useDebounce, useNextTick } from '@polkadot/react-hooks';

import Spinner from '../Spinner.js';
import { styled } from '../styled.js';
import Available from './Available.js';
import Selected from './Selected.js';

interface Props {
  available: string[];
  availableLabel: React.ReactNode;
  className?: string;
  defaultValue?: string[];
  maxCount: number;
  onChange: (values: string[]) => void;
  valueLabel: React.ReactNode;
}

function exclude (prev: string[], address: string): string[] {
  return prev.includes(address)
    ? prev.filter((a) => a !== address)
    : prev;
}

function include (prev: string[], address: string, maxCount: number): string[] {
  return !prev.includes(address) && (prev.length < maxCount)
    ? prev.concat(address)
    : prev;
}

function InputAddressMulti ({ available, availableLabel, className = '', defaultValue, maxCount, onChange, valueLabel }: Props): React.ReactElement<Props> {
  const [_filter, setFilter] = useState<string>('');
  const [selected, setSelected] = useState<string[]>([]);
  const filter = useDebounce(_filter);
  const isNextTick = useNextTick();
  
  useEffect((): void => {
    defaultValue && setSelected(defaultValue);
  }, [defaultValue, setFilter]);

  useEffect((): void => {
    selected && onChange(selected);
  }, [onChange, selected]);

  const onSelect = useCallback(
    (address: string) => setSelected((prev) => include(prev, address, maxCount)),
    [maxCount]
  );

  const onDeselect = useCallback(
    (address: string) => setSelected((prev) => exclude(prev, address)),
    []
  );

  return (
    <StyledDiv className={`${className} ui--InputAddressMulti`}>
      <div className='ui--InputAddressMulti-columns'>
        <div className='ui--InputAddressMulti-column'>
          <label>{valueLabel}</label>
          <div className='ui--InputAddressMulti-items'>
            {selected.map((address): React.ReactNode => (
              <Selected
                address={address}
                key={address}
                onDeselect={onDeselect}
              />
            ))}
          </div>
        </div>
        <div className='ui--InputAddressMulti-column'>
          <label>{availableLabel}</label>
          <div className='ui--InputAddressMulti-items'>
            {isNextTick
              ? available.map((address) => (
                <Available
                  address={address}
                  filter={filter}
                  isHidden={selected?.includes(address)}
                  key={address}
                  onSelect={onSelect}
                />
              ))
              : <Spinner />
            }
          </div>
        </div>
      </div>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  border-top-width: 0px;
  width: 100%;
  padding-top: 2rem;
  .ui--InputAddressMulti-Input {
    .ui.input {
      margin-bottom: 0.25rem;
      opacity: 1 !important;
    }
  }

  .ui--InputAddressMulti-columns {
    width: 100%;
    .ui--InputAddressMulti-column {
      display: flex;
      flex-direction: column;
      min-height: 16rem;
      max-height: 16rem;
      width: 100%;
      // padding: 0.25rem 0.5rem;

      .ui--InputAddressMulti-items {
        margin-top: 1rem;
        padding: 0.5rem 2rem 0.5rem 2rem;
        background-color: var(--bg-menubar);
        border-radius: 1rem;
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        margin-bottom: 1.5rem;
        .ui--Spinner {
          margin-top: 2rem;
        }

        .ui--AddressToggle {
          padding-left: 0.75rem;

          .ui--AddressToggle-address {
            flex: none;
            width: 40%;
          }

          @media only screen and (max-width: 1440px) {
            .ui--AddressToggle-address {
              flex: none;
              width: 30%;
            }
            .address-text {
              width: 60%;
            }
          }

          .address-text {
            width: 50%;
            text-overflow: ellipsis;
            overflow: hidden;

          }
        }

        .ui--AddressMini-address {
          min-width: auto;
          max-width: 100%;
        }

        .ui--AddressMini-info {
          max-width: 100%;
        }
      }
    > label {
    font-size: var(--font-size-h2);
  }
    }
  }
`;

export default React.memo(InputAddressMulti);
