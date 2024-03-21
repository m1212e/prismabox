# prismabox
Generate versatile typebox schemes from your prisma schema.

> This is still under development, expect bugs and breaks!

> Currently does not support mongoDB composite types (https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-composite-types)

Install it in your project,
```bash
npm i -D prismabox
pnpm i -D prismabox
bun i -D prismabox
```

 then add
```prisma
generator prismabox {
  provider = "prismabox"
  // you can optionally specify the output location. Defaults to ./prismabox
  output = "./myCoolPrismaboxDirectory"
  // if you want, you can customize the imported variable name that is used for the schemes. Defaults to "Type" which is what the standard typebox package offers
  typeboxImportVariableName = "t"
  // you also can specify the dependency from which the above import should happen. This is useful if a package re-exports the typebox package and you would like to use that
  typeboxImportDependencyName = "elysia"
  // by default the generated schemes do not allow additional properties. You can allow them by setting this to true
  additionalProperties = true
}
```
to your `prisma.schema`. You can modify the settings to your liking, please see the respective comments for info on what the option does.

## Annotations
Prismabox offers annotations to adjust the output of models and fields.

| Annotation | Example | Description |
---|---|---
| @prismabox.hide | - | Hides the field or model from the output |
| @prismabox.hidden | - | Alias for @prismabox.hide |
| @prismabox.options | @prismabox.options{ min: 10, max: 20 } | Uses the provided options for the field or model in the generated schema. Be careful to use valid JS/TS syntax! |

A schema using annotations could look like this:
```prisma
/// The post model
model Post {
  id        Int      @id @default(autoincrement())
  /// @prismabox.hidden
  createdAt DateTime @default(now())
  title     String   @unique

  User   User? @relation(fields: [userId], references: [id])
  /// @prismabox.options{max: 10}
  /// this is the user id
  userId Int?
}

/// @prismabox.hidden
enum Account {
  PASSKEY
  PASSWORD
}

```
## Generated Schemas
The generator will output schema objects based on the models. It will output three variables for each model:
```ts
// the plain object without any relations
export const PostPlain = Type.Object(
  {
    id: Type.Integer(),
    title: Type.String(),
    userId: Type.Optional(
      Type.Integer({
        max: 10,
        description: `this is the user id`,
        additionalProperties: false,
      }),
    ),
  },
  { description: `The post model`, additionalProperties: false },
);
```
```ts
// only the relations of a model
export const PostRelations = Type.Object(
  {
    User: Type.Optional(
      Type.Object(
        {
          name: Type.Optional(Type.String()),
          title: Type.String(),
          subtitle: Type.String(),
          misc: Type.String(),
          age: Type.Integer(),
        },
        { description: `The user model`, additionalProperties: false },
      ),
    ),
  },
  { description: `The post model`, additionalProperties: false },
);
```
```ts
// a composite model of the two, providing the full type
export const Post = Type.Composite([PostPlain, PostRelations], {
  description: `Composition of PostPlain, PostRelations`,
  additionalProperties: false,
});
```
```ts
// a model enforcing a unique selector for a query to an entity
// this can be passed to e.g. a `findUnique()` query in prisma
export const PostWhere = Type.Union([
  Type.Composite([
    Type.Pick(
      Type.Required(
        Type.Composite([
          Type.Object({}),
          Type.Pick(PostPlain, ["id", "title"]),
        ]),
      ),
      ["id"],
    ),
    Type.Omit(
      Type.Partial(
        Type.Composite([
          Type.Object({}),
          Type.Pick(PostPlain, ["id", "title"]),
        ]),
      ),
      ["id"],
    ),
  ]),
  Type.Composite([
    Type.Pick(
      Type.Required(
        Type.Composite([
          Type.Object({}),
          Type.Pick(PostPlain, ["id", "title"]),
        ]),
      ),
      ["title"],
    ),
    Type.Omit(
      Type.Partial(
        Type.Composite([
          Type.Object({}),
          Type.Pick(PostPlain, ["id", "title"]),
        ]),
      ),
      ["title"],
    ),
  ]),
]);

```
