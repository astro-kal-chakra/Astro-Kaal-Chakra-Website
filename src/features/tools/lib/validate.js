/**
 * Validate birth details. Returns { field: i18nKey } — empty object when valid.
 * @param {{ name?: string, date: string, time: string, place: object|null }} v
 */
export function validateBirth(v, { requireName = false, today } = {}) {
  const errors = {};
  if (requireName && !v.name?.trim()) errors.name = "tools.common.required";
  if (!v.date) errors.date = "tools.common.required";
  else if (today && v.date > today) errors.date = "tools.common.futureDate";
  if (!v.time) errors.time = "tools.common.required";
  if (!v.place) errors.place = "tools.common.placeRequired";
  return errors;
}
