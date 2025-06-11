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
  description: 'A modular app with dark and light mode',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
                  <Container maxWidth="lg"> {/* Wrap children with Container */}
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
