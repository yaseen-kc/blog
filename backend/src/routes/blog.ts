import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { verify } from 'hono/jwt'

interface JWTPayload {
    id: string;
}

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
        const authHeader = c.req.header("Authorization") || ""
        const user = await verify(authHeader, c.env.JWT_SECRET) as unknown as JWTPayload;
        if (!user) {
            c.status(403);
            return c.json({ message: "You are not logged in" });
        }
        c.set("userId", user.id);
        await next();
    } catch (error) {
        c.status(403)
        return c.json({
            message: "You are not logged in"
        })
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
                authorId: c.get("userId")
            }
        })
        return c.json({ id: post.id });

    } catch (e) {
        console.error("Error creating post:", e);
        return c.json({ error: "Internal server error" }, 500);
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

blogRouter.get('/:id', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const postId = c.req.param('id'); // Get ID from URL params

        const post = await prisma.post.findUnique({
            where: {
                id: postId
            }
        })

        if (!post) {
            return c.json({ error: "Post not found" }, 404);
        }

        return c.json(post)
    } catch (e) {
        console.error("Error fetching post:", e);
        return c.json({ error: "Internal server error" }, 500);
    }
})
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate())
    try {

        const post = await prisma.post.findMany({})
        return c.json({ post })
    } catch (e) {
        console.error("Error fetching posts:", e);
    }
})
