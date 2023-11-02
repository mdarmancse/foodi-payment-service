import { ZodError } from "zod";
import { isEmpty, omit } from "lodash";

/**
 * @typedef {Object} _ZodPropErrors
 * @property {string[]} _errors
 */

/**
 * @typedef {Record<string | "_errors", string[] | _ZodPropErrors>} _ZodError
 */

/**
 * @param {ZodError} err
 */
export function formatZodError(err) {
  const obj = err?.format() || {};
  return parseError(obj);
}

/**
 * @param {_ZodError} obj
 */
function parseError(obj) {
  /** @type {any} */
  let rv = {};

  for (const key in obj) {
    if (!key.startsWith("_errors")) {
      if (isArrayError(/** @type {_ZodError} */ (obj[key]))) {
        rv[key] = parseArray(/** @type {_ZodPropErrors} */ (obj[key]));
      } else {
        rv[key] =
          /** @type {_ZodPropErrors} */ (obj[key])._errors[0] || "Invalid data";
      }
      // console.log({[key]: obj[key], isArray: isArrayError(obj[key])});
    }
  }

  if (isEmpty(omit(obj, "_errors"))) {
    rv = /** @type {string[]} */ (obj._errors)[0] || "Invalid data";
  }

  return rv;
}

/**
 * FormatArrayError
 * @param {_ZodError} obj
 */
function parseArray(obj) {
  const rv = [];
  for (const key in obj) {
    if (!isNaN(parseInt(key))) {
      const err = parseError(/** @type {_ZodPropErrors} */ (obj[key]));
      rv[parseInt(key)] = err;
    }
  }
  return rv;
}

/**
 * IsArrayError
 * @param {_ZodError} obj
 */
function isArrayError(obj) {
  for (const key in obj) {
    if (!isNaN(parseInt(key))) {
      return true;
    }
  }
  return false;
}
