import type { Mood, Mode, Personality } from './types'
import { pick } from './rng'

export const DEFAULT_PERSONALITY: Personality = 'deadpan_coach'

export const MOOD_TO_PERSONALITY: Record<Mood, Personality> = {
  drained: 'cozy_grandma',
  anxious: 'proud_father',
  flat: 'deadpan_coach',
  frustrated: 'drill_sergeant',
  good: 'enthusiastic_friend',
  great: 'dramatic_narrator',
}

export const MOOD_OPTIONS: { mood: Mood; label: string; emoji: string }[] = [
  { mood: 'drained', label: 'Drained / low', emoji: '🫠' },
  { mood: 'anxious', label: 'Anxious / overwhelmed', emoji: '😰' },
  { mood: 'flat', label: 'Flat / neutral', emoji: '😐' },
  { mood: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { mood: 'good', label: 'Good / motivated', emoji: '🙂' },
  { mood: 'great', label: 'Great / inspired', emoji: '✨' },
]

export const PERSONALITY_INFO: Record<Personality, { name: string; tagline: string; emoji: string }> = {
  cozy_grandma: { name: 'Cozy Grandma', tagline: 'wraps you in a blanket and means it', emoji: '🧶' },
  proud_father: { name: 'Proud Father', tagline: 'steady, certain you\'ve got this', emoji: '🧔' },
  deadpan_coach: { name: 'Deadpan Coach', tagline: 'tracks it straight, no theatrics', emoji: '🧢' },
  drill_sergeant: { name: 'Drill Sergeant', tagline: 'gruff orders, soft underneath', emoji: '🫡' },
  enthusiastic_friend: { name: 'Enthusiastic Best Friend', tagline: 'genuinely thinks you\'re great', emoji: '🙌' },
  dramatic_narrator: { name: 'Dramatic Narrator', tagline: 'narrates your life like it matters', emoji: '🎭' },
}

type Tier = 'none' | 'some' | 'all'

interface VoiceContent {
  greeting: string[]
  modeHard: string[]
  modeSoft: string[]
  routineIntro: string[]
  routineHype: Record<Mode, Record<Tier, string[]>>
  groundingIntro: string[]
  groundingDone: string[]
  curiosityIntro: string[]
  curiosityMore: string[]
  complete: Record<Mode, string[]>
  milestone: string[]
}

const CONTENT: Record<Personality, VoiceContent> = {
  cozy_grandma: {
    greeting: [
      'Come sit a minute, love. Let\'s see what today needs from you.',
      'There you are. No rush — let\'s ease into the day together.',
    ],
    modeHard: ['Full list today? That\'s the soup-from-scratch kind of day. I\'ll have the kettle on.', 'A big day, hm? Good. I\'ll be right here cheering from the kitchen.'],
    modeSoft: ['Lighter day, dear? Smart. Even soup needs to simmer slow sometimes.', 'Soft day noted. Resting on purpose is still tending the garden.'],
    routineIntro: ['Let\'s see what\'s on your little list today.', 'No hurry — just tick off what you can, love.'],
    routineHype: {
      hard: {
        none: ['Not yet, hm? That\'s alright, the kettle\'s still warm. Come back when you\'re ready.', 'Nothing yet — no scolding here, just go on and try one.'],
        some: ['Look at you, chipping away at the whole list. I\'m proud of every little tick.', 'A few done already — that\'s real effort, dear, don\'t let anyone tell you otherwise.'],
        all: ['Every single one, on a full day! Sit down, you\'ve earned the good chair.', 'The whole list, done properly. I\'m putting the kettle on just for you.'],
      },
      soft: {
        none: ['Soft day, nothing ticked — and that is perfectly fine, love. Rest is not nothing.', 'Not one yet, and that\'s alright. Soft days don\'t need proving.'],
        some: ['A little done on a soft day — that\'s exactly the right amount, dear.', 'You did some, on a day you chose to go easy. That\'s wisdom, not laziness.'],
        all: ['All of it, and on a soft day too! You knew exactly what you could carry.', 'Every one done, gently. That\'s the smartest kind of finishing.'],
      },
    },
    groundingIntro: ['Now, breathe with me a moment, dear.', 'Just a small pause before we carry on, love.'],
    groundingDone: ['There. Doesn\'t that feel a touch lighter?', 'Good. Shoulders down, dear. That\'s it.'],
    curiosityIntro: ['Here\'s a little something for your pocket today.', 'A small wonder for you, before bed.'],
    curiosityMore: ['One more, if you\'d like, love?', 'Curious for another? Go on then.'],
    complete: {
      hard: ['That was a full day, and you showed up for every bit of it. Rest well, dear.', 'You did the whole thing today. I\'m so proud of you — now go rest.'],
      soft: ['You chose softness today, and that took its own kind of courage. Well done, love.', 'A gentle day, well spent. That counts just the same, dear.'],
    },
    milestone: ['Look how far you\'ve come, love. I always knew you would.', 'A whole milestone, dear. Sit with that for a moment.'],
  },
  proud_father: {
    greeting: ['Hey. Good to see you showed up today. That\'s the whole game.', 'There you are. I mean it — I\'m glad you\'re here.'],
    modeHard: ['Going for the full list. I like that. I\'ll be right here.', 'Hard mode today — alright. Steady pace, you don\'t need to rush.'],
    modeSoft: ['Going easier today. Smart call — that\'s not the weak option, that\'s the wise one.', 'Soft day. Good. Knowing your limit is a strength, not a shortcut.'],
    routineIntro: ['Alright, let\'s see what\'s on the list today.', 'Take these one at a time. No need to rush.'],
    routineHype: {
      hard: {
        none: ['Nothing yet — that\'s okay, the day isn\'t over. Just start with one.', 'Zero so far. No judgment. Pick the easiest one and go.'],
        some: ['You\'re chipping into a full list. That\'s real work — I see it.', 'Good progress. Keep that same steady pace.'],
        all: ['Every item, on a hard day. That\'s not luck, that\'s discipline. I\'m proud of you.', 'The whole list, done. You earned every bit of that.'],
      },
      soft: {
        none: ['Nothing yet, on a soft day. That\'s fine — soft doesn\'t mean nothing has to happen.', 'Still at zero. Try just one when you\'re ready.'],
        some: ['Some done, on a day you chose to go light. That\'s good judgment in action.', 'You\'re doing exactly the right amount for today.'],
        all: ['All of it, and you still kept it soft. That\'s control, not luck.', 'Full list, gentle day. That\'s exactly how it should look.'],
      },
    },
    groundingIntro: ['Before anything else — let\'s slow down for a second.', 'Take a second with me. Just breathe.'],
    groundingDone: ['Good. That matters more than people think.', 'Nice. Carry that calm into the rest of the day.'],
    curiosityIntro: ['Here\'s something worth knowing today.', 'One small fact for you — no reason, just thought you\'d like it.'],
    curiosityMore: ['Want one more? Go ahead.', 'There\'s another, if you\'re curious.'],
    complete: {
      hard: ['You put in real effort today, and it shows. I\'m proud of you. Genuinely.', 'Full day, full effort. That\'s who you are — remember that tomorrow.'],
      soft: ['You knew what today could hold, and you respected that. That\'s maturity.', 'Soft day, handled well. I\'m proud of how you read the room on yourself.'],
    },
    milestone: ['Look at this milestone. You built that, day by day.', 'I want you to actually sit with this for a second — you did this.'],
  },
  deadpan_coach: {
    greeting: ['Day\'s here. Let\'s log it.', 'Alright. Showing up. That\'s step one.'],
    modeHard: ['Hard mode. Full list. Noted.', 'Hard. Got it. Pace yourself, not a sprint.'],
    modeSoft: ['Soft mode. Fewer items, same standard.', 'Soft. Fine. Quality over quantity today.'],
    routineIntro: ['Here\'s today\'s list. Work it.', 'List\'s below. Check what you finish.'],
    routineHype: {
      hard: {
        none: ['Zero for zero. Still time.', 'Nothing logged. Start with one.'],
        some: ['Partial. Keep going.', 'Some done. Continue.'],
        all: ['Full list, hard mode. That\'s the rare clean sheet.', 'All items. Done correctly.'],
      },
      soft: {
        none: ['Soft mode, zero done. Pick one.', 'Nothing yet. One item moves the needle.'],
        some: ['Some done on soft mode. That\'s the target.', 'Partial completion, soft mode. Reasonable.'],
        all: ['Full list on soft mode. Efficient.', 'All done, soft mode. Good calibration.'],
      },
    },
    groundingIntro: ['Sixty seconds. Not optional, just short.', 'Quick reset. Follow the steps.'],
    groundingDone: ['Logged. Moving on.', 'Done. That\'s the whole point of it.'],
    curiosityIntro: ['One fact. No commentary.', 'Here\'s today\'s fact.'],
    curiosityMore: ['One more, if you want it.', 'Another\'s available. Your call.'],
    complete: {
      hard: ['Hard mode, day closed. Logged accurately.', 'Full effort recorded. Good day.'],
      soft: ['Soft mode, day closed. That was the right call today.', 'Logged as soft. No penalty for that.'],
    },
    milestone: ['Milestone hit. The number doesn\'t lie.', 'That\'s a checkpoint. Noted for the record.'],
  },
  drill_sergeant: {
    greeting: ['ON YOUR FEET. Day\'s starting. Let\'s move.', 'You\'re here. Good. Don\'t make me regret saying that.'],
    modeHard: ['HARD MODE. Outstanding. Don\'t make me eat my words.', 'Full list, soldier. Let\'s see what you\'ve got.'],
    modeSoft: ['Soft mode. Fine. Smart soldiers know when to conserve ammo.', 'Going light today — good, that\'s called strategy, not weakness.'],
    routineIntro: ['LISTEN UP. Here\'s the list. Get to work.', 'Here\'s your list, soldier. No excuses, just execution.'],
    routineHype: {
      hard: {
        none: ['ZERO?! Get up and move on ONE of these. Now.', 'Nothing done and full list ahead — pick your battle and start.'],
        some: ['Some progress. Acceptable. Now finish what you started.', 'You\'re moving. Good. Don\'t stop now.'],
        all: ['EVERY SINGLE ONE. On hard mode. That\'s what I like to see, soldier.', 'Full list, cleared. Outstanding work. At ease.'],
      },
      soft: {
        none: ['Soft day, zero done — still not an excuse to do NOTHING. Pick one.', 'Nothing yet. Soft mode doesn\'t mean off-duty.'],
        some: ['Some done on a light day. Good discipline knowing your limit AND hitting it.', 'Progress noted. That\'s exactly the right call for today.'],
        all: ['Full list, light day. That\'s precision, soldier. Well executed.', 'All done, on a soft day. That\'s control. Respect.'],
      },
    },
    groundingIntro: ['STAND DOWN for sixty seconds. Breathe. That\'s an order.', 'Pause. Breathe. Even soldiers reload.'],
    groundingDone: ['Good. Reset complete. Back to it.', 'There. Composure restored. Carry on.'],
    curiosityIntro: ['Intel for the day, soldier.', 'One fact. Memorize it if you want, doesn\'t matter — just take it.'],
    curiosityMore: ['One more piece of intel, if you want it.', 'Want a second one? Fine. Just one more.'],
    complete: {
      hard: ['FULL DAY. FULL EFFORT. Dismissed — and well done.', 'You put in the work today, soldier. Don\'t let anyone tell you otherwise.'],
      soft: ['Soft mode, day closed. You called it right and you followed through. Good.', 'Light day, handled with discipline. Dismissed, with respect.'],
    },
    milestone: ['MILESTONE HIT. That\'s not nothing, soldier. That\'s a record of showing up.', 'Look at that number. That\'s yours. You earned it.'],
  },
  enthusiastic_friend: {
    greeting: ['HEY!! You\'re here!! Okay let\'s do this day!', 'Ahh I\'m so glad you showed up — let\'s see what today looks like!'],
    modeHard: ['Full list today?! Let\'s GO, I believe in you so much right now.', 'Hard mode! Love that energy, let\'s make it happen!'],
    modeSoft: ['Soft day! Honestly so smart, listening to yourself like that.', 'Going easier today — yes, that\'s exactly the right call!'],
    routineIntro: ['Okay here\'s your list — let\'s knock some of these out!', 'Your list for today! You\'ve got this, for real.'],
    routineHype: {
      hard: {
        none: ['Nothing yet but the day\'s young — you\'re gonna crush at least one of these!', 'Zero so far, no big deal, let\'s start with literally any one!'],
        some: ['Yesss, look at you go! Keep that momentum!', 'You\'re actually doing it!! Keep going, I\'m cheering!'],
        all: ['EVERY SINGLE ONE?! On a hard day?! I\'m so proud of you right now!', 'You did the WHOLE list. That\'s incredible, genuinely.'],
      },
      soft: {
        none: ['Nothing yet, but it\'s a soft day so honestly — no pressure at all!', 'Zero so far on a soft day — totally fine, do one if you feel like it!'],
        some: ['Some done, on a day you chose to go easy — that\'s exactly the vibe!', 'Look at you doing some of it on a light day, love that for you!'],
        all: ['You did ALL of it on a soft day?! That\'s amazing self-awareness AND effort!', 'Full list, soft mode — that\'s the dream combo honestly!'],
      },
    },
    groundingIntro: ['Okay quick pause with me, just breathe for a sec!', 'Thirty seconds, just you and your breath, let\'s go!'],
    groundingDone: ['Niceee, how do you feel? A little lighter, right?', 'Love that. Okay, onward!'],
    curiosityIntro: ['Okay I have to tell you something cool I learned!', 'Wait, here\'s a fun fact for you today!'],
    curiosityMore: ['Want another one?? I have one more!', 'Ooh want one more fact? Say the word!'],
    complete: {
      hard: ['You did the WHOLE thing today. I am so proud of you, seriously!!', 'Full effort, full day. You should feel really good about today!'],
      soft: ['You went soft today and that took real self-awareness — love that for you!', 'Easier day, but you still showed up. That counts, big time!'],
    },
    milestone: ['WAIT. Look at that milestone!! You actually did that!!', 'Okay that\'s a huge number of days — I\'m so proud of you, really!'],
  },
  dramatic_narrator: {
    greeting: ['Another day dawns, and our hero rises to meet it.', 'The day begins. Few will know what was asked of them today — but we will.'],
    modeHard: ['They chose the harder path today. The full list. No shortcuts.', 'A demanding day, chosen freely. This is the stuff of legend.'],
    modeSoft: ['Today, our protagonist chooses restraint — the rarer, wiser kind of strength.', 'A softer path, deliberately taken. Even heroes must rest.'],
    routineIntro: ['Before them lies the list — the small tasks that, stacked, become a life.', 'The day\'s trials, laid bare. Let us see what becomes of them.'],
    routineHype: {
      hard: {
        none: ['Not yet begun — but the story is far from over.', 'Zero, for now. The page is still turning.'],
        some: ['Progress! Slow, perhaps, but undeniable. The tale continues.', 'Some tasks fall before our hero already. More awaits.'],
        all: ['Every task, vanquished. On the hardest of days. Let it be written.', 'The full list, conquered. A chapter worth retelling.'],
      },
      soft: {
        none: ['Stillness, on a chosen day of rest. Not every chapter needs action.', 'Nothing yet — and on this day, that is its own kind of plot.'],
        some: ['A measured effort, on a measured day. Wisdom, dressed as ease.', 'Some tasks fall, gently, as intended. The balance holds.'],
        all: ['Every task complete — and still, the day stayed soft. Masterful restraint.', 'The full list, and a gentle day besides. A rare and worthy feat.'],
      },
    },
    groundingIntro: ['And now — a pause. Even legends must breathe.', 'The world holds still for a moment, just for them.'],
    groundingDone: ['Composure, restored. The story may proceed.', 'A breath taken. The weight, ever so slightly lifted.'],
    curiosityIntro: ['And now, a wonder from the wider world, offered freely.', 'A small marvel, delivered as if the universe meant it personally.'],
    curiosityMore: ['Shall the page turn once more?', 'One more marvel awaits, should they wish it.'],
    complete: {
      hard: ['The hardest day, met in full. Let history note it.', 'They asked everything of themselves today — and answered. Curtain falls.'],
      soft: ['A gentler day, chosen and honored. No less a victory.', 'Restraint, today\'s quiet triumph. The tale continues tomorrow.'],
    },
    milestone: ['A milestone, at last reached. The mountain, just a little smaller now.', 'Let it be recorded: this many days, and still, they came back.'],
  },
}

export function getGreeting(personality: Personality, seed: number): string {
  return pick(seed, 'greeting', CONTENT[personality].greeting)
}

export function getModeLine(personality: Personality, mode: Mode, seed: number): string {
  return pick(seed, `mode-${mode}`, mode === 'hard' ? CONTENT[personality].modeHard : CONTENT[personality].modeSoft)
}

export function getRoutineIntro(personality: Personality, seed: number): string {
  return pick(seed, 'routineIntro', CONTENT[personality].routineIntro)
}

export function getRoutineHype(personality: Personality, mode: Mode, doneCount: number, totalCount: number, seed: number): string {
  const tier: Tier = totalCount === 0 || doneCount === 0 ? 'none' : doneCount === totalCount ? 'all' : 'some'
  return pick(seed, `routineHype-${mode}-${tier}`, CONTENT[personality].routineHype[mode][tier])
}

export function getGroundingIntro(personality: Personality, seed: number): string {
  return pick(seed, 'groundingIntro', CONTENT[personality].groundingIntro)
}

export function getGroundingDone(personality: Personality, seed: number): string {
  return pick(seed, 'groundingDone', CONTENT[personality].groundingDone)
}

export function getCuriosityIntro(personality: Personality, seed: number): string {
  return pick(seed, 'curiosityIntro', CONTENT[personality].curiosityIntro)
}

export function getCuriosityMore(personality: Personality, seed: number): string {
  return pick(seed, 'curiosityMore', CONTENT[personality].curiosityMore)
}

export function getCompleteLine(personality: Personality, mode: Mode, seed: number): string {
  return pick(seed, `complete-${mode}`, CONTENT[personality].complete[mode])
}

export function getMilestoneLine(personality: Personality, seed: number): string {
  return pick(seed, 'milestone', CONTENT[personality].milestone)
}
