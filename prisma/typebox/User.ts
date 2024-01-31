import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { Account, AccountPlain } from "./Account";
import { Post, PostPlain } from "./Post";
export const UserPlain = Type.Object(
  {
    id: Type.Integer(),
    name: Type.Optional(Type.String()),
    age: Type.Integer(),
  },
  { description: "The user model" },
);
export type UserPlainType = Static<typeof UserPlain>;
export const UserReferences = Type.Object(
  { type: AccountPlain, posts: Type.Array(PostPlain) },
  { description: "The user model" },
);
export type UserReferencesType = Static<typeof UserReferences>;
export const UserReferencesDeep = Type.Object(
  { type: Account, posts: Type.Array(Post) },
  { description: "The user model" },
);
export type UserReferencesDeepType = Static<typeof UserReferencesDeep>;
export const User = Type.Composite([UserPlain, UserReferences]);
export type UserType = Static<typeof UserReferences>;
export const UserDeep = Type.Composite([UserPlain, UserReferencesDeep]);
export type UserDeepType = Static<typeof UserDeep>;
