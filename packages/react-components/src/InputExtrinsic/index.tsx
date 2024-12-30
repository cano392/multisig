// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SubmittableExtrinsicFunction } from '@polkadot/api/types';
import type { DropdownOptions } from '../util/types.js';

import React, { useCallback, useState } from 'react';

import { useApi } from '@polkadot/react-hooks';

import methodOptions from './options/method.js';
import sectionOptions from './options/section.js';
import LinkedWrapper from './LinkedWrapper.js';
import SelectMethod from './SelectMethod.js';
import SelectSection from './SelectSection.js';
import Button from '../Button/index.js';
import {
  styled
} from '@polkadot/react-components';
interface Props {
  className?: string;
  defaultValue: SubmittableExtrinsicFunction<'promise'>;
  filter?: (section: string, method?: string) => boolean;
  isDisabled?: boolean;
  isError?: boolean;
  isPrivate?: boolean;
  label: React.ReactNode;
  onChange?: (value: SubmittableExtrinsicFunction<'promise'>) => void;
  withLabel?: boolean;
}

function InputExtrinsic({ className = '', defaultValue, filter, isDisabled, label, onChange, withLabel }: Props): React.ReactElement<Props> {
  const { api } = useApi();
  const [optionsMethod, setOptionsMethod] = useState<DropdownOptions>(() => methodOptions(api, defaultValue.section, filter));
  const [optionsSection] = useState<DropdownOptions>(() => sectionOptions(api, filter));
  const [value, setValue] = useState<SubmittableExtrinsicFunction<'promise'>>((): SubmittableExtrinsicFunction<'promise'> => defaultValue);
  const [{ defaultMethod, defaultSection }] = useState(() => ({ defaultMethod: defaultValue.method, defaultSection: defaultValue.section }));
  const [methodType, setMethodType] = useState<string>('Validator')
  const _onKeyChange = useCallback(
    (newValue: SubmittableExtrinsicFunction<'promise'>): void => {
      if (value !== newValue) {
        setValue((): SubmittableExtrinsicFunction<'promise'> => newValue);
        onChange && onChange(newValue);
      }
    },
    [onChange, value]
  );

  const _onSectionChange = useCallback(
    (newSection: string): void => {
      if (newSection !== value.section) {
        let optionsMethod = methodOptions(api, newSection, filter);
        setOptionsMethod(optionsMethod);
        _onKeyChange(api.tx[newSection][optionsMethod[0].value]);
      }
    },
    [_onKeyChange, api, filter, value]
  );

  return (
    <StyledDiv>
      <LinkedWrapper
        className={`${className} ui--Input-Container`}
        label={label}
        withLabel={withLabel}
      >
        <div className='extrinsicsBtn'>
          <Button
            className='nextBtn'
            label={'User'}
            onClick={() => setMethodType('User')}
          />
          <Button
            className='nextBtn'
            label={'Subnet'}
            onClick={() => setMethodType('Subnet')}
          />
          <Button
            className='nextBtn'
            label={'Validator'}
            onClick={() => setMethodType('Validator')}
          />
          {/* <button style={{ width: '6rem', backgroundColor: 'var(--bg-subCard)', color: 'var(--color-text)', paddingTop: '0.2rem', paddingBottom: '0.2rem'}} className='nextBtn'>User</button>
          <button style={{ width: '6rem', backgroundColor: 'var(--bg-subCard)', color: 'var(--color-text)', paddingTop: '0.2rem', paddingBottom: '0.2rem'}} className='nextBtn'>Subnet</button>
          <button style={{ width: '6rem', backgroundColor: 'var(--bg-subCard)', color: 'var(--color-text)', paddingTop: '0.2rem', paddingBottom: '0.2rem'}} className='nextBtn'>Validator</button> */}
        </div>
        {/* <div className="button-group extrinsicsBtn">
          <button className="button active">Validator</button>
          <button className="button">Subnet</button>
          <button className="button">User</button>
        </div> */}
        <SelectSection
          className='small'
          defaultValue={defaultSection}
          isDisabled={isDisabled}
          onChange={isDisabled ? undefined : _onSectionChange}
          options={optionsSection}
          value={value}
        />

        <SelectMethod
          api={api}
          className='large'
          defaultValue={defaultMethod}
          isDisabled={isDisabled}
          onChange={isDisabled ? undefined : _onKeyChange}
          options={optionsMethod}
          value={value}
          methodType={methodType}
        />
      </LinkedWrapper>
    </StyledDiv>
  );
}

export default React.memo(InputExtrinsic);

const StyledDiv = styled.div`
  .extrinsicsBtn {
    position: absolute;
    top: -5rem;
    width: 20rem;
  }
  .nextBtn {
    width: 6rem;
    margin-left: 0.2rem;
  }
//   .button-group {
//     position: absolute;
//     top: -5rem;
//     width: 20rem !important;
//     display: flex;
//     border: 1px solid #ccc;
//     border-radius: 4px;
//     float: right;
//   }

// .button {
//   flex: 1;
//   padding: 8px 16px;
//   background-color: #f1f1f1;
//   border: none;
//   outline: none;
//   cursor: pointer;
//   transition: background-color 0.3s;
//   float: right;
// }

// .button.active {
//   background-color: #007bff;
//   color: #fff;
//   float: right;
// }

// .button:not(:last-child) {
//   border-right: 1px solid #ccc;
//   float: right;
// }

// .button:hover:not(.active) {
//   background-color: #e6e6e6;
//   float: right;
// }

`