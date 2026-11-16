/* XPShare sample data (phase 1). Placeholder story content — replaced by
   Firestore in phase 2. Shapes mirror the planned xps_* collections.
   Fake times are "floating" 2004 timestamps (no timezone). */
window.XPS_SAMPLE = {
  meta: { storyNow: '2004-03-16T23:58', xpRate: 4.12, hits: 48211907 },

  identities: [
    { id: 'halcyon', name: 'Halcyon', color: '#1e7fd6', rank: 'Administrator', pips: 5, staff: 'admin', flair: { text: 'XPS Staff', color: '#c62a1a' },
      joined: '2001-06-01', location: 'XPShare HQ', xp: 0, sold: 0, bought: 0, postOffset: 4180, online: true,
      signature: '[b]Halcyon[/b] — XPShare Community Team\n[i]Share the experience.[/i]', bio: 'I keep the lights on. PM a moderator for account issues, not me.' },
    { id: 'juniper', name: 'mod_juniper', color: '#3f9a1c', rank: 'Moderator', pips: 4, staff: 'mod', flair: { text: 'Moderator', color: '#3f8d06' },
      joined: '2001-11-19', location: 'Portland, OR', xp: 18250, sold: 3, bought: 41, postOffset: 9034, online: true,
      signature: 'Read the [url=board.html?b=help]FAQ[/url] before posting. Please.', bio: 'Exchange mod. I have bought more summers than I have lived.' },
    { id: 'rainy', name: 'rainydaze_84', color: '#8a55d6', rank: 'Platinum Trader', pips: 4, flair: { text: 'Top Seller', color: '#d98a00' },
      joined: '2002-02-14', location: 'Seattle', xp: 96400, sold: 57, bought: 2, postOffset: 2203, online: true,
      signature: '~*~ 57 memories sold and counting ~*~\n100% positive feedback', bio: 'Selling the stuff I don\'t need anymore. Fast transfers, no refunds.' },
    { id: 'dan', name: 'DiscmanDan', color: '#e07a12', rank: 'Gold Trader', pips: 3, flair: { text: 'Collector', color: '#0b6fb8' },
      joined: '2002-08-30', location: 'Columbus, OH', xp: 7310, sold: 1, bought: 88, postOffset: 3377, online: false,
      signature: 'WTB: holidays, road trips, anything with snow.\n[i]Now playing: The Postal Service - Such Great Heights[/i]', bio: 'Collecting childhoods since 2002. Mine was boring so I got better ones.' },
    { id: 'lumen', name: 'lumen', color: '#12a5a0', rank: 'Certified Appraiser', pips: 4, flair: { text: 'Appraiser', color: '#12a5a0' },
      joined: '2001-09-03', location: '—', xp: 40120, sold: 12, bought: 12, postOffset: 5120, online: true,
      signature: 'Appraisals are opinions, not offers.', bio: 'I can tell you what it\'s worth. I can\'t tell you if you should sell it.' },
    { id: 'sk8', name: 'sk8r_memoriez', color: '#d6342a', rank: 'Member', pips: 2, flair: null,
      joined: '2003-12-26', location: 'san diego', xp: 640, sold: 4, bought: 0, postOffset: 211, online: false,
      signature: 'saving up 4 a new deck + an xbox', bio: '' },
    { id: 'snow', name: 'first_snow', color: '#7f93a3', rank: 'New Member', pips: 1, flair: { text: 'New Member', color: '#7f93a3' },
      joined: '2004-03-09', location: '', xp: 2500, sold: 1, bought: 0, postOffset: 0, online: true,
      signature: '', bio: '' }
  ],

  categories: [
    { id: 'official', title: 'XPShare Official' },
    { id: 'exchange', title: 'The Exchange', lime: true },
    { id: 'community', title: 'Community' }
  ],

  boards: [
    { slug: 'announcements', category: 'official', icon: '!', orb: 'gold', title: 'News & Announcements', desc: 'Site news, Exchange updates and cash-out schedules from the XPShare team.' },
    { slug: 'help', category: 'official', icon: '?', orb: '', title: 'Help & New Members', desc: 'New to sharing? Ask here. Read the FAQ first!' },
    { slug: 'exchange', category: 'exchange', icon: 'XP', orb: 'lime', title: 'Memory Exchange', desc: 'Buy, sell and trade memories. [WTS] / [WTB] / [WTT] tags required.', exchange: true },
    { slug: 'appraisals', category: 'exchange', icon: '$', orb: 'lime', title: 'Appraisals & Price Checks', desc: 'Not sure what it\'s worth? Our Certified Appraisers can help.' },
    { slug: 'vault', category: 'exchange', icon: '', orb: 'grey', title: 'The Vault', desc: 'Private listings. Platinum Traders only.', lockKey: 'vault' },
    { slug: 'general', category: 'community', icon: '✉', orb: '', title: 'General Chat', desc: 'Talk about anything. Be nice.' },
    { slug: 'entertainment', category: 'community', icon: '♪', orb: '', title: 'Movies, Music & Games', desc: 'What are you watching, playing and burning to CD-R?' }
  ],

  threads: [
    { id: 't1', board: 'announcements', title: 'XPShare 4.0 is here — the new Memory Exchange is LIVE!', author: 'halcyon', sticky: true, views: 184220 },
    { id: 't2', board: 'announcements', title: '[READ] Cash-out processing times for March 2004', author: 'halcyon', sticky: true, locked: true, views: 96014 },
    { id: 't3', board: 'help', title: 'sold a memory and now i cant remember what it was??', author: 'snow', views: 1312 },
    { id: 't4', board: 'exchange', title: '[WTS] First time seeing the ocean (age 6) — 4,000 XP', author: 'rainy', views: 2088, listing: 'm1' },
    { id: 't5', board: 'exchange', title: '[WTB] A good Christmas morning, late 80s preferred', author: 'dan', views: 940 },
    { id: 't6', board: 'appraisals', title: 'price check: learning 2 ride a bike (dad included)', author: 'sk8', views: 577 },
    { id: 't7', board: 'general', title: 'What did you buy with your first cash-out?', author: 'juniper', views: 12045 },
    { id: 't8', board: 'entertainment', title: 'Return of the King: 11 for 11 at the Oscars!!', author: 'dan', views: 3310 }
  ],

  posts: [
    { id: 'p1', thread: 't1', author: 'halcyon', time: '2004-03-01T09:00',
      body: 'Good morning, sharers!\n\nAfter eight months of work, [b]XPShare 4.0[/b] is live. What\'s new:\n\n[b]• The Memory Exchange[/b] — list a memory in under a minute. Buyers pay in XP, and the transfer completes while you sleep.\n[b]• Instant cash-out[/b] — convert XP to real money at today\'s rate. Checks, wire or PayPal.\n[b]• Trader ranks[/b] — the more you share, the more you earn.\n\nAs always: once a memory is sold, it belongs to the buyer. [color=#c62a1a][b]All transfers are final.[/b][/color]\n\nThank you for making XPShare the #1 entertainment destination on the web. :D',
      reactions: { 'thumbs up': 412, 'w00t': 97 } },
    { id: 'p2', thread: 't1', author: 'rainy', time: '2004-03-01T09:14', body: 'FINALLY. the old listing form took forever. already put 3 up :)' },
    { id: 'p3', thread: 't1', author: 'dan', time: '2004-03-01T10:02', body: '[quote=Halcyon]the transfer completes while you sleep[/quote]\nBought two last night to test it. Woke up remembering a lake house I\'ve never been to. Works great. 10/10' },
    { id: 'p4', thread: 't1', author: 'sk8', time: '2004-03-02T16:40', body: 'is there a limit on how many u can sell?? asking 4 a friend ;)' },
    { id: 'p5', thread: 't1', author: 'juniper', time: '2004-03-02T17:05', body: '[quote=sk8r_memoriez]is there a limit on how many u can sell??[/quote]\nNo limit. But please read the Terms of Service, section 9, before you list anything from before age 5.', edited: 'Last edited by mod_juniper on Tue Mar 02, 2004 5:11 pm; edited 1 time in total' },

    { id: 'p6', thread: 't2', author: 'halcyon', time: '2004-03-04T12:00', body: 'Due to record volume, cash-outs requested after March 1 will take [b]10–14 business days[/b].\n\nThe current rate is posted at the top of every page. Rates are set by the Exchange and may change without notice.\n\nThis thread is locked. Questions go in Help & New Members.' },

    { id: 'p7', thread: 't3', author: 'snow', time: '2004-03-15T22:31', body: 'hi, new here. i sold something last week for 2,500 XP. the money showed up fine.\n\nbut i can\'t remember what i sold. the listing page just says "transferred" and the title is blank on my end. i keep feeling like i forgot to do something important.\n\nis that normal? can i see what it was?' },
    { id: 'p8', thread: 't3', author: 'juniper', time: '2004-03-15T22:48', body: 'Welcome to XPShare! :)\n\nYes, that\'s completely normal — it means the transfer worked. Listing details are hidden from the seller after a sale so you don\'t get confused by a description of something you no longer have.\n\nThe feeling goes away in a few days. Enjoy your XP!' },
    { id: 'p9', thread: 't3', author: 'dan', time: '2004-03-15T23:10', body: 'Everyone gets that the first time. I felt like I left the oven on for a week after my first sale. Then you don\'t even remember that you forgot.' },
    { id: 'p10', thread: 't3', author: 'lumen', time: '2004-03-16T00:02', removed: true, body: 'first_snow — check who bought it. If the buyer account was created the same day as your listing, you should [spoiler]stop selling and save every page you can[/spoiler].' },
    { id: 'p11', thread: 't3', author: 'snow', time: '2004-03-16T23:42', body: 'there was a reply here last night and now it\'s gone? what did it say?\n\nalso there are photos in my apartment of someone i don\'t recognize' },

    { id: 'p12', thread: 't4', author: 'rainy', time: '2004-03-14T19:20', body: '[b]For sale:[/b] first time seeing the ocean. Age 6, Oregon coast, grey day, very cold water. Strong sensory detail (salt, wind, wet jeans). Includes one (1) parent laughing.\n\n[b]Price:[/b] 4,000 XP firm.\n[b]Condition:[/b] vivid, recalled maybe a dozen times.\n\nI\'ve seen the ocean plenty since, don\'t need the first one. PM me.' },
    { id: 'p13', thread: 't4', author: 'dan', time: '2004-03-14T20:05', body: 'Would you take 3,200? I already have two oceans but neither has a parent in it.' },
    { id: 'p14', thread: 't4', author: 'rainy', time: '2004-03-14T20:11', body: '[quote=DiscmanDan]Would you take 3,200?[/quote]\nfirm means firm :P' },
    { id: 'p15', thread: 't4', author: 'lumen', time: '2004-03-15T08:30', body: 'Fair price for what it is. Firsts with a family member present have been climbing all month.' },

    { id: 'p16', thread: 't5', author: 'dan', time: '2004-03-12T18:00', body: 'Looking for a Christmas morning, ideally 1986–1989. Must have: snow outside, at least one sibling, a big present (bike / NES / etc).\n\nPaying up to 6,000 XP for the right one. No sad ones. I got burned on a "Christmas 1991" that turned out to have a fight in it.' },
    { id: 'p17', thread: 't5', author: 'sk8', time: '2004-03-13T11:22', body: 'i have a xmas but its from 96 and its in california so no snow. 1500?' },
    { id: 'p18', thread: 't5', author: 'dan', time: '2004-03-13T12:40', body: 'Pass, thanks. Snow is the whole point.' },

    { id: 'p19', thread: 't6', author: 'sk8', time: '2004-03-10T15:15', body: 'what could i get for learning to ride a bike? im like 7, my dad is holding the seat and then lets go. its summer.\n\nneed about 3000 more for an xbox' },
    { id: 'p20', thread: 't6', author: 'lumen', time: '2004-03-10T16:01', body: 'Classic listing, always in demand. With the dad letting go, 2,800–3,500 XP.\n\nI\'ll say what I always say: you\'ve sold four already this winter. The bike will still be worth this much in a year. You might want it more than an Xbox by then.' },
    { id: 'p21', thread: 't6', author: 'sk8', time: '2004-03-10T16:20', body: 'lol ok mom. listing it 2nite' },

    { id: 'p22', thread: 't7', author: 'juniper', time: '2004-03-06T13:00', body: 'Fun one for the weekend. What was the first thing you bought with real money from XPShare?',
      poll: { question: 'My first cash-out went toward…', options: [
        { text: 'Rent / bills', votes: 3811 }, { text: 'Games, CDs, DVDs', votes: 2940 }, { text: 'A new PC', votes: 1102 },
        { text: 'More memories', votes: 4577 }, { text: 'I don\'t remember', votes: 2266 } ] } },
    { id: 'p23', thread: 't7', author: 'rainy', time: '2004-03-06T13:22', body: 'paid off my car!! best decision i ever made :D' },
    { id: 'p24', thread: 't7', author: 'dan', time: '2004-03-06T14:10', body: 'Never cashed out. It all goes back into the collection.' },
    { id: 'p25', thread: 't7', author: 'snow', time: '2004-03-16T23:50', body: 'voted "i don\'t remember". that\'s a joke option right' },

    { id: 'p26', thread: 't8', author: 'dan', time: '2004-02-29T23:55', body: 'ELEVEN OSCARS. Clean sweep. Best Picture finally goes to a fantasy movie. What a night.' },
    { id: 'p27', thread: 't8', author: 'rainy', time: '2004-03-01T00:20', body: 'i saw it opening night but i sold that in january so i guess i get to see it for the first time again :)' },
    { id: 'p28', thread: 't8', author: 'juniper', time: '2004-03-01T08:45', body: '[quote=rainydaze_84]i get to see it for the first time again[/quote]\nHonestly the best use of this site.' }
  ],

  listings: [
    { id: 'm1', seller: 'rainy', title: 'First time seeing the ocean (age 6)', teaser: 'Oregon coast, grey day, wet jeans, one parent laughing.', price: 4000, status: 'listed', thread: 't4' },
    { id: 'm2', seller: 'rainy', title: 'Snow day, January 1993', teaser: 'School cancelled. Sledding until dark. Hot chocolate.', price: 5200, status: 'sold', buyer: 'dan', soldOn: '2004-03-11T21:00' },
    { id: 'm3', seller: 'sk8', title: 'My 10th birthday party', teaser: 'pizza, laser tag, everyone from my class came', price: 900, status: 'sold', buyer: 'juniper', soldOn: '2004-03-08T17:30' },
    { id: 'm4', seller: 'sk8', title: 'Learning to ride a bike', teaser: 'summer, dad holding the seat and then letting go', price: 3000, status: 'listed', thread: 't6' },
    { id: 'm5', seller: 'snow', title: '(title hidden after transfer)', teaser: 'Details are hidden once a transfer completes.', price: 2500, status: 'sold', buyer: null, soldOn: '2004-03-09T03:12' }
  ]
};
