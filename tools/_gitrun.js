const { execFileSync } = require('child_process');
const GD = 'C:/Users/M4A1g/Documents/Warpeas/genshin-artifact-lock/.git';
const WT = 'C:/Users/M4A1g/Documents/Warpeas/genshin-artifact-lock';
const GIT = 'C:/Users/M4A1g/.workbuddy/binaries/PortableGit/versions/1.2.0/cmd/git.exe';
const args = ['--git-dir', GD, '--work-tree', WT, ...process.argv.slice(2)];
const out = execFileSync(GIT, args, { encoding: 'utf8', shell: false, cwd: WT });
process.stdout.write(out);
