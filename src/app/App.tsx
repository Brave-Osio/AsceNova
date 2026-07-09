import { useRoutes } from 'react-router-dom';
import { routes } from './routes';
import AppProviders from './providers/AppProviders';

export default function App() {
  const routeElement = useRoutes(routes);
  return <AppProviders>{routeElement}</AppProviders>;
}
