// Copyright 2017-2024 @polkadot/app-settings authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { SettingsStruct } from '@polkadot/ui-settings/types';

import React, { useEffect, useState } from 'react';

import { settings } from '@polkadot/ui-settings';
import { save } from '@polkadot/app-settings/util';


interface Props {
    className?: string;
    logo: boolean;
    setLogo: (logo: boolean) => void;
}

function themeToggle({ className = '', setLogo }: Props): React.ReactElement<Props> {
    const [isDark, setIsDark] = useState(false);

    const [state, setSettings] = useState((): SettingsStruct => {
        const values = settings.get();

        return { ...values, uiTheme: values.uiTheme === 'dark' ? 'dark' : 'light' };
    });

    useEffect(() => {
        setIsDark(state?.uiTheme === 'dark' ? true : false)
        setLogo(state?.uiTheme === 'dark' ? true : false)
    }, [])

    useEffect((): void => {
        save(state);
    }, [state]);

    const toggleTheme = () => {
        setIsDark(!isDark);
        setSettings((state) => ({ ...state, [`uiTheme`]: isDark ? 'light' : 'dark' }))
        save(state);
        setLogo(!isDark)
    };

    const styles = {
        icon: {
            width: '16px',
            height: '16px'
        }
    };

    return (
        <div
            onClick={toggleTheme}
            style={{
                display: 'inline-block',
                border: '1px solid var(--bg-menubar)',
                borderRadius: '50px',
                padding: '2px',
                backgroundColor: isDark ? '#424952' : '#dadada',
                width: '64px',
                height: '32px',
                position: 'relative',
                cursor: 'pointer'
            }}
            className={className}
        >
            <div style={{
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '25px',
                height: '25px',
                backgroundColor: isDark ? '#686868' : '#1c1e21',
                borderRadius: '50%',
                transition: 'transform 0.2s ease',
                transform: isDark ? 'translateX(32px)' : 'translateX(0)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
            }}>
                {isDark ? (
                    <svg
                        viewBox="0 0 24 24"
                        style={styles.icon}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                ) : (
                    <svg
                        viewBox="0 0 24 24"
                        style={styles.icon}
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                )}
            </div>
        </div>
    );
};

export default React.memo(themeToggle);
