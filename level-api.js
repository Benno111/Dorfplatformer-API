(function () {
  "use strict";

  function q(id) {
    return document.getElementById(id);
  }

  var baseUrlInput = q("baseUrl");
  var authTokenInput = q("authToken");
  var accountUsernameInput = q("accountUsername");
  var levelIdInput = q("levelId");
  var levelNameInput = q("levelName");
  var authorInput = q("author");
  var levelDataInput = q("levelData");
  var output = q("output");
  var uploadBtn = q("uploadBtn");
  var listBtn = q("listBtn");

  function log(msg, cssClass) {
    var line = "[" + new Date().toISOString() + "] " + msg;
    if (cssClass) {
      output.innerHTML += '<span class="' + cssClass + '">' + escapeHtml(line) + "</span>\n";
    } else {
      output.textContent += line + "\n";
    }
    output.scrollTop = output.scrollHeight;
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeBaseUrl(url) {
    return (url || "").trim().replace(/\/+$/, "");
  }

  function authQuery(token) {
    var t = (token || "").trim();
    if (!t) return "";
    return "?auth=" + encodeURIComponent(t);
  }

  function sanitizePart(raw, fallbackValue) {
    var v = (raw || "").trim().replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!v) return fallbackValue || "level";
    return v;
  }

  function makeLevelId(username, levelName) {
    var userPart = sanitizePart(username, "user");
    var levelPart = sanitizePart(levelName, "level");
    return userPart + "-" + levelPart;
  }

  async function uploadLevel() {
    var base = normalizeBaseUrl(baseUrlInput.value);
    var token = authTokenInput.value;
    var accountUsername = ((accountUsernameInput && accountUsernameInput.value) || (authorInput && authorInput.value) || "").trim();
    var levelNameRaw = (levelNameInput.value || levelIdInput.value || "").trim();
    var levelId = makeLevelId(accountUsername, levelNameRaw);
    var levelName = sanitizePart(levelNameRaw, "level");
    var owner = sanitizePart(accountUsername, "");
    var data = levelDataInput.value || "";

    if (!base) {
      log("Base URL is required.", "err");
      return;
    }
    if (!owner) {
      log("Account username is required.", "err");
      return;
    }
    if (!data.trim()) {
      log("Level data is empty.", "err");
      return;
    }

    var url = base + "/levels/" + encodeURIComponent(levelId) + ".json" + authQuery(token);
    var nowSeconds = Math.floor(Date.now() / 1000);
    var payload = {
      name: levelName,
      owner: owner,
      level_id: levelId,
      data: data,
      uploaded_at: nowSeconds,
      source: "df-new-gh-pages-uploader"
    };

    log("Uploading level '" + levelId + "' to " + url);
    try {
      var res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      var txt = await res.text();
      if (!res.ok) {
        log("Upload failed: HTTP " + res.status + " " + txt, "err");
        return;
      }
      log("Upload succeeded. Response: " + txt, "ok");
      levelIdInput.value = levelId;
    } catch (err) {
      log("Upload error: " + String(err), "err");
    }
  }

  async function listLevels() {
    var base = normalizeBaseUrl(baseUrlInput.value);
    var token = authTokenInput.value;
    var accountUsername = ((accountUsernameInput && accountUsernameInput.value) || (authorInput && authorInput.value) || "").trim();
    var ownerPrefix = sanitizePart(accountUsername, "");
    if (!base) {
      log("Base URL is required.", "err");
      return;
    }
    var query = "shallow=true";
    if ((token || "").trim()) {
      query += "&auth=" + encodeURIComponent(token.trim());
    }
    var url = base + "/levels.json?" + query;
    log("Fetching level IDs from " + url);
    try {
      var res = await fetch(url, { method: "GET" });
      var text = await res.text();
      if (!res.ok) {
        log("List failed: HTTP " + res.status + " " + text, "err");
        return;
      }
      var json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch (e) {
        log("List parse error: " + String(e), "err");
        return;
      }
      var ids = Object.keys(json || {}).sort();
      if (ownerPrefix) {
        ids = ids.filter(function (id) { return id.indexOf(ownerPrefix + "-") === 0; });
        log("Filtered by owner '" + ownerPrefix + "'.", "ok");
      }
      log("Level count: " + ids.length, "ok");
      log("IDs: " + (ids.length ? ids.join(", ") : "<none>"));
    } catch (err) {
      log("List error: " + String(err), "err");
    }
  }

  uploadBtn.addEventListener("click", function () {
    uploadLevel();
  });
  listBtn.addEventListener("click", function () {
    listLevels();
  });

  log("Ready. Uploads use the ID format username-levelname.");
})();
