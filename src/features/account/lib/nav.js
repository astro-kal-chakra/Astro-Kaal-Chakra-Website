import { Bell, FileText, Gift, Heart, History, LayoutDashboard, LifeBuoy, ScrollText, Settings, UserRound, Users, Wallet } from "lucide-react";
import { routes } from "@/config/routes";

/** Account sections — labels live in account.nav.<key>, descriptions in account.navDesc.<key>. */
export const ACCOUNT_NAV = [
  { key: "dashboard", href: routes.account, icon: LayoutDashboard },
  { key: "profile", href: routes.profile, icon: UserRound },
  { key: "wallet", href: routes.wallet, icon: Wallet },
  { key: "sessions", href: routes.sessions, icon: History },
  { key: "following", href: routes.following, icon: Heart },
  { key: "birthProfiles", href: routes.birthProfiles, icon: Users },
  { key: "savedKundlis", href: routes.savedKundlis, icon: ScrollText },
  { key: "reports", href: routes.myReports, icon: FileText },
  { key: "referral", href: routes.referral, icon: Gift },
  { key: "notifications", href: routes.notifications, icon: Bell },
  { key: "support", href: routes.support, icon: LifeBuoy },
  { key: "settings", href: routes.settings, icon: Settings },
];
