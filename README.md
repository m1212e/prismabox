# Prismabox
Generate typebox schemas from your prisma schema.

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
}
```
to your `prisma.schema`. The generated schema files will be located at prisma/prismabox.

## Decorators
Prismabox offers decorators to adjust the output of models and fields.

| Decorator | Example | Description |
---|---|---
| @prismabox.hide | - | Hides the field or model from the output |
| @prismabox.options | @prismabox.options{ min: 10, max: 20 } | Uses the provided options for the field or model in the generated schema. Be careful to use valid JS/TS syntax! |

A schema using decorators could look like this:
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