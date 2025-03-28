import { Link as RouterLink } from 'wouter';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export function Footer() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <footer className={`py-16 ${isDarkMode ? 'bg-[#121212] text-white' : 'bg-gray-50 text-gray-800'}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
              Krivo
            </h3>
            <p className={`${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-600'} max-w-xs`}>
              Vår innovative kredittvurdering gir alle bedre muligheter og rettferdige finansieringsalternativer.
            </p>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
              Kontakt
            </h3>
            <p className={`${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-600'}`}>
              Storgata 1
            </p>
            <p className={`${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-600'}`}>
              0151 Oslo
            </p>
            <p className={`${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-600'}`}>
              kontakt@krivo.no
            </p>
            <p className={`${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-600'}`}>
              +47 22 12 34 56
            </p>
          </div>
          
          <div>
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
              Lenker
            </h3>
            <ul className="space-y-2">
              <li>
                <RouterLink to="/">
                  <a className={`${isDarkMode ? 'text-[#B0B0B0] hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                    Hjem
                  </a>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/tjenester">
                  <a className={`${isDarkMode ? 'text-[#B0B0B0] hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                    Hvordan det fungerer
                  </a>
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/kontakt">
                  <a className={`${isDarkMode ? 'text-[#B0B0B0] hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                    Kontakt oss
                  </a>
                </RouterLink>
              </li>
            </ul>
          </div>
        </div>
        
        <div className={`border-t ${isDarkMode ? 'border-[#2A2A2A]' : 'border-gray-200'} mt-12 pt-8 text-center`}>
          <p className={`${isDarkMode ? 'text-[#B0B0B0]' : 'text-gray-600'}`}>
            © {new Date().getFullYear()} Krivo | 
            <RouterLink to="/brukervilkar">
              <a className={`mx-2 ${isDarkMode ? 'text-[#B0B0B0] hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Brukervilkår
              </a>
            </RouterLink> | 
            <RouterLink to="/personvern">
              <a className={`mx-2 ${isDarkMode ? 'text-[#B0B0B0] hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>
                Personvernerklæring
              </a>
            </RouterLink>
          </p>
        </div>
      </div>
    </footer>
  );
}