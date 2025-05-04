'use client';

import { CookiesProvider } from 'react-cookie';

export default function CookiesWrapper({ children }) {
  return <CookiesProvider>{children}</CookiesProvider>;
}