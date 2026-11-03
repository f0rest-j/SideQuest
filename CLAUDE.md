# CLAUDE.md — SideQuest MVP

## 0. Mission

Build a polished, mobile-first MVP called **SideQuest**.

SideQuest turns everyday real-world exploration into a modern urban RPG. The player receives small quests to complete away from the screen, earns XP, levels up, builds streaks, and unlocks achievements.

The core product question is:

> Is it surprisingly fun and motivating to earn XP for completing small adventures in the real world?

Work autonomously. Inspect the repository before changing anything. If the repository is empty, scaffold the application. Implement the complete MVP described below, run all available checks, fix errors, and leave the repository in a clean, runnable state.

Do not stop after creating a plan or static mockup. Build the working product.

---

## 1. Product identity

### Product name

**SideQuest**

### Tagline

**Your life is the open world.**

### Short pitch

SideQuest makes the real world feel like an open-world RPG. Players receive small, achievable quests such as taking a new route home, visiting an unfamiliar place, watching the sunset, or spending time outside without their phone. Completing quests grants XP, levels, streaks, and achievements.

### Experience principles

1. **Adventure, not productivity**  
   This must not feel like a task manager, fitness tracker, corporate wellness product, or habit app.

2. **Low friction**  
   A player should understand and accept a quest within seconds.

3. **Satisfying progression**  
   XP gains, progress bars, completion feedback, streaks, achievements, and level-ups should feel rewarding.

4. **Real-world first**  
   The app encourages the player to put the phone away and do something in the physical world.

5. **Modern urban RPG**  
   Use subtle game language and visual cues. Avoid medieval parody, excessive fantasy ornamentation, dragons, scrolls, and “ye olde quest master” styling.

6. **Safe and accessible**  
   Quests must not encourage trespassing, unsafe travel, harassment, illegal activity, dangerous weather exposure, distracted walking, or disclosure of precise location.

---

## 2. MVP scope

The MVP must let a player:

1. Open the app and land on the Quest Board.
2. See three available quests.
3. Accept one quest.
4. See the accepted quest as active.
5. Complete or abandon an active quest.
6. Receive XP when completing a quest.
7. See XP animate into the level progress bar.
8. Level up when crossing a threshold.
9. Receive visible completion and level-up feedback.
10. Generate replacement quests.
11. View player stats and progression.
12. View unlocked and locked achievements.
13. View recently completed quests.
14. Preserve progress across reloads with local storage.
15. Reset all local progress from Settings after explicit confirmation.

### Explicitly out of scope for v0.1

Do not add these unless they are trivial and do not delay or destabilize the MVP:

- Authentication
- Accounts
- Backend or cloud database
- Supabase
- GPS tracking
- Maps
- Camera proof
- AI-generated quests
- Social features
- Friends or leaderboards
- Push notifications
- Payments
- Ads
- Native mobile packaging
- User-generated public content
- Complex avatar customization

The app should be designed so these can be added later, but do not implement them now.

---

## 3. Technical baseline

If starting from an empty repository, use:

- **Next.js** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS**
- **React**
- **Lucide React** for icons
- **Framer Motion / Motion** for meaningful UI animations
- Browser **localStorage** for persistence
- **Vitest** and React Testing Library for unit/component tests when practical
- **Playwright** for one critical happy-path end-to-end test when practical

Use the current stable package releases compatible with one another. Prefer the package manager implied by the existing lockfile. If there is no lockfile, use `npm`.

### Engineering rules

- Keep dependencies modest.
- Do not introduce a backend.
- Do not use `any` unless genuinely unavoidable.
- Keep domain logic separate from presentation components.
- Use semantic HTML and accessible controls.
- Respect `prefers-reduced-motion`.
- Do not require a network connection after dependencies are installed.
- Do not use remote images for core UI.
- Use icons, gradients, CSS effects, and typography rather than stock imagery.
- Never commit secrets or API keys.
- Do not weaken linting or TypeScript settings to make errors disappear.
- Do not delete useful existing functionality without a clear reason.

### Suggested commands

Adapt these to the actual repository:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Add missing scripts where appropriate.

---

## 4. Information architecture

Use a mobile-first bottom navigation with these primary destinations:

1. **Quests** — quest board and active quest
2. **Hero** — player profile, level, XP, stats, and recent activity
3. **Achievements** — unlocked and locked achievements

Settings may be accessed from a compact button in the top bar or Hero screen rather than as a fourth permanent tab.

On desktop, constrain the content to a polished app-like shell rather than stretching cards across the full viewport.

Recommended maximum app width: approximately `480–560px`, with a useful wider layout permitted for the Hero screen if it improves readability.

---

## 5. Screens and states

### 5.1 First-run onboarding

Keep onboarding brief. Maximum three lightweight steps or one well-designed welcome screen.

Required input:

- Player name, defaulting to `Adventurer`

Optional preference inputs if implemented cleanly:

- Typical energy: low, medium, high
- Preferred quest categories

Primary action:

- **Begin adventure**

On completion, save the player profile locally and open the Quest Board.

### 5.2 Quest Board

Must show:

- SideQuest wordmark
- Greeting or player name
- Current level
- XP progress bar with numeric progress
- Active quest, if one exists
- Three available quest cards when there is no active quest, or a compact available list below the active quest
- Refresh/reroll action
- Bottom navigation

Each quest card must show:

- Rarity
- Category icon
- Title
- Short description
- Estimated duration
- XP reward
- Accept action

Do not hide all useful information behind an extra modal.

### 5.3 Quest detail / active quest

Must show:

- Title
- Description
- Rarity
- Category
- XP reward
- Estimated duration
- Safety note when relevant
- Accepted timestamp or “Active now”
- **Complete quest** button
- **Abandon quest** secondary action

Completion may require a confirmation step such as:

> Did you complete this quest in the real world?

Do not require proof in the MVP.

### 5.4 Completion celebration

When a quest is completed:

- Show a short celebratory transition or modal
- Display the completed quest title
- Display XP earned prominently
- Animate XP/progress increase
- Show any unlocked achievement
- Show level-up feedback if applicable
- Offer a clear **Continue** action

The animation should be satisfying but fast, and should degrade gracefully when reduced motion is enabled.

### 5.5 Hero screen

Must show:

- Player name
- Title based on level
- Current level
- Total XP
- Progress toward next level
- Quests completed
- Current streak
- Longest streak
- Rare-or-better quests completed
- Recent completed quests

A simple abstract avatar or emblem is sufficient. Avoid a complex avatar builder.

### 5.6 Achievements screen

Show unlocked and locked achievements in a visually clear grid or list.

Each achievement includes:

- Icon
- Name
- Description
- Progress if applicable
- XP bonus only if the implementation handles bonus awarding exactly once
- Unlock date when unlocked

Locked achievements may reveal their requirements. Do not use manipulative hidden requirements in the MVP.

### 5.7 Settings

Must include:

- Edit player name
- Reduced motion preference, while also respecting OS preference
- Sound preference placeholder only if sound is actually implemented
- Reset all progress
- Version label, e.g. `SideQuest v0.1`

Reset must require explicit confirmation and explain that local progress will be removed.

### 5.8 Empty and error states

Implement intentional states for:

- No completed quests yet
- No available quest cards due to corrupted local data
- localStorage unavailable or invalid
- Reset complete

Recover from malformed persisted data by migrating or restoring safe defaults rather than crashing.

---

## 6. Visual direction

### Mood

A polished modern indie game interface with an urban-night atmosphere.

Keywords:

- charcoal
- warm off-white
- electric lime
- muted rarity colors
- subtle grain
- soft glow
- large, confident typography
- high-contrast cards
- restrained animation

### Avoid

- Corporate dashboards
- Pastel productivity-app styling
- Excessive glassmorphism
- Medieval parchment
- Cartoon dragons
- Dense metrics
- Neon overload
- Tiny text
- Generic Bootstrap appearance

### Suggested design tokens

Treat these as a starting point, not a rigid requirement:

```css
--background: #0b0d0f;
--surface: #13171a;
--surface-elevated: #1a1f23;
--border: #293036;
--text: #f4f1e8;
--text-muted: #9ca5a9;
--accent: #b8ff5a;
--accent-dark: #78b82a;
--danger: #ff6b6b;

--common: #aab2b7;
--uncommon: #65d68a;
--rare: #5da9ff;
--epic: #b982ff;
--legendary: #ffad42;
```

### Typography

Use a distinctive display face only if it can be bundled safely or sourced through the framework without making the app fragile. Otherwise use a strong system-font stack with thoughtful scale and weight.

### Interaction details

- Cards should have clear pressed, hover, and focus states.
- Touch targets should be at least 44×44 CSS pixels.
- Focus indicators must remain visible.
- Actions must not rely on color alone.
- Level progress should include readable numeric text.
- Rarity should use both color and text/icon treatment.

---

## 7. Domain model

Use a typed domain model similar to the following. Adapt names if a better structure emerges.

```ts
export type QuestRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type QuestCategory =
  | "exploration"
  | "outdoors"
  | "creative"
  | "social"
  | "mindful";

export type QuestStatus = "available" | "active" | "completed" | "abandoned";

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  rarity: QuestRarity;
  xp: number;
  estimatedMinutes: number;
  safetyNote?: string;
  tags?: string[];
}

export interface QuestInstance extends QuestTemplate {
  instanceId: string;
  status: QuestStatus;
  offeredAt: string;
  acceptedAt?: string;
  completedAt?: string;
  abandonedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletionDate?: string;
  createdAt: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  metric: string;
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  unlockedAt?: string;
}

export interface AppState {
  schemaVersion: number;
  player: Player;
  availableQuests: QuestInstance[];
  activeQuest: QuestInstance | null;
  questHistory: QuestInstance[];
  achievements: AchievementProgress[];
  settings: {
    reducedMotion: boolean;
  };
}
```

Persist dates as ISO strings. Do not persist non-serializable values.

---

## 8. XP and level system

Use a deterministic XP curve.

Recommended total XP threshold for reaching level `L`:

```ts
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(125 * Math.pow(level - 1, 1.65));
}
```

The implementation must expose pure functions for:

- Determining level from total XP
- XP threshold for current level
- XP threshold for next level
- XP earned within the current level
- XP required to finish the current level
- Progress percentage

Requirements:

- Level 1 starts at 0 XP.
- One completion may cross multiple levels without breaking.
- Progress percentage must be clamped between 0 and 100.
- Level-up detection compares previous and new levels.
- Tests must cover exact boundaries and values immediately before/after a threshold.

Player titles:

- Levels 1–2: **Wanderer**
- Levels 3–5: **Explorer**
- Levels 6–9: **Adventurer**
- Levels 10–14: **Trailblazer**
- Levels 15–19: **Pathfinder**
- Level 20+: **Living Legend**

---

## 9. Streak rules

A streak is based on local calendar dates, not rolling 24-hour periods.

When a quest is completed:

- If there is no previous completion date: streak becomes 1.
- If the last completion was today: streak does not increase.
- If the last completion was yesterday: streak increases by 1.
- If the last completion was earlier than yesterday: streak resets to 1.

Update longest streak when current streak exceeds it.

Keep date handling in isolated pure functions and add tests. Avoid timezone bugs caused by comparing raw UTC dates to local dates.

---

## 10. Quest rarity and rewards

Use these reward bands:

| Rarity | XP range | Intended effort |
|---|---:|---|
| Common | 25–50 XP | Small action, 5–20 min |
| Uncommon | 60–100 XP | Moderate departure from routine |
| Rare | 125–225 XP | Memorable or meaningful outing |
| Epic | 300–500 XP | Larger intentional adventure |
| Legendary | 750–1,000 XP | Major challenge, very uncommon |

For the MVP quest pool:

- Mostly Common and Uncommon
- Some Rare
- A very small number of Epic
- Legendary quests should not appear in the standard random board unless deliberately enabled later

Suggested board distribution:

- Common: 45%
- Uncommon: 35%
- Rare: 17%
- Epic: 3%
- Legendary: 0%

Ensure the offered board contains unique quest templates and preferably varied categories.

Avoid repeating a recently completed or abandoned quest until other suitable quests have been offered.

Reroll behavior:

- Allow rerolling the available board.
- Do not use dark-pattern currencies or artificial waiting timers.
- If an active quest exists, rerolling available quests must not affect it.

---

## 11. Initial quest library

Create at least **35 handcrafted quests** across categories and rarity levels. Keep them concise, safe, realistic, and possible without purchases.

Use these as required seeds and add more in the same voice.

### Exploration

1. **The Scenic Route**  
   Uncommon · 80 XP · 25 min  
   Walk somewhere nearby that you have never walked before.

2. **The Long Way Home**  
   Common · 40 XP · 15 min  
   Take a different route home than the one you normally use.

3. **Hidden Gem**  
   Rare · 175 XP · 45 min  
   Find a public place in your area that you have never visited.

4. **End of the Line**  
   Rare · 200 XP · 60 min  
   Take familiar public transport a few stops farther than usual and explore a safe public area. Check the return route before leaving.

5. **Street You Never Chose**  
   Common · 35 XP · 15 min  
   Choose an unfamiliar public street and follow it until the next interesting turn.

6. **Local Tourist**  
   Uncommon · 90 XP · 35 min  
   Visit a nearby landmark as if you were seeing your town for the first time.

7. **Three Left Turns**  
   Common · 30 XP · 10 min  
   Start a walk and take the next three safe left turns. See where you end up.

8. **New Horizon**  
   Epic · 400 XP · 120 min  
   Plan and complete a longer visit to a safe public place you have never explored.

### Outdoors

9. **Touch Grass**  
   Uncommon · 75 XP · 30 min  
   Spend 30 minutes outside without actively using your phone.

10. **Golden Hour**  
    Rare · 150 XP · 45 min  
    Watch sunrise or sunset from a safe public viewpoint.

11. **Fresh Air Reset**  
    Common · 30 XP · 10 min  
    Step outside for ten minutes and notice five things around you.

12. **Park Bench Pause**  
    Common · 35 XP · 15 min  
    Sit somewhere outdoors and do nothing for fifteen minutes.

13. **Weatherproof**  
    Uncommon · 70 XP · 20 min  
    Take a short walk in ordinary imperfect weather. Dress appropriately and skip unsafe conditions.

14. **Green Detour**  
    Uncommon · 85 XP · 30 min  
    Make a park, garden, waterfront, or other green space part of today's route.

15. **Dawn Patrol**  
    Rare · 180 XP · 45 min  
    Go outside early enough to experience your neighborhood waking up. Stay in safe, familiar public areas.

### Creative

16. **Urban Sketch**  
    Uncommon · 80 XP · 25 min  
    Sit in a public place and sketch something you can see. Skill does not matter.

17. **Five Frames**  
    Common · 45 XP · 20 min  
    Take five photos that share one color or shape.

18. **Sound Collector**  
    Uncommon · 65 XP · 20 min  
    Write down five distinct sounds you notice on a short walk.

19. **Tiny Field Guide**  
    Rare · 140 XP · 40 min  
    Document three interesting plants, buildings, objects, or signs from one area.

20. **One-Block Story**  
    Uncommon · 90 XP · 30 min  
    Walk one block slowly, then write a six-sentence story inspired by it.

21. **Texture Hunt**  
    Common · 40 XP · 15 min  
    Find and photograph five different textures without identifying people.

22. **Postcard to Yourself**  
    Rare · 130 XP · 30 min  
    Visit a pleasant public place and write a short note to your future self.

### Social

23. **Small Kindness**  
    Common · 50 XP · 10 min  
    Do one considerate thing for someone without expecting anything in return.

24. **Reconnect**  
    Uncommon · 85 XP · 20 min  
    Contact someone you appreciate but have not spoken with recently.

25. **Ask a Local**  
    Rare · 150 XP · 30 min  
    Ask someone you already interact with for a nearby place they recommend, then visit it when practical.

26. **Shared Walk**  
    Uncommon · 100 XP · 30 min  
    Invite someone for a walk with no agenda beyond catching up.

27. **Phone-Free Coffee**  
    Uncommon · 90 XP · 30 min  
    Share a drink or break with someone and keep the phone away.

28. **Give Credit**  
    Common · 40 XP · 10 min  
    Tell someone specifically what you appreciate about something they did.

### Mindful

29. **Airplane Mode**  
    Uncommon · 70 XP · 30 min  
    Put your phone away for thirty minutes while awake and do something offline.

30. **Notice the Ordinary**  
    Common · 30 XP · 10 min  
    Find three ordinary things nearby that are better designed than you first noticed.

31. **Solo Adventurer**  
    Rare · 160 XP · 45 min  
    Visit a safe public place alone that you would normally only visit with company.

32. **Break the Routine**  
    Common · 45 XP · 15 min  
    Do one harmless everyday activity in a different way today.

33. **No Headphones**  
    Common · 35 XP · 15 min  
    Take a short safe walk without headphones and pay attention to the surroundings.

34. **Slow Quest**  
    Uncommon · 75 XP · 20 min  
    Complete a familiar short route at a deliberately slower pace.

35. **Main Character Moment**  
    Epic · 350 XP · 90 min  
    Plan a safe solo outing that feels memorable, intentional, and different from your normal week.

### Quest content safety rules

All future quest templates must follow these rules:

- Never instruct users to trespass.
- Never require interaction with strangers.
- Never require spending money.
- Never require driving while using the app.
- Never encourage travel without a safe return plan.
- Never encourage dangerous weather exposure.
- Never encourage substance use.
- Never ask for photos of identifiable strangers.
- Never require entering isolated or unsafe locations.
- Never present medical or mental-health treatment as a quest.
- Allow the player to abandon any quest without penalty.

---

## 12. Achievement system

Implement at least these achievements:

1. **First Steps**  
   Complete 1 quest.

2. **Adventurer**  
   Complete 10 quests.

3. **Explorer**  
   Complete 25 quests.

4. **SideQuest Enjoyer**  
   Complete 100 quests.

5. **Touch Grass**  
   Complete 10 outdoor quests.

6. **Creative Spark**  
   Complete 10 creative quests.

7. **On a Roll**  
   Reach a 3-day streak.

8. **Unbroken**  
   Reach a 7-day streak.

9. **Main Character Energy**  
   Complete the first Rare-or-better quest.

10. **Epic Tale**  
    Complete the first Epic quest.

Requirements:

- Achievement evaluation must be deterministic.
- Unlock an achievement only once.
- Show newly unlocked achievements during the completion celebration.
- Persist unlock timestamps.
- Add tests for at least the first completion, category-count, streak, and rarity achievements.

Avoid awarding bonus XP for achievements in v0.1 unless the logic guarantees exactly-once delivery and is thoroughly tested.

---

## 13. Persistence and migration

Use one namespaced localStorage key, for example:

```ts
const STORAGE_KEY = "sidequest:v1";
```

Requirements:

- Add `schemaVersion` to persisted state.
- Validate persisted data before use.
- A lightweight schema validator is acceptable; use Zod only if already present or if its value justifies the dependency.
- Handle unavailable localStorage gracefully.
- Handle malformed JSON gracefully.
- Preserve valid user progress during migrations.
- Provide a clearly separated repository/storage adapter so persistence can later be replaced by Supabase or another backend.
- Do not access localStorage during server rendering.
- Avoid hydration mismatches.

Provide a developer-only mechanism for quickly seeding a high-level player if useful, but do not expose it prominently in production UI.

---

## 14. State transitions

Keep quest and player state transitions explicit and testable.

### Accept quest

- Only one active quest at a time.
- Move the chosen quest from available to active.
- Set `status = "active"` and `acceptedAt`.
- If a quest is already active, prevent accepting another and explain why in the UI.

### Complete quest

- Require an active quest.
- Set status and completion timestamp.
- Add XP exactly once.
- Calculate previous/new level.
- Update streak.
- Update quest statistics.
- Evaluate achievements.
- Move quest into history.
- Clear active quest.
- Generate a replacement offer if needed.
- Show a completion result object to the UI.

Double-clicking or repeated dispatch must never reward XP twice.

### Abandon quest

- Mark the quest abandoned with timestamp.
- Add it to history or a separate compact audit trail.
- Do not remove XP.
- Do not break streak.
- Do not punish the player.
- Clear active quest and ensure replacement quests are available.

### Reroll board

- Preserve active quest.
- Replace only available quests.
- Avoid immediate duplicates where possible.

---

## 15. Accessibility and responsive behavior

Meet a sensible WCAG 2.2 AA baseline where practical.

Required:

- Keyboard-operable navigation and dialogs
- Visible focus states
- Semantic headings
- Accessible names for icon-only buttons
- Sufficient color contrast
- Rarity communicated with text, not color alone
- Dialog focus management
- Escape closes dismissible dialogs
- Reduced-motion support
- Live-region announcement or equivalent for important XP/achievement updates
- No horizontal scrolling at 320px viewport width
- Comfortable layout at 375px and 430px mobile widths
- App remains usable on desktop

---

## 16. Testing requirements

At minimum, add automated tests for core domain logic.

### Unit tests

- XP threshold calculation
- Level calculation at boundaries
- Progress calculation
- Streak behavior for same day, next day, and missed day
- Quest selection uniqueness
- Accept transition
- Complete transition
- Duplicate completion protection
- Achievement unlocking
- Persistence parsing/fallback

### Component tests, if practical

- Quest card renders rarity, reward, and action
- Accepting a quest changes visible state
- Completion celebration shows earned XP
- Reset dialog requires confirmation

### End-to-end happy path, if practical

1. Start app with clean storage.
2. Complete onboarding.
3. Accept a quest.
4. Complete it.
5. See XP increase.
6. Visit Hero screen.
7. Reload and verify progress remains.

Do not create brittle tests that depend on animation timing or exact incidental styling.

---

## 17. Suggested project structure

Use this only as guidance. Respect an existing repository structure when present.

```text
src/
  app/
    layout.tsx
    page.tsx
    globals.css
  components/
    achievements/
    hero/
    layout/
    quests/
    settings/
    ui/
  domain/
    achievements.ts
    levels.ts
    quests.ts
    streaks.ts
    transitions.ts
    types.ts
  data/
    quest-library.ts
    achievement-library.ts
  hooks/
    use-sidequest.ts
  lib/
    dates.ts
    ids.ts
    storage.ts
    validation.ts
  state/
    initial-state.ts
    reducer.ts
  tests/
```

Prefer small, cohesive modules over a single giant component.

---

## 18. Copy and tone

The interface language should be **English** in v0.1 so the product can be shared broadly. Keep all user-facing copy centralized or easy to localize later.

Tone:

- concise
- adventurous
- encouraging
- slightly playful
- never patronizing
- never guilt-inducing

Good:

- `Quest complete`
- `Your next adventure is waiting.`
- `No penalty. Pick something that fits today.`
- `You reached Level 4.`

Avoid:

- `You failed your quest.`
- `You broke your streak!`
- `You only completed 2 quests this week.`
- excessive exclamation marks
- corporate wellness language

Suggested navigation labels:

- Quests
- Hero
- Achievements

Suggested actions:

- Accept quest
- Complete quest
- Abandon quest
- Reroll quests
- Continue
- Begin adventure

---

## 19. Definition of done

The MVP is done only when all applicable items below are true:

- [ ] App runs locally from documented commands.
- [ ] No TypeScript errors.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] Automated domain tests pass.
- [ ] User can onboard.
- [ ] Quest Board shows three valid, unique offers.
- [ ] User can accept one quest.
- [ ] User cannot accidentally accept multiple active quests.
- [ ] User can complete or abandon the active quest.
- [ ] Completion awards XP exactly once.
- [ ] Level progress updates correctly.
- [ ] Level-up state is shown when relevant.
- [ ] Streak updates correctly.
- [ ] Achievements unlock and persist.
- [ ] Quest history is visible.
- [ ] State survives reload.
- [ ] Malformed storage does not crash the app.
- [ ] Reset progress works only after confirmation.
- [ ] App works at 320px mobile width.
- [ ] Keyboard navigation and focus states work.
- [ ] Reduced-motion preference is respected.
- [ ] README explains setup, scripts, architecture, storage, and MVP limitations.
- [ ] No secrets, placeholder API keys, or backend requirements.
- [ ] No obvious console errors in the main flow.

---

## 20. Implementation workflow for Claude Code

Follow this sequence unless the existing repository strongly suggests another order.

### Phase 1: Inspect and plan

1. Inspect repository files, package scripts, lockfiles, and existing conventions.
2. Determine whether to extend or scaffold.
3. Write a compact implementation plan in the terminal/chat.
4. Do not wait for further approval unless a destructive conflict makes progress impossible.

### Phase 2: Foundation

1. Scaffold or normalize the Next.js TypeScript app.
2. Establish global styles and design tokens.
3. Create typed domain models.
4. Implement XP, level, date, streak, and quest-selection utilities.
5. Add unit tests for pure domain logic.

### Phase 3: State and persistence

1. Implement initial state.
2. Implement explicit state transitions or reducer.
3. Implement localStorage adapter and validation.
4. Add migration/fallback behavior.
5. Test duplicate completion protection.

### Phase 4: Product experience

1. Build onboarding.
2. Build app shell and bottom navigation.
3. Build Quest Board.
4. Build active quest flow.
5. Build completion celebration.
6. Build Hero screen.
7. Build Achievements screen.
8. Build Settings and reset confirmation.

### Phase 5: Polish

1. Add restrained motion and reduced-motion fallbacks.
2. Check mobile layouts at 320, 375, and 430 pixels.
3. Improve focus, keyboard, and screen-reader behavior.
4. Add empty/error states.
5. Verify copy consistency.

### Phase 6: Verification

Run all relevant commands, including:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

If Playwright is configured, run the happy path as well.

Fix failures rather than suppressing them. Then inspect the final diff and remove dead code, placeholder text, and debug logging.

---

## 21. Final response format

When implementation is complete, report:

1. What was built
2. Important architecture decisions
3. Files or modules worth knowing
4. Commands run and whether they passed
5. Any remaining limitations strictly within the stated MVP
6. Exact command to start the app

Do not claim checks passed unless they were actually run successfully.

---

## 22. Future-ready boundaries

Do not implement these now, but keep boundaries clean for future work:

- Supabase auth and database persistence
- Context-aware quest generation
- Weather-aware quest filtering
- Approximate location and map exploration
- Native iOS/Android wrapper
- Push notifications
- Friends and parties
- Cooperative quests
- Seasonal quest packs
- Quest authoring tools
- AI-assisted quest generation with safety moderation
- Anti-cheat or proof systems

The MVP should feel complete without them.

---

## 23. Immediate instruction

Start now.

Inspect the current repository. If it is empty, scaffold the application using the technical baseline. Build the complete SideQuest MVP, verify it, and leave it ready to run locally.
