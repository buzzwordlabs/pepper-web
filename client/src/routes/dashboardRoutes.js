import {
  Settings,
  Onboarding,
  SetupForwarding,
  DeleteAccount,
  PaymentSettings,
  Unsubscribe,
  UpdateCard
} from '../views/Private/export';

const dashboardRoutes = [
  {
    path: '/user/onboarding',
    name: 'Onboarding',
    component: Onboarding
  },
  {
    path: '/user/settings',
    name: 'Settings',
    component: Settings
  },
  {
    path: '/user/setup-forwarding',
    name: 'Setup Forwarding',
    component: SetupForwarding
  },
  {
    path: '/user/delete-account',
    name: 'Delete Account',
    component: DeleteAccount
  },
  {
    path: '/user/payment/settings',
    name: 'Payment Settings',
    component: PaymentSettings
  },
  {
    path: '/user/payment/update-card',
    name: 'Update Card',
    component: UpdateCard
  },
  {
    path: '/user/payment/unsubscribe',
    name: 'Unsubscribe',
    component: Unsubscribe
  }
];

export default dashboardRoutes;
