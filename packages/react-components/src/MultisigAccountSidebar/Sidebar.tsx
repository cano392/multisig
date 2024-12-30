// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { useMemo, useRef, useState } from 'react';

import { useAccountInfo } from '@polkadot/react-hooks';

import { styled } from '../styled.js';
import { colorLink } from '../styles/theme.js';
import MultisigPage from './Multisig.js';
import SidebarEditableSection from './SidebarEditableSection.js';
import { MultisigOutput } from '@polkadot/react-components';
import type { H256, Multisig } from '@polkadot/types/interfaces';

interface Props {
  address: string;
  className?: string;
  dataTestId?: string;
  onClose?: () => void;
  onUpdateName?: (() => void) | null;
  toggleMultisig: () => void;
  ongoing: [H256, Multisig][];
  toggleProxyOverview: () => void;
}


interface Option {
  text: string;
  value: string;
}


function MultisigFullSidebar({ address, className = '', onUpdateName, toggleMultisig, ongoing, toggleProxyOverview }: Props): React.ReactElement<Props> {
  const [inEditMode, setInEditMode] = useState<boolean>(false);
  const { accountIndex, flags, meta } = useAccountInfo(address);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const hashes = useMemo<Option[]>(
    () => ongoing?.map(([h]) => ({ text: h.toHex(), value: h.toHex() })),
    [ongoing]
  );

  return (
    <StyledDiv
      className={`${className}${inEditMode ? ' inEditMode' : ''}`}
    >
      <div
        className='ui--AddressMenu-header'
        data-testid='sidebar-address-menu'
      >
        <SidebarEditableSection
          accountIndex={accountIndex}
          address={address}
          isBeingEdited={setInEditMode}
          onUpdateName={onUpdateName}
          sidebarRef={sidebarRef}
          toggleProxyOverview={toggleProxyOverview}
        />
      </div>
      <div className='account_detail'>
        <div className='ui--ScrollSection'>
          <h1 >Account Detail</h1>
          {/* <Identity
          address={address}
          identity={identity}
        /> */}
          <MultisigPage
            isMultisig={flags.isMultisig}
            meta={meta}
          />
        </div>
        <div className='hash'>
          <h1 >Pending Transaction</h1>
          <div className='subCard'>
            {hashes?.map((item, key) =>
              <MultisigOutput
                key={key}
                isDisabled
                value={item.value}
                withCopy
                toggleMultisig={toggleMultisig}
              />
            )}
          </div>

        </div>
      </div>

    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--bg-page);
  width: 100%;

  .ui--Labelled:not(.isSmall) >.ui--Labelled-content .ui.selection.dropdown:not(.floating) {
    padding-top: 1.2rem !important;
  }
  .account_detail {
    display: flex;
    @media only screen and (max-width: 1400px) {
      display: block;
    }
  }
  .hash {
    width: 62%;
    background-color: var(--bg-menubar);
    border-radius: 1rem;
    padding: 1rem;
    border: 1px solid var(--border-card);

    .subCard {
      background-color: var(--bg-subCard);
      border-radius: 1rem;
      height: 20rem;
      padding: 0.5rem;
    }
    @media only screen and (max-width: 1400px) {
      width: 98%;
      margin: 1rem 0rem 0rem 1rem;
    }
  }
  padding: 0 0 3.286rem;

  input {
    width: auto !important;
  }

  .ui--AddressMenu-header {
    align-items: center;
    background: var(--bg-menubar);
    border: 1px solid var(--border-card);
    display: flex;
    margin: 0 0 1rem 1rem;
    justify-content: space-between;
    padding: 2rem 2rem 2rem 2rem;
    border-radius: 1rem;
  }

  .ui--AddressSection {
    display: flex;
    align-items: center;

    .ui--AddressSection__AddressColumn {
      width: calc(100% - 82px - 17rem);
      padding: 0 1rem;

      .ui--AccountName {
        max-width: 21.5rem;
        font-size: 25px;
        overflow: hidden;
        white-space: normal;
      }
    }

    .ui--AddressSection__CopyColumn {
      margin-left: 1rem;

      .ui--AccountName {
        max-width: 10rem;
        overflow: hidden;
      }
    }
  }

  .ui--AddressMenu-addr,
  .ui--AddressMenu-index {
    text-align: left;
    font-size: var(--font-size-small);
  }

  .ui--AddressMenu-addr {
    word-break: break-all;
    width: 100%;
    margin: 0.5rem 0 0;
    color: var(--color-label);
  }

  .ui--AddressMenu-copyaddr,
  .ui--AddressMenu-index {
    text-align: left;
    font-size: var(--font-size-small);
  }

  .ui--AddressMenu-copyaaddr {
    word-break: break-all;
    width: 12ch;
    margin: 0.371rem 0;
    color: var(--color-label);
  }


  .ui--AddressMenu-index {
    display: flex;
    flex-direction: row;

    label {
      font-size: var(--font-size-small);
      margin-right: 0.4rem;
      text-transform: capitalize;
    }
  }

  section {

    &:not(:last-child) {
      margin-bottom: 1rem;
    }

    .ui--AddressMenu-sectionHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-transform: capitalize;

      margin-bottom: 0.57rem;
      width: 100%;

      color: var(--color-text);
      font-size: 1.143rem;
    }

    &.withDivider {

      ::before {
        position: absolute;
        top: 0;
        left: 0;

        content: '';
        width: 100%;
        // height: 1px;
        background-color: var(--border-table);
      }
    }
  }

  .ui--AddressMenu-identity,
  .ui--AddressMenu-multisig {
    .ui--AddressMenu-identityTable,
    .ui--AddressMenu-multisigTable {
      font-size: var(--font-size-small);
      margin-top: 0.6rem;
      padding: 1rem 2rem 0rem 2rem;

      .tr {
        padding: 0rem 0rem 0.6rem 0rem;
        // display: inline-flex;
        align-items: center;
        width: 100%;
        justify-content: space-between;

        .th {
          color: var(--color-label);
          font-weight: var(--font-weight-bold);
          text-align: left;
          flex-basis: 25%;
          font-size: var(--font-size-h3);

          &.top {
            align-self: flex-start;
          }
        }

        .td {
          overflow: hidden;
          padding: 1rem;
          text-overflow: ellipsis;
          text-align: left;
          flex-basis: 50%;
          font-size: var(--font-size-h3);
        }
      }

      .ui--AddressMini, .subs-number {
        margin-bottom: 0.4rem;
        padding: 0;
      }

      .subs-number {
        font-size: var(--font-size-base);
        margin-bottom: 0.714rem;
      }
    }

    .parent {
      padding: 0 !important;
    }
  }

  && .column {
    align-items: center;

    .ui--FormatBalance:first-of-type {
      margin-bottom: 0rem;
    }

    .ui--FormatBalance {
      line-height: 1rem;
    }
  }

  .ui--AddressMenu-buttons {
    .ui--Button-Group {
      margin-bottom: 0;
    }
  }

  .ui--AddressMenu-tags,
  .ui--AddressMenu-flags {
    margin: 0.75rem 0 0;
    width: 100%;
  }

  .ui--AddressMenu-identityIcon {
    background: ${colorLink}66;
  }

  .ui--AddressMenu-actions {
    ul {
      list-style-type: none;
      margin-block-start: 0;
      margin-block-end: 0;
      padding-inline-start: 1rem;

      li {
        margin: 0.2rem 0;
      }
    }
  }

  .inline-icon {
    cursor: pointer;
    margin: 0 0 0 0.5rem;
    color: ${colorLink};
  }

  .name--input {
    .ui.input {
      margin: 0 !important;

      > input {
      }
    }
  }

  &.inEditMode {
    .ui--AddressMenu-flags {
      opacity: 60%;
    }
  }

  .ui--AddressMenu-multisig .th.signatories {
    align-self: flex-start;
  }

  .ui--ScrollSection {
    padding: 1rem;
    overflow: auto;
    width: 38%;

    margin: 0 1rem 0 1rem;
    border: 1px solid var(--border-card);
    border-radius: 1rem;
    background-color: var(--bg-menubar);
    
    @media only screen and (max-width: 1400px) {
      width: 98%;
    }
  }

  .ui--LinkSection {
    border-top: 1px solid var(--border-table);
    padding: 0.5rem 0 0.571rem;
    width: 100%;
    position: absolute;
    bottom: 0;

    span {
      margin: 0 0.5rem;
    }
  }
`;

export default React.memo(MultisigFullSidebar);
