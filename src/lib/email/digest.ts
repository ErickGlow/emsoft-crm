import nodemailer from "nodemailer";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Post, AttentionMessage } from "@/lib/database.types";
import { fmtDateTime } from "@/lib/dates";

export interface DigestResult {
  sent: boolean;
  reason?: string;
  pendingCount: number;
  pendingPosts: number;
  pendingMessages: number;
}

// Everything that currently "requires a response" from the recipient —
// pending posts awaiting approval, and important messages awaiting a
// reply/decision. Built as its own function so more categories can be
// added here later without touching the send/cron plumbing below.
async function getPendingItems(supabase: SupabaseClient<Database>) {
  const [{ data: posts }, { data: messages }] = await Promise.all([
    supabase.from("posts").select("*").eq("status", "pending").order("created_at", { ascending: true }),
    supabase.from("attention_messages").select("*").eq("status", "waiting").order("created_at", { ascending: true }),
  ]);
  return { posts: (posts ?? []) as Post[], messages: (messages ?? []) as AttentionMessage[] };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function itemCard(label: string, date: string, body: string, extra = ""): string {
  return `
    <div style="margin-bottom:14px;padding:14px 16px;border:1px solid #E4E4E7;border-radius:10px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#C9962C;text-transform:uppercase;letter-spacing:0.05em;">
        ${label}
      </p>
      <p style="margin:0 0 6px;font-size:11px;color:#A1A1AA;">${date}</p>
      <div style="font-size:14px;color:#18181B;white-space:pre-wrap;">${body}</div>
      ${extra}
    </div>`;
}

function buildDigestHtml(posts: Post[], messages: AttentionMessage[]): string {
  const total = posts.length + messages.length;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  if (total === 0) {
    return `<p style="font-family:sans-serif;color:#5A6472;">Nothing needs your attention today.</p>`;
  }

  const postCards = posts
    .map((p) => itemCard("Post — approval needed", fmtDateTime(p.created_at), escapeHtml(p.content)))
    .join("");

  const messageCards = messages
    .map((m) => {
      const header = `<strong>${escapeHtml(m.person_name)}${m.company ? ` · ${escapeHtml(m.company)}` : ""}</strong><br>${escapeHtml(m.message_text)}`;
      const decision = m.notes ? `<p style="font-size:12px;color:#5A6472;margin:8px 0 0;"><strong>Decision:</strong> ${escapeHtml(m.notes)}</p>` : "";
      const link = m.conversation_url ? `<p style="margin:8px 0 0;"><a href="${escapeHtml(m.conversation_url)}" style="color:#4F46E5;font-size:12.5px;">Open conversation →</a></p>` : "";
      return itemCard("Message — reply needed", fmtDateTime(m.created_at), header, decision + link);
    })
    .join("");

  const links = appUrl
    ? `<p style="margin-top:12px;font-size:13px;">
        <a href="${appUrl}/posts" style="color:#4F46E5;">Posts for Approval</a>
        &nbsp;·&nbsp;
        <a href="${appUrl}/messages" style="color:#4F46E5;">Messages Awaiting Reply</a>
      </p>`
    : "";

  return `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="font-size:18px;color:#18181B;margin:0 0 8px;">EMSOFT CRM — Daily attention digest</h2>
      <p style="font-size:14px;color:#5A6472;margin:0 0 16px;">
        ${posts.length} post(s) awaiting approval · ${messages.length} important message(s) awaiting reply
      </p>
      ${postCards}
      ${messageCards}
      ${links}
    </div>`;
}

export async function sendDailyDigest(
  supabase: SupabaseClient<Database>,
  recipientOverride?: string
): Promise<DigestResult> {
  const recipient = recipientOverride || process.env.DIGEST_RECIPIENT_EMAIL;
  const gmailUser = process.env.GMAIL_SMTP_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const { posts, messages } = await getPendingItems(supabase);
  const base = { pendingCount: posts.length + messages.length, pendingPosts: posts.length, pendingMessages: messages.length };

  if (!recipient || !gmailUser || !gmailPass) {
    return { sent: false, reason: "Email not configured (GMAIL_SMTP_USER / GMAIL_APP_PASSWORD / DIGEST_RECIPIENT_EMAIL)", ...base };
  }

  try {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPass },
    });

    const total = base.pendingCount;
    await transport.sendMail({
      from: `EMSOFT CRM <${gmailUser}>`,
      to: recipient,
      subject: total > 0 ? `EMSOFT CRM — ${total} item(s) need your attention` : `EMSOFT CRM — nothing needs your attention today`,
      html: buildDigestHtml(posts, messages),
    });

    return { sent: true, ...base };
  } catch (e) {
    return { sent: false, reason: e instanceof Error ? e.message : "Gmail SMTP error", ...base };
  }
}
