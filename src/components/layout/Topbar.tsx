import { GlobalSearch } from "./GlobalSearch";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";
import { ActiveConversationsButton } from "./ActiveConversationsButton";
import { UserMenu } from "./UserMenu";
import { MobileMenuButton } from "./MobileMenuButton";
import { signOut } from "@/app/(app)/actions";
import type { Profile } from "@/lib/database.types";
import type { ActiveConversation } from "@/lib/data/linkedin-conversations";

export function Topbar({
  profile, overdue, dueToday, conversations,
}: {
  profile: Profile;
  overdue: number;
  dueToday: number;
  conversations: ActiveConversation[];
}) {
  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-3 px-4 md:px-6 border-b border-[var(--border)] bg-[var(--bg-elevated)]/80 backdrop-blur">
      <MobileMenuButton />
      <GlobalSearch />
      <div className="flex-1" />
      <ActiveConversationsButton conversations={conversations} />
      <NotificationBell overdue={overdue} dueToday={dueToday} />
      <ThemeToggle />
      <div className="w-px h-6 bg-[var(--border)] mx-1" />
      <UserMenu profile={profile} onSignOut={signOut} />
    </header>
  );
}
