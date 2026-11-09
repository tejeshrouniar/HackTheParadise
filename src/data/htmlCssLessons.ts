import type { CodedexLesson } from './codedexLessons';

export const HTML_CSS_LESSONS: CodedexLesson[] = [
  // ═══════════════════════════════════════════════════════════════════
  // LESSON 1 — The Ancient Scroll (HTML Document Structure)
  // Theme: Ancient Library / Scrolls
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 101,
    chapter: 'Chapter 1: The Weaver\'s First Thread',
    title: 'The Ancient Scroll',
    conceptName: 'HTML Document Structure',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '📜 What is an HTML Document?',
    whatIsThisBody:
      'Deep within the **Arcane Library of Eldara**, the master weavers discovered that every magical scroll must follow a sacred structure — a skeleton of nested enchantments that give the scroll its power.\n\n' +
      'An **HTML document** is exactly like one of these ancient scrolls. It is the foundational blueprint of every web page you see on the internet. Just as a scroll has a parchment border, a wax seal, and inscribed runes, an HTML page has a **DOCTYPE declaration**, a `<html>` wrapper, a `<head>` section for hidden metadata, and a `<body>` section where all visible content appears.\n\n' +
      '**The four sacred layers:**\n' +
      '- `<!DOCTYPE html>` — The **Seal of Origin**: tells the browser "this is a modern HTML5 scroll"\n' +
      '- `<html>` — The **Parchment Binding**: wraps everything together\n' +
      '- `<head>` — The **Hidden Chamber**: stores the scroll\'s title and secret instructions (not visible to readers)\n' +
      '- `<body>` — The **Visible Inscription**: everything the reader actually sees on the page',
    whatIsThisCallout:
      '🔮 Every web page on the internet — from Google to YouTube — starts with this exact same skeleton. Without it, the browser cannot interpret your scroll!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '✍️ How do I weave the First Scroll?',
    howToWriteBody:
      'To craft a valid HTML scroll, you must layer the four sacred elements in the correct order. The `<!DOCTYPE html>` declaration comes first (it has no closing tag — it is a one-time seal). Then the `<html>` tag wraps everything. Inside it, the `<head>` holds the page title, and the `<body>` holds the visible content.\n\n' +
      'Every opening tag like `<html>` **must** have a matching closing tag `</html>`. Think of them as the clasps on a spell book — open a clasp, write the spell, then close it.',
    codeExample:
`<!DOCTYPE html>
<html>
  <head>
    <title>My First Scroll</title>
  </head>
  <body>
    <h1>Hello, Wizard!</h1>
    <p>This is my first magical web page.</p>
  </body>
</html>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Weave the skeleton of your very first Ancient Scroll! Create a complete HTML document with all four sacred layers and place a greeting inside the body.',
    tasks: [
      {
        id: 'h1-t1',
        description: 'Place the Seal of Origin: add the `<!DOCTYPE html>` declaration at the very top.',
        codeKeyword: '<!DOCTYPE html>',
      },
      {
        id: 'h1-t2',
        description: 'Wrap everything in the Parchment Binding: add `<html>` and `</html>` tags.',
        codeKeyword: '<html>',
      },
      {
        id: 'h1-t3',
        description: 'Create the Hidden Chamber: add a `<head>` section with a `<title>`.',
        codeKeyword: '<head>',
      },
      {
        id: 'h1-t4',
        description: 'Create the Visible Inscription: add a `<body>` section with some content inside.',
        codeKeyword: '<body>',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Weave the four sacred layers of the Ancient Scroll below -->

`,

    hint:
      'Start with <!DOCTYPE html>, then open <html>. Inside it, add <head> with a <title>, then <body> with any text. Don\'t forget to close every tag you open!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Ancient Scroll</title>
  </head>
  <body>
    <h1>Welcome to Eldara</h1>
    <p>The first thread has been woven.</p>
  </body>
</html>`,

    stageType: 'webpage' as any,
    stageConfig: {
      expectedTags: ['<!DOCTYPE html>', '<html>', '<head>', '<body>'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 2 — Runes of Expression (Headings & Paragraphs)
  // Theme: Runic Inscriptions / Stone Tablets
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 102,
    chapter: 'Chapter 2: Runes of Expression',
    title: 'Runes of Expression',
    conceptName: 'Headings & Paragraphs',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '🪨 What are Headings & Paragraphs?',
    whatIsThisBody:
      'In the **Granite Halls of Runheim**, the dwarven runesmiths carved messages into massive stone tablets. But not all carvings were equal — the *title runes* were chiseled deep and large so travelers could read them from across the hall, while the *story runes* were smaller, forming the detailed tales beneath.\n\n' +
      'In HTML, **headings** (`<h1>` through `<h6>`) are your title runes. `<h1>` is the mightiest — the grand proclamation carved at the top of the tablet. `<h6>` is the smallest, a whispered footnote. **Paragraphs** (`<p>`) are the story runes — blocks of flowing text that convey detailed information.\n\n' +
      '**The hierarchy of runes:**\n' +
      '- `<h1>` — **Grand Rune**: Main title (use only once per page, like the name of a decree)\n' +
      '- `<h2>` — **Chapter Rune**: Major sections\n' +
      '- `<h3>` to `<h6>` — **Lesser Runes**: Sub-sections of decreasing importance\n' +
      '- `<p>` — **Story Rune**: A paragraph of body text',
    whatIsThisCallout:
      '⚒️ Runesmiths\' Rule: A tablet should have exactly ONE `<h1>` — its grand title. Using multiple `<h1>` tags confuses both readers and the search-spirit (search engines) that index your scrolls!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🔨 How do I carve Runes into the Tablet?',
    howToWriteBody:
      'Each rune is carved by placing text between an opening tag and its closing tag. The number in the heading tag (1–6) determines how large and bold the rune appears. Paragraphs wrap your sentences into neat blocks of text with spacing above and below.\n\n' +
      'Remember: headings are for **structure and hierarchy**, not just for making text big. A well-structured tablet helps both readers and search spirits understand your content.',
    codeExample:
`<h1>The Decree of Runheim</h1>
<p>Hear ye, all who enter the Granite Halls!</p>

<h2>Chapter I: The Founding</h2>
<p>Long ago, the first runesmiths discovered the
   power of carved stone.</p>

<h3>The First Rune</h3>
<p>It was a simple mark, but it changed everything.</p>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Carve a stone tablet with a grand title rune, a chapter rune, and story runes beneath each. Create a mini decree for the Granite Halls!',
    tasks: [
      {
        id: 'h2-t1',
        description: 'Carve a Grand Rune: add an `<h1>` heading as the main title of your tablet.',
        codeKeyword: '<h1>',
      },
      {
        id: 'h2-t2',
        description: 'Write a Story Rune: add a `<p>` paragraph beneath your title describing the decree.',
        codeKeyword: '<p>',
      },
      {
        id: 'h2-t3',
        description: 'Add a Chapter Rune: include an `<h2>` sub-heading for a new section.',
        codeKeyword: '<h2>',
      },
      {
        id: 'h2-t4',
        description: 'Write another Story Rune: add a second `<p>` paragraph under your chapter heading.',
        codeKeyword: '</p>',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Carve your runes into the stone tablet below -->
<!DOCTYPE html>
<html>
  <head>
    <title>Runes of Expression</title>
  </head>
  <body>

  </body>
</html>`,

    hint:
      'Inside the <body>, add an <h1> with a title, then a <p> with some text. Add an <h2> for a sub-section, then another <p>. Think of it like writing a mini chapter book!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>Runes of Expression</title>
  </head>
  <body>
    <h1>The Decree of Runheim</h1>
    <p>By order of the High Runesmith, let these words be carved in eternal stone for all who seek knowledge.</p>

    <h2>Chapter I: The Oath of the Apprentice</h2>
    <p>Every apprentice must learn the sacred art of rune-carving before they may wield the Hammer of Syntax.</p>
  </body>
</html>`,

    stageType: 'webpage' as any,
    stageConfig: {
      expectedTags: ['<h1>', '<p>'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 3 — The Portal Nexus (Links & Images)
  // Theme: Interdimensional Portals
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 103,
    chapter: 'Chapter 3: The Portal Nexus',
    title: 'The Portal Nexus',
    conceptName: 'Links & Images',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '🌀 What are Links & Images?',
    whatIsThisBody:
      'At the crossroads of the **Astral Plane** lies the **Portal Nexus** — a vast chamber filled with shimmering doorways that transport travelers to distant realms. Each portal is inscribed with a destination, and stepping through it whisks you away instantly.\n\n' +
      'In HTML, **links** (`<a>` tags) are your portal gateways. Clicking a link transports the user to another page, another website, or even a different section of the same scroll. The `href` attribute is the *destination coordinates* — the URL where the portal leads.\n\n' +
      '**Images** (`<img>` tags) are **enchanted mirrors** — they don\'t contain the picture themselves, but instead *reflect* an image stored elsewhere. The `src` attribute is the *scrying address* that tells the mirror where to look, and the `alt` attribute is the *whispered description* for those who cannot see the mirror\'s reflection.\n\n' +
      '**Key attributes:**\n' +
      '- `<a href="url">` — The **Portal Gateway**: `href` = destination, text inside = the label above the door\n' +
      '- `<img src="url" alt="description">` — The **Enchanted Mirror**: `src` = image location, `alt` = description for accessibility\n' +
      '- Note: `<img>` is a **self-closing tag** — mirrors have no "inside," so there is no `</img>`!',
    whatIsThisCallout:
      '🌌 Portal Safety Rule: Always include the `alt` attribute on images! Blind travelers rely on screen readers that speak the `alt` text aloud. Without it, they encounter a silent, dark mirror — and that\'s bad magic.',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🚪 How do I open Portals and summon Mirrors?',
    howToWriteBody:
      'To create a portal, use the `<a>` tag with an `href` attribute pointing to the destination URL. The text between `<a>` and `</a>` becomes the clickable portal inscription.\n\n' +
      'To summon an enchanted mirror, use the `<img>` tag with `src` (the image\'s URL) and `alt` (a text description). The `<img>` tag is self-closing — it needs no `</img>` partner.\n\n' +
      'You can even place a mirror *inside* a portal, creating a clickable image that transports the viewer when touched!',
    codeExample:
`<!-- A portal gateway to another realm -->
<a href="https://www.example.com">
  Enter the Realm of Examples
</a>

<!-- An enchanted mirror reflecting a dragon -->
<img src="https://example.com/dragon.png"
     alt="A fierce red dragon breathing fire">

<!-- A clickable mirror inside a portal -->
<a href="https://www.example.com">
  <img src="https://example.com/portal.png"
       alt="Shimmering portal doorway">
</a>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Build the Portal Nexus chamber! Create a page with a portal gateway (link) to any website and summon an enchanted mirror (image) with a proper description.',
    tasks: [
      {
        id: 'h3-t1',
        description: 'Open a Portal Gateway: add an `<a>` tag with an `href` attribute linking to any URL.',
        codeKeyword: '<a href=',
      },
      {
        id: 'h3-t2',
        description: 'Write the portal inscription: put descriptive text between `<a>` and `</a>`.',
        codeKeyword: '</a>',
      },
      {
        id: 'h3-t3',
        description: 'Summon an Enchanted Mirror: add an `<img>` tag with `src` and `alt` attributes.',
        codeKeyword: '<img src=',
      },
      {
        id: 'h3-t4',
        description: 'Ensure the mirror has a whispered description: include the `alt` attribute on your `<img>` tag.',
        codeKeyword: 'alt=',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Construct the Portal Nexus below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Portal Nexus</title>
  </head>
  <body>
    <h1>The Portal Nexus</h1>
    <p>Step through a gateway or gaze into an enchanted mirror...</p>

  </body>
</html>`,

    hint:
      'Add <a href="https://any-url.com">Click me</a> for a link. Add <img src="https://any-image-url.png" alt="description"> for an image. Remember: <img> has no closing tag!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Portal Nexus</title>
  </head>
  <body>
    <h1>The Portal Nexus</h1>
    <p>Step through a gateway or gaze into an enchanted mirror...</p>

    <h2>Portal Gateway</h2>
    <a href="https://www.wikipedia.org">Enter the Realm of Knowledge</a>

    <h2>Enchanted Mirror</h2>
    <img src="https://via.placeholder.com/300x200" alt="A mystical landscape beyond the portal">
  </body>
</html>`,

    stageType: 'webpage' as any,
    stageConfig: {
      expectedTags: ['<a', '<img'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 4 — The Merchant's Ledger (Lists)
  // Theme: Fantasy Marketplace / Trading Post
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 104,
    chapter: 'Chapter 4: The Merchant\'s Ledger',
    title: 'The Merchant\'s Ledger',
    conceptName: 'Lists (Ordered & Unordered)',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '🏪 What are HTML Lists?',
    whatIsThisBody:
      'Welcome to the **Bazaar of a Thousand Wonders**, the largest trading post in the realm! Every merchant here keeps a **ledger** — a carefully organized list of their wares, prices, and trade routes.\n\n' +
      'In HTML, **lists** let you organize items in a structured, readable way — just like a merchant\'s inventory scroll. There are two types:\n\n' +
      '**Unordered Lists (`<ul>`)** — The **Merchant\'s Satchel**: A collection of items where order doesn\'t matter. Each item gets a bullet point (•). Perfect for listing ingredients, features, or inventory.\n\n' +
      '**Ordered Lists (`<ol>`)** — The **Trade Route Manifest**: A numbered sequence where order *does* matter. Each item is automatically numbered (1, 2, 3…). Perfect for step-by-step instructions, rankings, or recipes.\n\n' +
      'Both list types use `<li>` (**List Item**) tags for each individual entry — think of each `<li>` as a single line in the merchant\'s ledger book.',
    whatIsThisCallout:
      '💰 Merchant\'s Tip: You can nest lists inside lists! A merchant selling potion ingredients might have a main list of potions, with each potion containing a sub-list of ingredients. This creates a beautifully organized multi-level ledger.',

    // ── Section 2: How to write it ──
    howToWriteTitle: '📋 How do I create a Merchant\'s Ledger?',
    howToWriteBody:
      'To create an unordered list (bulleted), wrap your items in `<ul>` and `</ul>`. For an ordered list (numbered), use `<ol>` and `</ol>`. Each item in either list must be wrapped in `<li>` and `</li>` tags.\n\n' +
      'The `<li>` tags can only live *inside* a `<ul>` or `<ol>` — a ledger entry without a ledger book makes no sense! Similarly, `<ul>` and `<ol>` should only contain `<li>` elements as direct children.',
    codeExample:
`<!-- Unordered List: Merchant's Inventory -->
<h2>Wares for Sale</h2>
<ul>
  <li>Phoenix Feather Quill</li>
  <li>Dragonscale Shield</li>
  <li>Elven Waybread (3 loaves)</li>
  <li>Moonstone Pendant</li>
</ul>

<!-- Ordered List: Trade Route -->
<h2>Trade Route to the Eastern Kingdoms</h2>
<ol>
  <li>Depart from Silverport at dawn</li>
  <li>Cross the Whispering Bridge</li>
  <li>Resupply at the Halfling Inn</li>
  <li>Arrive at the Golden Gate Market</li>
</ol>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Set up your merchant stall at the Bazaar! Create an inventory of wares using an unordered list AND a numbered trade route using an ordered list.',
    tasks: [
      {
        id: 'h4-t1',
        description: 'Open your satchel: create an unordered list with `<ul>`.',
        codeKeyword: '<ul>',
      },
      {
        id: 'h4-t2',
        description: 'Stock your wares: add at least 3 `<li>` items inside your unordered list.',
        codeKeyword: '<li>',
      },
      {
        id: 'h4-t3',
        description: 'Write a trade manifest: create an ordered list with `<ol>`.',
        codeKeyword: '<ol>',
      },
      {
        id: 'h4-t4',
        description: 'Close your ledger properly: make sure all lists and items have closing tags.',
        codeKeyword: '</ul>',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Set up your merchant stall at the Bazaar below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Merchant's Ledger</title>
  </head>
  <body>
    <h1>Bazaar of a Thousand Wonders</h1>

  </body>
</html>`,

    hint:
      'Create a <ul> with at least 3 <li> items for your inventory. Then create an <ol> with at least 3 <li> items for a numbered route or recipe. Don\'t forget the closing </li>, </ul>, and </ol> tags!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Merchant's Ledger</title>
  </head>
  <body>
    <h1>Bazaar of a Thousand Wonders</h1>

    <h2>Inventory: Mystic Wares</h2>
    <ul>
      <li>Phoenix Feather Quill — 12 gold</li>
      <li>Dragonscale Shield — 85 gold</li>
      <li>Elven Waybread — 3 gold per loaf</li>
      <li>Vial of Starlight — 40 gold</li>
    </ul>

    <h2>Trade Route: The Silk Serpent Path</h2>
    <ol>
      <li>Depart from Silverport at dawn</li>
      <li>Navigate through the Mistveil Marshes</li>
      <li>Resupply at the Crossroads Tavern</li>
      <li>Arrive at the Eastern Bazaar by nightfall</li>
    </ol>
  </body>
</html>`,

    stageType: 'webpage' as any,
    stageConfig: {
      expectedTags: ['<ul>', '<ol>', '<li>'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 5 — The Alchemist's Table (HTML Tables)
  // Theme: Alchemy Lab / Potion Recipes
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 105,
    chapter: 'Chapter 5: The Alchemist\'s Table',
    title: 'The Alchemist\'s Table',
    conceptName: 'HTML Tables',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '⚗️ What is an HTML Table?',
    whatIsThisBody:
      'In the bubbling depths of **Madame Zara\'s Alchemy Laboratory**, every potion recipe is meticulously recorded on a large grid carved into the stone workbench — the **Alchemist\'s Table**. Each row represents one ingredient, and each column tracks a different property: the ingredient name, the required amount, and its magical effect.\n\n' +
      'An **HTML table** works the same way. It organizes data into a grid of **rows** and **columns**, making it easy to compare and scan structured information.\n\n' +
      '**The four elements of a table:**\n' +
      '- `<table>` — The **Workbench** itself: wraps the entire grid\n' +
      '- `<tr>` — A **Table Row**: one horizontal line of the grid (like one shelf on the bench)\n' +
      '- `<th>` — A **Table Header** cell: bold column titles at the top (the labels engraved in brass)\n' +
      '- `<td>` — A **Table Data** cell: a regular cell containing data (the actual ingredients on the shelf)\n\n' +
      'The structure is always: `<table>` contains `<tr>` rows, and each row contains either `<th>` (for the header row) or `<td>` (for data rows) cells.',
    whatIsThisCallout:
      '🧪 Alchemist\'s Warning: Tables are for **tabular data** (schedules, recipes, comparisons) — NOT for page layout! Using tables to arrange your page design is an ancient, forbidden technique that modern wizards have abandoned in favor of CSS Grid and Flexbox.',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🧬 How do I build an Alchemist\'s Table?',
    howToWriteBody:
      'Start with `<table>` to create the workbench. Inside it, add `<tr>` for each row. The **first row** typically uses `<th>` cells for column headers (they render bold and centered by default). All subsequent rows use `<td>` cells for the actual data.\n\n' +
      'Think of it as building a grid, row by row:\n' +
      '1. Lay down the workbench (`<table>`)\n' +
      '2. Place the brass labels (`<tr>` with `<th>` cells)\n' +
      '3. Fill each shelf with ingredients (`<tr>` with `<td>` cells)\n' +
      '4. Close the workbench (`</table>`)',
    codeExample:
`<table>
  <tr>
    <th>Ingredient</th>
    <th>Amount</th>
    <th>Effect</th>
  </tr>
  <tr>
    <td>Dragon's Breath Pepper</td>
    <td>2 pinches</td>
    <td>Fire resistance</td>
  </tr>
  <tr>
    <td>Moonpetal Extract</td>
    <td>5 drops</td>
    <td>Night vision</td>
  </tr>
  <tr>
    <td>Crushed Starstone</td>
    <td>1 shard</td>
    <td>Levitation</td>
  </tr>
</table>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Craft a potion recipe table on Madame Zara\'s workbench! Create a table with header columns and at least 2 rows of potion ingredients.',
    tasks: [
      {
        id: 'h5-t1',
        description: 'Lay down the workbench: create a `<table>` element.',
        codeKeyword: '<table>',
      },
      {
        id: 'h5-t2',
        description: 'Engrave the brass labels: add a header row (`<tr>`) with at least 3 `<th>` cells.',
        codeKeyword: '<th>',
      },
      {
        id: 'h5-t3',
        description: 'Add the first ingredient: create a data row (`<tr>`) with `<td>` cells.',
        codeKeyword: '<td>',
      },
      {
        id: 'h5-t4',
        description: 'Add a second ingredient: create another data row with matching `<td>` cells.',
        codeKeyword: '</tr>',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Build Madame Zara's potion recipe table below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Alchemist's Table</title>
  </head>
  <body>
    <h1>Madame Zara's Potion Recipes</h1>
    <h2>Elixir of Eternal Flame</h2>

  </body>
</html>`,

    hint:
      'Start with <table>, add a <tr> containing 3 <th> headers (like Ingredient, Amount, Effect). Then add 2 more <tr> rows, each with 3 <td> cells. Close everything properly!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Alchemist's Table</title>
  </head>
  <body>
    <h1>Madame Zara's Potion Recipes</h1>
    <h2>Elixir of Eternal Flame</h2>

    <table>
      <tr>
        <th>Ingredient</th>
        <th>Amount</th>
        <th>Effect</th>
      </tr>
      <tr>
        <td>Dragon's Breath Pepper</td>
        <td>2 pinches</td>
        <td>Grants fire resistance for 1 hour</td>
      </tr>
      <tr>
        <td>Lava Salamander Scale</td>
        <td>1 whole scale</td>
        <td>Binds the flame to the drinker's soul</td>
      </tr>
      <tr>
        <td>Sunstone Powder</td>
        <td>3 teaspoons</td>
        <td>Stabilizes the potion's temperature</td>
      </tr>
    </table>
  </body>
</html>`,

    stageType: 'webpage' as any,
    stageConfig: {
      expectedTags: ['<table>', '<tr>', '<th>', '<td>'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 6 — Gateway of Whispers (HTML Forms)
  // Theme: Enchanted Doorway / Magical Locks
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 106,
    chapter: 'Chapter 6: Gateway of Whispers',
    title: 'Gateway of Whispers',
    conceptName: 'HTML Forms',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '🚪 What is an HTML Form?',
    whatIsThisBody:
      'At the end of a long, torch-lit corridor stands the **Gateway of Whispers** — an ancient enchanted door that only opens when you speak the correct incantations into its carved stone face. The door doesn\'t just need a password; it asks for your *name*, your *chosen guild*, your *secret phrase*, and then you must press the **Seal of Passage** to submit your answers.\n\n' +
      'An **HTML form** is your Gateway of Whispers. It collects input from the user — text, selections, choices — and sends that data somewhere for processing. Every login page, search bar, contact form, and checkout page on the internet is built with forms.\n\n' +
      '**The enchantments of a form:**\n' +
      '- `<form>` — The **Gateway Frame**: wraps all input elements and defines where the data is sent\n' +
      '- `<label>` — The **Carved Question**: descriptive text that tells the user what to enter (linked to an input)\n' +
      '- `<input>` — The **Whisper Slot**: where the user types their answer (text, password, email, etc.)\n' +
      '- `<select>` + `<option>` — The **Enchanted Dial**: a dropdown menu for choosing from preset answers\n' +
      '- `<button>` — The **Seal of Passage**: the submit button that sends all answers through the gateway',
    whatIsThisCallout:
      '🔐 Gateway Guardian\'s Decree: Always pair every `<input>` with a `<label>` using matching `for` and `id` attributes! This lets screen readers announce what each whisper slot is for, and lets users click the label to focus the input. Unlabeled inputs are like doorways with no signs — confusing and inaccessible.',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🗝️ How do I construct the Gateway?',
    howToWriteBody:
      'Wrap all your input elements inside a `<form>` tag. For each piece of information you want to collect, create a `<label>` and an `<input>`. The `<label>`\'s `for` attribute should match the `<input>`\'s `id` attribute to link them together.\n\n' +
      'Common input types:\n' +
      '- `type="text"` — An open text whisper slot\n' +
      '- `type="password"` — A secret whisper slot (characters are hidden)\n' +
      '- `type="email"` — Validates that the input looks like a crystal-mail address\n\n' +
      'Finally, add a `<button>` with `type="submit"` to create the Seal of Passage that sends the form data.',
    codeExample:
`<form>
  <label for="wizard-name">Wizard Name:</label>
  <input type="text" id="wizard-name"
         placeholder="Enter your name">

  <label for="secret">Secret Phrase:</label>
  <input type="password" id="secret"
         placeholder="Whisper your passphrase">

  <label for="guild">Choose your Guild:</label>
  <select id="guild">
    <option value="fire">Order of the Flame</option>
    <option value="ice">Frostweaver Circle</option>
    <option value="shadow">Shadow Covenant</option>
  </select>

  <button type="submit">Open the Gateway</button>
</form>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Construct the Gateway of Whispers! Build a form that asks for the traveler\'s name, a secret passphrase, and includes a submit button to open the gate.',
    tasks: [
      {
        id: 'h6-t1',
        description: 'Erect the Gateway Frame: create a `<form>` element to hold all inputs.',
        codeKeyword: '<form>',
      },
      {
        id: 'h6-t2',
        description: 'Add a Whisper Slot: create an `<input>` for the traveler\'s name.',
        codeKeyword: '<input',
      },
      {
        id: 'h6-t3',
        description: 'Carve a Question: add a `<label>` to describe at least one of your input fields.',
        codeKeyword: '<label',
      },
      {
        id: 'h6-t4',
        description: 'Place the Seal of Passage: add a `<button>` to submit the form.',
        codeKeyword: '<button>',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Construct the Gateway of Whispers below -->
<!DOCTYPE html>
<html>
  <head>
    <title>Gateway of Whispers</title>
  </head>
  <body>
    <h1>The Gateway of Whispers</h1>
    <p>Speak your truths into the stone, traveler, and the gate shall judge your worth...</p>

  </body>
</html>`,

    hint:
      'Inside the <body>, add a <form>. Inside the form, add <label for="name">Name:</label> then <input type="text" id="name">. Add another pair for a password. End with <button type="submit">Open the Gate</button>. Close the </form>!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>Gateway of Whispers</title>
  </head>
  <body>
    <h1>The Gateway of Whispers</h1>
    <p>Speak your truths into the stone, traveler, and the gate shall judge your worth...</p>

    <form>
      <label for="traveler-name">Your Name:</label>
      <input type="text" id="traveler-name" placeholder="Speak your name">

      <label for="passphrase">Secret Passphrase:</label>
      <input type="password" id="passphrase" placeholder="Whisper the ancient words">

      <label for="guild">Choose your Guild:</label>
      <select id="guild">
        <option value="flame">Order of the Flame</option>
        <option value="frost">Frostweaver Circle</option>
        <option value="shadow">Shadow Covenant</option>
      </select>

      <button type="submit">Open the Gateway</button>
    </form>
  </body>
</html>`,

    stageType: 'webpage' as any,
    stageConfig: {
      expectedTags: ['<form>', '<input', '<button>'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 7 — The Enchantress's Wardrobe (CSS Selectors & Styling Magic)
  // Theme: Fairy Wardrobe / Fashion Magic
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 107,
    chapter: "Chapter 7: The Enchantress's Wardrobe",
    title: "The Enchantress's Wardrobe",
    conceptName: 'CSS Selectors & Styling Magic',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '👗 What is CSS and Styling Magic?',
    whatIsThisBody:
      'Deep within the **Silken Woods of Sylphoria**, Lady Lumina weaves enchanted garments not from common sheep\'s wool, but from starlight, moonbeams, and prismatic threads. An HTML scroll without CSS is like an unadorned training dummy — functionally complete, but lacking color, elegance, and soul!\n\n' +
      '**CSS (Cascading Style Sheets)** is the arcane discipline of **Enchantment Magic**. While HTML builds the raw anatomy of your page (headings, paragraphs, buttons), CSS enchants those elements with colors, typography, borders, and geometry.\n\n' +
      '**The three components of a Style Incantation:**\n' +
      '- **The Target (Selector)**: Which runes receive the charm? (e.g., `h1`, `p`, or `button`)\n' +
      '- **The Charm (Property)**: What physical trait are you transforming? (e.g., `color`, `font-size`, `background-color`)\n' +
      '- **The Potency (Value)**: What is the new state? (e.g., `purple`, `28px`, `#10B981`)\n\n' +
      'We inscribe these charms inside a `<style>` chamber placed within the `<head>` of our scroll.',
    whatIsThisCallout:
      '✨ The Rune of Binding: Every CSS declaration must end with a semicolon `;` and property-value pairs are bound by a colon `:`. Forgetting a semicolon disrupts the enchantment circle!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🪄 How do I weave a Style Enchantment?',
    howToWriteBody:
      'Inside the `<head>` of your HTML document, summon a `<style>` tag. Inside this chamber, write the element selector followed by curly braces `{ ... }`. Inside the braces, list your property-value pairs.',
    codeExample:
`<style>
  /* Inscribe the Grand Title in royal amethyst */
  h1 {
    color: #9333EA;
    font-size: 32px;
    text-align: center;
  }

  /* Enchant all story runes with calm sage and soft cushioning */
  p {
    color: #374151;
    font-size: 18px;
    background-color: #F3E8FF;
  }
</style>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Enchant the bare scroll with Lady Lumina\'s styling magic! Add a `<style>` block in the `<head>`, give the `<h1>` heading a vibrant color, set its `font-size`, and style the paragraphs.',
    tasks: [
      {
        id: 'h7-t1',
        description: 'Summon the Style Chamber: add a `<style>` tag inside the `<head>` section.',
        codeKeyword: '<style>',
      },
      {
        id: 'h7-t2',
        description: 'Target the Grand Title: write a selector for `h1` with opening and closing braces.',
        codeKeyword: 'h1 {',
      },
      {
        id: 'h7-t3',
        description: 'Bestow Radiant Color: set the `color:` property inside your `h1` style.',
        codeKeyword: 'color:',
      },
      {
        id: 'h7-t4',
        description: 'Scale the Title Rune: define `font-size:` inside your `h1` rule.',
        codeKeyword: 'font-size:',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Enchant the scroll with CSS styling magic below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Enchantress's Wardrobe</title>
  </head>
  <body>
    <h1>Lady Lumina's Atelier</h1>
    <p>Every thread holds a spell, and every color tells a tale of wonder...</p>
  </body>
</html>`,

    hint:
      'Inside the <head> tags, place <style> h1 { color: #8B5CF6; font-size: 32px; } </style>. You can also add styles for p elements!',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Enchantress's Wardrobe</title>
    <style>
      h1 {
        color: #8B5CF6;
        font-size: 36px;
        text-align: center;
      }
      p {
        color: #4C1D95;
        font-size: 18px;
        background-color: #EDE9FE;
      }
    </style>
  </head>
  <body>
    <h1>Lady Lumina's Atelier</h1>
    <p>Every thread holds a spell, and every color tells a tale of wonder...</p>
  </body>
</html>`,

    stageType: 'styler' as any,
    stageConfig: {
      expectedProperties: ['color', 'font-size', 'background-color'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 8 — The Prism Caverns (CSS Colors & Radiant Gradients)
  // Theme: Underground Crystal Caves / Gemstone Refraction
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 108,
    chapter: 'Chapter 8: The Prism Caverns',
    title: 'The Prism Caverns',
    conceptName: 'CSS Colors & Radiant Gradients',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '💎 What are CSS Colors & Gradients?',
    whatIsThisBody:
      'Hidden deep beneath the Whispering Peaks lies the **Prism Caverns**, where giant fluorite crystals refract underground aurora light into cascading torrents of vivid color. Master crystal-smiths mix these magical pigments to forge armor and luminous banners.\n\n' +
      'In CSS, you have multiple magical vocabularies to command color:\n' +
      '- **Named Colors**: Standard verbal spells like `gold`, `crimson`, `rebeccapurple`\n' +
      '- **Hexadecimal Runes (`#RRGGBB`)**: Precise light coordinates in base-16. `#FF007F` is electric rose, while `#00F5D4` is astral turquoise!\n' +
      '- **RGB Essence (`rgb(red, green, blue)`)**: Numerical intensities from 0 to 255. `rgb(255, 215, 0)` summons radiant gold.\n' +
      '- **Linear Gradients (`linear-gradient(...)`)**: Merging two or more crystal hues into a seamless flowing river of light across backgrounds!',
    whatIsThisCallout:
      '🌈 Crystal Lore: `#FFFFFF` channels pure blinding daylight across all color channels, while `#000000` summons the void where light is completely absorbed.',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🧪 How do I blend Colors and Gradients?',
    howToWriteBody:
      'Assign colors to text with `color: #value;` and to backgrounds with `background-color:` or `background: linear-gradient(direction, color1, color2);`.' ,
    codeExample:
`<style>
  /* A banner glowing with crystal energy */
  .crystal-shrine {
    color: #FFFFFF;
    background: linear-gradient(135deg, #6366F1, #EC4899);
    padding: 24px;
    border-radius: 16px;
  }
</style>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Channel the radiant power of the Prism Caverns! Inscribe styles with a hexadecimal color and forge a stunning linear-gradient background for the crystal shrine.',
    tasks: [
      {
        id: 'h8-t1',
        description: 'Imbue the Background: use the `background:` property in your CSS.',
        codeKeyword: 'background',
      },
      {
        id: 'h8-t2',
        description: 'Inscribe a Hexadecimal Rune: use a `#` hex color code (like `#8B5CF6`).',
        codeKeyword: '#',
      },
      {
        id: 'h8-t3',
        description: 'Summon an Aurora Stream: craft a `linear-gradient` inside your background style.',
        codeKeyword: 'linear-gradient',
      },
      {
        id: 'h8-t4',
        description: 'Sharpen Text Illumination: declare the `color:` property for readability.',
        codeKeyword: 'color:',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Channel the radiant colors of the Prism Caverns below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Prism Caverns</title>
    <style>
      /* Inscribe your crystal color enchantments here */

    </style>
  </head>
  <body>
    <div class="crystal-shrine">
      <h1>The Chamber of Prisms</h1>
      <p>Crystal light cascades across the obsidian walls in radiant streams.</p>
    </div>
  </body>
</html>`,

    hint:
      'In your <style>, add: .crystal-shrine { background: linear-gradient(90deg, #7C3AED, #06B6D4); color: #FFFFFF; }',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Prism Caverns</title>
    <style>
      .crystal-shrine {
        background: linear-gradient(135deg, #7C3AED, #F43F5E);
        color: #FFFFFF;
        padding: 30px;
        border-radius: 12px;
      }
      h1 {
        color: #FDE047;
      }
    </style>
  </head>
  <body>
    <div class="crystal-shrine">
      <h1>The Chamber of Prisms</h1>
      <p>Crystal light cascades across the obsidian walls in radiant streams.</p>
    </div>
  </body>
</html>`,

    stageType: 'styler' as any,
    stageConfig: {
      expectedProperties: ['background', 'linear-gradient', 'color'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 9 — The Treasure Vault (The CSS Box Model)
  // Theme: Dwarven Treasury / Armor & Chests
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 109,
    chapter: 'Chapter 9: The Treasure Vault',
    title: 'The Treasure Vault',
    conceptName: 'The CSS Box Model',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '📦 What is the CSS Box Model?',
    whatIsThisBody:
      'In the fortified mountain holds of **Krag-Mor**, master dwarven locksmiths safeguard royal relics inside reinforced chests. Every chest is engineered with four distinct layers to protect the gold:\n\n' +
      '1. **The Relic (Content)**: The actual treasure inside — text, pictures, or icons (`width` & `height`)\n' +
      '2. **Velvet Cushioning (Padding)**: Soft inner padding between the jewels and the wooden box walls. It gives breathing room so relics never rub against iron!\n' +
      '3. **Iron Plating (Border)**: The visible physical perimeter of the chest (`border: 4px solid #D97706`)\n' +
      '4. **Security Moat (Margin)**: The clear perimeter space outside the chest that keeps neighboring chests from colliding in the vault!\n\n' +
      'Every single element on the web — from a tiny button to an entire section — is governed by this four-layer **Box Model**.',
    whatIsThisCallout:
      '🛡️ Locksmith\'s Rule: Padding lives INSIDE the border. Margin lives OUTSIDE the border. Mastering this distinction gives you total control over spatial harmony!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🔨 How do I forge the Box Layers?',
    howToWriteBody:
      'In your CSS styles, assign values to `width`, `padding`, `border`, and `margin`. You can specify values in pixels (`px`) or relative measurements like `rem`.',
    codeExample:
`<style>
  .treasure-chest {
    width: 320px;
    padding: 24px;              /* Velvet inner cushion */
    border: 4px solid #D97706;  /* Golden iron rim */
    margin: 32px auto;          /* Centered security moat */
    background-color: #451A03;
    color: #FDE68A;
  }
</style>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Forge a legendary dwarven treasure chest using the Box Model! Set the chest\'s width, line its interior with velvet padding, forge a solid border, and establish an outer margin.',
    tasks: [
      {
        id: 'h9-t1',
        description: 'Set Inner Velvet Cushioning: declare `padding:` on your chest element.',
        codeKeyword: 'padding:',
      },
      {
        id: 'h9-t2',
        description: 'Forge the Protective Rim: define a `border:` with thickness, style, and color.',
        codeKeyword: 'border:',
      },
      {
        id: 'h9-t3',
        description: 'Establish the Perimeter Moat: add `margin:` to space the chest from other relics.',
        codeKeyword: 'margin:',
      },
      {
        id: 'h9-t4',
        description: 'Calibrate Chest Width: set the `width:` dimension in pixels.',
        codeKeyword: 'width:',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Forge the dwarven treasure chest using the Box Model below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Treasure Vault</title>
    <style>
      .vault-chest {
        background-color: #1E293B;
        color: #F8FAFC;
        /* Forge width, padding, border, and margin below */

      }
    </style>
  </head>
  <body>
    <div class="vault-chest">
      <h2>Chest of the Dragon Heart</h2>
      <p>Inside lies the smoldering ember of Mount Ignis, pulsing with primordial fire.</p>
    </div>
  </body>
</html>`,

    hint:
      'Add inside .vault-chest: width: 340px; padding: 20px; border: 3px solid #F59E0B; margin: 25px auto;',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Treasure Vault</title>
    <style>
      .vault-chest {
        background-color: #1E293B;
        color: #F8FAFC;
        width: 340px;
        padding: 24px;
        border: 4px solid #F59E0B;
        margin: 30px auto;
        border-radius: 8px;
      }
    </style>
  </head>
  <body>
    <div class="vault-chest">
      <h2>Chest of the Dragon Heart</h2>
      <p>Inside lies the smoldering ember of Mount Ignis, pulsing with primordial fire.</p>
    </div>
  </body>
</html>`,

    stageType: 'styler' as any,
    stageConfig: {
      expectedProperties: ['padding', 'border', 'margin', 'width'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 10 — The Shapeshifter's Arena (CSS Flexbox Formations)
  // Theme: Gladiator Arena / Shapeshifter Battle Formations
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 110,
    chapter: 'Chapter 10: The Shapeshifter\'s Arena',
    title: 'The Shapeshifter\'s Arena',
    conceptName: 'CSS Flexbox Battle Formations',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '⚔️ What is Flexbox?',
    whatIsThisBody:
      'At the **Grand Colosseum of Val-Drakor**, arena marshals train shapeshifting elemental warriors. When horn blasts sound, squads must rearrange their battle formations instantly: standing shoulder-to-shoulder, marching in single file, or spacing themselves across the arena grounds.\n\n' +
      '**CSS Flexbox (Flexible Box Layout)** is the supreme martial discipline of one-dimensional layouts. It gives the parent commander the power to align, space, and distribute child elements gracefully across any screen width!\n\n' +
      '**The Arena Commands:**\n' +
      '- `display: flex` — Commands the arena container to enter Flex Formation\n' +
      '- `justify-content` — Organizes warriors along the marching axis (`center`, `space-between`, `space-around`, `flex-start`)\n' +
      '- `align-items` — Calibrates posture perpendicular to the march (`center`, `flex-start`, `stretch`)\n' +
      '- `gap` — Sets an honorable breathing distance between all squad members with zero margin headaches!',
    whatIsThisCallout:
      '🥋 Legendary Centering Trick: To center any card, character, or orb dead-center on a page, declare: `display: flex; justify-content: center; align-items: center;` on the arena!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🛡️ How do I command a Flex Formation?',
    howToWriteBody:
      'Inscribe `display: flex;` on the squad\'s parent wrapper. Then govern their positions using `justify-content:` and `gap:`.',
    codeExample:
`<style>
  .squad-roster {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
  }

  .warrior-card {
    background: #312E81;
    color: #E0E7FF;
    padding: 16px;
    border-radius: 8px;
  }
</style>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Command the shapeshifting warriors at the Colosseum! Turn the arena into a flex container, distribute the gladiators evenly with justify-content, align them with align-items, and separate them with gap.',
    tasks: [
      {
        id: 'h10-t1',
        description: 'Activate Flex Formation: declare `display: flex;` on `.arena-floor`.',
        codeKeyword: 'display: flex;',
      },
      {
        id: 'h10-t2',
        description: 'Distribute along the Battle Axis: use `justify-content:` to position warriors.',
        codeKeyword: 'justify-content:',
      },
      {
        id: 'h10-t3',
        description: 'Align Squad Posture: set `align-items:` on the arena container.',
        codeKeyword: 'align-items:',
      },
      {
        id: 'h10-t4',
        description: 'Maintain Breathing Room: declare a `gap:` between gladiators.',
        codeKeyword: 'gap:',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Marshal the Colosseum warriors using Flexbox below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Shapeshifter's Arena</title>
    <style>
      .arena-floor {
        /* Command the flex formation here */

      }
      .gladiator {
        background: #1E1B4B;
        color: #C7D2FE;
        padding: 18px;
        border-radius: 10px;
        border: 2px solid #6366F1;
      }
    </style>
  </head>
  <body>
    <div class="arena-floor">
      <div class="gladiator">🔥 Pyromancer Ignis</div>
      <div class="gladiator">❄️ Frostwalker Cryo</div>
      <div class="gladiator">⚡ Stormcaller Zephyr</div>
    </div>
  </body>
</html>`,

    hint:
      'Inside .arena-floor, add: display: flex; justify-content: space-around; align-items: center; gap: 16px;',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Shapeshifter's Arena</title>
    <style>
      .arena-floor {
        display: flex;
        justify-content: space-around;
        align-items: center;
        gap: 20px;
        background: #0F172A;
        padding: 24px;
        border-radius: 12px;
      }
      .gladiator {
        background: #1E1B4B;
        color: #C7D2FE;
        padding: 18px;
        border-radius: 10px;
        border: 2px solid #6366F1;
      }
    </style>
  </head>
  <body>
    <div class="arena-floor">
      <div class="gladiator">🔥 Pyromancer Ignis</div>
      <div class="gladiator">❄️ Frostwalker Cryo</div>
      <div class="gladiator">⚡ Stormcaller Zephyr</div>
    </div>
  </body>
</html>`,

    stageType: 'layout' as any,
    stageConfig: {
      expectedProperties: ['display', 'justify-content', 'align-items', 'gap'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 11 — The Architect's Citadel (CSS Grid Citadel Blueprints)
  // Theme: Floating Sky Castle / Celestial Masonry Blueprint
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 111,
    chapter: 'Chapter 11: The Architect\'s Citadel',
    title: 'The Architect\'s Citadel',
    conceptName: 'CSS Grid Citadel Blueprints',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '🏛️ What is CSS Grid?',
    whatIsThisBody:
      'Floating high amidst the celestial cloud banks, the **Aether Citadel** is anchored by interlocking columns and flying buttresses of solid lapis lazuli. To engineer such a multi-level fortress, high archmages don\'t work in simple lines — they draft complete two-dimensional blueprints!\n\n' +
      '**CSS Grid** is the master architect\'s system for 2-dimensional spatial layouts. While Flexbox manages items along a single axis (row or column), CSS Grid commands columns AND rows simultaneously, placing spires, armories, grand halls, and dungeons with pinpoint precision!\n\n' +
      '**The Architectural Invocations:**\n' +
      '- `display: grid` — Inscribes the grid coordinate matrix\n' +
      '- `grid-template-columns` — Defines column widths (e.g., `1fr 1fr 1fr` for three equal wings)\n' +
      '- `fr (Fractional Unit)` — The unit of free magical space! `1fr 2fr` grants twice as much corridor width to the second room\n' +
      '- `gap` — Carves castle corridors and courtyards between rooms',
    whatIsThisCallout:
      '📐 The `repeat()` Shortcut: Instead of chanting `1fr 1fr 1fr 1fr`, you can invoke `repeat(4, 1fr)`. High mages always prefer succinct incantations!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🏰 How do I construct a Grid Citadel?',
    howToWriteBody:
      'On the citadel wrapper, declare `display: grid;`. Then shape its wings using `grid-template-columns: repeat(3, 1fr);` and carve courtyard pathways with `gap: 16px;`.',
    codeExample:
`<style>
  .citadel-wings {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 20px;
  }

  .chamber {
    background: #0284C7;
    color: #F0F9FF;
    padding: 20px;
    border-radius: 8px;
  }
</style>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Erect the multi-chamber wings of the Aether Citadel! Transform the citadel container into a CSS Grid with three balanced columns and courtyard corridors.',
    tasks: [
      {
        id: 'h11-t1',
        description: 'Establish the Grid Matrix: declare `display: grid;` on `.citadel-layout`.',
        codeKeyword: 'display: grid;',
      },
      {
        id: 'h11-t2',
        description: 'Carve Column Shafts: define `grid-template-columns:` on the citadel container.',
        codeKeyword: 'grid-template-columns:',
      },
      {
        id: 'h11-t3',
        description: 'Harness Free Fractional Space: use the `fr` unit in your column definition.',
        codeKeyword: 'fr',
      },
      {
        id: 'h11-t4',
        description: 'Carve Castle Corridors: set `gap:` between grid chambers.',
        codeKeyword: 'gap:',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Construct the Aether Citadel using CSS Grid below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Architect's Citadel</title>
    <style>
      .citadel-layout {
        /* Inscribe grid blueprint here */

      }
      .chamber {
        background: #0369A1;
        color: #E0F2FE;
        padding: 24px;
        border-radius: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="citadel-layout">
      <div class="chamber">🔭 Observatory Spire</div>
      <div class="chamber">👑 Council Throne</div>
      <div class="chamber">📚 Astral Archives</div>
      <div class="chamber">⚔️ Knights\' Barracks</div>
      <div class="chamber">🔮 Alchemy Crucible</div>
      <div class="chamber">🦅 Griffon Aviary</div>
    </div>
  </body>
</html>`,

    hint:
      'In .citadel-layout, add: display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px;',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Architect's Citadel</title>
    <style>
      .citadel-layout {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 20px;
        background: #082F49;
        padding: 24px;
        border-radius: 12px;
      }
      .chamber {
        background: #0369A1;
        color: #E0F2FE;
        padding: 24px;
        border-radius: 10px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="citadel-layout">
      <div class="chamber">🔭 Observatory Spire</div>
      <div class="chamber">👑 Council Throne</div>
      <div class="chamber">📚 Astral Archives</div>
      <div class="chamber">⚔️ Knights\' Barracks</div>
      <div class="chamber">🔮 Alchemy Crucible</div>
      <div class="chamber">🦅 Griffon Aviary</div>
    </div>
  </body>
</html>`,

    stageType: 'layout' as any,
    stageConfig: {
      expectedProperties: ['display', 'grid-template-columns', 'gap'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════
  // LESSON 12 — The Mimic's Mirror (Responsive Design & Media Queries)
  // Theme: Eldritch Mimic / Adaptive Illusion Magic
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 112,
    chapter: 'Chapter 12: The Mimic\'s Mirror',
    title: 'The Mimic\'s Mirror',
    conceptName: 'Responsive Design & Media Queries',

    // ── Section 1: What is this? ──
    whatIsThisTitle: '🪞 What is Responsive Design & Media Queries?',
    whatIsThisBody:
      'In the bazaar of **Ouroboros**, illusionists marvel at the **Mimic\'s Mirror**. When held up to a pocket spyglass, the mirror condenses its vision into a single focused column. When placed inside a grand palace archway, it stretches out into a panoramic tapestry!\n\n' +
      'In modern webcraft, adventurers scry your scrolls across thousands of different devices: pocket smartphones, magic slates (tablets), laptops, and massive scrying pools (desktop monitors). **Responsive Design** guarantees your creation looks stunning regardless of viewport dimensions.\n\n' +
      '**The Shapeshifter\'s Invocations:**\n' +
      '- `@media (max-width: 768px)` — The **Perception Ward**: triggers special CSS rules ONLY when the scrying mirror is 768 pixels wide or narrower!\n' +
      '- `flex-direction: column` — Stacks warriors vertically on narrow pocket screens so they don\'t squash each other\n' +
      '- `max-width: 100%` — Keeps enchanted images and containers from breaking beyond the screen\'s boundaries',
    whatIsThisCallout:
      '📱 The Mobile-First Creed: Over 60% of realm travelers browse via mobile slates. If your scroll looks broken on a phone, most adventurers will turn back and never return to your kingdom!',

    // ── Section 2: How to write it ──
    howToWriteTitle: '🔮 How do I cast a Media Query Ward?',
    howToWriteBody:
      'Write your standard desktop layout first. Then at the bottom of your `<style>` block, inscribe an `@media (max-width: ...)` block to reshape the layout for smaller viewports.',
    codeExample:
`<style>
  /* Standard desktop formation: horizontal row */
  .mimic-container {
    display: flex;
    flex-direction: row;
    gap: 16px;
  }

  /* Pocket Screen Ward: stack into vertical column */
  @media (max-width: 640px) {
    .mimic-container {
      flex-direction: column;
    }
  }
</style>`,

    // ── Section 3: Tasks ──
    taskObjective:
      'Enchant your scroll with the Mimic\'s adaptive magic! Implement a media query with a max-width condition that switches a horizontal flex layout into a mobile-friendly vertical stack.',
    tasks: [
      {
        id: 'h12-t1',
        description: 'Cast the Perception Ward: inscribe an `@media` query in your stylesheet.',
        codeKeyword: '@media',
      },
      {
        id: 'h12-t2',
        description: 'Set Viewport Boundary: define a `max-width:` condition inside the media query.',
        codeKeyword: 'max-width:',
      },
      {
        id: 'h12-t3',
        description: 'Shapeshift to Vertical Stack: set `flex-direction:` inside the responsive ward.',
        codeKeyword: 'flex-direction:',
      },
      {
        id: 'h12-t4',
        description: 'Ensure Fluid Adaptation: set `width: 100%` on the cards.',
        codeKeyword: 'width: 100%',
      },
    ],

    initialCode:
`<!-- 🪄 "type code here" -->
<!-- Inscribe responsive media query wards below -->
<!DOCTYPE html>
<html>
  <head>
    <title>The Mimic's Mirror</title>
    <style>
      .mirror-panel {
        display: flex;
        flex-direction: row;
        gap: 16px;
      }
      .mirror-shard {
        width: 100%;
        background: #3B0764;
        color: #F5D0FE;
        padding: 20px;
        border-radius: 8px;
      }

      /* Inscribe your @media query ward below */

    </style>
  </head>
  <body>
    <div class="mirror-panel">
      <div class="mirror-shard">🪞 Shard of the North</div>
      <div class="mirror-shard">🪞 Shard of the East</div>
      <div class="mirror-shard">🪞 Shard of the West</div>
    </div>
  </body>
</html>`,

    hint:
      'Add inside <style>: @media (max-width: 600px) { .mirror-panel { flex-direction: column; } }',
    solutionCode:
`<!DOCTYPE html>
<html>
  <head>
    <title>The Mimic's Mirror</title>
    <style>
      .mirror-panel {
        display: flex;
        flex-direction: row;
        gap: 16px;
      }
      .mirror-shard {
        width: 100%;
        background: #3B0764;
        color: #F5D0FE;
        padding: 20px;
        border-radius: 8px;
        border: 2px solid #C084FC;
      }

      @media (max-width: 600px) {
        .mirror-panel {
          flex-direction: column;
        }
      }
    </style>
  </head>
  <body>
    <div class="mirror-panel">
      <div class="mirror-shard">🪞 Shard of the North</div>
      <div class="mirror-shard">🪞 Shard of the East</div>
      <div class="mirror-shard">🪞 Shard of the West</div>
    </div>
  </body>
</html>`,

    stageType: 'layout' as any,
    stageConfig: {
      expectedProperties: ['@media', 'max-width', 'flex-direction'],
    },
  },
];
