
// Exercise categories
export const EXERCISE_CATEGORIES = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Arms',
  'Shoulders',
  'Core',
  'Glutes',
  'Cardio'
];

// Equipment types with new additions
export const EQUIPMENT_TYPES = [
  'Body Weight',
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Leg Press',
  'Leg Extension',
  'Leg Curl',
  'Calf Raise',
  'Pec Deck',
  'Chest Press',
  'Lat Pulldown',
  'Rowing Machine',
  'Shoulder Press',
  'Tricep Machine',
  'Bicep Machine',
  'Back Extension',
  'Smith Machine',
  'Treadmill',
  'Elliptical',
  'Exercise Bike',
  'Rowing Ergometer',
  'Stairmaster',
  'Cable Station',
  'Free Weights',
  'Ab Wheel',
  // New equipment
  'DLC115 Shoulder Press',
  'DLC125 Lateral Raise',
  'DLC220 Butterfly',
  'DLC315 Lat Pulldown',
  'DLC325 Rowing Machine',
  'DLC330 Lat Press',
  'DLC345 Pull Over',
  'DLC355 Back Extension',
  'DLC415 Bicep Machine',
  'DLC435 Dip Machine',
  'DLC635 Squat Machine',
  'DLC665 Kick Machine',
  'DLC685 Calf Machine',
  'K613 Leg Press',
  'K617 Vario Leg Press',
  'K688 Leg Combo',
  'K721 Bench Press',
  'K724 Incline Bench',
  'K733 Hyperextension',
  'K740 Bicep Bench',
  'K753 Ab Bench',
  'K760 Squat Rack',
  'T310 Lat Station',
  'T320 Rowing Station',
  'T322 Seated Row',
  'T414 Bicep-Tricep',
  'T613 Rolling Leg Press',
  // Additional descriptions for leg press
  'Beinpresse, sitzend'
];

// Expanded list of fitness exercises with new equipment
export const availableExercises = [
  { id: 'ex1', name: 'Bench Press', equipment: 'Barbell', videoUrl: '/bench-press.mp4', category: 'Chest' },
  { id: 'ex2', name: 'Squat', equipment: 'Barbell', videoUrl: '/squat.mp4', category: 'Legs' },
  { id: 'ex3', name: 'Deadlift', equipment: 'Barbell', videoUrl: '/deadlift.mp4', category: 'Back' },
  { id: 'ex4', name: 'Pull Up', equipment: 'Body Weight', videoUrl: '/pull-up.mp4', category: 'Back' },
  { id: 'ex5', name: 'Push Up', equipment: 'Body Weight', videoUrl: '/push-up.mp4', category: 'Chest' },
  { id: 'ex6', name: 'Lat Pulldown', equipment: 'Cable Machine', videoUrl: '/lat-pulldown.mp4', category: 'Back' },
  { id: 'ex7', name: 'Leg Press', equipment: 'Machine', videoUrl: '/leg-press.mp4', category: 'Legs' },
  { id: 'ex8', name: 'Bicep Curl', equipment: 'Dumbbell', videoUrl: '/bicep-curl.mp4', category: 'Arms' },
  { id: 'ex9', name: 'Tricep Extension', equipment: 'Cable', videoUrl: '/tricep-extension.mp4', category: 'Arms' },
  { id: 'ex10', name: 'Shoulder Press', equipment: 'Dumbbell', videoUrl: '/shoulder-press.mp4', category: 'Shoulders' },
  { id: 'ex11', name: 'Leg Curl', equipment: 'Machine', videoUrl: '/leg-curl.mp4', category: 'Legs' },
  { id: 'ex12', name: 'Leg Extension', equipment: 'Machine', videoUrl: '/leg-extension.mp4', category: 'Legs' },
  { id: 'ex13', name: 'Chest Fly', equipment: 'Cable', videoUrl: '/chest-fly.mp4', category: 'Chest' },
  { id: 'ex14', name: 'Lateral Raise', equipment: 'Dumbbell', videoUrl: '/lateral-raise.mp4', category: 'Shoulders' },
  { id: 'ex15', name: 'Face Pull', equipment: 'Cable', videoUrl: '/face-pull.mp4', category: 'Shoulders' },
  { id: 'ex16', name: 'Cable Row', equipment: 'Cable', videoUrl: '/cable-row.mp4', category: 'Back' },
  { id: 'ex17', name: 'Calf Raise', equipment: 'Machine', videoUrl: '/calf-raise.mp4', category: 'Legs' },
  { id: 'ex18', name: 'Hammer Curl', equipment: 'Dumbbell', videoUrl: '/hammer-curl.mp4', category: 'Arms' },
  { id: 'ex19', name: 'Skull Crusher', equipment: 'Barbell', videoUrl: '/skull-crusher.mp4', category: 'Arms' },
  { id: 'ex20', name: 'Incline Bench Press', equipment: 'Barbell', videoUrl: '/incline-bench-press.mp4', category: 'Chest' },
  { id: 'ex21', name: 'Romanian Deadlift', equipment: 'Barbell', videoUrl: '/romanian-deadlift.mp4', category: 'Legs' },
  { id: 'ex22', name: 'Pull-Through', equipment: 'Cable', videoUrl: '/pull-through.mp4', category: 'Glutes' },
  { id: 'ex23', name: 'Ab Roller', equipment: 'Ab Wheel', videoUrl: '/ab-roller.mp4', category: 'Core' },
  { id: 'ex24', name: 'Plank', equipment: 'Body Weight', videoUrl: '/plank.mp4', category: 'Core' },
  
  // Leg Machines
  { id: 'ex25', name: 'Leg Press', equipment: 'Leg Press', videoUrl: '/leg-press.mp4', category: 'Legs' },
  { id: 'ex26', name: 'Leg Extension', equipment: 'Leg Extension', videoUrl: '/leg-extension.mp4', category: 'Legs' },
  { id: 'ex27', name: 'Leg Curl', equipment: 'Leg Curl', videoUrl: '/leg-curl.mp4', category: 'Legs' },
  { id: 'ex28', name: 'Seated Calf Raise', equipment: 'Calf Raise', videoUrl: '/calf-raise.mp4', category: 'Legs' },
  { id: 'ex29', name: 'Standing Calf Raise', equipment: 'Calf Raise', videoUrl: '/standing-calf-raise.mp4', category: 'Legs' },
  
  // Chest Machines
  { id: 'ex30', name: 'Pec Deck Fly', equipment: 'Pec Deck', videoUrl: '/pec-deck.mp4', category: 'Chest' },
  { id: 'ex31', name: 'Chest Press Machine', equipment: 'Chest Press', videoUrl: '/chest-press-machine.mp4', category: 'Chest' },
  
  // Back Machines
  { id: 'ex32', name: 'Lat Pulldown Machine', equipment: 'Lat Pulldown', videoUrl: '/lat-pulldown-machine.mp4', category: 'Back' },
  { id: 'ex33', name: 'Seated Row Machine', equipment: 'Rowing Machine', videoUrl: '/seated-row-machine.mp4', category: 'Back' },
  { id: 'ex34', name: 'Back Extension Machine', equipment: 'Back Extension', videoUrl: '/back-extension.mp4', category: 'Back' },
  
  // Shoulder Machines
  { id: 'ex35', name: 'Shoulder Press Machine', equipment: 'Shoulder Press', videoUrl: '/shoulder-press-machine.mp4', category: 'Shoulders' },
  
  // Arm Machines
  { id: 'ex36', name: 'Tricep Machine', equipment: 'Tricep Machine', videoUrl: '/tricep-machine.mp4', category: 'Arms' },
  { id: 'ex37', name: 'Bicep Curl Machine', equipment: 'Bicep Machine', videoUrl: '/bicep-machine.mp4', category: 'Arms' },
  
  // Multi-Purpose
  { id: 'ex38', name: 'Smith Machine Squat', equipment: 'Smith Machine', videoUrl: '/smith-machine-squat.mp4', category: 'Legs' },
  { id: 'ex39', name: 'Smith Machine Bench', equipment: 'Smith Machine', videoUrl: '/smith-machine-bench.mp4', category: 'Chest' },
  { id: 'ex40', name: 'Cable Crossover', equipment: 'Cable Station', videoUrl: '/cable-crossover.mp4', category: 'Chest' },
  { id: 'ex41', name: 'Cable Tricep Pushdown', equipment: 'Cable Station', videoUrl: '/cable-tricep-pushdown.mp4', category: 'Arms' },
  { id: 'ex42', name: 'Cable Bicep Curl', equipment: 'Cable Station', videoUrl: '/cable-bicep-curl.mp4', category: 'Arms' },
  
  // Cardio Equipment
  { id: 'ex43', name: 'Treadmill Run', equipment: 'Treadmill', videoUrl: '/treadmill-run.mp4', category: 'Cardio' },
  { id: 'ex44', name: 'Treadmill Walk', equipment: 'Treadmill', videoUrl: '/treadmill-walk.mp4', category: 'Cardio' },
  { id: 'ex45', name: 'Elliptical Trainer', equipment: 'Elliptical', videoUrl: '/elliptical.mp4', category: 'Cardio' },
  { id: 'ex46', name: 'Exercise Bike', equipment: 'Exercise Bike', videoUrl: '/exercise-bike.mp4', category: 'Cardio' },
  { id: 'ex47', name: 'Rowing Machine', equipment: 'Rowing Ergometer', videoUrl: '/rowing-machine.mp4', category: 'Cardio' },
  { id: 'ex48', name: 'Stairmaster', equipment: 'Stairmaster', videoUrl: '/stairmaster.mp4', category: 'Cardio' },
  
  // Free Weight Variations
  { id: 'ex49', name: 'Dumbbell Bench Press', equipment: 'Free Weights', videoUrl: '/dumbbell-bench-press.mp4', category: 'Chest' },
  { id: 'ex50', name: 'Dumbbell Shoulder Press', equipment: 'Free Weights', videoUrl: '/dumbbell-shoulder-press.mp4', category: 'Shoulders' },
  
  // New equipment exercises
  { id: 'ex51', name: 'Stehender Schulterdruck', equipment: 'DLC115 Shoulder Press', videoUrl: '/shoulder-press-dlc115.mp4', category: 'Shoulders' },
  { id: 'ex52', name: 'Seitliches Heben', equipment: 'DLC125 Lateral Raise', videoUrl: '/lateral-raise-dlc125.mp4', category: 'Shoulders' },
  { id: 'ex53', name: 'Butterfly', equipment: 'DLC220 Butterfly', videoUrl: '/butterfly-dlc220.mp4', category: 'Chest' },
  { id: 'ex54', name: 'Latzug Radial', equipment: 'DLC315 Lat Pulldown', videoUrl: '/lat-pulldown-dlc315.mp4', category: 'Back' },
  { id: 'ex55', name: 'Lateral Rudern', equipment: 'DLC325 Rowing Machine', videoUrl: '/rowing-dlc325.mp4', category: 'Back' },
  { id: 'ex56', name: 'Lat Press', equipment: 'DLC330 Lat Press', videoUrl: '/lat-press-dlc330.mp4', category: 'Back' },
  { id: 'ex57', name: 'Pull Over', equipment: 'DLC345 Pull Over', videoUrl: '/pullover-dlc345.mp4', category: 'Back' },
  { id: 'ex58', name: 'Rückenstrecker', equipment: 'DLC355 Back Extension', videoUrl: '/back-extension-dlc355.mp4', category: 'Back' },
  { id: 'ex59', name: 'Bizeps Curls', equipment: 'DLC415 Bicep Machine', videoUrl: '/bicep-dlc415.mp4', category: 'Arms' },
  { id: 'ex60', name: 'Dips Maschine', equipment: 'DLC435 Dip Machine', videoUrl: '/dip-dlc435.mp4', category: 'Arms' },
  { id: 'ex61', name: 'Kniebeugen Maschine', equipment: 'DLC635 Squat Machine', videoUrl: '/squat-dlc635.mp4', category: 'Legs' },
  { id: 'ex62', name: 'Kickbacks', equipment: 'DLC665 Kick Machine', videoUrl: '/kick-dlc665.mp4', category: 'Legs' },
  { id: 'ex63', name: 'Wadenmaschine', equipment: 'DLC685 Calf Machine', videoUrl: '/calf-dlc685.mp4', category: 'Legs' },
  { id: 'ex64', name: 'Beinpresse', equipment: 'K613 Leg Press', videoUrl: '/leg-press-k613.mp4', category: 'Legs' },
  { id: 'ex65', name: 'Vario Beinpresse', equipment: 'K617 Vario Leg Press', videoUrl: '/leg-press-k617.mp4', category: 'Legs' },
  { id: 'ex66', name: 'Kombinierte Beinübung', equipment: 'K688 Leg Combo', videoUrl: '/leg-combo-k688.mp4', category: 'Legs' },
  { id: 'ex67', name: 'Brustdrücken Flach', equipment: 'K721 Bench Press', videoUrl: '/bench-press-k721.mp4', category: 'Chest' },
  { id: 'ex68', name: 'Schrägbankdrücken', equipment: 'K724 Incline Bench', videoUrl: '/incline-bench-k724.mp4', category: 'Chest' },
  { id: 'ex69', name: 'Hyperextension', equipment: 'K733 Hyperextension', videoUrl: '/hyperextension-k733.mp4', category: 'Back' },
  { id: 'ex70', name: 'Bizepsbank', equipment: 'K740 Bicep Bench', videoUrl: '/bicep-bench-k740.mp4', category: 'Arms' },
  { id: 'ex71', name: 'Bauchübungen', equipment: 'K753 Ab Bench', videoUrl: '/ab-bench-k753.mp4', category: 'Core' },
  { id: 'ex72', name: 'Kniebeugen mit Rack', equipment: 'K760 Squat Rack', videoUrl: '/squat-rack-k760.mp4', category: 'Legs' },
  { id: 'ex73', name: 'Latzug mit Sitz', equipment: 'T310 Lat Station', videoUrl: '/lat-station-t310.mp4', category: 'Back' },
  { id: 'ex74', name: 'Rudern Station', equipment: 'T320 Rowing Station', videoUrl: '/rowing-station-t320.mp4', category: 'Back' },
  { id: 'ex75', name: 'Sitzrudern mit Brustpolster', equipment: 'T322 Seated Row', videoUrl: '/seated-row-t322.mp4', category: 'Back' },
  { id: 'ex76', name: 'Bizeps-Trizeps Kombi', equipment: 'T414 Bicep-Tricep', videoUrl: '/bicep-tricep-t414.mp4', category: 'Arms' },
  { id: 'ex77', name: 'Rollsitz Beinpresse', equipment: 'T613 Rolling Leg Press', videoUrl: '/rolling-leg-press-t613.mp4', category: 'Legs' },
  // New entry for Beinpresse sitzend
  { id: 'ex78', name: 'Beinpresse, sitzend', equipment: 'Beinpresse, sitzend', videoUrl: '/leg-press.mp4', category: 'Legs' },
];
