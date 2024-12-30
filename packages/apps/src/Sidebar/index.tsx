// Copyright 2017-2024 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Route, Routes } from '@polkadot/apps-routing/types';
import type { ApiProps } from '@polkadot/react-api/types';
import type { AccountId } from '@polkadot/types/interfaces';
import type { Group, Groups } from './types.js';

import React, { useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import createRoutes from '@polkadot/apps-routing';
import { styled } from '@polkadot/react-components';
import { useAccounts, useApi, useCall, useTeleport } from '@polkadot/react-hooks';

import { findMissingApis } from '../endpoint.js';
import { useTranslation } from '../translate.js';
import Grouping from './Grouping.js';

interface Props {
  className?: string;
}

function checkVisible ({ api, isApiConnected, isApiReady, isDevelopment: isApiDevelopment }: ApiProps, allowTeleport: boolean, hasAccounts: boolean, hasSudo: boolean, { isDevelopment, isHidden, needsAccounts, needsApi, needsApiCheck, needsApiInstances, needsSudo, needsTeleport }: Route['display']): boolean {
  if (isHidden) {
    return false;
  } else if (needsAccounts && !hasAccounts) {
    return false;
  } else if (!needsApi) {
    return true;
  } else if (!isApiReady || !isApiConnected) {
    return false;
  } else if (needsSudo && !hasSudo) {
    return false;
  } else if (needsTeleport && !allowTeleport) {
    return false;
  } else if (!isApiDevelopment && isDevelopment) {
    return false;
  }

  return findMissingApis(api, needsApi, needsApiInstances, needsApiCheck).length === 0;
}

function extractGroups (routing: Routes, groupNames: Record<string, string>, apiProps: ApiProps, allowTeleport: boolean, hasAccounts: boolean, hasSudo: boolean): Group[] {
  return Object
    .values(
      routing.reduce((all: Groups, route): Groups => {
        if (!all[route.group]) {
          all[route.group] = {
            name: groupNames[route.group],
            routes: [route]
          };
        } else {
          all[route.group].routes.push(route);
        }

        return all;
      }, {})
    )
    .map(({ name, routes }): Group => ({
      name,
      routes: routes.filter(({ display }) =>
        checkVisible(apiProps, allowTeleport, hasAccounts, hasSudo, display)
      )
    }))
    .filter(({ routes }) => routes.length);
}

function Sidebar ({ className = '' }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { allAccounts, hasAccounts } = useAccounts();
  const apiProps = useApi();
  const { allowTeleport } = useTeleport();
  const sudoKey = useCall<AccountId>(apiProps.isApiReady && apiProps.api.query.sudo?.key);
  const location = useLocation();

  const routeRef = useRef(createRoutes(t));

  const groupRef = useRef({
    accounts: t('Accounts'),
    developer: t('Developer'),
    files: t('Files'),
    governance: t('Governance'),
    network: t('Network'),
    settings: t('Settings')
  });

  const hasSudo = useMemo(
    () => !!sudoKey && allAccounts.some((a) => sudoKey.eq(a)),
    [allAccounts, sudoKey]
  );

  const visibleGroups = useMemo(
    () => extractGroups(routeRef.current, groupRef.current, apiProps, allowTeleport, hasAccounts, hasSudo),
    [allowTeleport, apiProps, hasAccounts, hasSudo]
  );

  const activeRoute = useMemo(
    () => routeRef.current.find(({ name }) =>
      location.pathname.startsWith(`/${name}`)
    ) || null,
    [location]
  );

  return (
    <StyledDiv className={`${className}${(!apiProps.isApiReady || !apiProps.isApiConnected) ? ' isLoading' : ''}`}>
      <div className='menuContainer'>
        <div className='menuSection'>
          <ul className='menuItems'>
            {visibleGroups.map(({ name, routes }): React.ReactNode => (
              <Grouping
                isActive={!!activeRoute && activeRoute.group === name?.toLowerCase()}
                key={name}
                name={name}
                routes={routes}
              />
            ))}
          </ul>
        </div>

      </div>
      {/* <div className='IconContainer'>
        <Menu.Item icon='plus' className={`iconBtn`}/>
        <Menu.Item icon='user'  className={`iconBtn isActive`}/>
        <Menu.Item icon='users'  className={`iconBtn`}/>
        <Menu.Item icon='address-book'  className={`iconBtn`}/>
        <Menu.Item icon='users' className={`iconBtn`}/>
      </div> */}
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  width: 300px;
  height: calc(100vh - 151.5px);
  padding: 2rem 1rem 0rem 1rem;
  z-index: 220;
  .smallShow {
    display: none;
  }

  .menuContainer {
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: var(--width-full);
    margin: 0 auto;
    background-color: var(--bg-menubar);
    border-radius: 1rem;
  }

  &.isLoading {
    .menuActive {
      background: var(--bg-page);
    }

    &:before {
      filter: grayscale(1);
    }

    .menuItems {
      filter: grayscale(1);
    }
  }

  .menuSection {
    align-items: center;
    line-height: 5;

  }

  .menuActive {
    background: var(--bg-tabs);
    border-bottom: none;
    border-radius: 0.25rem 0.25rem 0 0;
    color: var(--color-text);
    padding: 1rem 1.5rem;
    margin: 0 1rem -1px;
    z-index: 1;

    .ui--Icon {
      margin-right: 0.5rem;
    }
  }

  .menuItems {
    list-style: none;
    margin: 0;
    padding: 2rem 1rem 2rem 1rem;

    > li {
      display: inline-block;
    }

    > li {
      width: 100%;
    }
  }

  .ui--NodeInfo {
    align-self: center;
  }

  @media only screen and (max-width: 800px) {

    .smallShow {
      display: initial;
    }

    .smallHide {
      display: none;
    }
  }

  @media only screen and (max-width: 1200px) {
    width: 114px;
  }

  .IconContainer {
    justify-content: space-between;
    display: flex;
    margin: 0 1.5rem;
    .iconBtn {
      background-color: var(--bg-menubar);
      border-radius: 50%;
      padding: 1.5rem;
      align-items: center;
      text-align: center;
      
    }
    .isActive {
      border-top-left-radius: unset;
      border-top-right-radius: unset;
    }
  }
`;

export default React.memo(Sidebar);
