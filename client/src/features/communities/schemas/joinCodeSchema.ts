import { z } from "zod";

export const joinCodeSchema = z.string().regex(/^[A-Z0-9]{8}$/);
