import { z } from "zod";
const optionalUrl = z.union([z.literal(""), z.url()]).transform((value) => value || undefined);
export const projectSchema = z.object({ name: z.string().trim().min(2).max(120), clientName: z.string().trim().min(2).max(120), clientWebsite: optionalUrl.optional(), packageName: z.string().trim().max(100).optional(), requirements: z.string().trim().max(20_000).optional(), deadline: z.coerce.date().optional(), googleMapsUrl: optionalUrl.optional(), demoUrl: optionalUrl.optional(), githubUrl: optionalUrl.optional(), vercelUrl: optionalUrl.optional(), priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"), developerId: z.string().cuid().optional(), managerId: z.string().cuid().optional() });
export type ProjectInput = z.infer<typeof projectSchema>;
