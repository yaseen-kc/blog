import { Hono } from 'hono'

const app = new Hono()

app.post(' /api/v1/user/signup', (c) => c.text('Signup Route - Post'))
app.post(' /api/v1/user/signin', (c) => c.text('Signin Route - Post'))
app.post(' /api/v1/blog', (c) => c.text('Blog - Post'))

app.put('/api/v1/blog', (c) => c.text('Blog - Post'))

app.get('/api/v1/blog:id', (c) => c.text('Blog - Get'))
app.get('/api/v1/blog/bulk', (c) => c.text('Bulk - Post'))


export default app
