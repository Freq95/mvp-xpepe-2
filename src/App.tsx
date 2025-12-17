import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { IS_UNDER_DEVELOPMENT } from 'config';
import { PageNotFound } from 'pages/PageNotFound/PageNotFound';
import { routes } from 'routes';
import { AxiosInterceptors, BatchTransactionsContextProvider } from 'wrappers';

import { Layout, UnderDevelopment } from './components';

export const App = () => {
  if (IS_UNDER_DEVELOPMENT) {
    return <UnderDevelopment />;
  }

  return (
    <Router>
      <AxiosInterceptors>
        <BatchTransactionsContextProvider>
          <Layout>
            <Routes>
              {routes.map((route) => (
                <Route
                  key={`route-key-${route.path}`}
                  path={route.path}
                  element={<route.component />}
                >
                  {route.children?.map((child) => (
                    <Route
                      key={`route-key-${route.path}-${child.path}`}
                      path={child.path}
                      element={<child.component />}
                    />
                  ))}
                </Route>
              ))}
              <Route path='*' element={<PageNotFound />} />
            </Routes>
          </Layout>
        </BatchTransactionsContextProvider>
      </AxiosInterceptors>
    </Router>
  );
};
