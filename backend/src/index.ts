import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'




const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }

}>();
app.post('/api/v1/user/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  try {
    const body = await c.req.json()

    if (!body.email || !body.password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    })
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ jwt })
  } catch (e) {
    return c.json({ error: 'Something went wrong' }, 500)
  }
})
app.post('/api/v1/user/signin', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  try {
    const body = await c.req.json()
    if (!body.email) {
      return c.json({ error: "Email is required" }, 400);
    }

    const user = await prisma.user.findUnique({
      where: {
        email: body.email
      }
    })

    if (!user) {
      c.status(403);
      return c.json({ error: "user not found" });
    }

    if (!c.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      return c.json({ error: "Internal server error" }, 500);
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ jwt })
  } catch (error) {
    console.error(error);
    return c.json({ error: "Something went wrong" }, 500);
  }
})
app.post('/api/v1/blog', (c) => c.text('Blog - Post'))

app.put('/api/v1/blog', (c) => c.text('Blog - Post'))

app.get('/api/v1/blog:id', (c) => c.text('Blog - Get'))
app.get('/api/v1/blog/bulk', (c) => c.text('Bulk - Post'))


export default app
