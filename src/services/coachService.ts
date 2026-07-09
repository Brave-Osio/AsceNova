/**
 * askCoach(question) is the ONLY function callers invoke from this
 * service. Today it matches the question against a broader set of known
 * topics and returns a canned response. Later this becomes a real
 * Gemini call — the signature (string in, Promise<string> out)
 * does not change, so CoachChatPage never needs to know which is happening.
 */
export async function askCoach(question: string): Promise<string> {
  const q = question.toLowerCase();

  // ── Workout frequency ──────────────────────────────────────────────
  if (q.includes('every day') || q.includes('everyday') || q.includes('daily workout')) {
    return "Training every day is possible, but it depends on intensity. High-intensity strength work needs 48 hours of muscle recovery — alternate muscle groups or mix in light cardio and mobility days. Daily movement is great for your streak, but daily maximal effort on the same muscles risks injury and burnout.";
  }

  if (q.includes('how many days') || q.includes('days per week') || q.includes('how often')) {
    return "For most people, 3–5 training days per week is the sweet spot. Beginners can see great gains with 3 full-body sessions. Intermediate and advanced trainees often do 4–5 with split routines. Rest days aren't lazy — they're when your muscles actually grow.";
  }

  // ── Nutrition macros ────────────────────────────────────────────────
  if (q.includes('protein')) {
    return "A common guideline for active individuals is 1.6–2.2g of protein per kg of bodyweight per day, leaning higher if your goal is muscle gain. Spread it across meals rather than one big serving for better absorption. Good sources: chicken, eggs, Greek yogurt, tofu, and legumes.";
  }

  if (q.includes('carb') || q.includes('carbohydrate')) {
    return "Carbs are your body's primary fuel — especially important before and after workouts. For fat loss, lower carb intake helps create a calorie deficit while keeping protein high. For muscle gain, carbs support performance and glycogen replenishment. Focus on complex carbs: oats, rice, sweet potato, fruits, and whole grains.";
  }

  if (q.includes('fat ') || q.includes('dietary fat') || q.includes('healthy fat')) {
    return "Dietary fat is essential — it supports hormone production, joint health, and fat-soluble vitamin absorption. Aim for 25–35% of your daily calories from fat. Prioritize unsaturated fats from sources like avocado, nuts, olive oil, and fatty fish. Limit saturated fat and avoid trans fats.";
  }

  if (q.includes('sodium') || q.includes('salt')) {
    return "Most guidelines recommend under 2300mg of sodium per day. Athletes who sweat a lot may need slightly more to replace what's lost. Too much sodium can cause water retention and raise blood pressure over time. Whole foods naturally have less sodium than processed or packaged foods — that's the biggest lever to pull.";
  }

  if (q.includes('calorie') || q.includes('calories')) {
    return "Calories in vs. calories out is the foundation — but quality matters too. For fat loss, a modest deficit of 300–500 kcal/day is sustainable without muscle loss. For muscle gain, a small surplus of 200–300 kcal keeps you lean while building. Crash-cutting calories backfires because it burns muscle alongside fat.";
  }

  // ── Goals ───────────────────────────────────────────────────────────
  if (q.includes('lose fat') || q.includes('fat loss') || q.includes('lose weight') || q.includes('weight loss')) {
    return "Fat loss comes down to a sustained calorie deficit, paired with enough protein to preserve muscle, and resistance training to maintain strength. Crash diets work short-term but are hard to sustain — consistency over months beats intensity over days. Track your food even loosely for the first few weeks to calibrate your intake.";
  }

  if (q.includes('gain muscle') || q.includes('muscle gain') || q.includes('build muscle') || q.includes('bulk')) {
    return "Muscle gain needs a calorie surplus, progressive overload (gradually lifting heavier or doing more reps), and enough protein and sleep to recover. Expect visible progress over months, not days — consistency is what compounds. A beginner can gain 1–2 lbs of muscle per month under good conditions.";
  }

  if (q.includes('maintain') || q.includes('maintain weight')) {
    return "Maintaining weight is about matching energy in to energy out. Keep protein moderate to high, stay active, and track your weight trend weekly rather than daily. Daily fluctuations of 1–2 kg from water and food are completely normal — the weekly average is what matters.";
  }

  // ── Supplements ─────────────────────────────────────────────────────
  if (q.includes('creatine')) {
    return "Creatine monohydrate is one of the most researched and effective supplements for strength and muscle gain. 3–5g per day is the standard dose — no loading phase needed. It works by replenishing ATP (your explosive energy system) faster. It's safe for healthy adults and inexpensive.";
  }

  if (q.includes('supplement') || q.includes('pre-workout') || q.includes('preworkout')) {
    return "Most supplements are optional if your diet is solid. The ones with strongest evidence: creatine monohydrate (strength + muscle), caffeine (performance + focus), and protein powder (convenience, not magic). Pre-workouts often just combine caffeine + other stimulants. Skip the expensive stacks and nail sleep, food, and consistency first.";
  }

  // ── Recovery ────────────────────────────────────────────────────────
  if (q.includes('sleep')) {
    return "7–9 hours of sleep is when most muscle repair and hormone regulation happens. Poor sleep can stall both fat loss and muscle gain even if training and diet are perfect — cortisol rises, testosterone drops, and recovery slows. Sleep is the cheapest performance enhancer available.";
  }

  if (q.includes('recover') || q.includes('rest day') || q.includes('sore') || q.includes('soreness')) {
    return "Muscle soreness (DOMS) peaks 24–72 hours after a new or intense workout. Light movement, hydration, and protein help. You don't need to be sore to have had a good workout — soreness just means you introduced something new. Rest days are active recovery opportunities: walk, stretch, or do light mobility work.";
  }

  if (q.includes('stretch') || q.includes('flexibility') || q.includes('mobility')) {
    return "Static stretching is best after workouts or on rest days when muscles are warm. Dynamic warm-ups (leg swings, arm circles) are better before exercise. Regular mobility work — even 10 minutes a day — can dramatically reduce injury risk and improve performance over time. Yoga and foam rolling complement strength training well.";
  }

  // ── Hydration ───────────────────────────────────────────────────────
  if (q.includes('water') || q.includes('hydration') || q.includes('drink')) {
    return "A common target is 3–4 liters a day for an active adult, more if you're sweating heavily. Spread it through the day rather than chugging it all at once. A simple test: your urine should be pale yellow. Dehydration of even 2% can reduce performance noticeably.";
  }

  // ── Gamification ────────────────────────────────────────────────────
  if (q.includes('streak') || q.includes('rank') || q.includes('xp')) {
    return "Your rank and XP are driven by consistency — daily check-ins, completed workouts, and hitting your habit goals — not by how much weight you've lost. Showing up daily, even with smaller efforts, climbs the ranks faster than sporadic intense days. Protect your streak like it's a game high score.";
  }

  if (q.includes('achievement') || q.includes('badge') || q.includes('unlock')) {
    return "Achievements are unlocked by hitting key milestones: first workout logged, 7-day streaks, rank promotions, and more. Each badge represents a real habit victory, not just a number on a scale. Check your Dashboard to see which ones you're close to — sometimes you're one log away from the next badge.";
  }

  // ── Beginner advice ─────────────────────────────────────────────────
  if (q.includes('beginner') || q.includes('start') || q.includes('new to')) {
    return "For beginners, consistency beats complexity. Pick a simple full-body routine 3x per week, hit enough protein (~1.6g/kg), sleep well, and log your workouts. You'll make faster progress than most because your body responds strongly to new stimulus. Don't overthink it — just start and adjust as you go.";
  }

  if (q.includes('cardio') || q.includes('running') || q.includes('endurance')) {
    return "Cardio improves heart health, burns calories, and boosts recovery. For fat loss, moderate-intensity cardio 3–5x per week works well alongside strength training. HIIT (high-intensity intervals) burns more calories in less time but requires more recovery. Running, cycling, rowing, and swimming are all excellent choices — pick what you'll actually do.";
  }

  if (q.includes('warm up') || q.includes('warmup') || q.includes('cool down')) {
    return "A 5–10 minute warm-up raises heart rate and primes joints for heavier loads — dynamic movements like leg swings, hip circles, and light cardio are best. Cool-downs help lower heart rate gradually and reduce next-day stiffness. Both bookend your session and reduce injury risk significantly over time.";
  }

  // ── Fallback ────────────────────────────────────────────────────────
  return "Great question! For this demo I have answers covering: workout frequency, protein, carbs, fat, sodium, calories, fat loss, muscle gain, supplements (creatine, pre-workout), sleep, recovery, stretching, hydration, XP/rank/achievements, beginner tips, and cardio. Try asking about any of those topics!";
}
