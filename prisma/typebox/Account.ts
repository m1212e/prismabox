import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
export const Account = Type.Union([
  Type.Literal("PASSKEY"),
  Type.Literal("PASSWORD"),
]);
export const AccountPlain = Account;
export type AccountType = Static<typeof Account>;
