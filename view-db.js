const Database = require("better-sqlite3");

const db = new Database("snapchat.db");

console.log("\n=== UTILISATEURS ENREGISTRÉS ===\n");

const users = db.prepare("SELECT id, username, email, password, created_at FROM users").all();

if (users.length === 0) {
  console.log("Aucun utilisateur inscrit.");
} else {
  users.forEach(u => {
    console.log(`ID: ${u.id}`);
    console.log(`Username: ${u.username}`);
    console.log(`Email: ${u.email}`);
    console.log(`Mot de passe: ${u.password}`);
    console.log(`Inscrit le: ${u.created_at}`);
    console.log("-".repeat(50));
  });
  console.log(`\nTotal: ${users.length} utilisateur(s)\n`);
}

db.close();
