// Copyright 2017-2024 @polkadot/apps-config authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { EndpointOption } from './types.js';

import { POLKADOT_GENESIS } from '../api/constants.js';
import { chainsPolkadotCircleSVG } from '../ui/logos/chains/index.js';
import { getTeleports } from './util.js';

// The available endpoints that will show in the dropdown. For the most part (with the exception of
// Polkadot) we try to keep this to live chains only, with RPCs hosted by the community/chain vendor
//   info: The chain logo name as defined in ../ui/logos/index.ts in namedLogos (this also needs to align with @polkadot/networks)
//   text: The text to display on the dropdown
//   providers: The actual hosted secure websocket endpoint
//
// IMPORTANT: Alphabetical based on text
export const prodParasPolkadot: Omit<EndpointOption, 'teleport'>[] = [
];

export const prodParasPolkadotCommon: EndpointOption[] = [
];

export const prodRelayPolkadot: EndpointOption = {
  dnslink: 'polkadot',
  genesisHash: POLKADOT_GENESIS,
  info: 'polkadot',
  isPeopleForIdentity: true,
  isRelay: true,
  linked: [
    ...prodParasPolkadotCommon,
    ...prodParasPolkadot
  ],
  providers: {
    Allnodes: 'wss://polkadot-rpc.publicnode.com',
    // 'Geometry Labs': 'wss://polkadot.geometry.io/websockets', // https://github.com/polkadot-js/apps/pull/6746
    // 'Automata 1RPC': 'wss://1rpc.io/dot',
    Blockops: 'wss://polkadot-public-rpc.blockops.network/ws',
    Dwellir: 'wss://polkadot-rpc.dwellir.com',
    'Dwellir Tunisia': 'wss://polkadot-rpc-tn.dwellir.com',
    IBP1: 'wss://rpc.ibp.network/polkadot',
    IBP2: 'wss://polkadot.dotters.network',
    LuckyFriday: 'wss://rpc-polkadot.luckyfriday.io',
    OnFinality: 'wss://polkadot.api.onfinality.io/public-ws',
    RadiumBlock: 'wss://polkadot.public.curie.radiumblock.co/ws',
    RockX: 'wss://rockx-dot.w3node.com/polka-public-dot/ws',
    Stakeworld: 'wss://dot-rpc.stakeworld.io',
    SubQuery: 'wss://polkadot.rpc.subquery.network/public/ws',
    'light client': 'light://substrate-connect/polkadot'
  },
  teleport: getTeleports(prodParasPolkadotCommon),
  text: 'Polkadot',
  ui: {
    color: '',
    identityIcon: 'polkadot',
    logo: chainsPolkadotCircleSVG
  }
};
