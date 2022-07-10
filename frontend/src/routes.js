import { useRoutes } from 'react-router-dom';
// layouts
import MainLayout from './layouts/main';
import Index from './pages/Index';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        { path: '', element: <Index /> },
      ],
    },
  ]);
}
