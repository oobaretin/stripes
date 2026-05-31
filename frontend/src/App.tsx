import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import SellerLanding from './pages/SellerLanding';
import { APP_SHELL_DEFAULT_HREF, APP_SHELL_ROUTES } from './config/appShellRoutes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sell" element={<SellerLanding />} />
        <Route path="/login" element={<Navigate to={APP_SHELL_DEFAULT_HREF} replace />} />
        <Route path="/register" element={<Navigate to={APP_SHELL_DEFAULT_HREF} replace />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to={APP_SHELL_DEFAULT_HREF} replace />} />
          {APP_SHELL_ROUTES.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
        </Route>
        <Route path="*" element={<Navigate to={APP_SHELL_DEFAULT_HREF} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
