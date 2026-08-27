import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { IconExternal } from "@/components/icons";
import { fmtDateTime } from "@/lib/dates";
import type { LinkedinActivity } from "@/lib/database.types";

const TYPE_LABELS: Record<string, string> = { post: "Post", comment: "Comment", message: "Message", followup: "Follow-up" };
const TYPE_COLORS: Record<string, string> = {
  post: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  comment: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  message: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  followup: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export function LinkedInList({ items }: { items: LinkedinActivity[] }) {
  if (items.length === 0) {
    return <Card className="p-10 text-center"><p className="text-sm text-[var(--text-muted)]">No LinkedIn activity logged yet.</p></Card>;
  }

  return (
    <Card className="divide-y divide-[var(--border-subtle)]">
      {items.map((item) => {
        const link = item.comment_url || item.conversation_url || item.post_url || item.profile_url;
        return (
          <div key={item.id} className="flex items-start gap-3 px-5 py-3.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <Badge className={TYPE_COLORS[item.activity_type]}>{TYPE_LABELS[item.activity_type]}</Badge>
                {item.person_name && <span className="text-[13.5px] font-medium">{item.person_name}</span>}
                {item.reply_status === "replied" && (
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Replied</Badge>
                )}
              </div>
              {item.company && <p className="text-[12px] text-[var(--text-muted)]">{item.company}</p>}
              {item.content && <p className="text-[12.5px] text-[var(--text-muted)] mt-1 line-clamp-2">{item.content}</p>}
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              <span className="text-[11.5px] text-[var(--text-faint)] whitespace-nowrap">{fmtDateTime(item.occurred_at)}</span>
              {link && (
                <div className="flex gap-2">
                  {item.profile_url && (
                    <a href={item.profile_url} target="_blank" rel="noopener noreferrer" className="text-[11.5px] font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5">
                      Profile <IconExternal className="h-3 w-3" />
                    </a>
                  )}
                  {(item.conversation_url) && (
                    <a href={item.conversation_url} target="_blank" rel="noopener noreferrer" className="text-[11.5px] font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5">
                      Conversation <IconExternal className="h-3 w-3" />
                    </a>
                  )}
                  {(item.post_url) && (
                    <a href={item.post_url} target="_blank" rel="noopener noreferrer" className="text-[11.5px] font-medium text-[var(--accent)] hover:underline flex items-center gap-0.5">
                      Post <IconExternal className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
