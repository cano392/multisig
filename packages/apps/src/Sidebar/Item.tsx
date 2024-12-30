// Copyright 2017-2024 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemRoute } from './types.js';

import React from 'react';

import { Icon, styled } from '@polkadot/react-components';
import { useToggle } from '@polkadot/react-hooks';

interface Props {
  className?: string;
  classNameText?: string;
  isLink?: boolean;
  isToplevel?: boolean;
  route: ItemRoute;
  isActive: boolean;
}

const DUMMY_COUNTER = () => 0;

function Item ({ className = '', classNameText, isLink, isToplevel, route: { Modal, href, icon, name, text, useCounter = DUMMY_COUNTER } }: Props): React.ReactElement<Props> {
  const [isModalVisible, toggleModal] = useToggle();
  const count = useCounter();

  return (
    <StyledLi className={`${className} ui--MenuItem ${count ? 'withCounter' : ''} ${isLink ? 'isLink' : ''} ${isToplevel ? 'topLevel highlight--color-contrast' : ''}`}>
      <a
        href={Modal ? undefined : (href || `#/${name}`)}
        onClick={Modal ? toggleModal : undefined}
        rel='noopener noreferrer'
        target={href ? '_blank' : undefined}
      >
        <Icon icon={icon} />
        <span className={`${classNameText} sidebarItem media--1200`}>{text}</span>
        {/* {!!count && (
          <Badge
            color='white'
            info={count}
          />
        )} */}
      </a>
      {Modal && isModalVisible && (
        <Modal onClose={toggleModal} />
      )}
    </StyledLi>
  );
}

const StyledLi = styled.li`
  cursor: pointer;
  position: relative;
  white-space: nowrap;
  border-radius: 1rem;
  &.topLevel {
    font-weight: var(--font-weight-bold);
    line-height: 1.214rem;
    border-radius: 1rem;

    a {
      padding: 0.857rem 0.857em 0.857rem 1rem;
      line-height: 1.214rem;
      border-radius: 1rem;
    }

    &.isActive.highlight--color-contrast {
      font-weight: var(--font-weight-normal);
      a {
        color: var(--color-text-hover) !important;
        background-color: var(--item-active) !important;
        font-weight: 700 !important;
      }
    }

    &.isActive {
      border-radius: 1rem;

      a {
        padding: 0.857rem 1.429rem 0.857rem;
        cursor: default;
      }

      &&.withCounter a {
        padding-right: 3.2rem;
      }
    }

    .ui--Badge {
      top: 0.7rem;
    }
  }

  &&.withCounter a {
    padding-right: 3.2rem;
  }

  a {
    color: var(--color-text) !important;
    display: block;
    padding: 0.5rem 1.15rem 0.57rem;
    text-decoration: none;
    line-height: 1.5rem;
    font-weight: var(--font-weight-normal) !important;

  }

  .ui--Badge {
    position: absolute;
    right: 0.5rem;
  }

  .ui--Icon {
    margin-right: 0.5rem;
  }
  .sidebarItem {
    font-size: var(--font-size-h1);
  }
  
  a:hover {
    background-color: var(--item-active) !important;
    color: var(--color-text-hover) !important;
  }
`;

export default React.memo(Item);
