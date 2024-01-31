import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { Post, PostPlain } from "./Post";
export const UserPlain = Type.Object(
  { id: Type.Integer(), name: Type.Optional(Type.String()) },
  { description: "The user model" },
);
export type UserPlainType = Static<typeof UserPlain>;
export const UserReferences = Type.Object(
  { posts: Type.Array(PostPlain) },
  { description: "The user model" },
);
export type UserReferencesType = Static<typeof UserReferences>;
export const UserReferencesDeep = Type.Object(
  { posts: Type.Array(Post) },
  { description: "The user model" },
);
export type UserReferencesDeepType = Static<typeof UserReferencesDeep>;
export const User = Type.Composite([UserPlain, UserReferences]);
export type UserType = Static<typeof UserReferences>;
export const UserDeep = Type.Composite([UserPlain, UserReferencesDeep]);
export type UserDeepType = Static<typeof UserDeep>;
