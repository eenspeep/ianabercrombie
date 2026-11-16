/* XPShare renderer. Pages call XPS.boot('index' | 'board' | 'thread' | 'user').
   XPS.load() resolves to the whole story dataset; phase 2 swaps its source
   from XPS_SAMPLE to Firestore without touching the page renderers. */
(function () {
  'use strict';
  var XPS = window.XPS = {};

  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(n) { return Number(n || 0).toLocaleString('en-US'); }
  function param(k) { return new URLSearchParams(location.search).get(k); }
  function parse(t) { return new Date(String(t).length <= 10 ? t + 'T00:00Z' : t + 'Z'); }

  function clock(d) {
    var h = d.getUTCHours(), m = d.getUTCMinutes();
    return ((h % 12) || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'am' : 'pm');
  }
  function fmtDate(t) {
    var d = parse(t);
    return DAYS[d.getUTCDay()] + ' ' + MONTHS[d.getUTCMonth()] + ' ' + (d.getUTCDate() < 10 ? '0' : '') + d.getUTCDate() + ', ' + d.getUTCFullYear() + ' ' + clock(d);
  }
  function fmtDay(t) {
    var d = parse(t);
    return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear();
  }
  function fmtShort(t, now) {
    var d = parse(t), n = parse(now);
    var days = Math.floor(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate()) / 864e5) -
               Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 864e5);
    if (days === 0) return 'Today, ' + clock(d);
    if (days === 1) return 'Yesterday, ' + clock(d);
    return fmtDay(t) + ' ' + clock(d);
  }

  /* ---------- BBCode ---------- */
  var SMILEYS = { ':)': 'M5 9.5q3 3 6 0', ':(': 'M5 11.5q3 -3 6 0', ':D': 'M4.5 9h7q-3.5 5 -7 0z', ';)': 'M5 9.5q3 3 6 0', ':P': 'M5 9.5h6M8 9.5v2.5h2v-2.5' };
  function smiley(code) {
    var wink = code === ';)';
    return '<svg class="smiley" width="16" height="16" viewBox="0 0 16 16" role="img" aria-label="' + esc(code) + '">' +
      '<circle cx="8" cy="8" r="7" fill="#ffd83a" stroke="#b98200"/><ellipse cx="8" cy="4.5" rx="4.5" ry="2.5" fill="#fff" opacity=".6"/>' +
      (wink ? '<path d="M4.5 6.5h2" stroke="#000" fill="none"/>' : '<circle cx="5.6" cy="6.3" r="1"/>') + '<circle cx="10.4" cy="6.3" r="1"/>' +
      '<path d="' + SMILEYS[code] + '" fill="' + (code === ':D' ? '#fff' : 'none') + '" stroke="#000" stroke-linecap="round"/></svg>';
  }
  function bb(src) {
    var s = esc(src), prev;
    s = s.replace(/\[(\/?)(b|i|u|s)\]/gi, '<$1$2>');
    s = s.replace(/\[color=(#[0-9a-f]{3,6}|[a-z]+)\]([\s\S]*?)\[\/color\]/gi, '<span style="color:$1">$2</span>');
    s = s.replace(/\[url=((?:https?:\/\/|[a-z0-9_.\-]+\.html)[^\]\s"]*)\]([\s\S]*?)\[\/url\]/gi, '<a href="$1">$2</a>');
    s = s.replace(/\[img\](https?:\/\/[^\[\s"]+)\[\/img\]/gi, '<img src="$1" alt="">');
    s = s.replace(/\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, '<span class="spoiler" tabindex="0" title="Hover to reveal">$1</span>');
    do {
      prev = s;
      s = s.replace(/\[quote(?:=([^\]]+))?\]((?:(?!\[quote)[\s\S])*?)\[\/quote\]\n?/i, function (m, who, text) {
        return '<div class="quote"><div class="quote-by">' + (who ? who + ' wrote:' : 'Quote:') + '</div><div class="quote-text">' + text + '</div></div>';
      });
    } while (s !== prev);
    s = s.replace(/(^|\s)(:\)|:\(|:D|;\)|:P)(?=\s|$)/g, function (m, pre, code) { return pre + smiley(code); });
    return s.replace(/\n/g, '<br>');
  }
  XPS.bb = bb;

  /* ---------- data ---------- */
  function index(db) {
    db.byId = {}; db.boardBySlug = {}; db.threadById = {};
    db.identities.forEach(function (u) { db.byId[u.id] = u; u.posts = u.postOffset || 0; });
    db.boards.forEach(function (b) { db.boardBySlug[b.slug] = b; b.threads = []; b.postCount = 0; b.lastPost = null; });
    db.threads.forEach(function (t) { db.threadById[t.id] = t; t.posts = []; });
    db.posts.sort(function (a, b) { return a.time < b.time ? -1 : a.time > b.time ? 1 : 0; });
    db.posts.forEach(function (p) {
      var t = db.threadById[p.thread]; if (!t) return;
      t.posts.push(p);
      if (db.byId[p.author]) db.byId[p.author].posts++;
    });
    db.threads = db.threads.filter(function (t) { return t.posts.length; });
    db.threads.forEach(function (t) {
      var b = db.boardBySlug[t.board]; if (!b) return;
      t.last = t.posts[t.posts.length - 1];
      b.threads.push(t); b.postCount += t.posts.length;
      if (!b.lastPost || t.last.time > b.lastPost.time) b.lastPost = t.last;
    });
    db.boards.forEach(function (b) {
      b.threads.sort(function (x, y) { return (y.sticky ? 1 : 0) - (x.sticky ? 1 : 0) || (x.last.time < y.last.time ? 1 : -1); });
    });
    return db;
  }
  XPS.load = function () {
    return Promise.resolve(index(JSON.parse(JSON.stringify(window.XPS_SAMPLE))));
  };

  /* ---------- shared pieces ---------- */
  function avatar(u, size) {
    size = size || 80;
    if (u.avatarUrl) return '<img class="avatar" src="' + esc(u.avatarUrl) + '" width="' + size + '" height="' + size + '" alt="">';
    var init = esc(u.name.replace(/[^a-z0-9]/gi, '').slice(0, 2).toUpperCase());
    return '<svg class="avatar" width="' + size + '" height="' + size + '" viewBox="0 0 80 80" role="img" aria-label="' + esc(u.name) + '">' +
      '<rect width="80" height="80" fill="' + esc(u.color || '#29a9e8') + '"/><circle cx="40" cy="70" r="46" fill="#000" opacity=".16"/>' +
      '<ellipse cx="40" cy="6" rx="52" ry="30" fill="#fff" opacity=".4"/>' +
      '<text x="40" y="52" text-anchor="middle" font-family="Trebuchet MS, Tahoma, sans-serif" font-size="30" font-weight="bold" fill="#fff">' + init + '</text></svg>';
  }
  function userLink(u) {
    if (!u) return '<i>Guest</i>';
    var color = u.staff === 'admin' ? '#c62a1a' : u.staff === 'mod' ? '#2f7a05' : '';
    return '<a href="user.html?u=' + encodeURIComponent(u.id) + '"' + (color ? ' style="color:' + color + ';font-weight:bold"' : '') + '>' + esc(u.name) + '</a>';
  }
  function flair(u) {
    return u.flair ? '<span class="flair" style="--fc:' + esc(u.flair.color || '#0b6fb8') + '">' + esc(u.flair.text) + '</span>' : '';
  }
  function xp(n) { return '<span class="xp"><i class="coin"></i>' + num(n) + ' XP</span>'; }
  function pips(n) { var s = ''; for (var i = 0; i < (n || 0); i++) s += '<i></i>'; return '<span class="pips">' + s + '</span>'; }
  function lockSvg() {
    return '<svg width="14" height="14" viewBox="0 0 14 14" aria-label="Locked"><rect x="2.5" y="6" width="9" height="6.5" rx="1" fill="#fff"/><path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" fill="none" stroke="#fff" stroke-width="1.6"/></svg>';
  }
  function lastCell(db, p, t) {
    if (!p) return '<span class="small">No posts</span>';
    return fmtShort(p.time, db.meta.storyNow) + '<br>' + (t ? 'in <a href="thread.html?t=' + t.id + '">' + esc(t.title.length > 26 ? t.title.slice(0, 24) + '…' : t.title) + '</a> ' : '') + 'by ' + userLink(db.byId[p.author]);
  }
  function listingCard(db, m) {
    var seller = db.byId[m.seller], buyer = m.buyer && db.byId[m.buyer], sold = m.status === 'sold';
    var title = m.thread ? '<a href="thread.html?t=' + m.thread + '">' + esc(m.title) + '</a>' : esc(m.title);
    return '<div class="listing' + (sold ? ' sold' : '') + '"><h3>' + title + '</h3><p>' + esc(m.teaser) + '</p>' +
      '<div class="foot"><span>' + xp(m.price) + '</span><span>' + (sold ? '<span class="sold-stamp">SOLD</span>' : '<a class="btn lime" href="#" data-login>Buy</a>') + '</span></div>' +
      '<div class="small">Seller: ' + userLink(seller) + (sold ? ' &middot; Buyer: ' + (buyer ? userLink(buyer) : '<i>private</i>') : '') + '</div></div>';
  }

  function chrome(db, page, crumbs) {
    var m = db.meta, now = parse(m.storyNow);
    document.getElementById('xps-header').innerHTML =
      '<div class="topbar"><a class="logo" href="index.html"><span class="logo-orb">XP</span>' +
      '<span><span class="logo-word">XP<b>Share</b></span><span class="logo-tag">SHARE THE EXPERIENCE&trade;</span></span></a>' +
      '<div class="topbar-right">Welcome, <b>Guest</b>. <a href="#" data-login>Log in</a> or <a href="#" data-login>Register</a><br>' +
      fmtDate(m.storyNow) + '<br><span class="rate"><i class="coin"></i>1,000 XP = $' + m.xpRate.toFixed(2) + ' USD <span class="up">&#9650; 0.07</span></span></div></div>' +
      '<nav class="nav"><a href="index.html"' + (page === 'index' ? ' class="on"' : '') + '>Forums</a>' +
      '<a href="board.html?b=exchange"' + (param('b') === 'exchange' ? ' class="on"' : '') + '>Memory Exchange</a>' +
      '<a href="board.html?b=announcements">News</a><a href="board.html?b=help">Help</a>' +
      '<a href="#" data-login>My XP</a><a href="#" data-login>Cash Out</a></nav>' +
      '<div class="crumbs">' + [['XPShare', 'index.html']].concat(crumbs || []).map(function (c, i, a) {
        return i === a.length - 1 ? '<b>' + esc(c[0]) + '</b>' : '<a href="' + c[1] + '">' + esc(c[0]) + '</a>';
      }).join(' &raquo; ') + '</div>';

    document.getElementById('xps-footer').innerHTML =
      '<div class="foot"><div class="badges"><span class="b88">XPShare<br>4.0</span><span class="b88 g">GET XP<br>NOW!</span>' +
      '<span class="b88 k">IE 6<br>READY</span><span class="b88 o">VALID<br>HTML 4.01</span></div>' +
      'You are visitor <span class="counter">' + String(m.hits).replace(/\B(?=(\d{3})+$)/g, '') + '</span><br><br>' +
      'Powered by <b>XPBoard 4.0.2</b> &copy; 2001&ndash;' + now.getUTCFullYear() + ' XPShare Networks, Inc. All rights reserved. All transfers are final.<br>' +
      'Best viewed in Internet Explorer 6 at 1024&times;768. Page generated in 0.0412 seconds.</div>';

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('[data-login]');
      if (a) { e.preventDefault(); dialog('XPShare', 'You must be logged in to do that.'); }
    });
  }
  function dialog(title, text) {
    var d = document.createElement('div');
    d.className = 'dlg-back';
    d.innerHTML = '<div class="panel dlg" role="dialog" aria-modal="true"><div class="panel-head">' + esc(title) + '</div>' +
      '<div class="panel-body"><p>' + esc(text) + '</p><button class="btn" type="button">OK</button></div></div>';
    d.addEventListener('click', function (e) { if (e.target === d || e.target.tagName === 'BUTTON') d.remove(); });
    document.body.appendChild(d);
    d.querySelector('button').focus();
  }
  function main(html) { document.getElementById('xps-main').innerHTML = html; }
  function notFound(db, what) {
    chrome(db, '', [['Error']]);
    main('<div class="panel"><div class="panel-head">XPShare Message</div><div class="panel-body">The ' + what + ' you requested does not exist. <a href="index.html">Return to the forum index</a>.</div></div>');
  }

  /* ---------- pages ---------- */
  var pages = {};

  pages.index = function (db) {
    document.title = 'XPShare — Share the Experience';
    chrome(db, 'index');
    var sold = db.listings.filter(function (m) { return m.status === 'sold'; });
    var h = '<div class="panel"><div class="panel-body welcome"><span class="orb lime" style="width:46px;height:46px;flex:none">XP</span><div>' +
      '<h1>Welcome to XPShare!</h1><p>The world\'s #1 entertainment community. Share your memories, earn <b>XP</b>, and spend it on anything &mdash; including real cash. ' +
      '<a href="#" data-login>Register free</a> and get <b>500 XP</b> just for signing up.</p></div></div>' +
      '<div class="ticker" aria-label="Recently sold"><div class="ticker-track">' + sold.concat(sold).map(function (m) {
        return '<span><b>SOLD</b> &middot; ' + esc(m.title) + ' &middot; ' + xp(m.price) + '</span>';
      }).join('') + '</div></div></div>';

    db.categories.forEach(function (c) {
      var boards = db.boards.filter(function (b) { return b.category === c.id; });
      h += '<div class="panel"><div class="panel-head' + (c.lime ? ' lime' : '') + '">' + esc(c.title) + '</div><table class="list">' +
        '<tr><th></th><th>Forum</th><th class="c hide-sm">Threads</th><th class="c hide-sm">Posts</th><th class="hide-sm">Last Post</th></tr>' +
        boards.map(function (b) {
          var locked = !!b.lockKey;
          return '<tr><td class="ico"><span class="orb ' + (b.orb || '') + '">' + (locked ? lockSvg() : esc(b.icon)) + '</span></td>' +
            '<td><a class="btitle" href="board.html?b=' + b.slug + '">' + esc(b.title) + '</a><br><span class="small">' + esc(b.desc) + '</span></td>' +
            '<td class="c hide-sm">' + (locked ? '&mdash;' : num(b.threads.length)) + '</td><td class="c hide-sm">' + (locked ? '&mdash;' : num(b.postCount)) + '</td>' +
            '<td class="last hide-sm">' + (locked ? '<span class="small">Private</span>' : lastCell(db, b.lastPost, b.lastPost && db.threadById[b.lastPost.thread])) + '</td></tr>';
        }).join('') + '</table></div>';
    });

    var online = db.identities.filter(function (u) { return u.online; });
    var newest = db.identities.slice().sort(function (a, b) { return a.joined < b.joined ? 1 : -1; })[0];
    h += '<div class="panel"><div class="panel-head">Who\'s Online</div><div class="panel-body">' +
      '<span class="dot on"></span>There are currently <b>1,204,' + (300 + online.length) + '</b> users online. Sharers you may know: ' +
      online.map(userLink).join(', ') + '<br><span class="small">Legend: <b style="color:#c62a1a">Administrator</b> &middot; <b style="color:#2f7a05">Moderator</b> &middot; Member</span></div></div>' +
      '<div class="panel"><div class="panel-head">XPShare Statistics</div><div class="panel-body">Members: <b>61,402,118</b> &middot; Memories shared: <b>212,907,455</b> &middot; ' +
      'XP in circulation: ' + xp(8841200300) + '<br>Welcome to our newest member, ' + userLink(newest) + '!</div></div>';
    main(h);
  };

  pages.board = function (db) {
    var b = db.boardBySlug[param('b')];
    if (!b) return notFound(db, 'forum');
    document.title = b.title + ' — XPShare';
    chrome(db, 'board', [[b.title]]);
    if (b.lockKey) {
      return main('<div class="panel"><div class="panel-head"><span class="orb sm grey">' + lockSvg() + '</span>' + esc(b.title) + '</div>' +
        '<div class="panel-body">You do not have permission to view this forum. ' + esc(b.desc) + '<br><br><a class="btn" href="#" data-login>Log in</a></div></div>');
    }
    var h = '';
    if (b.exchange) {
      h += '<div class="panel"><div class="panel-head lime">Featured Listings<span class="right">Rate: 1,000 XP = $' + db.meta.xpRate.toFixed(2) + '</span></div>' +
        '<div class="panel-body"><div class="listings">' + db.listings.map(function (m) { return listingCard(db, m); }).join('') + '</div></div></div>';
    }
    h += '<div class="actions"><a class="btn" href="#" data-login>New Thread</a><span class="small right">Page 1 of 1</span></div>' +
      '<div class="panel"><div class="panel-head">' + esc(b.title) + '</div><table class="list">' +
      '<tr><th></th><th>Thread</th><th class="c hide-sm">Replies</th><th class="c hide-sm">Views</th><th class="hide-sm">Last Post</th></tr>' +
      (b.threads.length ? b.threads.map(function (t) {
        var hasPoll = t.posts.some(function (p) { return p.poll; });
        return '<tr><td class="ico"><span class="orb sm ' + (t.locked ? 'grey' : t.sticky ? 'gold' : '') + '">' + (t.locked ? '' : t.sticky ? '!' : '') + '</span></td><td>' +
          (t.sticky ? '<span class="tag sticky">Sticky</span>' : '') + (t.locked ? '<span class="tag locked">Locked</span>' : '') + (hasPoll ? '<span class="tag poll">Poll</span>' : '') +
          '<a class="ttitle" href="thread.html?t=' + t.id + '">' + esc(t.title) + '</a><br><span class="small">by ' + userLink(db.byId[t.author]) + ' &middot; ' + fmtDay(t.posts[0].time) + '</span></td>' +
          '<td class="c hide-sm">' + num(t.posts.length - 1) + '</td><td class="c hide-sm">' + num(t.views) + '</td><td class="last hide-sm">' + lastCell(db, t.last) + '</td></tr>';
      }).join('') : '<tr><td colspan="5">There are no threads in this forum.</td></tr>') + '</table></div>';
    main(h);
  };

  function pollHtml(poll) {
    var total = poll.options.reduce(function (s, o) { return s + (o.votes || 0); }, 0) || 1;
    return '<div class="poll"><h4>Poll: ' + esc(poll.question) + '</h4>' + poll.options.map(function (o) {
      var pct = Math.round(100 * (o.votes || 0) / total);
      return '<div class="poll-row"><span>' + esc(o.text) + '</span><span class="bar"><i style="width:' + pct + '%"></i></span><span class="small">' + pct + '% (' + num(o.votes) + ')</span></div>';
    }).join('') + '<div class="small" style="margin-top:6px">Total votes: ' + num(total) + ' &middot; <a href="#" data-login>Log in to vote</a></div></div>';
  }
  function postHtml(db, p, n) {
    var u = db.byId[p.author] || { id: '', name: 'Guest', color: '#999' };
    var body = p.removed
      ? '[This post was removed by a moderator. Reason: Misinformation (ToS &sect;4.2)]'
      : (p.poll ? pollHtml(p.poll) : '') + bb(p.body);
    var reacts = Object.keys(p.reactions || {}).map(function (k) {
      return '<a class="btn ghost" href="#" data-login>' + esc(k) + ' <b>' + num(p.reactions[k]) + '</b></a>';
    }).join('');
    return '<div class="post' + (p.removed ? ' removed' : '') + '" id="' + esc(p.id) + '"><div class="post-user">' + avatar(u, 80) +
      '<div><span class="uname">' + userLink(u) + '</span><span class="rank">' + esc(u.rank || '') + '</span>' + pips(u.pips) + flair(u) + '</div>' +
      '<dl><dt>Joined:</dt><dd>' + (u.joined ? fmtDay(u.joined) : '—') + '</dd><dt>Posts:</dt><dd>' + num(u.posts) + '</dd>' +
      '<dt>Balance:</dt><dd>' + xp(u.xp) + '</dd>' + (u.location ? '<dt>From:</dt><dd>' + esc(u.location) + '</dd>' : '') +
      '<dt>Status:</dt><dd><span class="dot' + (u.online ? ' on' : '') + '"></span>' + (u.online ? 'Online' : 'Offline') + '</dd></dl></div>' +
      '<div class="post-main"><div class="post-meta"><span>Posted: ' + fmtDate(p.time) + '</span><span class="right"><a href="#' + esc(p.id) + '">#' + n + '</a></span></div>' +
      '<div class="post-body">' + body + '</div>' + (p.edited && !p.removed ? '<div class="post-edit">' + esc(p.edited) + '</div>' : '') +
      (u.signature && !p.removed ? '<div class="post-sig">' + bb(u.signature) + '</div>' : '') +
      '<div class="post-foot">' + reacts + '<span class="right"><a class="btn ghost" href="#" data-login>Quote</a><a class="btn ghost" href="#" data-login>Report</a></span></div></div></div>';
  }
  pages.thread = function (db) {
    var t = db.threadById[param('t')];
    if (!t) return notFound(db, 'thread');
    var b = db.boardBySlug[t.board];
    document.title = t.title + ' — XPShare';
    chrome(db, 'thread', [[b.title, 'board.html?b=' + b.slug], [t.title]]);
    var replyBtn = t.locked ? '<span class="btn ghost">Thread Locked</span>' : '<a class="btn" href="#" data-login>Post Reply</a>';
    main('<div class="actions">' + replyBtn + '<span class="small right">' + num(t.views) + ' views &middot; Page 1 of 1</span></div>' +
      '<div class="panel"><div class="panel-head">' + esc(t.title) + '</div>' + t.posts.map(function (p, i) { return postHtml(db, p, i + 1); }).join('') + '</div>' +
      '<div class="actions">' + replyBtn + '<a class="small right" href="board.html?b=' + b.slug + '">&laquo; Back to ' + esc(b.title) + '</a></div>' +
      (t.locked ? '' : '<div class="panel replybox"><div class="panel-head">Quick Reply</div><div class="panel-body"><textarea readonly aria-label="Quick reply">You must be logged in to reply to this thread.</textarea>' +
        '<div style="margin-top:6px"><a class="btn" href="#" data-login>Submit</a></div></div></div>') +
      '<div class="panel"><div class="panel-body small"><span class="dot on"></span>Users browsing this thread: ' + (3 + t.posts.length * 7) + ' (' + t.posts.length + ' members and ' + (3 + t.posts.length * 6) + ' guests)</div></div>');
    if (location.hash) { var el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }
  };

  pages.user = function (db) {
    var u = db.byId[param('u')];
    if (!u) return notFound(db, 'member');
    document.title = u.name + ' — XPShare';
    chrome(db, 'user', [['Members'], [u.name]].slice(1));
    var posts = db.posts.filter(function (p) { return p.author === u.id && !p.removed && db.threadById[p.thread]; }).reverse().slice(0, 8);
    var mine = db.listings.filter(function (m) { return m.seller === u.id || m.buyer === u.id; });
    var bannerStyle = u.bannerUrl ? 'background-image:url(&quot;' + esc(u.bannerUrl) + '&quot;)' : '--bc:' + esc(u.color || '#29a9e8');
    main('<div class="panel"><div class="banner" style="' + bannerStyle + '"></div><div class="profile-top">' + avatar(u, 96) +
      '<div><h1>' + esc(u.name) + '</h1><span class="small">' + esc(u.rank || '') + '</span> ' + flair(u) + '</div>' +
      '<div style="margin-left:auto"><a class="btn" href="#" data-login>Send PM</a> <a class="btn lime" href="#" data-login>Offer Trade</a></div></div></div>' +
      '<div class="profile-grid"><div><div class="panel"><div class="panel-head">Member Info</div><div class="panel-body"><table class="kv">' +
      '<tr><td>Status</td><td><span class="dot' + (u.online ? ' on' : '') + '"></span>' + (u.online ? 'Online' : 'Offline') + '</td></tr>' +
      '<tr><td>Joined</td><td>' + fmtDay(u.joined) + '</td></tr><tr><td>Posts</td><td>' + num(u.posts) + '</td></tr>' +
      (u.location ? '<tr><td>Location</td><td>' + esc(u.location) + '</td></tr>' : '') +
      '<tr><td>Balance</td><td>' + xp(u.xp) + '</td></tr><tr><td>Memories sold</td><td>' + num(u.sold) + '</td></tr><tr><td>Memories bought</td><td>' + num(u.bought) + '</td></tr>' +
      '</table></div></div>' +
      (u.bio ? '<div class="panel"><div class="panel-head">About Me</div><div class="panel-body">' + bb(u.bio) + '</div></div>' : '') +
      (u.signature ? '<div class="panel"><div class="panel-head">Signature</div><div class="panel-body small">' + bb(u.signature) + '</div></div>' : '') +
      '</div><div>' +
      (mine.length ? '<div class="panel"><div class="panel-head lime">Exchange Activity</div><div class="panel-body"><div class="listings">' + mine.map(function (m) { return listingCard(db, m); }).join('') + '</div></div></div>' : '') +
      '<div class="panel"><div class="panel-head">Recent Posts</div><table class="list">' + (posts.length ? posts.map(function (p) {
        var t = db.threadById[p.thread], text = p.body.replace(/\[quote[\s\S]*?\[\/quote\]/gi, '').replace(/\[[^\]]+\]/g, '').trim();
        return '<tr><td><a class="ttitle" href="thread.html?t=' + t.id + '#' + p.id + '">' + esc(t.title) + '</a><br><span class="small">' + fmtDate(p.time) + '</span><br>' +
          esc(text.length > 150 ? text.slice(0, 150) + '…' : text) + '</td></tr>';
      }).join('') : '<tr><td>This member has not posted yet.</td></tr>') + '</table></div></div></div>');
  };

  XPS.boot = function (page) {
    XPS.load().then(function (db) { pages[page](db); }).catch(function (err) {
      console.error(err);
      main('<div class="panel"><div class="panel-head">XPShare Message</div><div class="panel-body">XPShare is temporarily unavailable. Please try again later.</div></div>');
    });
  };
})();
