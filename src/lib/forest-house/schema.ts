import { z } from "zod";
import { ROLES, SKILLS, DEPLOY_DATES } from "./constants";

const PHONE_REGEX = /^[+0-9 ()-]{7,}$/;

const BaseFields = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    email: z.string().trim().toLowerCase().email("Valid email required"),
    phone: z.string().trim().regex(PHONE_REGEX, "Valid phone required"),
    roles: z.array(z.enum(ROLES)).min(1, "Select at least one role"),
    preferredRole: z.enum(ROLES),
    backupRole: z.enum(ROLES).optional(),
    availability: z
      .array(z.enum(DEPLOY_DATES))
      .min(1, "Select at least one day"),
    buildCrew: z.boolean(),
    strikeCrew: z.boolean(),
    paradeCrew: z.boolean(),
    skills: z.array(z.enum(SKILLS)),
    critical: z.boolean(),
    notes: z.string().max(1000, "Notes must be 1000 characters or fewer").optional(),
    website: z.string().optional(),
    shifts: z.array(z.unknown()).optional(),
  })
  .strict();

export const RegistrationInputSchema = BaseFields.superRefine((data, ctx) => {
  if (!data.roles.includes(data.preferredRole)) {
    ctx.addIssue({
      code: "custom",
      path: ["preferredRole"],
      message: "Preferred role must be in your selected roles",
    });
  }
  if (data.backupRole && !data.roles.includes(data.backupRole)) {
    ctx.addIssue({
      code: "custom",
      path: ["backupRole"],
      message: "Backup role must be in your selected roles",
    });
  }
  if (data.backupRole && data.backupRole === data.preferredRole) {
    ctx.addIssue({
      code: "custom",
      path: ["backupRole"],
      message: "Backup role must differ from preferred role",
    });
  }
});

export type RegistrationInput = z.infer<typeof RegistrationInputSchema>;

export const CrewRecordSchema = BaseFields.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type CrewRecord = z.infer<typeof CrewRecordSchema>;

export const CrewFileSchema = z.object({ crew: z.array(CrewRecordSchema) });
