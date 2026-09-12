import { resolve } from "node:path";
import { createFollowupHandler } from "@/lib/server/followup-http";
import { configuredWorkplace, localWorkplace } from "@/lib/server/workplace";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handler = createFollowupHandler({
  connect: () =>
    process.env.AMBIGUOUS_API_KEY?.trim()
      ? configuredWorkplace()
      : localWorkplace(),
  directory: resolve(process.env.WEB_APPROVAL_DIR || ".data/web-approvals"),
});
export const GET = handler;
export const POST = handler;
