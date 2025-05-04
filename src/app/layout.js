import { AuthProvider } from '@/context/AuthContext';
import CookiesWrapper from '@/components/CookiesWrapper';
import CustomAppBar from '@/components/AppBar/AppBar';
import ThemeWrapper from '@/components/ThemeWrapper';

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
              {/* App Bar */}
              <CustomAppBar />
              {/* Page Content */}
              {children}
            </ThemeWrapper>
          </AuthProvider>
        </CookiesWrapper>
      </body>
    </html>
  );
}
