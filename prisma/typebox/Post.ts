import { Type } from "@sinclair/typebox";
import type { Static } from "@sinclair/typebox";
import { User, UserPlain } from "./User";
export const PostPlain = Type.Object(
  {
    id: Type.Integer(),
    createdAt: Type.Date(),
    userId: Type.Optional(Type.Integer()),
  },
  { description: "The post model" },
);
export type PostPlainType = Static<typeof PostPlain>;
export const PostReferences = Type.Object(
  { User: Type.Optional(UserPlain) },
  { description: "The post model" },
);
export type PostReferencesType = Static<typeof PostReferences>;
export const PostReferencesDeep = Type.Object(
  { User: Type.Optional(User) },
  { description: "The post model" },
);
export type PostReferencesDeepType = Static<typeof PostReferencesDeep>;
export const Post = Type.Composite([PostPlain, PostReferences]);
export type PostType = Static<typeof PostReferences>;
export const PostDeep = Type.Composite([PostPlain, PostReferencesDeep]);
export type PostDeepType = Static<typeof PostDeep>;
