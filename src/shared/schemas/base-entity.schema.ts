import { z } from "astro/zod";

const statusSchema = z.enum(["active", "inactive", "archived"]);

type Status = z.infer<typeof statusSchema>;

const baseEntitySchema = z.object({
  id: z.number(),
  status: statusSchema,
  created_at: z.coerce.date().optional(),
  updated_at: z.coerce.date().optional(),
  deleted_at: z.coerce.date().optional(),
});

type BaseEntity = z.infer<typeof baseEntitySchema>;

export type { BaseEntity, Status };
export { baseEntitySchema, statusSchema };
