import { AuthProvider } from '@/context/AuthContext';
import CookiesWrapper from '@/components/CookiesWrapper';
import CustomAppBar from '@/components/AppBar/AppBar';
import ThemeWrapper from '@/components/ThemeWrapper';
import { LoaderProvider } from '@/context/LoaderContext';
import UniversalLoader from '@/components/UniversalLoader';
import { SnackbarProviderWithUtils } from '@/context/SnackbarContext';
import AxiosInjector from '@/components/AxiosInjector';
import { Container } from '@mui/material'; // Import Container

export const metadata = {
  title: 'Do I Deserve It',
  description: 'Do I Deserve It App',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1976d2" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <CookiesWrapper>
          <LoaderProvider>
            <AuthProvider>
              <ThemeWrapper>
                <SnackbarProviderWithUtils>
                  <AxiosInjector />
                  <UniversalLoader />
                  <CustomAppBar />
                  {/* Page Content */}
                  <Container maxWidth="lg" sx={{ py: 1 }}>
                    {' '}
                    {/* Wrap children with Container */}
                    {children}
                  </Container>
                </SnackbarProviderWithUtils>
              </ThemeWrapper>
            </AuthProvider>
          </LoaderProvider>
        </CookiesWrapper>
      </body>
    </html>
  );
}
