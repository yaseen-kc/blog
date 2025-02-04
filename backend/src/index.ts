import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }, Variables: {
    userId: string
  }
}>();


app.use('/api/v1/blog/*', async (c, next) => {
  try {
    const jwt = c.req.header('Authorization')

    if (!jwt || !jwt.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401)
    }

    if (!jwt) {
      c.status(401)
      return c.json({ Error: "Unauthorized" })
    }

    const token = jwt.split(' ')[1]

    if (!token) {
      return c.json({ error: 'Unauthorized: Token not found' }, 401)
    }

    const payload = await verify(token, c.env.JWT_SECRET)

    if (!payload) {
      c.status(401)
      return c.json({ Error: "Unauthorized: Invalid token" })
    }

    c.set('userId', payload.id)

    await next()

  } catch (e) {
    console.error(e);
    return c.json({ error: 'Something went wrong' }, 500)
  }
})

app.post('/api/v1/user/signup', async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate())
  try {
    const body = await c.req.json()

    if (!body.email || !body.password) {
      return c.json({ error: 'Email and password are required' }, 400)
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return c.json({ error: "Email already in use" }, 400);
    }


    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password
      }
    })

    console.log("JWT_SECRET:", c.env.JWT_SECRET);
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)

    return c.json({ jwt })
  } catch (e) {
    console.error(e);
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

    console.log("JWT_SECRET:", c.env.JWT_SECRET);

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
    return c.json({ jwt })
  } catch (e) {
    console.error(e);
    return c.json({ error: "Something went wrong" }, 500);
  }
})
app.post('/api/v1/blog', (c) => c.text('Blog - Post'))

app.put('/api/v1/blog', (c) => c.text('Blog - Post'))

app.get('/api/v1/blog:id', (c) => c.text('Blog - Get'))
app.get('/api/v1/blog/bulk', (c) => c.text('Bulk - Post'))

export default app
