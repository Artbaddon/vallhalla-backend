import { connect } from "../config/db/connectMysql.js";

/**
 * Resolve a canonical Owner_id from either an Owner identifier or a User identifier.
 * Accepts raw values (string/number) coming from HTTP payloads or decoded JWTs.
 * Returns null when no matching owner can be found.
 *
 * @param {number|string|null|undefined} identifier
 * @returns {Promise<number|null>}
 */
export async function resolveOwnerId(identifier) {
  if (identifier === undefined || identifier === null) {
    return null;
  }

  const db = connect;

  try {
    const numericCandidate = Number(identifier);

    if (Number.isInteger(numericCandidate) && numericCandidate > 0) {
      const [ownerRows] = await db.query(
        "SELECT Owner_id FROM owner WHERE Owner_id = ? LIMIT 1",
        [numericCandidate]
      );

      if (ownerRows.length > 0) {
        return ownerRows[0].Owner_id;
      }
    }

    const [ownerByUserRows] = await db.query(
      "SELECT Owner_id FROM owner WHERE User_FK_ID = ? LIMIT 1",
      [identifier]
    );

    if (ownerByUserRows.length > 0) {
      return ownerByUserRows[0].Owner_id;
    }

    return null;
  } catch (error) {
    console.error("Error resolving owner id:", error);
    throw error;
  }
}
