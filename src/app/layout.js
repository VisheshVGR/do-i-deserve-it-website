import { AuthProvider } from '@/context/AuthContext';
import CookiesWrapper from '@/components/CookiesWrapper';
import CustomAppBar from '@/components/AppBar/AppBar';
import ThemeWrapper from '@/components/ThemeWrapper';
import { LoaderProvider } from '@/context/LoaderContext';
import UniversalLoader from '@/components/UniversalLoader';
import { SnackbarProviderWithUtils } from '@/context/SnackbarContext';
import AxiosInjector from '@/components/AxiosInjector';

export const metadata = {
  title: 'Do I Deserve It',
  description: 'A modular app with dark and light mode',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CookiesWrapper>
          <AuthProvider>
            <ThemeWrapper>
              <LoaderProvider>
                <SnackbarProviderWithUtils>
                  <AxiosInjector />
                  <UniversalLoader />
                  <CustomAppBar />
                  {/* Page Content */}
                  {children}
                </SnackbarProviderWithUtils>
              </LoaderProvider>
            </ThemeWrapper>
          </AuthProvider>
        </CookiesWrapper>
      </body>
    </html>
  );
}
