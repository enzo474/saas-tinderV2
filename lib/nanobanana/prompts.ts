export type PhotoType = 'main' | 'lifestyle' | 'social' | 'passion' | 'elegant'

export interface UserContext {
  vibe: string[]
  lifestyle: string[]
  sport?: string
  job?: string
  target_women: string[]
  passions?: string[]
}

// Préfixe de réalisme pour forcer un rendu smartphone authentique (équivalent negative prompt)
const REALISM_PREFIX = `CRITICAL REALISM REQUIREMENTS FOR SMARTPHONE PHOTO:
- Photo MUST look like taken with iPhone 14/15 Pro in natural real-world conditions
- Authentic smartphone camera characteristics: natural grain, realistic depth of field, true-to-life color temperature
- Real identifiable location with visible environmental context (absolutely NO AI-generated or studio backdrop)
- Natural ambient lighting with realistic shadows, highlights, and natural color cast from environment
- Realistic human skin texture with visible natural pores and subtle imperfections (absolutely NO airbrushing or smoothing)
- Clothing and fabric showing visible material texture, natural wrinkles, and realistic wear
- Candid authentic moment aesthetic, absolutely NOT staged studio portrait or professional photoshoot
- Environmental storytelling: background MUST show real recognizable places with character

STRICTLY AVOID (these will ruin authenticity):
- Studio portrait lighting (perfect even illumination, artificial rim lights, hair lights, or fill lights)
- Artificial backgrounds, green screen effects, or obviously AI-generated environments
- Overly smooth, plastic-looking, or porcelain skin (must show natural texture)
- Perfectly symmetrical centered composition (use natural off-center framing)
- Corporate headshot, LinkedIn profile, or business card photo aesthetic
- Stock photography appearance with overly perfect staging
- Professional DSLR look with artificially perfect bokeh circles
- Stiff, rigid, or overly posed body language (must appear natural and relaxed)
- Perfect studio makeup or retouching

MANDATORY AESTHETIC: Natural candid lifestyle photography captured spontaneously in authentic real-world moment with smartphone.

`;

export function buildPhotoPrompt(type: PhotoType, ctx: UserContext): string {
  const vibeStr = ctx.vibe.join(', ')
  const lifestyleStr = ctx.lifestyle.join(', ')
  
  const prompts: Record<PhotoType, string> = {
    main: `${REALISM_PREFIX}
Photorealistic smartphone photo of a man in an urban outdoor lifestyle setting.

IDENTITY PRESERVATION (ABSOLUTELY CRITICAL):
- Preserve EXACT facial features, skin tone, eye color, and complete face structure from ALL reference images
- Do NOT alter, idealize, enhance, or modify ANY facial characteristics whatsoever
- Maintain 100% identity fidelity to the reference photos - face must be immediately recognizable
- Keep natural facial asymmetries, unique features, and authentic appearance

SETTING & COMPOSITION:
- Location: Urban rooftop terrace with visible city skyline in soft-focus background OR pedestrian street with recognizable architecture
- Time of day: Golden hour (late afternoon, 5-6pm, warm orange-yellow side lighting, long soft shadows)
- Background: Slightly blurred real cityscape - actual buildings, real street scene, authentic urban environment (NOT generic or AI-generated backdrop)
- Distance & framing: Medium shot from chest to top of head, captured at slight 3/4 angle (not straight-on), subject positioned slightly off-center for natural composition
- Camera height: Eye level or slightly below, creating approachable feel

OUTFIT & CLOTHING DETAILS:
- Top: Fitted white, light blue, or soft grey button-up shirt with top button casually undone, sleeves rolled to forearms OR clean t-shirt
- Outer layer: Navy, olive green, or charcoal bomber jacket OR unstructured casual blazer with relaxed modern fit (not corporate)
- Style: Clean modern European streetwear aesthetic - well-fitted but not tight, contemporary casual
- Details: Watch visible on wrist (minimal modern design), NO sunglasses on face, clothes showing natural fabric texture and slight wrinkles
- Overall look: Effortlessly put-together, NOT trying too hard

POSE & BODY LANGUAGE:
- Stance: Relaxed natural posture with weight shifted onto one leg, creating subtle asymmetry
- Upper body: Slight lean forward or to the side, shoulders relaxed and natural (NOT squared rigidly to camera)
- Hands: One hand casually in jacket pocket OR naturally holding smartphone or disposable coffee cup
- Movement: Mid-moment captured naturally, as if photographer caught a spontaneous second (NOT static frozen pose)
- Energy: Confident but approachable, present and grounded

FACIAL EXPRESSION & GAZE:
- Expression: Genuine slight smile showing hint of warmth OR calm confident neutral expression with soft eyes
- Mouth: Natural relaxed position, maybe slight asymmetry (human authenticity)
- Eyes: Looking toward camera but with relaxed soft gaze (NOT intense stare or model gaze)
- Micro-expressions: Subtle natural details like slight squint from golden hour sun, natural eye crinkle
- Overall feel: Approachable, genuine, confident without arrogance

PHOTO TECHNICAL SPECIFICATIONS:
- Camera simulation: iPhone 14/15 Pro portrait mode aesthetic
- Focus: Sharp focus on face and eyes, natural progressive blur (depth of field) on background
- Skin & texture: Natural skin showing realistic pores and texture, visible fabric texture on clothing, realistic material appearance
- Lighting direction: Warm golden hour light coming from left or right side, creating natural shadow on opposite side of face
- Color temperature: Warm natural color cast with orange/yellow tones characteristic of golden hour (NOT cool or neutral)
- Photo grain: Subtle natural smartphone photo grain throughout (NOT overly sharp or artificially processed)
- Composition: Slightly off-center framing, casual natural composition (absolutely NOT symmetrical studio portrait)
- Dynamic range: Natural smartphone contrast with slightly blown-out highlights in background (authentic to smartphone camera)

ENVIRONMENTAL CONTEXT & ATMOSPHERE:
- Background elements: Real identifiable urban environment visible but slightly out of focus
- Architecture style: Modern European or North American urban - glass buildings, brick facades, or contemporary design
- Sky: Natural sky gradient with warm sunset colors if golden hour timing
- Ambient details: Maybe distant people blurred in background, street furniture, urban life context
- Location authenticity: Setting should feel like it could be real rooftop in Paris, NYC, London, Barcelona - specific identifiable character

OVERALL VIBE & ENERGY: ${vibeStr} - confident, modern, approachable urban lifestyle, natural masculine energy, effortlessly stylish without trying too hard`,

    lifestyle: `${REALISM_PREFIX}
Photorealistic smartphone photo of a man in a relaxed outdoor casual lifestyle setting.

IDENTITY PRESERVATION (ABSOLUTELY CRITICAL):
- Preserve EXACT facial features, skin tone, eye color, and complete face structure from ALL reference images
- Do NOT alter, idealize, enhance, or modify ANY facial characteristics whatsoever
- Maintain 100% identity fidelity to the reference photos - face must be immediately recognizable
- Keep natural facial asymmetries, unique features, and authentic appearance

SETTING & COMPOSITION:
- Location: ${
      ctx.lifestyle.includes('Voyageur')
        ? 'Waterfront promenade, lakeside wooden dock, or scenic coastal path with water visible in soft-focus background'
        : ctx.lifestyle.includes('Sportif discipliné')
        ? 'Urban running path through park, outdoor fitness area with greenery, or riverside walking trail'
        : ctx.lifestyle.includes('Créatif')
        ? 'Street art district, creative neighborhood with murals, or artsy cafe terrace with character'
        : 'Pedestrian street in charming neighborhood, outdoor cafe terrace, or tree-lined urban park path'
    }
- Time of day: Natural daylight - mid-morning (soft even light) OR late afternoon (warm ambient light)
- Background: Real identifiable environment visible with natural blur - NOT studio backdrop, actual recognizable location
- Distance & framing: Half-body shot from waist up, captured at natural angle with environmental context clearly visible
- Perspective: Slightly below eye level, creating dynamic authentic composition

OUTFIT & CLOTHING DETAILS:
- Top: Casual henley shirt, relaxed polo, or casual button-up shirt (untucked, sleeves possibly rolled)
- Alternative: Clean crewneck sweatshirt (solid color - navy, grey, olive, burgundy), lightweight casual jacket over t-shirt
- Bottom: Dark blue or black jeans, casual chinos in neutral color (if visible in frame)
- Footwear: Clean white sneakers or casual leather shoes (if visible)
- Style: Effortless casual weekend aesthetic - comfortable but intentional, relaxed fit showing fabric texture
- Details: Minimal accessories, possibly watch, maybe sunglasses in hand or hanging from collar (NOT on face)

POSE & BODY LANGUAGE:
- Position: Mid-movement captured naturally - mid-stride while walking, sitting casually on ledge/railing, or leaning against surface
- Action context: Maybe holding reusable coffee cup, phone naturally in hand, or just arms relaxed at sides
- Upper body: Turned slightly to create dynamic angle (NOT facing camera directly), natural relaxed shoulders
- Movement: Sense of natural motion frozen mid-moment - mid-laugh, mid-step, or casual gesture
- Energy: Relaxed, in his element, living life naturally without awareness of being photographed

FACIAL EXPRESSION & GAZE:
- Expression: Relaxed genuine smile showing natural warmth OR thoughtful calm look (contemplative moment)
- Eyes: Slight look away from camera toward environment OR natural glance toward camera while mid-action
- Authenticity: Expression should match body language and setting (laughing while walking, calm while observing)
- Micro-details: Natural expression lines, eyes reflecting ambient light, authentic human moment
- Overall feel: Living his life authentically, caught in genuine moment

PHOTO TECHNICAL SPECIFICATIONS:
- Camera simulation: iPhone smartphone photo aesthetic (NOT professional DSLR look)
- Focus: Sharp on subject with natural background blur showing environment context
- Skin & texture: Realistic skin texture visible, fabric texture on clothing, slight photo grain characteristic of smartphone
- Lighting: Natural outdoor ambient light, soft shadows, absolutely NO artificial flash or studio lights
- Color temperature: Natural outdoor color cast - slightly warm if afternoon, neutral-cool if morning
- Environment authenticity: Location MUST be real identifiable place (actual waterfront, real street, real park)
- Composition: Natural casual framing capturing authentic lifestyle moment
- Photo quality: Smartphone-quality dynamic range with natural contrast

ENVIRONMENTAL CONTEXT & ATMOSPHERE:
- Background storytelling: Environment should communicate lifestyle and personality
${ctx.lifestyle.includes('Voyageur') ? '- Travel context: Water, boats, distant landmarks, or scenic natural elements visible' : ''}
${ctx.lifestyle.includes('Sportif discipliné') ? '- Athletic context: Park paths, greenery, outdoor fitness environment suggesting active lifestyle' : ''}
${ctx.lifestyle.includes('Créatif') ? '- Creative context: Street art, colorful backgrounds, quirky cafe, or artistic neighborhood character' : ''}
- Ambient details: Real people subtly blurred in background, natural environmental elements
- Seasonal context: Appropriate outdoor details (green foliage, autumn colors, or neutral season)
- Authenticity: Setting must feel like real spontaneous moment captured during actual activity

OVERALL VIBE & ENERGY: ${vibeStr} - ${lifestyleStr} - relaxed, authentic, living life fully, masculine energy balanced with approachability`,

    social: `${REALISM_PREFIX}
Photorealistic smartphone photo of a man in a cozy indoor setting showing personality and character.

IDENTITY PRESERVATION (ABSOLUTELY CRITICAL):
- Preserve EXACT facial features, skin tone, eye color, and complete face structure from ALL reference images
- Do NOT alter, idealize, enhance, or modify ANY facial characteristics whatsoever
- Maintain 100% identity fidelity to the reference photos - face must be immediately recognizable
- Keep natural facial asymmetries, unique features, and authentic appearance

SETTING & COMPOSITION:
- Location: Cozy characterful indoor space - cafe/bar interior with personality, home bookshelf background, record shop, creative workspace, or lounge with warm atmosphere
- Background elements: Visible environment telling story - bookshelves with actual books, plants creating ambiance, artwork/posters on walls, warm interior design details
- Lighting atmosphere: Warm amber indoor ambient light - cafe lighting creating cozy glow, window light streaming in, soft pendant lamps, or warm Edison bulbs
- Distance & framing: Chest-up shot at natural angle, background clearly visible and contextual but slightly soft focus
- Setting character: Environment should have personality and warmth (NOT sterile or generic)

OUTFIT & CLOTHING DETAILS:
- Primary option: Crewneck sweater in black, navy, charcoal grey, or forest green - clean simple aesthetic
- Alternative: Henley shirt, casual button-up (maybe flannel pattern), OR plain hoodie without loud graphics
- Tertiary option: Denim jacket worn over simple t-shirt for layered casual look
- Fit & style: Well-fitted but not tight, comfortable relaxed silhouette showing natural fabric texture
- Material texture: Visible knit texture on sweater, fabric wrinkles, realistic material appearance
- Overall aesthetic: Laid-back approachable style, comfortable in his environment

POSE & BODY LANGUAGE:
- Seated position: Casually seated at table/counter with natural relaxed posture, OR leaning against bar/bookshelf
- Hands: Holding warm drink (coffee/tea in ceramic mug), resting naturally on table surface, or relaxed at sides
- Upper body: Leaning forward slightly creating engaged presence, shoulders relaxed and open
- Posture: Natural seated or standing position showing comfort in environment (NOT stiff or awkward)
- Energy: Present, grounded, comfortable being himself

FACIAL EXPRESSION & GAZE:
- Expression: Genuine warm smile showing teeth slightly OR calm engaged thoughtful look
- Eyes: Looking slightly off-camera in natural moment OR warm direct gaze suggesting mid-conversation
- Smile authenticity: If smiling, must reach eyes creating natural crow's feet (genuine Duchenne smile)
- Engagement: Expression suggesting he's mid-conversation or naturally present in moment
- Overall affect: Warm, approachable, interesting person you'd want to talk to

PHOTO TECHNICAL SPECIFICATIONS:
- Camera simulation: iPhone photo taken by friend in natural social moment (NOT professional setup)
- Focus: Slightly softer overall from indoor lighting, warm color temperature throughout
- Texture: Natural skin texture clearly visible, environmental details showing character
- Lighting quality: Warm indoor glow with natural shadows, maybe slight window backlight creating dimension
- Color cast: Warm amber/orange tones from indoor cafe lighting (NOT cool or clinical)
- Atmosphere: Cozy inviting ambiance captured in color and lighting
- Grain: Natural smartphone photo grain, especially in shadows
- Composition: Natural framing as if friend captured candid moment

ENVIRONMENTAL CONTEXT & STORYTELLING:
- Background personality: Environment reveals interests and character
${ctx.passions?.filter(Boolean).length ? `- Personal interests: Background should subtly reference ${ctx.passions.filter(Boolean).slice(0, 2).join(' and ')} through environmental details` : '- Personal interests: Books, music, creative elements, or cultural objects visible'}
- Cafe ambiance: If cafe setting, show espresso machine, shelves with coffee equipment, plants, warm lighting
- Home/workspace: If personal space, show bookshelves, records/music equipment, plants, artwork that tells story
- Location authenticity: Setting must feel like real identifiable place (actual cafe interior, real bookshelf, genuine creative space)
- Ambient details: Other elements slightly visible but out of focus - lamps, furniture, decor creating atmosphere

OVERALL VIBE & ENERGY: ${vibeStr} - approachable, interesting, depth of character visible, masculine warmth, intellectually curious, comfortable in his own skin`,

    passion: `${REALISM_PREFIX}
Photorealistic smartphone photo of a man in a minimal relaxed outdoor setting with effortless chill energy.

IDENTITY PRESERVATION (ABSOLUTELY CRITICAL):
- Preserve EXACT facial features, skin tone, eye color, and complete face structure from ALL reference images
- Do NOT alter, idealize, enhance, or modify ANY facial characteristics whatsoever
- Maintain 100% identity fidelity to the reference photos - face must be immediately recognizable
- Keep natural facial asymmetries, unique features, and authentic appearance

SETTING & COMPOSITION:
- Location: Simple clean outdoor setting - park bench with minimal background, modern building exterior with plain wall, waterfront seating area, or rooftop with sky visible
- Background style: Clean minimal aesthetic - clear sky, water, plain wall, or naturally blurred urban/nature backdrop
- Lighting: Soft natural daylight with even illumination OR warm afternoon light with gentle shadows
- Distance & framing: Waist-up shot if standing, OR full upper body if seated casually, relaxed natural framing
- Composition: Uncluttered clean composition letting subject stand out against simplified background

OUTFIT & CLOTHING DETAILS:
- Top: Laid-back casual - plain quality t-shirt (white, grey, navy, olive, sand) OR casual lightweight shirt
- Optional layer: Light casual jacket (bomber, denim, windbreaker) worn naturally OR just clean simple top
- Bottom: Well-fitted dark jeans or casual pants in neutral tone (if visible)
- Accessories: Sunglasses worn naturally (ON face if bright day, NOT on head or hanging), maybe minimal watch
- Colors: Neutral minimalist palette - whites, greys, navy, olive, beige, black
- Fit: Clean simple aesthetic, effortless style, modern minimalist streetwear influence
- Texture: Visible fabric texture, natural clothing wrinkles, realistic material

POSE & BODY LANGUAGE:
- Seated option: Sitting casually on bench/ledge with legs crossed OR one leg bent, arm resting naturally on knee
- Standing option: Leaning back against wall/railing with relaxed posture, weight on one leg creating natural asymmetry
- Position: Body slightly turned creating dynamic angle (NOT rigid frontal pose)
- Arms: One arm resting casually, other hand in pocket OR both arms relaxed at sides
- Shoulders: Completely relaxed, natural slouch, embodying effortless confidence
- Energy: Chill, unhurried, present in the moment, secure masculine energy without trying

FACIAL EXPRESSION & GAZE:
- Expression: Calm slight smile suggesting inner contentment OR neutral confident relaxed look
- Eyes: Looking slightly away from camera toward distance (contemplative) OR relaxed calm gaze toward camera
- If wearing sunglasses: Head turned showing face profile and jawline, natural relaxed expression even with eyes hidden
- Emotion: Peaceful, grounded, at ease with himself
- Authenticity: Expression matching chill relaxed body language
- Overall vibe: Effortless cool without trying, natural confidence

PHOTO TECHNICAL SPECIFICATIONS:
- Camera simulation: iPhone smartphone candid photo captured by friend
- Focus: Clean sharp focus on subject, natural blur on simplified background
- Texture: Realistic natural skin texture, fabric detail visible, subtle photo grain
- Lighting: Soft natural daylight with minimal harsh shadows, even ambient outdoor light
- Color palette: Clean neutral tones, slightly desaturated for modern aesthetic
- Background: Simple uncluttered minimal backdrop (sky, water, plain surface)
- Composition: Breathing room in frame, subject doesn't fill entire image, minimal clean aesthetic
- Quality: Smartphone-quality natural dynamic range

ENVIRONMENTAL CONTEXT & MINIMAL STORYTELLING:
- Background simplicity: Minimal setting letting subject be focus without distraction
- Subtle context hints:
${ctx.sport ? `  - Athletic influence: Maybe gym bag visible at feet, athletic-casual wear, or fitness-influenced aesthetic` : ''}
${ctx.passions?.filter(Boolean)[0] ? `  - Interest suggestion: Subtle hint of ${ctx.passions[0]} through minimal prop (skateboard, camera, book) NOT dominating frame` : ''}
- Location character: Clean modern spaces - contemporary park design, modern architecture, minimalist urban setting
- Ambient atmosphere: Clear day, clean air, open space feeling
- Authenticity: Real identifiable minimal location (actual modern park bench, real waterfront, genuine rooftop)

OVERALL VIBE & ENERGY: ${vibeStr} - effortless confidence, chill relaxed energy, comfortable silence, grounded presence, masculine ease without posturing, minimalist aesthetic`,

    elegant: `${REALISM_PREFIX}
Photorealistic smartphone photo of a man in an evening smart casual upscale setting with sophisticated approachable energy.

IDENTITY PRESERVATION (ABSOLUTELY CRITICAL):
- Preserve EXACT facial features, skin tone, eye color, and complete face structure from ALL reference images
- Do NOT alter, idealize, enhance, or modify ANY facial characteristics whatsoever
- Maintain 100% identity fidelity to the reference photos - face must be immediately recognizable
- Keep natural facial asymmetries, unique features, and authentic appearance

SETTING & COMPOSITION:
- Location: Evening urban upscale setting - rooftop bar/terrace at dusk, upscale restaurant exterior, sophisticated lounge with city view, OR elevated terrace overlooking night cityscape
- Time: Dusk/early evening (blue hour transitioning to night, 7-8pm) OR early night with ambient artificial lights
- Background: Soft bokeh from city lights in background, warm glowing lights creating atmosphere, twilight sky gradient
- Distance & framing: Chest-up sophisticated composition, slight angle creating dimension, polished but not stiff framing
- Atmosphere: Upscale casual environment (NOT formal gala or black-tie event), elevated social setting

OUTFIT & CLOTHING DETAILS:
- Blazer: Dark smart blazer (navy, charcoal, or black) with modern European tailored cut - structured but not corporate
- Shirt: Open-collar shirt (light blue, white, or subtle pattern) with top 1-2 buttons casually undone (absolutely NO tie)
- Alternative: Dark high-quality turtleneck OR refined knit sweater worn under blazer for sophisticated casual look
- Fit: Tailored modern slim fit but NOT tight, contemporary European cut showing quality
- Colors: Rich dark tones - navy, charcoal, black, deep burgundy
- Details: Watch visible (leather strap or minimal metal), maybe holding crystal glass naturally, fabric showing quality texture
- Overall aesthetic: Smart casual evening wear - polished but approachable, sophisticated without being corporate

POSE & BODY LANGUAGE:
- Stance: Relaxed upright posture with slight lean, weight subtly shifted to one leg
- Upper body: Turned at slight angle (NOT rigidly frontal), shoulders naturally relaxed despite formal wear
- Hands: One hand casually in trouser pocket creating asymmetry OR holding drink glass naturally at side
- Position: Maybe leaning subtly against railing/column OR standing confidently but relaxed
- Posture: Confident but NOT stiff military posture, natural masculine presence
- Energy: Sophisticated confidence, date-ready, approachable despite elevated setting

FACIAL EXPRESSION & GAZE:
- Expression: Calm confident slight smile suggesting warmth OR composed assured look with soft eyes
- Smile: If smiling, subtle and genuine (NOT wide cheese or forced)
- Eyes: Warm engaging gaze toward camera OR slight look to side suggesting mid-moment
- Affect: Sophisticated but warm, confident without arrogance, approachable despite polished appearance
- Micro-expressions: Natural relaxed face showing authentic ease
- Overall feel: You'd feel comfortable approaching him despite elevated setting

PHOTO TECHNICAL SPECIFICATIONS:
- Camera simulation: iPhone 14/15 Pro portrait mode in evening/night conditions
- Focus: Sharp focus on subject's face, beautiful soft bokeh on background city lights
- Background blur: Out-of-focus warm lights creating atmospheric bokeh circles (natural phone depth-of-field)
- Texture: Natural skin showing slight evening glow from ambient light, fabric texture visible on blazer/shirt
- Lighting: Warm ambient evening light creating soft glow on face, maybe subtle rim light from behind
- Light sources: Ambient lounge lighting, distant city lights, maybe candlelight if restaurant setting
- Color temperature: Warm evening tones (amber/gold) mixed with cool twilight blue from sky
- Atmosphere: Sophisticated evening ambiance captured in lighting and color palette
- Grain: Slight smartphone grain characteristic of evening/low-light smartphone photography

ENVIRONMENTAL CONTEXT & EVENING ATMOSPHERE:
- Background: City lights creating bokeh, urban skyline slightly visible, upscale terrace/rooftop environment
- Lighting ambiance: Warm pendant lights, string lights, or ambient architectural lighting visible but blurred
- Setting character: Upscale but relaxed social space (rooftop drinks spot, elevated terrace, sophisticated lounge)
- NOT: Corporate event, wedding, formal gala, or overly stiff formal occasion
- Season/weather: Clear evening, comfortable temperature, pleasant atmosphere
- Social context: Evening drinks setting, pre-dinner gathering, sophisticated but casual social moment
- Location authenticity: Real rooftop bar (NYC, Paris, London style), genuine upscale terrace, identifiable elevated venue

OVERALL VIBE & ENERGY: ${vibeStr} - polished casual evening confidence, sophisticated but approachable, date-ready elevated presence, masculine refinement without stuffiness, comfortable in upscale settings while remaining warm and human`,
  }

  return prompts[type]
}
