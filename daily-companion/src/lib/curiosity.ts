export interface CuriosityEntry {
  id: string
  text: string
}

/** Finite — not a feed. Cycles by day, with a couple extra "turn the page" reveals at most. */
export const CURIOSITY_ENTRIES: CuriosityEntry[] = [
  { id: 'c01', text: 'Octopuses have three hearts, and two of them stop beating when they swim.' },
  { id: 'c02', text: 'A day on Venus is longer than its year — it rotates slower than it orbits the sun.' },
  { id: 'c03', text: "Honey found in ancient Egyptian tombs is still edible, thousands of years later." },
  { id: 'c04', text: 'Bananas are berries. Strawberries, technically, are not.' },
  { id: 'c05', text: 'The word "set" has more dictionary meanings than any other English word.' },
  { id: 'c06', text: 'A cloud can weigh over a million pounds and still float.' },
  { id: 'c07', text: 'Wombat droppings are cube-shaped, which keeps them from rolling off logs.' },
  { id: 'c08', text: 'There are more possible chess games than atoms in the observable universe.' },
  { id: 'c09', text: 'Your sense of smell can recall memories faster than any other sense.' },
  { id: 'c10', text: 'Sharks have been around longer than trees.' },
  { id: 'c11', text: 'The Eiffel Tower grows about 6 inches taller in summer from heat expansion.' },
  { id: 'c12', text: "A single bolt of lightning is roughly five times hotter than the sun's surface." },
  { id: 'c13', text: 'Sea otters hold hands while sleeping so they don’t drift apart.' },
  { id: 'c14', text: 'There is a species of jellyfish that can reset its biological clock and return to a juvenile stage.' },
  { id: 'c15', text: 'The Great Wall of China is not, in fact, visible from space with the naked eye.' },
  { id: 'c16', text: 'Some turtles can breathe through their butts when hibernating underwater.' },
  { id: 'c17', text: 'Hot water can sometimes freeze faster than cold water — it’s called the Mpemba effect.' },
  { id: 'c18', text: 'A group of flamingos is called a "flamboyance."' },
  { id: 'c19', text: 'The shortest war in recorded history lasted about 38 minutes.' },
  { id: 'c20', text: 'Your bones are about five times stronger than steel of the same weight.' },
  { id: 'c21', text: 'Antarctica is the largest desert on Earth — deserts are defined by dryness, not heat.' },
  { id: 'c22', text: 'Butterflies can taste with their feet.' },
  { id: 'c23', text: 'There’s enough gold in Earth’s core to coat the whole planet in a layer about knee-deep.' },
  { id: 'c24', text: 'A bolt of lightning strikes the Earth about 8 million times a day.' },
  { id: 'c25', text: 'Some stars you see at night may no longer exist — you’re seeing light from long ago.' },
  { id: 'c26', text: 'The inventor of the Pringles can is buried in one.' },
  { id: 'c27', text: 'Cows have best friends and get stressed when separated from them.' },
  { id: 'c28', text: 'A "jiffy" is an actual unit of time: 1/100th of a second.' },
  { id: 'c29', text: 'Venus is the only planet that spins clockwise — every other planet spins the opposite way.' },
  { id: 'c30', text: 'Humans share about 60% of their DNA with bananas.' },
  { id: 'c31', text: 'It rains diamonds on Jupiter and Saturn, according to atmospheric models.' },
  { id: 'c32', text: 'The Mona Lisa has no eyebrows — they were a fashion trend to shave them off at the time.' },
  { id: 'c33', text: 'Crows can recognize human faces and hold what looks like a grudge for years.' },
  { id: 'c34', text: 'There are more stars in the universe than grains of sand on every beach on Earth.' },
  { id: 'c35', text: 'A single strand of spaghetti is called a "spaghetto."' },
  { id: 'c36', text: 'Polar bears have black skin underneath their fur, which is actually transparent, not white.' },
  { id: 'c37', text: 'The human heart creates enough pressure to squirt blood about 30 feet.' },
  { id: 'c38', text: 'Some species of bamboo can grow nearly a meter in a single day.' },
  { id: 'c39', text: 'Saturn’s moon Enceladus shoots geysers of water into space from its south pole.' },
  { id: 'c40', text: 'Onions can make you cry because of a gas that reacts with the water in your eyes.' },
]

export function curiosityForIndex(index: number): CuriosityEntry {
  return CURIOSITY_ENTRIES[((index % CURIOSITY_ENTRIES.length) + CURIOSITY_ENTRIES.length) % CURIOSITY_ENTRIES.length]
}

export function curiosityById(id: string | null): CuriosityEntry | null {
  return CURIOSITY_ENTRIES.find((c) => c.id === id) ?? null
}

export const MAX_CURIOSITY_TURNS = 2
