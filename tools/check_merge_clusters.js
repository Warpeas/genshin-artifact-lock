// Focused, dependency-free checks for automatic build clustering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const data = fs.readFileSync(path.join(root, 'src/data.js'), 'utf8');
const start = app.indexOf('/* 自动合并使用独立的需求视图');
const end = app.indexOf('/* ②-a 一组角色在某部位的主属性计票', start);
assert(start >= 0 && end > start, 'automatic merge functions must remain in one extractable block');

const dataCtx = vm.createContext({});
const builtIn = vm.runInContext(`${data}\n({ chars: buildDefaultCharacters(), setNames: SET_NAMES })`, dataCtx);
const ctx = vm.createContext({});
vm.runInContext(`
function statIdOf(x) {
  if (x == null) return '';
  return typeof x === 'object' ? (x.id != null ? x.id : (x.stat != null ? x.stat : '')) : x;
}
function roleSimilarity(a, b) {
  const weights = role => {
    const out = {};
    let prev = 1;
    (role.subList || []).forEach((item, index) => {
      if (index) prev = item.op === '=' ? prev : prev * 0.72;
      out[statIdOf(item)] = prev * (item.req ? 1.25 : 1) * (item.opt ? 0.4 : 1);
    });
    return out;
  };
  const left = weights(a), right = weights(b);
  const ids = new Set([...Object.keys(left), ...Object.keys(right)]);
  let dot = 0, leftNorm = 0, rightNorm = 0;
  ids.forEach(id => {
    const x = left[id] || 0, y = right[id] || 0;
    dot += x * y;
    leftNorm += x * x;
    rightNorm += y * y;
  });
  const norm = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  return norm ? dot / norm : 0;
}
${app.slice(start, end)}
`, ctx);

const role = (name, items, source = 'heuristic') => ({
  name,
  subList: items.map(item => typeof item === 'string' ? {id: item, op: '>'} : item),
  req: [],
  subRuleSource: source,
});
const partitions = roles => Array.from(ctx.naturalClusters(roles), group => Array.from(group));
const canonical = groups => Array.from(groups, group => Array.from(group, item => item.name).sort().join(',')).sort();

const shortA = role('shortA', ['atkP', 'er']);
const shortB = role('shortB', ['er', 'atkP']);
assert.deepEqual(canonical(partitions([shortA, shortB])), ['shortA,shortB']);

const shortThreeA = role('shortThreeA', ['cr', 'cd', 'atkP']);
const shortThreeB = role('shortThreeB', ['atkP', 'cr', 'cd']);
assert.deepEqual(canonical(partitions([shortThreeA, shortThreeB])), ['shortThreeA,shortThreeB']);

const conditionalA = role('conditionalA', [
  'cr', 'cd', 'atkP', {id: 'hpP', op: '>', opt: true},
]);
const conditionalB = role('conditionalB', [
  'atkP', 'cr', 'cd', {id: 'hpP', op: '>', opt: true},
]);
assert.equal(ctx.mergeItemsOf(conditionalA).length, 4);
assert.equal(ctx.mergeHeadOf(conditionalA).has('hpP'), false);
assert.deepEqual(canonical(partitions([conditionalA, conditionalB])), ['conditionalA,conditionalB']);

const wrongShort = role('wrongShort', ['atkP', 'em']);
assert.deepEqual(canonical(partitions([shortA, wrongShort])), ['shortA', 'wrongShort']);

const sameHeadA = role('sameHeadA', ['cr', 'cd', 'atkP', 'er']);
const sameHeadB = role('sameHeadB', ['cr', 'cd', 'er', 'atkP']);
assert.deepEqual(canonical(partitions([sameHeadA, sameHeadB])), ['sameHeadA,sameHeadB']);

const shiftedHead = role('shiftedHead', ['atkP', 'er', 'cr', 'cd']);
assert.deepEqual(canonical(partitions([sameHeadA, shiftedHead])), ['sameHeadA', 'shiftedHead']);

const manualA = role('manualA', ['cr', 'cd', 'atkP'], 'manual');
const manualB = role('manualB', ['atkP', 'cr', 'cd'], 'manual');
assert.deepEqual(canonical(partitions([manualA, manualB])), ['manualA', 'manualB']);

const bridgeA = role('bridgeA', [
  {id: 'cr', op: '>'}, {id: 'cd', op: '='}, {id: 'hpP', op: '>'}, {id: 'defP', op: '>'},
]);
const bridgeB = role('bridgeB', [
  {id: 'cr', op: '>'}, {id: 'cd', op: '='}, {id: 'atkP', op: '='}, {id: 'em', op: '>'},
]);
const bridgeC = role('bridgeC', [
  {id: 'cd', op: '>'}, {id: 'atkP', op: '='}, {id: 'hpP', op: '>'}, {id: 'defP', op: '>'},
]);
assert(ctx.mergePairCompatible(bridgeA, bridgeB));
assert(ctx.mergePairCompatible(bridgeB, bridgeC));
assert(!ctx.mergePairCompatible(bridgeA, bridgeC));
assert.deepEqual(canonical(partitions([bridgeA, bridgeB, bridgeC])), ['bridgeA,bridgeB', 'bridgeC']);

const sample = [shortA, shortB, sameHeadA, sameHeadB, shiftedHead, wrongShort];
assert.deepEqual(canonical(partitions(sample)), canonical(partitions(sample.slice().reverse())));
assert(app.includes("subRuleSource: (b.subRules && b.subRules.source) || 'unset'"));

let corpusGroupCount = 0;
builtIn.setNames.forEach(setName => {
  const roles = builtIn.chars.flatMap(character => {
    const matches = character.builds.filter(build => (build.sets || []).includes(setName));
    const build = matches.find(item => item.priority === 'main') || matches[0];
    if (!build) return [];
    return [{
      name: character.name,
      subList: build.subs || [],
      req: (build.subs || []).filter(item => item.req).map(item => item.id),
      subRuleSource: (build.subRules && build.subRules.source) || 'unset',
    }];
  });
  const groups = partitions(roles);
  corpusGroupCount += groups.length;
  groups.forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        assert(ctx.mergePairCompatible(group[i], group[j]), `${setName}: incompatible pair in one cluster`);
      }
    }
  });
  assert.deepEqual(canonical(groups), canonical(partitions(roles.slice().reverse())), `${setName}: input order changed clusters`);
});

console.log(`PASS: focused merge cases plus ${builtIn.setNames.length} built-in sets; ${corpusGroupCount} clusters satisfy complete-link compatibility and input-order stability.`);

const production = vm.createContext({});
vm.runInContext(data, production);
vm.runInContext(`
function statIdOf(x) {
  if (x == null) return '';
  return typeof x === 'object' ? (x.id != null ? x.id : (x.stat != null ? x.stat : '')) : x;
}
`, production);
const productionStart = app.indexOf('const SUB_RANK_DECAY =');
const productionEnd = app.indexOf('/* 把若干候选方案手动合并成一套', productionStart);
const rolesStart = app.indexOf('function pickBuild(c, setName)');
const rolesEnd = app.indexOf('function buildPlanCandidates(charList, setName)', rolesStart);
assert(productionStart >= 0 && productionEnd > productionStart);
assert(rolesStart >= 0 && rolesEnd > rolesStart);
vm.runInContext(app.slice(productionStart, productionEnd), production);
vm.runInContext(app.slice(rolesStart, rolesEnd), production);

const productionChars = vm.runInContext('buildDefaultCharacters()', production);
let planCount = 0;
let maxGroupSize = 0;
const largestGroups = [];
const auditIssues = [];
const relevantSlots = ['sands', 'goblet', 'circlet'];
const fixedSubstats = new Set(['hp', 'atk']);

builtIn.setNames.forEach(setName => {
  console.log(`Auditing generated plans: ${setName}`);
  const charsForSet = productionChars.filter(character =>
    (character.builds || []).some(build => (build.sets || []).includes(setName)));
  const roles = production.toRoles(charsForSet, setName);
  const clusters = Array.from(production.naturalClusters(roles), group => Array.from(group));
  clusters.forEach(group => {
    const plan = production.planFromGroup(group);
    planCount++;
    maxGroupSize = Math.max(maxGroupSize, group.length);
    if (group.length >= 8) {
      const signatures = new Map();
      group.forEach(member => {
        const signature = (member.subList || []).map(item => `${item.id}${item.opt ? '?' : ''}`).join(',');
        signatures.set(signature, (signatures.get(signature) || 0) + 1);
      });
      const poolSupport = Object.fromEntries(plan.sub.pool.map(id => [
        id,
        group.filter(member => (member.subList || []).some(item => item.id === id)).length,
      ]));
      largestGroups.push({
        setName,
        size: group.length,
        signatures: [...signatures.entries()].sort((a, b) => b[1] - a[1]),
        pool: plan.sub.pool,
        poolSupport,
        minHit: plan.sub.minHit,
      });
    }

    group.forEach(member => {
      relevantSlots.forEach(slot => {
        const rank1 = member.mains[slot] && member.mains[slot][0];
        if (rank1 && !plan.mains[slot].includes(rank1.stat)) {
          auditIssues.push(`${setName}/${member.name}: ${slot} rank1 ${rank1.stat} missing`);
        }
      });

      (member.subList || []).slice(0, 5).forEach(item => {
        const id = item.id;
        if (id && !fixedSubstats.has(id) && !plan.sub.pool.includes(id)) {
          auditIssues.push(`${setName}/${member.name}: requested substat ${id} missing from pool`);
        }
      });

      (member.req || []).forEach(id => {
        if (!plan.sub.required.includes(id)) {
          auditIssues.push(`${setName}/${member.name}: required ${id} missing from required marks`);
        }
      });

      (member.subList || []).filter(item => item.opt).forEach(item => {
        if (item.id && !fixedSubstats.has(item.id) && !plan.sub.opt.includes(item.id)) {
          auditIssues.push(`${setName}/${member.name}: conditional ${item.id} missing from optional marks`);
        }
      });
    });

    if (plan.sub.minHit > plan.sub.pool.length || plan.sub.minHit > 4) {
      auditIssues.push(`${setName}/${group.map(item => item.name).join(',')}: invalid minHit ${plan.sub.minHit}`);
    }
  });
});

assert.deepEqual(auditIssues, [], auditIssues.slice(0, 20).join('\n'));
console.log(`PASS: production plan assembly; ${planCount} plans keep every member's main-stat rank1, requested pool entries, required marks, and conditional marks. Largest group: ${maxGroupSize}.`);
largestGroups.sort((a, b) => b.size - a.size || a.setName.localeCompare(b.setName));
if (largestGroups.length) console.log('Largest groups (top 10):', JSON.stringify(largestGroups.slice(0, 10)));

const celestial = production.toRoles(productionChars.filter(character =>
  (character.builds || []).some(build => (build.sets || []).includes('天之美赐'))), '天之美赐');
const celestialGroups = Array.from(production.naturalClusters(celestial), group => Array.from(group));
const nicolePruneGroup = celestialGroups.find(group =>
  group.some(member => member.name === '尼可') && group.some(member => member.name === '布伦妮'));
assert(nicolePruneGroup, 'Nicole and Prune should share the Celestial Gift plan');
console.log('PASS: 天之美赐 short-list case:', nicolePruneGroup.map(member => member.name).join('、'));
