import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signinInput, signupInput } from '@yaseenkc/blog-common'


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
        const result = signupInput.safeParse(body)
        if (!result.success) {
            c.status(411);
            return c.json({
                message: "Invalid input",
                errors: result.error.errors
            })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: result.data.email }
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
        const result = signinInput.safeParse(body)
        if (!result.success) {
            c.status(411)
            return c.json({
                message: "Invalid input",
                errors: result.error.errors
            })
        }

        const user = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        })

        if (!user) {
            c.status(403);
            return c.json({ error: "Invalid credentials" })
        }


        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json({ jwt })
    } catch (e) {
        console.error(e);
        return c.json({ error: "Something went wrong" }, 500);
    }
})