import { z } from "zod";

export const signupInput = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password is too long"),
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name is too long")
        .optional(),
})


export const signinInput = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})


export const createBlogInput = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(100, "Title is too long"),
    content: z.string()
        .min(1, "Content is required")
        .max(10000, "Content is too long"),
})


export const updateBlogInput = z.object({
    id: z.string().uuid("Invalid post ID"),
    title: z.string()
        .min(1, "Title is required")
        .max(100, "Title is too long")
        .optional(),
    content: z.string()
        .min(1, "Content is required")
        .max(10000, "Content is too long")
        .optional(),
})


export type SignupInput = z.infer<typeof signupInput>
export type SigninInput = z.infer<typeof signinInput>
export type CreateBlogInput = z.infer<typeof createBlogInput>
export type UpdateBlogInput = z.infer<typeof updateBlogInput>