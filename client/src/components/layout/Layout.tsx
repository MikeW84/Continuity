import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
//import FloatingActionButton from '../FloatingActionButton';
import { useLocation } from 'wouter';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [location] = useLocation();
  
  // Extract page name from location path
  const pageName = location === '/' ? 'dashboard' : location.slice(1);

  return (
    <div className="min-h-screen flex flex-col">
      <Sidebar />
      
      <main className="ml-16 md:ml-64 flex-1">
        <Header title={pageName} />
        
        {children}
      </main>
      
      {/*<FloatingActionButton />*/}
    </div>
  );
};

export default Layout;
