// ✅ app.js — Sentinel: Script Logger + Prompt Shield + Upload Shield + Exposure Logger + Smart Logging
console.log("✅ app.js loaded!");

fetch("http://localhost:5000/log-scripts", {
  method: "POST",
  ...
});

window.addEventListener('load', () => {
  console.log("📦 Script logger running...");

  // ========== SCRIPT LOGGER ==========
  const scripts = Array.from(document.scripts)
    .map(script => script.src)
    .filter(src => src);

  const AI_DOMAINS = [
    "openai.com",
    "cdn.elevenlabs.io",
    "huggingface.co",
    "stability.ai",
    "anthropic.com",
    "replicate.delivery",
    "bard.google.com",
    "azureedge.net",
    "chat.openai.com"
  ];

  // Load user whitelist (Option C)
  const userWhitelist = JSON.parse(localStorage.getItem("whitelistedScripts") || "[]");
  const loggedScripts = JSON.parse(sessionStorage.getItem("loggedScripts") || "[]");

  function isAIScript(src) {
    return AI_DOMAINS.some(domain => src.includes(domain));
  }

  function showAIWarning(scriptURL) {
    const alert = document.createElement('div');
    alert.innerHTML = `
      ⚠️ <strong>AI Tracker Detected:</strong> ${scriptURL}<br>
      <small>Click to trust and hide this warning in future.</small>
    `;
    Object.assign(alert.style, {
      position: "fixed", bottom: "10px", left: "10px",
      background: "#ff4d4d", color: "white", padding: "12px 18px",
      zIndex: 9999, borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.3)",
      fontSize: "14px", fontFamily: "Arial, sans-serif",
      cursor: "pointer"
    });

    alert.addEventListener("click", () => {
      userWhitelist.push(scriptURL);
      localStorage.setItem("whitelistedScripts", JSON.stringify(userWhitelist));
      alert.remove();
      console.log("📝 Whitelisted:", scriptURL);
    });

    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 10000);
  }

  const flaggedScripts = [];

  scripts.forEach(script => {
    if (isAIScript(script)) {
      if (!userWhitelist.includes(script) && !loggedScripts.includes(script)) {
        showAIWarning(script);
        flaggedScripts.push({ url: script, tag: "AI" });
        loggedScripts.push(script);
      }
    } else {
      flaggedScripts.push({ url: script, tag: "Safe" });
    }
  });

  sessionStorage.setItem("loggedScripts", JSON.stringify(loggedScripts));

  // Log to backend
  if (flaggedScripts.length > 0) {
    fetch('/log-scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        url: window.location.href,
        scripts: flaggedScripts,
        log_type: flaggedScripts.some(s => s.tag === "AI") ? "AI" : "Safe",
        source: "ScriptLogger"
      })
    })
      .then(res => res.json())
      .then(data => console.log("✅ Logged to backend:", data))
      .catch(err => console.warn("❌ Script logging failed:", err));
  }

  // ========== EXPOSURE LOGGER ==========
  const sensitiveFields = ["email", "password", "name", "address", "phone"];

  function logExposure(inputName, value) {
    const exposureLog = {
      timestamp: new Date().toISOString(),
      inputName,
      value
    };

    let logs = JSON.parse(localStorage.getItem("exposures") || "[]");
    logs.push(exposureLog);
    localStorage.setItem("exposures", JSON.stringify(logs));

    console.log("🧾 Exposure logged:", exposureLog);
  }

  document.querySelectorAll("input").forEach(input => {
    const name = input.name?.toLowerCase() || input.id?.toLowerCase() || "";
    if (sensitiveFields.some(field => name.includes(field))) {
      input.addEventListener("blur", () => {
        logExposure(name, input.value);
      });
    }
  });

  // ========== PROMPT SHIELD ==========
  const isOnAIDomain = true; // force for local testing

  if (isOnAIDomain) {
    const showPromptWarning = () => {
      const warning = document.createElement('div');
      warning.innerHTML = `⚠️ <strong>Prompt Shield:</strong> You're typing into an AI tool. Your prompt may be saved or used for training.`;
      Object.assign(warning.style, {
        position: "fixed", bottom: "60px", left: "10px",
        background: "#ffcc00", color: "#000", padding: "12px 18px",
        zIndex: 9999, borderRadius: "8px", boxShadow: "0 0 6px rgba(0,0,0,0.2)",
        fontFamily: "Arial, sans-serif"
      });
      document.body.appendChild(warning);
      setTimeout(() => warning.remove(), 10000);
    };

    const watchInputs = () => {
      const inputs = [...document.querySelectorAll("textarea, input[type='text']")];
      inputs.forEach(input => {
        input.addEventListener('keydown', () => {
          if (!sessionStorage.getItem("promptWarned")) {
            showPromptWarning();
            sessionStorage.setItem("promptWarned", "true");
          }
        });
      });
    };

    setInterval(watchInputs, 2000);
  }

  // ========== UPLOAD SHIELD ==========
  const showUploadWarning = () => {
    const warning = document.createElement('div');
    warning.innerHTML = `⚠️ <strong>Upload Shield:</strong> You're uploading a file to an AI tool. Your file may be stored, scanned, or reused.`;
    Object.assign(warning.style, {
      position: "fixed", bottom: "110px", left: "10px",
      background: "#ff9900", color: "white", padding: "12px 18px",
      zIndex: 9999, borderRadius: "8px", boxShadow: "0 0 8px rgba(0,0,0,0.3)",
      fontSize: "14px", fontFamily: "Arial, sans-serif"
    });
    document.body.appendChild(warning);
    setTimeout(() => warning.remove(), 10000);
  };

  const watchFileInputs = () => {
    const fileInputs = [...document.querySelectorAll("input[type='file']")];
    fileInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (!sessionStorage.getItem("uploadWarned")) {
          showUploadWarning();
          sessionStorage.setItem("uploadWarned", "true");
        }
      });
    });
  };

  setInterval(watchFileInputs, 2000);
});
