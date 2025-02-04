import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();

userRouter.post('/signup', async (c) => {
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

userRouter.post('/signin', async (c) => {
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