import { createBrowserRouter } from 'react-router-dom'
import Layout from '../page/Layout';
import CurrentChat from '../page/CurrentChat';
import RecentChat from '../page/RecentChat';
import NotFound from '../page/Notfound';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        index: true,
        element: <CurrentChat/>,
      },
      {
        path: "recent",
        element: <RecentChat/>,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound/>,
  }
]);

export default router;