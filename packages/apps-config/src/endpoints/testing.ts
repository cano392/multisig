// Copyright 2017-2024 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from './types.js';

import { chains3dpassSVG, chainsBittensorPNG } from '../ui/logos/chains/index.js';

export * from './testingRelayPaseo.js';
export * from './testingRelayWestend.js';

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   providers: The actual hosted secure websocket endpoint
//
// IMPORTANT: Alphabetical based on text
export const testChains: Omit<EndpointOption, 'teleport'>[] = [
  {
    info: '3dpass-testnet',
    providers: {
      // '3dpass': 'wss://test-rpc.3dpass.org' // https://github.com/polkadot-js/apps/issues/9443
    },
    text: '3DPass Testnet',
    ui: {
      color: '#323232',
      logo: chains3dpassSVG
    }
  },
  {
    info: 'aleph-testnet',
    providers: {
      'Aleph Zero Foundation': 'wss://test.finney.opentensor.ai:443',
      Dwellir: 'wss://aleph-zero-testnet-rpc.dwellir.com'
      // OnFinality: 'wss://aleph-zero.api.onfinality.io/public-ws'
    },
    text: 'Bittensor',
    ui: {
      color: '#00CCAB',
      logo: chainsBittensorPNG
    }
  },
];
