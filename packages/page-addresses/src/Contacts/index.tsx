// Copyright 2017-2024 @polkadot/app-addresses authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ActionStatus } from '@polkadot/react-components/Status/types';

import React, { useEffect, useState } from 'react';

import { Button, styled, SummaryBox, Table_Book } from '@polkadot/react-components';
import { useAddresses, useFavorites, useNextTick, useToggle } from '@polkadot/react-hooks';

import CreateModal from '../modals_book/Create.js';
import { useTranslation } from '../translate.js';
import Address from './Address_book.js';

interface SortedAddress { address: string; isFavorite: boolean }

interface Props {
  className?: string;
  onStatusChange: (status: ActionStatus) => void;
}

const STORE_FAVS = 'accounts:favorites';

function Overview ({ className = '', onStatusChange }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAddresses } = useAddresses();
  const [isCreateOpen, toggleCreate] = useToggle(false);
  const [favorites, toggleFavorite] = useFavorites(STORE_FAVS);
  const [sortedAddresses, setSortedAddresses] = useState<SortedAddress[] | undefined>();
  const isNextTick = useNextTick();

  useEffect((): void => {
    setSortedAddresses(
      allAddresses
        .map((address): SortedAddress => ({ address, isFavorite: favorites.includes(address) }))
        .sort((a, b): number =>
          a.isFavorite === b.isFavorite
            ? 0
            : b.isFavorite
              ? 1
              : -1
        )
    );
  }, [allAddresses, favorites]);

  return (
    <StyledDiv className={className}>
      {isCreateOpen && (
        <CreateModal
          onClose={toggleCreate}
          onStatusChange={onStatusChange}
        />
      )}
      <SummaryBox className='summary-box-contacts'>
        <Button.Group>
          <Button
            className='add-contact-button'
            icon='plus'
            label={t('Add contact')}
            onClick={toggleCreate}
          />
        </Button.Group>
      </SummaryBox>
      <Table_Book
        className='address-book-table'
        empty={isNextTick && sortedAddresses && <div className='detail'>
          <svg width="25" height="25" viewBox="0 0 25 25">
            <path fill="var(--color-icon)" d="M12.5 2c0.5 0 1 0.15 1.4 0.4l7.6 4.4c0.9 0.5 1.4 1.4 1.4 2.4v6.4c0 1-0.5 1.9-1.4 2.4l-7.6 4.4c-0.4 0.25-0.9 0.4-1.4 0.4s-1-0.15-1.4-0.4l-7.6-4.4c-0.9-0.5-1.4-1.4-1.4-2.4v-6.4c0-1 0.5-1.9 1.4-2.4l7.6-4.4c0.4-0.25 0.9-0.4 1.4-0.4z" />
            <path fill="var(--bg-page)" d="M11.5 8h2v7h-2zM11.5 16h2v2h-2z" />
          </svg>
          <p>No Saved Address</p>
        </div>}
        isSplit
      >
        {isNextTick && sortedAddresses?.map(({ address, isFavorite }): React.ReactNode => (
          <Address
            address={address}
            filter={''}
            isFavorite={isFavorite}
            key={address}
            toggleFavorite={toggleFavorite}
          />
        ))}
      </Table_Book>
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  background-color: var(--bg-menubar);
  border-radius: 1rem;
  height: 100%;
  .summary-box-contacts {
    align-items: center;
    padding-left: 3rem;
    padding-top: 1rem;
  }
  .add-contact-button {
    border: 1px solid var(--border-button);
    border-radius: 1rem;
    margin: 0;
  }
  .add-contact-button:hover {
    border-color: var(--border-input-hover);
  }
  .address-book-table {
    border-radius: 1rem;
    padding: 0 3rem;
    table {
      margin-bottom: 0 !important;
      border-radius: 5px;
    }
    .ui--Table-Split {
      margin-bottom: 0 !important;
    }
    td {
      div.empty {
        opacity: 1 !important;
      }
    }
    th {
    }
  }
  .detail {
      padding: 1rem 0rem 0rem 0rem;
      align-items: center;
      text-align: center;
      justity-content: center;
      display: flex;
      font-size: var(--font-size-h3);  
      p {
        padding-left: 1rem;
      }
    }
`;

export default React.memo(Overview);
