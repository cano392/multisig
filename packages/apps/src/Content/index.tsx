// Copyright 2017-2024 @polkadot/apps authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Route } from '@polkadot/apps-routing/types';

import React, { Suspense, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import createRoutes from '@polkadot/apps-routing';
import { ErrorBoundary, Spinner, styled } from '@polkadot/react-components';
import { useApi, useQueue } from '@polkadot/react-hooks';
import { TabsCtx } from '@polkadot/react-hooks/ctx/Tabs';

import { findMissingApis } from '../endpoint.js';
import { useTranslation } from '../translate.js';
import NotFound from './NotFound.js';
import Status from './Status.js';

interface Props {
  className?: string;
}

const NOT_FOUND: Route = {
  Component: NotFound,
  display: {},
  group: 'settings',
  icon: 'times',
  isIgnored: false,
  name: 'unknown',
  text: 'Unknown'
};

function Content ({ className }: Props): React.ReactElement<Props> {
  const location = useLocation();
  const { t } = useTranslation();
  const { api, isApiConnected, isApiReady, isDevelopment } = useApi();
  const { queueAction } = useQueue();

  const { Component, display: { needsApi, needsApiCheck, needsApiInstances }, icon, name, text } = useMemo(
    (): Route => {
      const app = location.pathname.slice(1) || '';

      return createRoutes(t).find((r) =>
        r &&
        app.startsWith(r.name) &&
        (isDevelopment || !r.display.isDevelopment)
      ) || NOT_FOUND;
    },
    [isDevelopment, location, t]
  );

  const missingApis = useMemo(
    () => needsApi
      ? isApiReady && isApiConnected
        ? findMissingApis(api, needsApi, needsApiInstances, needsApiCheck)
        : null
      : [],
    [api, isApiConnected, isApiReady, needsApi, needsApiCheck, needsApiInstances]
  );

  return (
    <StyledDiv className={className}>
      {!missingApis
        ? (
          <div className='connecting'>
            <Spinner label={t('Initializing connection')} />
          </div>
        )
        : (
          <>
            <Suspense fallback='...'>
              <ErrorBoundary trigger={name}>
                <TabsCtx.Provider value={{ icon, text }}>
                  {missingApis.length
                    ? (
                      <NotFound
                        basePath={`/${name}`}
                        location={location}
                        missingApis={missingApis}
                        onStatusChange={queueAction}
                      />
                    )
                    : (
                      <Component
                        basePath={`/${name}`}
                        location={location}
                        onStatusChange={queueAction}
                      />
                    )
                  }
                </TabsCtx.Provider>
              </ErrorBoundary>
            </Suspense>
            <Status />
          </>
        )
      }
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  flex-grow: 1;
  overflow: hidden auto;
  padding: 2rem 1rem 2rem 1rem;
  position: relative;
  
  margin: 0;
  border-radius: 1rem;
  .connecting {
    padding: 3.5rem 0;
  }

  & main > *:not(header):not(.hasOwnMaxWidth) {
    margin-right: auto;
    margin-left: auto;
    width: 100%;
  }
`;

export default React.memo(Content);
