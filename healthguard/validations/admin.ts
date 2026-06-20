import { z } from "zod";

export const inviteDoctorSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(8, "Enter a valid phone number"),
  hospitalId: z.string().min(1, "Select or find a hospital"),
  hospitalLicenseCode: z.string().min(3, "Hospital license code is required"),
});
