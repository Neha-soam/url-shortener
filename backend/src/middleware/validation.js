const { z } = require('zod');

const createUrlSchema = z.object({
  url: z.string().min(1).max(2048),
  customAlias: z.string().optional(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

const authSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
});

const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) });
  }
  req.body = parsed.data;
  next();
};

module.exports = { validate, createUrlSchema, authSchema };
