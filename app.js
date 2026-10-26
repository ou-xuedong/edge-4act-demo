(function () {
  var DECODE_NOTE = "H.264 预览未能解码。请确认 media/*.mp4 已生成；原片 HEVC MOV 仍在软链上。";
  var FOOTNOTE = "原计划 2cm，现场先用 3cm";

  var ACTS = [
    {
      id: "act-1",
      num: "01",
      nav: "大模型示教",
      kicker: "幕 1 · 占位",
      title: "大模型示教",
      body: "人控制示教臂完成采数。大模型在云端教技能、改技能包。示教录屏还没有，这一幕先用侧面摄像头静图。",
      placeholder: "占位：示教录屏待补",
      footnote: "",
      caption: "侧面摄像头.png",
      media: {
        kind: "image",
        src: "media/act1-side-camera.png",
        alt: "侧面机位静图：夹爪旁装着摄像头，背景有方块。这不是示教录屏。"
      }
    },
    {
      id: "act-2",
      num: "02",
      nav: "端侧离线作业",
      kicker: "幕 2 · 实录",
      title: "端侧离线作业",
      body: "技能包在端侧。现场离线完成 4cm 方块夹取。下面是这次任务成功的录像。",
      placeholder: "",
      footnote: "",
      caption: "4cm夹取任务成功.mp4",
      media: {
        kind: "video",
        src: "media/act2-4cm-success.mp4",
        label: "4cm 夹取任务成功。端侧离线作业实录。"
      }
    },
    {
      id: "act-3",
      num: "03",
      nav: "回基地分析迭代",
      kicker: "幕 3 · 占位",
      title: "回基地分析迭代",
      body: "3cm 方块夹取失败后，设备原路回退并留下记录。记录回到基地，用于归因和修改技能包。基地分析录屏还没有，这一幕用失败录像表示证据回传。",
      placeholder: "占位：真实分析录屏待补。画面是失败证据回传，不是基地分析过程。",
      footnote: FOOTNOTE,
      caption: "3cm 夹取失败原路回退记录失败任务.mp4",
      media: {
        kind: "video",
        src: "media/act3-3cm-fail-return.mp4",
        label: "3cm 夹取失败并原路回退。此处只作失败证据回传的占位。"
      }
    },
    {
      id: "act-4",
      num: "04",
      nav: "再次离线验证",
      kicker: "幕 4 · 实录",
      title: "再次离线验证",
      body: "云端改进后的技能包回到端侧。再次离线，3cm 方块夹取成功。",
      placeholder: "",
      footnote: FOOTNOTE,
      caption: "大模型 harness 技能包改进后3cm 成功夹取.mp4",
      media: {
        kind: "video",
        src: "media/act4-3cm-success.mp4",
        label: "技能包改进后的 3cm 夹取成功。原计划 2cm，现场先用 3cm。"
      }
    }
  ];

  var nav = document.getElementById("act-nav");
  var frame = document.getElementById("stage-frame");
  var caption = document.getElementById("stage-caption");
  var statusEl = document.getElementById("media-status");
  var kicker = document.getElementById("kicker");
  var title = document.getElementById("title");
  var body = document.getElementById("body");
  var placeholder = document.getElementById("placeholder");
  var footnote = document.getElementById("footnote");
  var current = -1;

  ACTS.forEach(function (act, index) {
    var button = document.createElement("button");
    button.type = "button";
    button.id = "tab-" + act.id;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-controls", "intro");
    button.setAttribute("aria-selected", "false");
    button.tabIndex = -1;
    var num = document.createElement("span");
    num.className = "num";
    num.textContent = act.num;
    var label = document.createElement("span");
    label.className = "label";
    label.textContent = act.nav;
    button.append(num, label);
    button.addEventListener("click", function () {
      select(index, "push");
    });
    nav.append(button);
  });

  nav.addEventListener("keydown", function (event) {
    var tabs = Array.prototype.slice.call(nav.querySelectorAll('[role="tab"]'));
    var index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    var next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    select(next, "push");
  });

  window.addEventListener("hashchange", function () {
    select(indexFromHash(), "none");
  });

  window.addEventListener("popstate", function () {
    select(indexFromHash(), "none");
  });

  select(indexFromHash(), "replace");

  function indexFromHash() {
    var match = /^#act-([1-4])$/.exec(location.hash);
    return match ? Number(match[1]) - 1 : 0;
  }

  function select(index, historyMode) {
    if (index < 0 || index >= ACTS.length) index = 0;
    if (index === current) return;
    current = index;
    var act = ACTS[index];

    var tabs = nav.querySelectorAll('[role="tab"]');
    Array.prototype.forEach.call(tabs, function (tab, tabIndex) {
      var selected = tabIndex === index;
      tab.setAttribute("aria-selected", selected ? "true" : "false");
      tab.tabIndex = selected ? 0 : -1;
    });

    setText(kicker, act.kicker);
    setText(title, act.title);
    setText(body, act.body);
    setOptional(placeholder, act.placeholder);
    renderFootnote(act.footnote);
    setText(caption, act.caption);
    renderMedia(act);
    document.title = "EDGE · " + act.title;
    document.getElementById("intro").setAttribute("aria-labelledby", "tab-" + act.id);
    writeHash("#" + act.id, historyMode);
  }

  function writeHash(hash, historyMode) {
    if (historyMode !== "push" && historyMode !== "replace") return;
    if (location.hash === hash) return;
    try {
      if (historyMode === "push") history.pushState(null, "", hash);
      else history.replaceState(null, "", hash);
    } catch (err) {
      location.hash = hash;
    }
  }

  function renderMedia(act) {
    frame.replaceChildren();
    frame.dataset.mediaSrc = act.media.src;
    showStatus("");
    if (act.placeholder) {
      var badge = document.createElement("p");
      badge.className = "badge";
      badge.textContent = "占位";
      frame.append(badge);
    }
    if (act.media.kind === "image") {
      var img = document.createElement("img");
      img.src = act.media.src;
      img.alt = act.media.alt;
      img.addEventListener("error", function () {
        showStatus("静图没有加载。请确认 media/act1-side-camera.png 仍指向侧面摄像头.png。");
      });
      frame.append(img);
      return;
    }
    var video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = act.media.src;
    video.setAttribute("aria-label", act.media.label);
    video.addEventListener("loadedmetadata", function () {
      syncDecodeNote(video);
    });
    video.addEventListener("resize", function () {
      syncDecodeNote(video);
    });
    video.addEventListener("error", function () {
      syncDecodeNote(video);
    });
    frame.append(video);
  }

  function syncDecodeNote(video) {
    var note = frame.querySelector(".decode-note");
    if (video.videoWidth > 0) {
      if (note) note.remove();
      showStatus("");
      return;
    }
    showStatus("");
    if (!note) {
      note = document.createElement("p");
      note.className = "decode-note";
      note.setAttribute("role", "status");
      frame.append(note);
    }
    note.textContent = DECODE_NOTE;
  }

  function renderFootnote(text) {
    footnote.replaceChildren();
    if (!text) {
      footnote.hidden = true;
      return;
    }
    var mark = document.createElement("span");
    mark.textContent = "脚注";
    footnote.append(mark, document.createTextNode(" " + text));
    footnote.hidden = false;
  }

  function setText(node, text) {
    node.textContent = text;
  }

  function setOptional(node, text) {
    node.hidden = !text;
    node.textContent = text || "";
  }

  function showStatus(text) {
    statusEl.hidden = !text;
    statusEl.textContent = text || "";
  }

})();
