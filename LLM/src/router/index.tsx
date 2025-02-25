import { createBrowserRouter } from 'react-router-dom';
import React from 'react';

// 动态导入组件
const Layout = React.lazy(() => import('@/page/Layout'));
const CurrentChat = React.lazy(() => import('@/page/CurrentChat'));
// const RecentChat = React.lazy(() => import('@/page/RecentChat'));
const NotFound = React.lazy(() => import('@/page/Notfound'));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <CurrentChat />,
      },
      {
        path: "recent/:id",
        element: <CurrentChat />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  }
]);

export default router;