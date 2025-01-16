import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const app = new Hono();

type User = z.TypeOf<typeof userSchema>;

let users: User[] = [
  {
    name: "John Doe",
    age: 25,
  },
  {
    name: "Jane Doe",
    age: 30,
  },
];

app
  .get("/users", (c) => {
    return c.json(users);
  })
  .get("/users/:id", (c) => {
    const { id } = c.req.param();
    const user = users.at(Number(id) - 1);
    if (!user) {
      throw new HTTPException(404, { message: "Not Found" });
    }
    return c.json(user);
  })
  .post("/users", zValidator("json", userSchema), (c) => {
    const user = c.req.valid("json");
    users.push(user);
    return c.json(user);
  })
  .put("/users/:id", zValidator("json", userSchema.nullish()), (c) => {
    const { id } = c.req.param();
    users = users.map((user, idx) => {
      return idx === Number(id) - 1
        ? ({
          name: c.req.valid("json")?.name ?? user.name,
          age: c.req.valid("json")?.age ?? user.age,
        } satisfies User)
        : user;
    });
    return c.json(users.at(Number(id) - 1));
  })
  .delete("users/:id", (c) => {
    const { id } = c.req.param();
    users = users.filter((_, idx) => {
      return idx !== Number(id) - 1;
    });
    return c.json(null);
  });

export default app;
