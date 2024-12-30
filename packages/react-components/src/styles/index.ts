// Copyright 2017-2024 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createGlobalStyle } from 'styled-components';

import cssComponents from './components.js';
import cssForm from './form.js';
import cssMedia from './media.js';
import cssSemantic from './semantic.js';
import cssTheme from './theme.js';

interface Props {
  uiHighlight?: string;
}

const BRIGHTNESS = 128 + 32;
const FACTORS = [0.2126, 0.7152, 0.0722];
const PARTS = [0, 2, 4];
const VERY_DARK = 16;

export const defaultHighlight = '#';

function getHighlight (uiHighlight: string | undefined): string {
  return (uiHighlight || defaultHighlight);
}

function countBrightness (uiHighlight: string | undefined): number {
  const hc = getHighlight(uiHighlight).replace('#', '').toLowerCase();

  return PARTS.reduce((b, p, index) => b + (parseInt(hc.substring(p, p + 2), 16) * FACTORS[index]), 0);
}

function getContrast (uiHighlight: string | undefined): string {
  const brightness = countBrightness(uiHighlight);

  return brightness > BRIGHTNESS
    ? 'rgba(45, 43, 41, 0.875)'
    : 'rgba(255, 253, 251, 0.875)';
}

function getMenuHoverContrast (uiHighlight: string | undefined): string {
  const brightness = countBrightness(uiHighlight);

  if (brightness < VERY_DARK) {
    return 'rgba(255, 255, 255, 0.15)';
  }

  return brightness < BRIGHTNESS
    ? 'rgba(0, 0, 0, 0.15)'
    : 'rgba(255, 255, 255, 0.15)';
}

function hexToRGB (hex: string, alpha?: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return alpha
    ? `rgba(${r}, ${g}, ${b}, ${alpha})`
    : `rgb(${r}, ${g}, ${b})`;
}

export default createGlobalStyle<Props>(({ uiHighlight }: Props) => `
  .highlight--all {
    background: ${getHighlight(uiHighlight)} !important;
    border-color: ${getHighlight(uiHighlight)} !important;
    color: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--before:before {
    background: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--before-border:before {
    border-color: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--bg {
    background: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--bg-contrast {
    background: ${getContrast(uiHighlight)};
  }

  .ui--MenuItem.isActive .ui--Badge {
    background: ${getHighlight(uiHighlight)};
    color: ${getContrast(uiHighlight)} !important;
  }

  .ui.dropdown .menu>.header {
    color: var(--color-text) !important;
    margin: 0.75rem !important;
  }
  
  .ui.selection.active.dropdown:hover .menu {
    border-color: var(--bg-page);
  }

  .ui.selection.active.dropdown .menu {
    border-color: var(--bg-page);
    border-radius: 0.7rem;
    padding-left: 0.7rem;
    padding-right: 0.7rem;
  }
  
  .ui.active.selection.dropdown {
    border-bottom-left-radius: 0.7rem !important;
    border-bottom-right-radius: 0.7rem !important;
  }

  .ui.selection.active.dropdown {
    border-color: var(--border-input-hover);
  }

  .ui.selection.dropdown>.dropdown.icon {
    top: 1.3em;
  }
  .ui.selection.dropdown .menu>.item {
    height: 48px;
    padding: 1rem 1rem 0 1rem !important;
    border-radius: 0.7rem;
  }

  .ui.dropdown .menu >.item  {
    border-color: var(--border-input);
    padding: 1.2rem 1rem 0 1rem !important;
  }

  .ui.input.error input {
    background-color: var(--bg-input) !important;
  }
  .error {
    background-color: var(--bg-input) !important;
    border-color: var(--border-input-hover) !important;
    border-radius: 0.7rem;
  }

  .ui.selection.dropdown.ui--output.isDisabled {
    border-style: solid !important;
  }

  .ui--CopyButton {
    top: 1rem !important;
    right: 1.3rem !important;
    .ui--Button {
      padding: 0 !important;
    }
  }
  
  .ui.dropdown .menu>.message {
    color: var(--color-text) !important;
  }
  .ui--MenuItem {
    & .ui--Badge {
      color: ${countBrightness(uiHighlight) < BRIGHTNESS ? '#fff' : '#424242'};
    }

    &:hover:not(.isActive) .ui--Badge {
      background: ${countBrightness(uiHighlight) < BRIGHTNESS ? 'rgba(255, 255, 255, 0.8)' : '#4D4D4D'};
      color: ${countBrightness(uiHighlight) > BRIGHTNESS ? '#fff' : '#424242'};
    }
  }

  .ui--Tab .ui--Badge {
    background: ${getHighlight(uiHighlight)};
    color: ${countBrightness(uiHighlight) < BRIGHTNESS ? '#fff' : '#424242'};
  }

  .highlight--bg-faint,
  .highlight--bg-light {
    background: var(--bg-table);
    position: relative;

    &:before {
      background: ${getHighlight(uiHighlight)};
      bottom: 0;
      content: ' ';
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      z-index: -1;
    }
  }

  .highlight--bg-faint:before {
    opacity: 0.025;
  }

  .highlight--bg-light:before {
    opacity: 0.2;
  }

  .highlight--border {
    border-color: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--color {
    color: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--color-contrast {
    color: ${getContrast(uiHighlight)};
  }

  .highlight--fill {
    fill: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--gradient {
    background: ${`linear-gradient(90deg, ${uiHighlight || defaultHighlight}, transparent)`};
  }

  .ui--MenuItem.topLevel:hover,
  .ui--MenuItem.isActive.topLevel:hover {
    color: ${getContrast(uiHighlight)};

    a {
      background-color: ${getMenuHoverContrast(uiHighlight)};
    }
  }

  .menuItems li:hover .groupHdr {
    background: ${getMenuHoverContrast(uiHighlight)};
    color: ${getContrast(uiHighlight)};
  }

  .groupMenu {
    background: ${getHighlight(uiHighlight)} !important;

    &::before {
      background: ${getMenuHoverContrast(uiHighlight)};
      color:  ${getContrast(uiHighlight)};
    }
    li {
      color:  ${getContrast(uiHighlight)};
    }
  }

  .highlight--hover-bg:hover {
    background: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--hover-color:hover {
    color: ${getHighlight(uiHighlight)} !important;
  }

  .highlight--icon {
    .ui--Icon {
      color: ${getHighlight(uiHighlight)} !important;
    }
  }

  .highlight--shadow {
    box-shadow: 0 0 1px ${getHighlight(uiHighlight)} !important;
  }

  .highlight--stroke {
    stroke: ${getHighlight(uiHighlight)} !important;
  }

  .ui--Button {
    background: var(--bg-button);
    color: var(--color-text);
    border: 1px solid var(--border-button);
    border-radius: 0.5rem !important;
    white-space: nowrap;

    &:hover {
      background: var(--bg-button-hover) !important;
      color: var(--button-color) !important;
      .ui--Icon {
        background: var(--bg-button-hover) !important;
        color: var(--button-color) !important;
      }
    }
    
    &:not(.isDisabled):not(.isIcon):not(.isBasic),
    &.withoutLink:not(.isDisabled) {
      .ui--Icon {
        background: var(--bg-button);
        color: var(--color-text);
      }
    }

    &.isBasic:not(.isDisabled):not(.isIcon):not(.isSelected) {
      &:not(.isReadOnly) {
        
      }

      .ui--Icon {
        color: var(--color-text);
      }
    }

    &.isSelected {
      box-shadow: 0 0 1px var(--bg-page);
    }

    &:hover:not(.isDisabled):not(.isReadOnly),
    &.isSelected {
      background: var(--bg-page);
      color: var(--color-text-hover);
      text-shadow: none;

      &:not(.isIcon),
      &.withoutLink {
        .ui--Icon {
          color: inherit;
        }
      }
    }
  }

  .ui--Table td .ui--Button {
    &:not(.isDisabled):not(.isIcon):not(.isToplevel),
    &.withoutLink:not(.isDisabled) {
      &:hover {
        .ui--Icon {
          color: var(--color-text-hover);
        }
      }

      .ui--Icon {
        background: transparent;
        color: inherit;
        // color: ${getHighlight(uiHighlight)};
      }
    }
  }

  .ui--Popup .ui--Button.isOpen:not(.isDisabled):not(.isReadOnly) {
    background: ${getHighlight(uiHighlight)} !important;
    color: ${getContrast(uiHighlight)} !important;

    .ui--Icon {
      background: transparent !important;
      color: ${getContrast(uiHighlight)} !important;
    }
  }


  .ui--Menu {
    .ui--Menu__Item:hover {
       background: ${hexToRGB(getHighlight(uiHighlight), '.1')};
    }

    .ui--Toggle.isChecked .ui--Toggle-Slider {
      background: var(--bg-toggle);

      &::before {
        border-color: var(--border-table);
      }
    }
  }

  .ui--Sort {
    .ui--Labelled.ui--Dropdown:hover {
     .ui.selection.dropdown {
        border-color: ${getHighlight(uiHighlight)};

       .visible.menu {
         border: 1px solid ${getHighlight(uiHighlight)};
        }
      }
    }

    button:hover {
      border-color: ${getHighlight(uiHighlight)};
    }

    button:hover,
    .ui--Labelled.ui--Dropdown:hover {
      &::after {
        background-color:  ${getHighlight(uiHighlight)};
      }
    }

    .arrow.isActive {
      color:  ${getHighlight(uiHighlight)};
      opacity: 1;
    }
  }

  .theme--dark,
  .theme--light {
    .ui--Tabs .active .tabLinkText::after {
      background: ${getHighlight(uiHighlight)};
    }

    .ui.primary.button,
    .ui.buttons .primary.button {
      background: ${getHighlight(uiHighlight)};

      &.active,
      &:active,
      &:focus,
      &:hover {
        background-color: ${getHighlight(uiHighlight)};
      }
    }

    .ui--Toggle.isChecked {
      &:not(.isRadio) {
        .ui--Toggle-Slider {
          background: var(--bg-toggle);

          &:before {
            border-color: var(--border-table);
          }
        }
      }
    }
  }

  .ui--ExpandButton:hover {
    border-color: ${getHighlight(uiHighlight)} !important;

    .ui--Icon {
      color: ${getHighlight(uiHighlight)} !important;
    }
  }

  .ui--Tag.themeColor.lightTheme,
  .ui--InputTags.lightTheme .ui.label {
    background: ${hexToRGB(getHighlight(uiHighlight), '0.08')};
    color: ${countBrightness(uiHighlight) > BRIGHTNESS ? '#424242' : getHighlight(uiHighlight)};
  }

  .ui--Tag.themeColor.darkTheme,
  .ui--InputTags.darkTheme .ui.label {
    color: ${countBrightness(uiHighlight) > BRIGHTNESS ? getHighlight(uiHighlight) : '#fff'};
  }

  #root {
    background: var(--bg-page);
    color: var(--color-text);
    // font: var(--font-sans);
    font-family: "Nunito" !important; 
    font-weight: var(--font-weight-normal);
    height: 100%;
  }

  a {
    cursor: pointer;
  }

  article {
    background: var(--bg-table);
    border: 1px solid #f2f2f2;
    border-radius: 0.25rem;
    box-sizing: border-box;
    margin: 0.25rem;
    padding: 1.25rem;
    position: relative;
    text-align: left;

    > ul {
      margin: 0;
      padding: 0;
    }

    &.error,
    &.warning {
      border-left-width: 0.25rem;
      font-size: var(--font-size-small);
      line-height: 1.5;
      margin-left: 2.25rem;
      padding: 0.75rem 1rem;
      position: relative;
      z-index: 5;

      &:before {
        border-radius: 0.25rem;
        bottom: 0;
        content: ' ';
        left: 0;
        position: absolute;
        right: 0;
        top: 0;
        z-index: -1;
      }
    }

    &.mark {
      margin: 0.5rem 0 0.5rem 2.25rem;
      padding: 0.5rem 1rem !important;
    }

    &.nomargin {
      margin-left: 0;
    }

    &.extraMargin {
      margin: 2rem auto;
    }

    &.centered {
      margin: 1.5rem auto;
      max-width: 75rem;

      &+.ui--Button-Group {
        margin-top: 2rem;
      }
    }

    &.error {
      &:before {
        background: rgba(255, 12, 12, 0.05);
      }

      border-color: rgba(255, 12, 12, 1);
    }

    &.padded {
      padding: 0.75rem 1rem;

      > div {
        margin: 0.25rem;
      }
    }

    &.warning {
      &:before {
        background: rgba(255, 196, 12, 0.05);
      }

      border-color: rgba(255, 196, 12, 1);
    }
  }

  body {
    height: 100%;
    margin: 0;
    // font: var(--font-sans);
  }

  br {
    line-height: 1.5rem;
  }

  details {
    cursor: pointer;

    &[open] > summary {
      white-space: normal;

      br, br + * {
        display: block;
      }
    }

    > summary {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      outline: none;

      br, br + * {
        display: none;
      }
    }
  }

  h1, h2, h3, h4, h5 {
    color: var(--color-header);
    // font: var(--font-sans);
    font-weight: var(--font-weight-header);
    margin-bottom: 0.25rem;
  }


  h1 {
    font-size: var(--font-size-h1);
    em {
      font-style: normal;
      text-transform: none;
    }
  }

  h2 {
    font-size: var(--font-size-h2);
  }

  h3 {
    font-size: var(--font-size-h3);
  }

  h4 {
    font-size: var(--font-size-h4);
  }

  header {
    margin-bottom: 1.5rem;
    text-align: center;

    > article {
      background: transparent;
    }
  }

  html {
    height: 100%;
  }

  label {
    box-sizing: border-box;
    display: block;
    // font: var(--font-sans);
  }

  // we treat h5 and label as equivalents
  label, h5 {
    color: var(--color-label);
    font-style: normal;
    font-weight: var(--font-weight-label);
    // line-height: 1rem;
    vertical-align: middle;
    font-size: var(--font-size-h2);
  }

  button {
    font-size: var(--font-size-small);
    font-family: "Open Sans";
    font-weight: var(--font-weight-normal);
  }

  main {
    > section {
      margin-bottom: 2em;
    }
  }

  /* Add our overrides */
  ${cssSemantic}
  ${cssTheme}
  ${cssForm}
  ${cssMedia}
  ${cssComponents}
`);
