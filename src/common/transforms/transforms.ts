import { Transform } from 'class-transformer';

/**
 * Transform a comma-separated string into an array of trimmed strings
 * Example: "active, pending, failed" -> ["active", "pending", "failed"]
 */
export const CommaSeparatedStringToArray = () =>
  Transform(({ value }) => {
    if (!value) return undefined;
    if (Array.isArray(value)) return value;
    return typeof value === 'string'
      ? value
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0)
      : value;
  });

/**
 * Transform string "true"/"false" to boolean
 * Example: "true" -> true, "false" -> false
 */
export const StringToBoolean = () =>
  Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return false;
  });

/**
 * Transform string to number
 * Example: "123" -> 123
 */
export const StringToNumber = () =>
  Transform(({ value }) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
  });
