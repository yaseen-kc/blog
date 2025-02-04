import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }, Variables: {
        userId: string
    }
}>();

blogRouter.use('/blog/*', async (c, next) => {
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


blogRouter.post('/', (c) => c.text('Blog - Post'))

blogRouter.put('/', (c) => c.text('Blog - Post'))

blogRouter.get('/:id', (c) => c.text('Blog - Get'))
blogRouter.get('/bulk', (c) => c.text('Bulk - Post'))
