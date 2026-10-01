const MODULE_ID = "safeguard";
const SCENES = ["Roleplay", "Combat", "Puzzle", "Downtime", "Story", "Travel"];
const GENRES = ["High Fantasy", "Low Fantasy", "Dark Fantasy", "Light Hearted", "Serious", "General Blend"];

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "responses", {
    scope: "world", config: false, type: Object, default: {}, restricted: true
  });
  game.settings.register(MODULE_ID, "minResponses", {
    name: "Minimum Responses for GM Results",
    hint: "Hide aggregate and free-text results until this many non-GM players have submitted. Helps reduce identification by elimination.",
    scope: "world", config: true, type: Number, default: 3, restricted: true
  });
});

Hooks.once("ready", () => {
  game.socket.on(`module.${MODULE_ID}`, async payload => {
    if (!game.user.isGM || payload?.action !== "submit") return;
    const responses = foundry.utils.deepClone(game.settings.get(MODULE_ID, "responses") ?? {});
    responses[payload.userId] = sanitize(payload.data);
    await game.settings.set(MODULE_ID, "responses", responses);
    game.socket.emit(`module.${MODULE_ID}`, { action: "saved", userId: payload.userId });
  });
});

Hooks.on("getSceneControlButtons", controls => {
  const button = {
    name: "safeguard",
    title: "Safeguard",
    icon: "fas fa-shield-heart",
    button: true,
    visible: true,
    onClick: () => openSafeguard()
  };
  if (Array.isArray(controls)) controls.push(button);
  else if (controls && typeof controls === "object") controls.safeguard = button;
});

function sanitize(data = {}) {
  const allowed = (arr, choices) => Array.isArray(arr) ? arr.filter(v => choices.includes(v)) : [];
  return {
    scenes: allowed(data.scenes, SCENES), genres: allowed(data.genres, GENRES),
    lines: String(data.lines ?? "").slice(0, 5000).trim(),
    veils: String(data.veils ?? "").slice(0, 5000).trim()
  };
}

async function openSafeguard() {
  if (game.user.isGM) return openGM();
  return openPlayer();
}

function dialogWindow({title, content, buttons, width=560}) {
  return new Dialog({ title, content, buttons, default: Object.keys(buttons)[0] }, { width }).render(true);
}

function checkedSet(values=[]) { return new Set(values); }
function checkboxGroup(title, name, options, selected) {
  return `<fieldset><legend>${title}</legend><div class="sg-grid">${options.map(o =>
    `<label><input type="checkbox" name="${name}" value="${o}" ${selected.has(o) ? "checked" : ""}> <span>${o}</span></label>`
  ).join("")}</div></fieldset>`;
}

function openPlayer() {
  const responses = game.settings.get(MODULE_ID, "responses") ?? {};
  const mine = responses[game.user.id] ?? {scenes:[], genres:[], lines:"", veils:""};
  const content = `<form class="safeguard-form">
    <p class="sg-note"><strong>Your preferences are editable at any time.</strong> Safeguard presents results anonymously in the GM dashboard. Foundry administrators can still access world data, so this is application-level anonymity rather than cryptographic anonymity.</p>
    ${checkboxGroup("What kinds of scenes would you like to see?", "scenes", SCENES, checkedSet(mine.scenes))}
    ${checkboxGroup("What genres or tones interest you?", "genres", GENRES, checkedSet(mine.genres))}
    <fieldset><legend>Lines</legend><p>Content you do not want included in the game.</p><textarea name="lines" rows="5" maxlength="5000" placeholder="Enter one or more Lines…">${foundry.utils.escapeHTML(mine.lines ?? "")}</textarea></fieldset>
    <fieldset><legend>Veils</legend><p>Content that may exist, but should happen off-screen or without detailed description.</p><textarea name="veils" rows="5" maxlength="5000" placeholder="Enter one or more Veils…">${foundry.utils.escapeHTML(mine.veils ?? "")}</textarea></fieldset>
  </form>`;
  dialogWindow({ title: "Safeguard — My Preferences", content, buttons: {
    save: { icon: '<i class="fas fa-save"></i>', label: "Save", callback: html => {
      const root = html[0];
      const data = {
        scenes: [...root.querySelectorAll('input[name="scenes"]:checked')].map(x=>x.value),
        genres: [...root.querySelectorAll('input[name="genres"]:checked')].map(x=>x.value),
        lines: root.querySelector('[name="lines"]').value,
        veils: root.querySelector('[name="veils"]').value
      };
      game.socket.emit(`module.${MODULE_ID}`, { action: "submit", userId: game.user.id, data });
      ui.notifications.info("Safeguard preferences submitted.");
    }},
    cancel: { label: "Cancel" }
  }});
}

function countMap(responses, field, choices) {
  return Object.fromEntries(choices.map(c => [c, responses.filter(r => r[field]?.includes(c)).length]));
}
function listText(responses, field) {
  return responses.flatMap(r => String(r[field] ?? "").split(/\r?\n/).map(x=>x.trim()).filter(Boolean));
}
function resultBars(title, counts, total) {
  return `<section><h3>${title}</h3>${Object.entries(counts).map(([k,v]) => `<div class="sg-result"><span>${k}</span><meter min="0" max="${Math.max(total,1)}" value="${v}"></meter><strong>${v}</strong></div>`).join("")}</section>`;
}
function anonymousList(title, values) {
  return `<section><h3>${title}</h3>${values.length ? `<ul>${values.map(v=>`<li>${foundry.utils.escapeHTML(v)}</li>`).join("")}</ul>` : `<p><em>No ${title.toLowerCase()} submitted.</em></p>`}</section>`;
}

function openGM() {
  const all = game.settings.get(MODULE_ID, "responses") ?? {};
  const playerIds = game.users.filter(u => !u.isGM).map(u => u.id);
  const responses = playerIds.filter(id => all[id]).map(id => all[id]);
  const totalPlayers = playerIds.length;
  const n = responses.length;
  const threshold = Math.max(1, Number(game.settings.get(MODULE_ID, "minResponses") || 3));
  let body = `<p><strong>Responses: ${n} of ${totalPlayers} players</strong></p>`;
  if (n < threshold) body += `<div class="sg-warning"><i class="fas fa-user-shield"></i> Results are hidden until at least ${threshold} players have submitted, reducing the chance of identifying an individual response.</div>`;
  else body += resultBars("Scene Preferences", countMap(responses,"scenes",SCENES),n) + resultBars("Genre Preferences",countMap(responses,"genres",GENRES),n) + anonymousList("Lines",listText(responses,"lines")) + anonymousList("Veils",listText(responses,"veils"));
  body += `<p class="sg-note">Safeguard intentionally does not show which player submitted which response. World administrators may still be able to inspect stored Foundry data.</p>`;
  dialogWindow({ title:"Safeguard — GM Dashboard", content:`<div class="safeguard-dashboard">${body}</div>`, width:650, buttons:{
    close:{label:"Close"},
    clear:{icon:'<i class="fas fa-trash"></i>',label:"Clear All Responses",callback: async()=>{
      const ok = await Dialog.confirm({title:"Clear Safeguard Responses?",content:"<p>This permanently clears all current Safeguard responses for this world.</p>"});
      if(ok){ await game.settings.set(MODULE_ID,"responses",{}); ui.notifications.info("Safeguard responses cleared."); }
    }}
  }});
}
