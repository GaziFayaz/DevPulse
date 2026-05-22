import { query } from "../../utils/sql";
import { NotFoundError, ForbiddenError } from "../../utils/errors";

interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: "bug" | "feature_request";
  status: "open" | "in_progress" | "resolved";
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

interface IssueWithReporter {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  reporter: { id: number; name: string; role: string } | null;
  created_at: string;
  updated_at: string;
}

interface UserBrief {
  id: number;
  name: string;
  role: string;
}

const fetchReporter = async (userId: number): Promise<UserBrief | null> => {
  const result = await query("SELECT id, name, role FROM users WHERE id = $1", [userId]);
  return result.rows[0] as UserBrief | null;
};

const attachReporter = async (issue: IssueRow): Promise<IssueWithReporter> => {
  const reporter = issue.reporter_id ? await fetchReporter(issue.reporter_id) : null;
  const { reporter_id, ...rest } = issue;
  return { ...rest, reporter };
};

export const create = async (
  title: string,
  description: string,
  type: "bug" | "feature_request",
  reporterId: number
) => {
  const result = await query(
    `INSERT INTO issues (title, description, type, reporter_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, description, type, reporterId]
  );
  return result.rows[0] as IssueRow;
};

export const getAll = async (
  sort: string = "newest",
  type?: string,
  status?: string
): Promise<IssueWithReporter[]> => {
  let sql = "SELECT * FROM issues";
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (type) {
    conditions.push(`type = $${paramIndex++}`);
    params.push(type);
  }
  if (status) {
    conditions.push(`status = $${paramIndex++}`);
    params.push(status);
  }

  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }

  sql += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";

  const result = await query(sql, params);
  const issues = result.rows as IssueRow[];

  const reporterIds = [...new Set(issues.map(i => i.reporter_id).filter(Boolean))] as number[];
  const reporterMap = new Map<number, UserBrief>();

  if (reporterIds.length > 0) {
    const placeholders = reporterIds.map((_, i) => `$${i + 1}`).join(",");
    const reporterResult = await query(
      `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
      reporterIds
    );
    for (const row of reporterResult.rows as UserBrief[]) {
      reporterMap.set(row.id, row);
    }
  }

  return issues.map((issue) => {
    const { reporter_id, ...rest } = issue;
    const reporter = reporter_id ? reporterMap.get(reporter_id) ?? null : null;
    return { ...rest, reporter };
  });
};

export const getById = async (id: number): Promise<IssueWithReporter> => {
  const result = await query("SELECT * FROM issues WHERE id = $1", [id]);
  if (result.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }
  return attachReporter(result.rows[0] as IssueRow);
};

export const update = async (
  id: number,
  userId: number,
  userRole: string,
  fields: { title?: string; description?: string; type?: string }
) => {
  const existing = await query("SELECT * FROM issues WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }

  const issue = existing.rows[0] as IssueRow;

  if (userRole === "contributor") {
    if (issue.reporter_id !== userId) {
      throw new ForbiddenError("You can only update your own issues");
    }
    if (issue.status !== "open") {
      throw new ForbiddenError("You can only update issues with open status");
    }
  }

  const allowedFields: Record<string, unknown> = {};
  if (fields.title !== undefined) allowedFields.title = fields.title;
  if (fields.description !== undefined) allowedFields.description = fields.description;
  if (fields.type !== undefined) allowedFields.type = fields.type;

  if (Object.keys(allowedFields).length === 0) {
    throw new ForbiddenError("No valid fields to update");
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(allowedFields)) {
    setClauses.push(`${key} = $${paramIndex++}`);
    params.push(value);
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const result = await query(
    `UPDATE issues SET ${setClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  return result.rows[0] as IssueRow;
};

export const remove = async (id: number) => {
  const existing = await query("SELECT id FROM issues WHERE id = $1", [id]);
  if (existing.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }

  await query("DELETE FROM issues WHERE id = $1", [id]);
};
