/**
 * Exercise library the backup templates are assembled from.
 * e: 'G' = needs a gym, 'H' = home-only improvisation (bands/chair/backpack),
 *    'A' = works in both. d: 1 beginner, 2 intermediate, 3 advanced.
 * hi = high impact (excluded from low-impact templates).
 * r = fixed reps/duration string (holds, cardio, mobility); cardio uses {t} = minutes.
 */
export interface PoolExercise {
  name: string;
  eq: string;
  e: 'G' | 'H' | 'A';
  d: 1 | 2 | 3;
  m: string[];
  hi?: boolean;
  r?: string;
}

export type PoolKey =
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'lowerAcc'
  | 'pushH'
  | 'pushV'
  | 'pushAcc'
  | 'pullV'
  | 'pullH'
  | 'pullAcc'
  | 'core'
  | 'cardio'
  | 'mobility';

type Flags = { hi?: boolean; r?: string };
const g = (name: string, eq: string, d: 1 | 2 | 3, m: string[], f: Flags = {}): PoolExercise => ({ name, eq, e: 'G', d, m, ...f });
const h = (name: string, eq: string, d: 1 | 2 | 3, m: string[], f: Flags = {}): PoolExercise => ({ name, eq, e: 'H', d, m, ...f });
const a = (name: string, eq: string, d: 1 | 2 | 3, m: string[], f: Flags = {}): PoolExercise => ({ name, eq, e: 'A', d, m, ...f });

const HOLD = '30-45 sec';
const REPS = '12-20';

export const EXERCISE_POOLS: Record<PoolKey, PoolExercise[]> = {
  squat: [
    g('Leg Press', 'Machine', 1, ['Quads', 'Glutes']),
    g('Goblet Squat', 'Dumbbell', 1, ['Quads', 'Glutes', 'Core']),
    g('Smith Machine Squat', 'Smith machine', 1, ['Quads', 'Glutes']),
    g('Hack Squat', 'Machine', 2, ['Quads', 'Glutes']),
    g('Barbell Back Squat', 'Barbell', 2, ['Quads', 'Glutes', 'Core']),
    g('Barbell Front Squat', 'Barbell', 3, ['Quads', 'Core']),
    a('Bodyweight Squat', 'Bodyweight', 1, ['Quads', 'Glutes']),
    h('Chair Box Squat', 'Chair', 1, ['Quads', 'Glutes']),
    a('Tempo Bodyweight Squat', 'Bodyweight', 2, ['Quads', 'Glutes']),
    h('Backpack Goblet Squat', 'Loaded backpack', 2, ['Quads', 'Glutes', 'Core']),
    a('Jump Squat', 'Bodyweight', 2, ['Quads', 'Glutes', 'Calves'], { hi: true }),
    a('Assisted Pistol Squat', 'Bodyweight', 3, ['Quads', 'Glutes']),
  ],
  hinge: [
    g('Dumbbell Romanian Deadlift', 'Dumbbells', 1, ['Hamstrings', 'Glutes']),
    g('Back Extension', 'Bench', 1, ['Lower back', 'Glutes']),
    g('Cable Pull-Through', 'Cable', 1, ['Glutes', 'Hamstrings']),
    g('Barbell Romanian Deadlift', 'Barbell', 2, ['Hamstrings', 'Glutes']),
    g('Barbell Hip Thrust', 'Barbell', 2, ['Glutes', 'Hamstrings']),
    g('Conventional Deadlift', 'Barbell', 3, ['Hamstrings', 'Glutes', 'Back']),
    a('Glute Bridge', 'Bodyweight', 1, ['Glutes', 'Hamstrings']),
    a('Good Morning', 'Bodyweight', 1, ['Hamstrings', 'Lower back']),
    h('Banded Hip Hinge', 'Resistance band', 1, ['Glutes', 'Hamstrings']),
    a('Single-Leg Glute Bridge', 'Bodyweight', 2, ['Glutes', 'Hamstrings']),
    h('Backpack Romanian Deadlift', 'Loaded backpack', 2, ['Hamstrings', 'Glutes']),
    a('Single-Leg Romanian Deadlift', 'Bodyweight', 3, ['Hamstrings', 'Glutes', 'Core']),
  ],
  lunge: [
    g('Dumbbell Step-Up', 'Dumbbells + bench', 1, ['Quads', 'Glutes']),
    g('Smith Machine Reverse Lunge', 'Smith machine', 1, ['Quads', 'Glutes']),
    g('Dumbbell Walking Lunge', 'Dumbbells', 2, ['Quads', 'Glutes']),
    g('Cable Reverse Lunge', 'Cable', 2, ['Quads', 'Glutes']),
    g('Dumbbell Bulgarian Split Squat', 'Dumbbells + bench', 3, ['Quads', 'Glutes']),
    a('Reverse Lunge', 'Bodyweight', 1, ['Quads', 'Glutes']),
    a('Step-Up', 'Step or sturdy chair', 1, ['Quads', 'Glutes']),
    a('Lateral Lunge', 'Bodyweight', 1, ['Adductors', 'Glutes']),
    a('Split Squat', 'Bodyweight', 2, ['Quads', 'Glutes']),
    a('Curtsy Lunge', 'Bodyweight', 2, ['Glutes', 'Quads']),
    h('Bulgarian Split Squat', 'Chair', 3, ['Quads', 'Glutes']),
    a('Jump Lunge', 'Bodyweight', 3, ['Quads', 'Glutes'], { hi: true }),
  ],
  lowerAcc: [
    g('Seated Leg Curl', 'Machine', 1, ['Hamstrings']),
    g('Leg Extension', 'Machine', 1, ['Quads']),
    g('Hip Abduction Machine', 'Machine', 1, ['Glutes']),
    g('Seated Calf Raise', 'Machine', 1, ['Calves']),
    g('Standing Calf Raise', 'Machine', 2, ['Calves']),
    g('Lying Leg Curl', 'Machine', 2, ['Hamstrings']),
    a('Calf Raise', 'Bodyweight', 1, ['Calves']),
    a('Glute Kickback', 'Bodyweight', 1, ['Glutes']),
    a('Fire Hydrant', 'Bodyweight', 1, ['Glutes']),
    h('Banded Lateral Walk', 'Resistance band', 1, ['Glutes']),
    a('Wall Sit', 'Wall', 2, ['Quads'], { r: HOLD }),
    a('Single-Leg Calf Raise', 'Bodyweight', 2, ['Calves']),
  ],
  pushH: [
    g('Machine Chest Press', 'Machine', 1, ['Chest', 'Triceps']),
    g('Dumbbell Bench Press', 'Dumbbells', 1, ['Chest', 'Triceps']),
    g('Cable Chest Fly', 'Cable', 1, ['Chest']),
    g('Incline Dumbbell Press', 'Dumbbells', 2, ['Upper chest', 'Shoulders']),
    g('Barbell Bench Press', 'Barbell', 2, ['Chest', 'Triceps']),
    g('Parallel Bar Dip', 'Dip bars', 3, ['Chest', 'Triceps']),
    a('Incline Push-Up', 'Bench, chair or wall', 1, ['Chest', 'Triceps']),
    a('Knee Push-Up', 'Bodyweight', 1, ['Chest', 'Triceps']),
    h('Banded Chest Press', 'Resistance band', 1, ['Chest', 'Triceps']),
    a('Push-Up', 'Bodyweight', 2, ['Chest', 'Triceps', 'Shoulders']),
    a('Decline Push-Up', 'Bodyweight + chair', 3, ['Upper chest', 'Shoulders']),
    a('Diamond Push-Up', 'Bodyweight', 3, ['Triceps', 'Chest']),
  ],
  pushV: [
    g('Machine Shoulder Press', 'Machine', 1, ['Shoulders', 'Triceps']),
    g('Dumbbell Shoulder Press', 'Dumbbells', 1, ['Shoulders', 'Triceps']),
    g('Landmine Press', 'Barbell + landmine', 2, ['Shoulders', 'Upper chest']),
    g('Arnold Press', 'Dumbbells', 2, ['Shoulders']),
    g('Barbell Overhead Press', 'Barbell', 2, ['Shoulders', 'Triceps']),
    g('Push Press', 'Barbell', 3, ['Shoulders', 'Triceps', 'Legs']),
    h('Banded Overhead Press', 'Resistance band', 1, ['Shoulders', 'Triceps']),
    h('Backpack Overhead Press', 'Loaded backpack', 1, ['Shoulders', 'Triceps']),
    a('Pike Push-Up', 'Bodyweight', 2, ['Shoulders', 'Triceps']),
    a('Elevated Pike Push-Up', 'Bodyweight + chair', 3, ['Shoulders', 'Triceps']),
    a('Wall Handstand Hold', 'Wall', 3, ['Shoulders', 'Core'], { r: '20-30 sec' }),
  ],
  pushAcc: [
    g('Cable Triceps Pushdown', 'Cable', 1, ['Triceps']),
    g('Dumbbell Lateral Raise', 'Dumbbells', 1, ['Side delts']),
    g('Overhead Dumbbell Triceps Extension', 'Dumbbell', 1, ['Triceps']),
    g('Dumbbell Front Raise', 'Dumbbells', 1, ['Front delts']),
    g('EZ-Bar Skull Crusher', 'EZ bar', 2, ['Triceps']),
    g('Close-Grip Bench Press', 'Barbell', 2, ['Triceps', 'Chest']),
    a('Bench Dip', 'Bench or chair', 1, ['Triceps']),
    h('Banded Triceps Pushdown', 'Resistance band', 1, ['Triceps']),
    h('Banded Lateral Raise', 'Resistance band', 1, ['Side delts']),
    a('Bodyweight Triceps Extension', 'Bodyweight', 2, ['Triceps']),
    a('Plank Shoulder Tap', 'Bodyweight', 2, ['Shoulders', 'Core'], { r: '20-30 taps' }),
    a('Plank-to-Push-Up', 'Bodyweight', 3, ['Triceps', 'Core', 'Shoulders']),
  ],
  pullV: [
    g('Lat Pulldown', 'Cable', 1, ['Lats', 'Biceps']),
    g('Assisted Pull-Up', 'Machine', 1, ['Lats', 'Biceps']),
    g('Close-Grip Pulldown', 'Cable', 1, ['Lats', 'Biceps']),
    g('Chin-Up', 'Pull-up bar', 2, ['Lats', 'Biceps']),
    g('Straight-Arm Pulldown', 'Cable', 2, ['Lats']),
    g('Pull-Up', 'Pull-up bar', 3, ['Lats', 'Biceps', 'Upper back']),
    h('Banded Lat Pulldown', 'Resistance band', 1, ['Lats', 'Biceps']),
    a('Superman Pull', 'Bodyweight', 1, ['Lats', 'Lower back']),
    h('Single-Arm Banded Pulldown', 'Resistance band', 2, ['Lats']),
    h('Negative Chin-Up', 'Pull-up bar or sturdy bar', 2, ['Lats', 'Biceps']),
    h('Towel Door Pull-Up Hold', 'Towel + door', 2, ['Lats', 'Biceps'], { r: '15-25 sec' }),
    h('Pull-Up', 'Pull-up bar', 3, ['Lats', 'Biceps', 'Upper back']),
  ],
  pullH: [
    g('Seated Cable Row', 'Cable', 1, ['Mid back', 'Biceps']),
    g('Chest-Supported Row', 'Machine', 1, ['Mid back', 'Lats']),
    g('One-Arm Dumbbell Row', 'Dumbbell + bench', 1, ['Lats', 'Mid back']),
    g('Barbell Bent-Over Row', 'Barbell', 2, ['Lats', 'Mid back']),
    g('T-Bar Row', 'T-bar', 2, ['Mid back', 'Lats']),
    g('Pendlay Row', 'Barbell', 3, ['Mid back', 'Lats']),
    h('Banded Row', 'Resistance band', 1, ['Mid back', 'Biceps']),
    h('Towel Door Row', 'Towel + door', 1, ['Mid back', 'Lats']),
    h('Backpack Bent-Over Row', 'Loaded backpack', 1, ['Lats', 'Mid back']),
    a('Prone Y-T Raise', 'Bodyweight', 1, ['Rear delts', 'Upper back']),
    h('Inverted Table Row', 'Sturdy table', 2, ['Lats', 'Mid back']),
    h('Feet-Elevated Inverted Row', 'Sturdy table + chair', 3, ['Lats', 'Mid back']),
  ],
  pullAcc: [
    g('Dumbbell Biceps Curl', 'Dumbbells', 1, ['Biceps']),
    g('Dumbbell Hammer Curl', 'Dumbbells', 1, ['Biceps', 'Forearms']),
    g('Cable Face Pull', 'Cable', 1, ['Rear delts', 'Upper back']),
    g('Rear Delt Fly Machine', 'Machine', 1, ['Rear delts']),
    g('Barbell Curl', 'Barbell', 2, ['Biceps']),
    g('Incline Dumbbell Curl', 'Dumbbells + bench', 2, ['Biceps']),
    h('Banded Biceps Curl', 'Resistance band', 1, ['Biceps']),
    h('Backpack Curl', 'Loaded backpack', 1, ['Biceps']),
    h('Banded Pull-Apart', 'Resistance band', 1, ['Rear delts', 'Upper back']),
    h('Banded Face Pull', 'Resistance band', 1, ['Rear delts', 'Upper back']),
    a('Reverse Snow Angel', 'Bodyweight', 1, ['Rear delts', 'Upper back']),
    h('Towel Isometric Curl', 'Towel', 2, ['Biceps'], { r: '20-30 sec' }),
  ],
  core: [
    a('Plank', 'Bodyweight', 1, ['Core'], { r: HOLD }),
    a('Dead Bug', 'Bodyweight', 1, ['Core'], { r: REPS }),
    a('Bird Dog', 'Bodyweight', 1, ['Core', 'Lower back'], { r: REPS }),
    a('Bicycle Crunch', 'Bodyweight', 1, ['Core'], { r: REPS }),
    g('Cable Crunch', 'Cable', 1, ['Abs'], { r: '12-15' }),
    a('Side Plank', 'Bodyweight', 2, ['Obliques'], { r: '20-30 sec each side' }),
    a('Russian Twist', 'Bodyweight', 2, ['Obliques'], { r: REPS }),
    a('Lying Leg Raise', 'Bodyweight', 2, ['Lower abs'], { r: '10-15' }),
    g('Hanging Knee Raise', 'Pull-up bar', 2, ['Abs'], { r: '10-15' }),
    a('Mountain Climber', 'Bodyweight', 2, ['Core', 'Shoulders'], { r: '30 sec', hi: true }),
    a('Hollow Body Hold', 'Bodyweight', 3, ['Core'], { r: '20-40 sec' }),
    g('Ab Wheel Rollout', 'Ab wheel', 3, ['Core'], { r: '8-12' }),
  ],
  cardio: [
    g('Treadmill Incline Walk', 'Treadmill', 1, ['Cardio', 'Glutes'], { r: '{t} min at 5-8% incline, brisk pace' }),
    g('Elliptical Steady State', 'Elliptical', 1, ['Cardio'], { r: '{t} min at a conversational pace' }),
    g('Stationary Bike Intervals', 'Bike', 2, ['Cardio', 'Quads'], { r: '{t} min: 1 min hard / 2 min easy' }),
    g('Rowing Machine', 'Rower', 2, ['Cardio', 'Back'], { r: '{t} min at a steady moderate pace' }),
    g('Stair Climber', 'Stair machine', 2, ['Cardio', 'Glutes'], { r: '{t} min at a steady pace' }),
    g('Treadmill Run Intervals', 'Treadmill', 3, ['Cardio'], { r: '{t} min: 1 min fast / 1 min easy', hi: true }),
    g('Assault Bike Sprints', 'Air bike', 3, ['Cardio'], { r: '{t} min: 20 sec all-out / 40 sec easy' }),
    a('Brisk Walk', 'None', 1, ['Cardio'], { r: '{t} min at a brisk pace' }),
    h('March in Place', 'None', 1, ['Cardio'], { r: '{t} min with high knees at an easy pace' }),
    h('Low-Impact Step Aerobics', 'Step or stairs', 1, ['Cardio', 'Legs'], { r: '{t} min at a steady pace' }),
    h('Shadow Boxing', 'None', 2, ['Cardio', 'Shoulders'], { r: '{t} min in 3-min rounds' }),
    a('Easy Cycling', 'Bike', 2, ['Cardio', 'Quads'], { r: '{t} min at a steady pace' }),
    a('Jumping Jacks', 'Bodyweight', 2, ['Cardio'], { r: '{t} min: 40 sec on / 20 sec off', hi: true }),
    h('Jump Rope', 'Jump rope', 3, ['Cardio', 'Calves'], { r: '{t} min: 45 sec on / 15 sec off', hi: true }),
    a('Burpees', 'Bodyweight', 3, ['Cardio', 'Full body'], { r: '{t} min: 30 sec on / 30 sec off', hi: true }),
  ],
  mobility: [
    a("Cat-Cow", 'Bodyweight', 1, ['Spine'], { r: '10 slow reps' }),
    a("World's Greatest Stretch", 'Bodyweight', 1, ['Hips', 'Thoracic spine'], { r: '5 each side' }),
    a('90/90 Hip Switch', 'Bodyweight', 1, ['Hips'], { r: '8 each side' }),
    a('Thoracic Rotation', 'Bodyweight', 1, ['Upper back'], { r: '10 each side' }),
    a('Standing Hamstring Stretch', 'Bodyweight', 1, ['Hamstrings'], { r: '40 sec each side' }),
    a("Child's Pose", 'Bodyweight', 1, ['Back', 'Lats'], { r: '60 sec' }),
    a('Half-Kneeling Hip Flexor Stretch', 'Bodyweight', 1, ['Hip flexors'], { r: '40 sec each side' }),
    a('Doorway Chest Stretch', 'Doorway', 1, ['Chest', 'Shoulders'], { r: '40 sec each side' }),
    a('Foam Roll: Back and Quads', 'Foam roller', 1, ['Back', 'Quads'], { r: '60 sec each area' }),
  ],
};
