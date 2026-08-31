import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  resolveSessionToken,
  verifyAdminSessionToken,
} from "@/lib/admin/session";

export async function requireAdminSession(request: Request): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const token = resolveSessionToken(request, cookieToken);
  return verifyAdminSessionToken(token);
}
