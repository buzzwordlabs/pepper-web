import {
  Login,
  Home,
  Error404,
  PrivacyPolicy,
  FAQ,
  About,
  Contact,
  TOS
} from '../views/Public/export';

const staticRoutes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: FAQ
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/privacy-policy',
    name: 'Privacy Policy',
    component: PrivacyPolicy
  },
  {
    path: '/terms-of-service',
    name: 'Terms of Service',
    component: TOS
  },
  // Make website static while working on mobile app
  // {
  //   path: '/login',
  //   name: 'Login',
  //   component: Login
  // },
  {
    path: '/404',
    name: '404',
    component: Error404
  }
];

export default staticRoutes;
