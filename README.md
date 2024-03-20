# Prismabox
Generate versatile typebox schemas from your prisma schema.

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
  // if you want, you can customize the imported variable name that is used for the schemas. Defaults to "Type" which is what the standard typebox package offers
  typeboxImportVariableName = "t"
  // you also can specify the dependency from which the above import should happen. This is useful if a package re-exports the typebox package and you would like to use that
  typeboxImportDependencyName = "elysia"
}
```
to your `prisma.schema`. The generated schema files will be located at prisma/prismabox.

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
