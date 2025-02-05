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

blogRouter.use('/*', async (c, next) => {
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
        // @ts-ignore
        c.set('userId', payload.id)

        await next()

    } catch (e) {
        console.error(e);
        return c.json({ error: 'Something went wrong' }, 500)
    }
})

blogRouter.post('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const body = await c.req.json()
        const post = await prisma.post.create({
            data: {
                title: body.title,
                content: body.content,
                authorId: "1"
            }
        })
        return c.json({
            id: [post.id]
        })
    } catch (e) {
        console.error("Error creating post:", e);
    }
})


blogRouter.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());
    try {

        const body = await c.req.json();

        const updatedPost = await prisma.post.update({
            where: {
                id: body.id,
            },
            data: {
                title: body.title,
                content: body.content,
            },
        });

        return c.json({ message: 'Post updated successfully', post: updatedPost });
    } catch (e) {
        console.error("Error updating post:", e);

    }
});

blogRouter.get('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const body = await c.req.json()

        const post = await prisma.post.findUnique({
            where: {
                id: body.id
            }
        })

        if (!post) {
            return c.json({ error: "Post not found" }, 404);
        }

        return c.json(post)
    } catch (error) {
        console.error("Error fetching post:", error);
    }
})
blogRouter.get('/bulk', (c) => c.text('Bulk - Post'))
