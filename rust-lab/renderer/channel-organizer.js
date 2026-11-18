/* Rust Lab v8: deterministic, local-only channel and folder organization.
   Plain JS so the same functions can run in Node regression tests. */
'use strict';
(function (root, factory) {
 const api = factory();
 if (typeof module !== 'undefined' && module.exports) module.exports = api;
 if (root) root.IPTVChannelOrganizer = api;
})(typeof window !== 'undefined' ? window : null, function () {
 const unique = values => [...new Set(values)];
 const cleanGroup = channel => String(channel?.group || 'Khác').replace(/\s*\|\s*(?:Kiểm tra|Kiem tra):?.*$/i, '').trim() || 'Khác';
 function ensure(store) {
  const current=store.channelOrder;
  if (!current || typeof current !== 'object' || Array.isArray(current)) store.channelOrder = Object.create(null);
  else if (Object.getPrototypeOf(current) !== null) {
   const safe=Object.create(null);
   for (const [group, ids] of Object.entries(current)) if (Array.isArray(ids)) safe[group]=ids;
   store.channelOrder=safe;
  }
  return store.channelOrder;
 }
 function groupList(store, group) {
  ensure(store);
  const found = (store.channels || []).filter(c => cleanGroup(c) === group && typeof c.id === 'string' && c.id);
  const ids = new Set(found.map(c => c.id));
  const saved = Array.isArray(store.channelOrder[group]) ? store.channelOrder[group] : [];
  const ordered = unique(saved.filter(id => typeof id === 'string' && ids.has(id)));
  const included = new Set(ordered);
  for (const c of found) if (!included.has(c.id)) { ordered.push(c.id); included.add(c.id); }
  return ordered;
 }
 function sorted(store, group, entries) {
  const order = new Map(groupList(store, group).map((id, i) => [id, i]));
  return [...entries].sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER));
 }
 function reconcile(store) {
  const saved = ensure(store);
  const groups = unique((store.channels || []).map(cleanGroup));
  const next = Object.create(null);
  // Retain empty user-created groups; never reintroduce deleted channel IDs.
  for (const group of unique([...(store.folders || []), ...groups])) {
   if (typeof group === 'string' && group && group !== '__proto__' && group !== 'constructor') next[group] = groupList(store, group);
  }
  store.channelOrder = next;
  return next;
 }
 function move(store, ids, targetGroup, beforeId = null) {
  if (!Array.isArray(ids) || typeof targetGroup !== 'string' || !targetGroup.trim()) return {changed: false, count: 0};
  const channels = store.channels || [];
  const byId = new Map(channels.map(c => [c.id, c]));
  const requested = unique(ids.filter(id => typeof id === 'string' && byId.has(id)));
  if (!requested.length) return {changed: false, count: 0};
  const originals = new Map(channels.map(c => [c.id, cleanGroup(c)]));
  const affected = unique([...requested.map(id => originals.get(id)), targetGroup]);
  const orderBefore = new Map(affected.map(group => [group, groupList(store, group)]));
  // The selection is moved in its existing visual order, not checkbox order.
  const displayed = new Map();
  const groupNames = unique([...((store.groupOrder || [])), ...channels.map(cleanGroup)]);
  groupNames.forEach((group, groupIndex) => {
   groupList(store, group).forEach((id, i) => displayed.set(id, groupIndex * (channels.length + 1) + i));
  });
  const moving = requested.sort((a, b) => (displayed.get(a) ?? 1e15) - (displayed.get(b) ?? 1e15));
  const chosen = new Set(moving);
  if (beforeId && chosen.has(beforeId)) return {changed: false, count: 0};
  const destination = (orderBefore.get(targetGroup) || []).filter(id => !chosen.has(id));
  if (beforeId != null && !destination.includes(beforeId)) return {changed: false, count: 0};
  const at = beforeId == null ? destination.length : destination.indexOf(beforeId);
  destination.splice(at, 0, ...moving);
  const result = Object.create(null);
  for (const group of affected) result[group] = group === targetGroup ? destination : (orderBefore.get(group) || []).filter(id => !chosen.has(id));
  const changed = moving.some(id => originals.get(id) !== targetGroup) || affected.some(group => JSON.stringify(orderBefore.get(group)) !== JSON.stringify(result[group]));
  if (!changed) return {changed: false, count: 0};
  const saved = ensure(store);
  for (const id of moving) byId.get(id).group = targetGroup;
  for (const group of affected) saved[group] = result[group];
  return {changed: true, count: moving.length, moved: moving, group: targetGroup};
 }
 function renameGroup(store, oldName, newName) {
  const saved = ensure(store);
  const original = groupList(store, oldName);
  for (const c of store.channels || []) if (cleanGroup(c) === oldName) c.group = newName;
  if (oldName !== newName) {
   saved[newName] = unique([...(Array.isArray(saved[newName]) ? saved[newName] : []), ...original]);
   delete saved[oldName];
  }
 }
 function deleteGroup(store, group, replacement = 'Khác') {
  const ids = groupList(store, group);
  if (ids.length) move(store, ids, replacement);
  delete ensure(store)[group];
 }
 return {ensure, cleanGroup, sorted, groupList, reconcile, move, renameGroup, deleteGroup};
});
