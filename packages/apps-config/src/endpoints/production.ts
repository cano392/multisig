// Copyright 2017-2024 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from './types.js';

import {  chainsBittensorPNG, chainsCommuneaiPNG } from '../ui/logos/chains/index.js';
import { nodesCompetitorsClubPNG } from '../ui/logos/nodes/index.js';

export * from './productionRelayKusama.js';
export * from './productionRelayPolkadot.js';

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   providers: The actual hosted secure websocket endpoint
//
// IMPORTANT: Alphabetical based on text
export const prodChains: Omit<EndpointOption, 'teleport'>[] = [
  {
    info: 'bittensor',
    providers: {
      // Dwellir: 'wss://bittensor-mainnet-rpc.dwellir.com', // https://github.com/polkadot-js/apps/issues/10728
      'Opentensor Fdn (Archive)': 'wss://entrypoint-finney.opentensor.ai:443'
    },
    text: 'Bittensor',
    ui: {
      color: '#252525',
      logo: chainsBittensorPNG
    }
  },
  {
    info: 'communeai',
    providers: {
      Bitconnect: 'wss://commune-api-node-1.communeai.net'
      // OnFinality: 'wss://commune.api.onfinality.io/public-ws'
    },
    text: 'Commune AI',
    ui: {
      color: '#060606',
      logo: chainsCommuneaiPNG
    }
  },
  {
    info: 'competitors-club',
    providers: {
    },
    text: 'Competitors Club',
    ui: {
      color: '#213830',
      logo: nodesCompetitorsClubPNG
    }
  },
];
