const fs = require("fs");
const path = require("path");
const yaml = require("yaml");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const DIST_DIR = path.join(__dirname, "..", "dist");
const APPS_SRC = path.join(PUBLIC_DIR, "v4", "apps");
const LOGOS_SRC = path.join(PUBLIC_DIR, "v4", "logos");
const APPS_DEST = path.join(DIST_DIR, "v4", "apps");
const LOGOS_DEST = path.join(DIST_DIR, "v4", "logos");

// Clean and create dist
fs.rmSync(DIST_DIR, { recursive: true, force: true });
fs.mkdirSync(APPS_DEST, { recursive: true });
fs.mkdirSync(LOGOS_DEST, { recursive: true });

const oneClickApps = [];

// Process each YAML app
const appFiles = fs.readdirSync(APPS_SRC).filter((f) => f.endsWith(".yml"));

for (const file of appFiles) {
    const name = path.basename(file, ".yml");
    const content = fs.readFileSync(path.join(APPS_SRC, file), "utf8");
    const parsed = yaml.parse(content);

    // Write JSON without extension
    fs.writeFileSync(path.join(APPS_DEST, name), JSON.stringify(parsed));

    // Add to list
    const meta = parsed.caproverOneClickApp || {};
    oneClickApps.push({
        name: name,
        displayName: meta.displayName || name,
        description: meta.description || "",
        isOfficial: meta.isOfficial || false,
        logoUrl: fs.existsSync(path.join(LOGOS_SRC, `${name}.png`))
            ? `${name}.png`
            : "",
    });
}

// Write list file (no extension)
fs.writeFileSync(
    path.join(DIST_DIR, "v4", "list"),
    JSON.stringify({ oneClickApps })
);

// Copy logos
if (fs.existsSync(LOGOS_SRC)) {
    for (const logo of fs.readdirSync(LOGOS_SRC)) {
        fs.copyFileSync(path.join(LOGOS_SRC, logo), path.join(LOGOS_DEST, logo));
    }
}

console.log(`Built ${appFiles.length} app(s): ${appFiles.map((f) => path.basename(f, ".yml")).join(", ")}`);
