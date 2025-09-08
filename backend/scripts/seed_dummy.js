import { connect } from "../config/db/connectMysql.js";
import bcrypt from "bcrypt";

/*
  Inserts dummy users with email & roles if they don't exist.
  Assumes roles & user_status already seeded (role names: Admin, Owner, Security).
*/

async function up() {
  const users = [
    { name: 'demo_admin', email: 'demo_admin@example.com', role: 'Admin', password: 'Admin1234' },
    { name: 'demo_owner', email: 'demo_owner@example.com', role: 'Owner', password: 'Owner1234' },
    { name: 'demo_security', email: 'demo_security@example.com', role: 'Security', password: 'Security1234' }
  ];

  for (const u of users) {
    const [existing] = await connect.query('SELECT Users_id FROM users WHERE Users_name = ? OR Users_email = ? LIMIT 1', [u.name, u.email]);
    if (existing.length) {
      console.log(`[SKIP] ${u.name} already exists`);
      continue;
    }
    const [[roleRow]] = await connect.query('SELECT Role_id FROM role WHERE Role_name = ? LIMIT 1', [u.role]);
    if (!roleRow) {
      console.log(`[WARN] Role ${u.role} not found; skipping user ${u.name}`);
      continue;
    }
    const [[statusRow]] = await connect.query('SELECT User_status_id FROM user_status WHERE User_status_name = ? LIMIT 1', ['Active']);
    if (!statusRow) {
      console.log('[ERROR] Active status missing. Abort.');
      break;
    }
    const hash = await bcrypt.hash(u.password, 10);
    await connect.query(
      `INSERT INTO users (Users_name, Users_email, Users_password, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [u.name, u.email, hash, statusRow.User_status_id, roleRow.Role_id]
    );
    console.log(`[OK] Inserted ${u.name}`);
  }
  await connect.end();
  console.log('Dummy seed completed');
}

up().catch(e => { console.error(e); process.exit(1); });
