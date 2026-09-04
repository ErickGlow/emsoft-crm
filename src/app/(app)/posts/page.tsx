import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ApproveButton } from "@/components/posts/ApproveButton";
import { EditPostButton } from "@/components/posts/EditPostButton";
import { QuickActionBar } from "@/components/quick-actions/QuickActionBar";
import { fmtDateTime } from "@/lib/dates";
import type { Post } from "@/lib/database.types";

export default async function PostsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  const posts = (data ?? []) as Post[];
  const pending = posts.filter((p) => p.status === "pending");
  const approved = posts.filter((p) => p.status === "approved");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Posts for Approval</h1>
          <p className="text-[13px] text-[var(--text-muted)] mt-0.5">
            {pending.length} pending approval · {approved.length} approved
          </p>
        </div>
        <QuickActionBar />
      </div>

      <div>
        <h2 className="text-[13.5px] font-semibold mb-3">Pending approval</h2>
        {pending.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-[var(--text-muted)]">Nothing waiting on approval right now.</p>
          </Card>
        ) : (
          <Card className="divide-y divide-[var(--border-subtle)]">
            {pending.map((post) => (
              <div key={post.id} className="flex items-start justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">Pending</Badge>
                    <span className="text-[11.5px] text-[var(--text-faint)]">{fmtDateTime(post.created_at)}</span>
                  </div>
                  <p className="text-[13.5px] whitespace-pre-wrap">{post.content}</p>
                </div>
                <div className="shrink-0 flex gap-2">
                  <EditPostButton postId={post.id} content={post.content} />
                  <ApproveButton postId={post.id} />
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      {approved.length > 0 && (
        <div>
          <h2 className="text-[13.5px] font-semibold mb-3">Approved</h2>
          <Card className="divide-y divide-[var(--border-subtle)]">
            {approved.map((post) => (
              <div key={post.id} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">Approved</Badge>
                  <span className="text-[11.5px] text-[var(--text-faint)]">
                    {post.approved_at ? fmtDateTime(post.approved_at) : ""}
                  </span>
                </div>
                <p className="text-[13.5px] whitespace-pre-wrap">{post.content}</p>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
