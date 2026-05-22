import bcrypt from "bcrypt";
import { pool } from "./db";
import config from "./config";

const seed = async () => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query("DELETE FROM issues");
    await client.query("DELETE FROM users");

    const password = await bcrypt.hash("password123", 10);

    const users = await client.query(`
      INSERT INTO users (name, email, password, role) VALUES
        ('Alice Wonder', 'alice@devpulse.com', $1, 'contributor'),
        ('Bob Builder', 'bob@devpulse.com', $1, 'contributor'),
        ('Carol Maintainer', 'carol@devpulse.com', $1, 'maintainer')
      RETURNING id, name, role
    `, [password]);

    const aliceId = users.rows[0]!.id;
    const bobId = users.rows[1]!.id;
    const carolId = users.rows[2]!.id;

    await client.query(`
      INSERT INTO issues (title, description, type, status, reporter_id) VALUES
        ('Login page returns 500', 'When submitting the login form, the server crashes with an unhandled promise rejection. This blocks all users from signing in.', 'bug', 'open', $1),
        ('Add dark mode support', 'Users have requested a dark theme option for late-night coding sessions. Consider using CSS variables for easy theming.', 'feature_request', 'open', $2),
        ('Database pool exhaustion', 'Under load testing, the connection pool maxes out at 50 connections and never releases them, causing a cascade of timeout errors.', 'bug', 'in_progress', $1),
        ('Export issues to CSV', 'Maintainers need a way to export the issue list as a CSV file for reporting purposes.', 'feature_request', 'open', $3),
        ('Memory leak in issue list', 'The /api/issues endpoint grows memory usage by 2MB per request when returning 100+ items. Need to profile and fix.', 'bug', 'resolved', $2),
        ('Webhook integration for Slack', 'Send notifications to a Slack channel when new issues are created or status changes occur.', 'feature_request', 'open', $3),
        ('Password reset flow', 'Implement a forgot-password flow with email-based reset tokens. Currently there is no way to recover an account.', 'feature_request', 'in_progress', $1),
        ('Broken pagination in search', 'When using the search feature, page 2 and beyond return empty results even when more results exist.', 'bug', 'open', $2)
    `, [aliceId, bobId, carolId]);

    // Swap reporter for issue 3 (alice's issue assigned to bob in progress)
    await client.query(
      "UPDATE issues SET reporter_id = $1 WHERE title = 'Database pool exhaustion'",
      [bobId]
    );

    await client.query("COMMIT");

    console.log("Seed data inserted:");
    console.log("  Users: Alice (contributor), Bob (contributor), Carol (maintainer)");
    console.log("  Issues: 8 (4 bugs, 4 feature requests)");
    console.log("  All passwords: password123");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
