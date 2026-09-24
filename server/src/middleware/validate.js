/** Validates + sanitises req[source] with a Zod schema. Unknown keys are stripped (blocks mass-assignment). */
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) return next(parsed.error);
    req[source] = parsed.data;
    next();
  };
