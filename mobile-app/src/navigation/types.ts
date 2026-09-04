export type RootStackParamList = {
  Tabs: undefined;
  // Kept registered (not deleted) even though nothing in the nav UI links
  // to it anymore — see MoreScreen.tsx / DashboardScreen.tsx / AlertsScreen.tsx.
  Batches: undefined;
  Farms: undefined;
  Growth: undefined;
  Sales: undefined;
  Health: undefined;
  Feed: undefined;
  Proposal: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Herd: undefined;
  Finance: undefined;
  Alerts: undefined;
  More: undefined;
};
