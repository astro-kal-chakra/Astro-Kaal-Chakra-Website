import { Bell, FileText, Gift, HandHeart, Heart, History, LayoutDashboard, LifeBuoy, ScrollText, Settings, UserRound, Users, Wallet } from "lucide-react";
import { routes } from "@/config/routes";

/**
 * Account sections — labels live in account.nav.<key>, descriptions in account.navDesc.<key>.
 * `feature` entries show only while that feature is switched on (see accountNavFor).
 */
export const ACCOUNT_NAV = [
  { key: "dashboard", href: routes.account, icon: LayoutDashboard },
  { key: "profile", href: routes.profile, icon: UserRound },
  { key: "wallet", href: routes.wallet, icon: Wallet },
  { key: "sessions", href: routes.sessions, icon: History },
  { key: "following", href: routes.following, icon: Heart },
  { key: "birthProfiles", href: routes.birthProfiles, icon: Users },
  { key: "savedKundlis", href: routes.savedKundlis, icon: ScrollText },
  { key: "reports", href: routes.myReports, icon: FileText },
  { key: "remedies", href: routes.myRemedies, icon: HandHeart, feature: "remedies" },
  { key: "referral", href: routes.referral, icon: Gift },
  { key: "notifications", href: routes.notifications, icon: Bell },
  { key: "support", href: routes.support, icon: LifeBuoy },
  { key: "settings", href: routes.settings, icon: Settings },
];

/** The menu without switched-off features: accountNavFor({ remedies: true }). */
export const accountNavFor = (features = {}) => ACCOUNT_NAV.filter((item) => !item.feature || features[item.feature]);
