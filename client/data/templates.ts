export type TemplateCategory =
  | "image-generation"
  | "video"
  | "career"
  | "learning"
  | "coding"
  | "business";

export type Template = {
  slug: string;
  title: string;
  category: TemplateCategory;
  tool: string[];
  description: string;
  prompt: string;
  variables: string[];
  coverImage: string;
  coverAlt: string;
  createdAt: string;
  tips?: string;
};

export const CATEGORIES: {
  slug: TemplateCategory;
  name: string;
  description: string;
}[] = [
  {
    slug: "image-generation",
    name: "Image Generation",
    description: "Production-ready prompt templates for Midjourney, DALL·E 3, and Stable Diffusion.",
  },
  {
    slug: "video",
    name: "Video & Reels",
    description: "High-retention video script, scene direction, and reel storyboard prompts.",
  },
  {
    slug: "career",
    name: "Career & LinkedIn",
    description: "Thought leadership posts, resume optimization, and interview prep prompts.",
  },
  {
    slug: "learning",
    name: "Learning & Education",
    description: "Socratic tutoring, complex concept breakdown, and skill mastery prompts.",
  },
  {
    slug: "coding",
    name: "Coding & Engineering",
    description: "System architecture, refactoring, code review, and debug prompts.",
  },
  {
    slug: "business",
    name: "Business & Strategy",
    description: "Executive memos, product briefs, market analysis, and launch plans.",
  },
];

export const TEMPLATES: Template[] = [
  // 1 to 20: Image Generation Prompts from execution.md Part 3.6
  {
    slug: "cinematic-portrait",
    title: "Cinematic Portrait",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3", "Stable Diffusion"],
    description: "85mm lens portrait with soft rim lighting and 35mm film grain tone.",
    prompt:
      "Cinematic portrait of [SUBJECT], shallow depth of field, 85mm lens, soft rim light, film grain, teal and orange grading, ultra detailed",
    variables: ["[SUBJECT]"],
    coverImage: "/templates/cinematic-portrait.svg",
    coverAlt: "Cinematic portrait with shallow depth of field and rim lighting",
    createdAt: "2026-03-01",
    tips: "Add --ar 16:9 in Midjourney for widescreen film framing.",
  },
  {
    slug: "linkedin-headshot",
    title: "LinkedIn Headshot",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Clean studio headshot against neutral backdrop for executive profiles.",
    prompt:
      "Professional headshot of [SUBJECT] in [ATTIRE], clean light gray background, soft studio lighting, confident smile, 1:1 ratio, sharp focus",
    variables: ["[SUBJECT]", "[ATTIRE]"],
    coverImage: "/templates/linkedin-headshot.svg",
    coverAlt: "Clean professional studio headshot on neutral gray background",
    createdAt: "2026-03-01",
    tips: "Set attire to tailored blazer or tech-casual oxford shirt for best realism.",
  },
  {
    slug: "product-photography",
    title: "Product Photography",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Minimalist commercial studio shot with diffuse shadow box lighting.",
    prompt:
      "Studio product shot of [PRODUCT] on [SURFACE], soft shadows, softbox lighting, minimal background, high-end commercial look",
    variables: ["[PRODUCT]", "[SURFACE]"],
    coverImage: "/templates/product-photography.svg",
    coverAlt: "Minimalist commercial studio product photograph on textured pedestal",
    createdAt: "2026-03-01",
    tips: "Specify concrete, matte travertine, or dark oak for the surface variable.",
  },
  {
    slug: "anime-character",
    title: "Anime Character",
    category: "image-generation",
    tool: ["Midjourney", "Niji 6"],
    description: "High-energy stylized character illustration with crisp clean line art.",
    prompt:
      "Anime-style character [DESCRIPTION], dynamic pose, vibrant colors, clean line art, detailed eyes, studio-quality shading",
    variables: ["[DESCRIPTION]"],
    coverImage: "/templates/anime-character.svg",
    coverAlt: "Stylized anime character illustration with sharp linework and vibrant shading",
    createdAt: "2026-03-01",
    tips: "Use --niji 6 parameter if generating inside Midjourney.",
  },
  {
    slug: "3d-pixar-style",
    title: "3D Animated Style",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Charming character model with warm global illumination and smooth shading.",
    prompt:
      "3D animated character of [SUBJECT], expressive face, soft global illumination, smooth textures, warm color palette, family-friendly style",
    variables: ["[SUBJECT]"],
    coverImage: "/templates/3d-pixar-style.svg",
    coverAlt: "3D animated character model with warm expressive lighting",
    createdAt: "2026-03-01",
    tips: "Describe small clothing details like knit fabric or corduroy for tactile realism.",
  },
  {
    slug: "logo-design",
    title: "Minimal Logo",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Vector-ready geometric symbol with flat design and zero visual noise.",
    prompt:
      "Minimal vector logo for [BRAND], [INDUSTRY], simple geometric shape, [COLOR], flat design, white background, no text artifacts",
    variables: ["[BRAND]", "[INDUSTRY]", "[COLOR]"],
    coverImage: "/templates/logo-design.svg",
    coverAlt: "Minimal vector geometric logo emblem on white background",
    createdAt: "2026-03-01",
    tips: "Always add --no text letters words typography when prompting in Midjourney.",
  },
  {
    slug: "fantasy-landscape",
    title: "Fantasy Landscape",
    category: "image-generation",
    tool: ["Midjourney", "Stable Diffusion"],
    description: "Panoramic mythical terrain with floating geometry and volumetric mist.",
    prompt:
      "Epic fantasy landscape with [ELEMENTS], volumetric light, floating islands, misty valleys, painterly detail, wide angle",
    variables: ["[ELEMENTS]"],
    coverImage: "/templates/fantasy-landscape.svg",
    coverAlt: "Epic fantasy landscape with volumetric sunlight and mist-shrouded peaks",
    createdAt: "2026-03-01",
    tips: "Use --ar 21:9 for cinematic ultrawide aspect ratio.",
  },
  {
    slug: "cyberpunk-city",
    title: "Cyberpunk City",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Dystopian rain-slicked metropolis drenched in magenta and cyan neon glow.",
    prompt:
      "Neon-lit cyberpunk street at night, rain reflections, holographic signs, crowded alley, cinematic wide shot, purple and cyan palette",
    variables: [],
    coverImage: "/templates/cyberpunk-city.svg",
    coverAlt: "Cyberpunk city street at night with neon reflections on wet asphalt",
    createdAt: "2026-03-01",
    tips: "Append rainy night, puddle reflections to double down on light bounce.",
  },
  {
    slug: "food-photography",
    title: "Food Photography",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Overhead artisanal culinary shot with natural window lighting and steam.",
    prompt:
      "Overhead food photo of [DISH], rustic wooden table, natural window light, steam rising, garnish details, shallow depth of field",
    variables: ["[DISH]"],
    coverImage: "/templates/food-photography.svg",
    coverAlt: "Top-down overhead food photograph of plated cuisine on rustic wood",
    createdAt: "2026-03-01",
    tips: "Add micro herbs and coarse sea salt flakes to the dish description.",
  },
  {
    slug: "interior-design",
    title: "Interior Design Render",
    category: "image-generation",
    tool: ["Midjourney", "Stable Diffusion"],
    description: "Architectural interior visual with natural daylighting and materials.",
    prompt:
      "Photorealistic [ROOM] interior in [STYLE] style, natural daylight, [MATERIALS], wide-angle architectural photo, clean composition",
    variables: ["[ROOM]", "[STYLE]", "[MATERIALS]"],
    coverImage: "/templates/interior-design.svg",
    coverAlt: "Modern Scandinavian architectural interior render with soft natural light",
    createdAt: "2026-03-01",
    tips: "Try Japandi style with fluted white oak and lime plaster walls.",
  },
  {
    slug: "youtube-thumbnail",
    title: "YouTube Thumbnail",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "High-contrast dynamic layout with dedicated negative space for title text.",
    prompt:
      "High-contrast YouTube thumbnail of [TOPIC], expressive face, bold colors, strong focal subject, empty space on the left for text",
    variables: ["[TOPIC]"],
    coverImage: "/templates/youtube-thumbnail.svg",
    coverAlt: "High-contrast YouTube thumbnail visual with negative space on left",
    createdAt: "2026-03-01",
    tips: "Remember to keep left 40% clean so your title text doesn't overlap faces.",
  },
  {
    slug: "instagram-aesthetic",
    title: "Instagram Aesthetic Post",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Warm golden-hour lifestyle snapshot with film color grading.",
    prompt:
      "Aesthetic lifestyle photo of [SCENE], soft pastel tones, golden hour light, candid feel, 4:5 ratio",
    variables: ["[SCENE]"],
    coverImage: "/templates/instagram-aesthetic.svg",
    coverAlt: "Candid lifestyle photo in warm golden hour afternoon light",
    createdAt: "2026-03-01",
    tips: "Use --ar 4:5 for standard Instagram feed crop.",
  },
  {
    slug: "retro-poster",
    title: "Retro Poster",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "1970s screen-printed vintage graphic with authentic halftone stippling.",
    prompt:
      "Vintage 1970s poster of [SUBJECT], halftone texture, limited color palette, bold typography space, screen-print look",
    variables: ["[SUBJECT]"],
    coverImage: "/templates/retro-poster.svg",
    coverAlt: "1970s vintage graphic poster with screen-printed halftone textures",
    createdAt: "2026-03-01",
    tips: "Pick 3 dominant spot colors: mustard yellow, burnt sienna, and olive green.",
  },
  {
    slug: "watercolor-illustration",
    title: "Watercolor Illustration",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Delicate watercolor wash on cold-press textured paper.",
    prompt:
      "Watercolor illustration of [SCENE], loose brush strokes, soft color bleeds, textured paper, gentle light",
    variables: ["[SCENE]"],
    coverImage: "/templates/watercolor-illustration.svg",
    coverAlt: "Delicate watercolor painting with loose brushstrokes on cold press paper",
    createdAt: "2026-03-01",
    tips: "Add wet-on-wet watercolor bleeding edge for realistic pigment flow.",
  },
  {
    slug: "isometric-scene",
    title: "Isometric Scene",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Orthographic 3D diorama miniature with clean white surroundings.",
    prompt:
      "Isometric 3D miniature of [SCENE], tiny detailed objects, soft shadows, pastel colors, clean white background",
    variables: ["[SCENE]"],
    coverImage: "/templates/isometric-scene.svg",
    coverAlt: "Isometric 3D diorama miniature with tiny detailed models",
    createdAt: "2026-03-01",
    tips: "Great for website hero icons and tech concept illustrations.",
  },
  {
    slug: "fashion-editorial",
    title: "Fashion Editorial",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "High-fashion lookbook frame with directional studio strobes.",
    prompt:
      "Editorial fashion photo of [SUBJECT] wearing [OUTFIT], dramatic studio lighting, bold pose, magazine-style composition",
    variables: ["[SUBJECT]", "[OUTFIT]"],
    coverImage: "/templates/fashion-editorial.svg",
    coverAlt: "High fashion editorial magazine photograph with dramatic key light",
    createdAt: "2026-03-01",
    tips: "Reference avant-garde designers or architectural tailoring.",
  },
  {
    slug: "post-apocalyptic-scene",
    title: "Post-Apocalyptic Scene",
    category: "image-generation",
    tool: ["Midjourney", "Stable Diffusion"],
    description: "Atmospheric ruins overgrown with lush foliage beneath amber skies.",
    prompt:
      "Post-apocalyptic wasteland with [SUBJECT], overgrown ruins, dusty orange sky, cinematic wide shot, gritty but non-graphic",
    variables: ["[SUBJECT]"],
    coverImage: "/templates/post-apocalyptic-scene.svg",
    coverAlt: "Cinematic post-apocalyptic cityscape with overgrown vine-covered concrete",
    createdAt: "2026-03-01",
    tips: "Keep description non-graphic to comply with model safety systems.",
  },
  {
    slug: "pet-portrait",
    title: "Pet Portrait",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Heartwarming studio portrait capturing fine fur detail and bright eyes.",
    prompt:
      "Studio portrait of a [PET TYPE] with [FEATURES], soft background, warm lighting, detailed fur, heartfelt expression",
    variables: ["[PET TYPE]", "[FEATURES]"],
    coverImage: "/templates/pet-portrait.svg",
    coverAlt: "Studio portrait of domestic pet with detailed coat and warm catchlights",
    createdAt: "2026-03-01",
    tips: "Specify amber catchlights in eyes for emotional depth.",
  },
  {
    slug: "infographic-style",
    title: "Infographic Visual",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Structured educational graphic breakdown with modular visual layout.",
    prompt:
      "Clean infographic-style illustration explaining [TOPIC], flat icons, consistent color palette, clear hierarchy, white background",
    variables: ["[TOPIC]"],
    coverImage: "/templates/infographic-style.svg",
    coverAlt: "Clean educational infographic illustration with structured layout cards",
    createdAt: "2026-03-01",
    tips: "Keep background pure #ffffff for clean web insertion.",
  },
  {
    slug: "app-ui-mockup",
    title: "App UI Mockup",
    category: "image-generation",
    tool: ["Midjourney", "DALL·E 3"],
    description: "Polished mobile user interface displayed inside realistic glass device frame.",
    prompt:
      "Modern mobile app UI mockup for [APP TYPE], clean layout, rounded cards, [COLOR] accent, realistic phone frame, soft shadow",
    variables: ["[APP TYPE]", "[COLOR]"],
    coverImage: "/templates/app-ui-mockup.svg",
    coverAlt: "Modern mobile app user interface design in clean device frame",
    createdAt: "2026-03-01",
    tips: "Specify dark mode or light mode and primary brand accent color.",
  },

  // Additional categories
  {
    slug: "viral-reel-script",
    title: "Viral 60s Reel Hook & Script",
    category: "video",
    tool: ["ChatGPT", "Claude", "Gemini"],
    description: "High-retention 3-part short-form video breakdown with on-screen visual cues.",
    prompt:
      "Write a 60-second viral reel script on [TOPIC] for [TARGET AUDIENCE].\nInclude:\n1. 3-second pattern-interrupt visual hook\n2. Body divided into 3 rapid insights (with exact B-roll text overlays)\n3. Clear single CTA\nKeep total speaking pace under 140 words.",
    variables: ["[TOPIC]", "[TARGET AUDIENCE]"],
    coverImage: "/templates/viral-reel-script.svg",
    coverAlt: "Video reel script template outline",
    createdAt: "2026-03-02",
  },
  {
    slug: "b2b-linkedin-breakdown",
    title: "B2B Founder Thought Leadership",
    category: "career",
    tool: ["ChatGPT", "Claude"],
    description: "Zero-fluff LinkedIn post turning a painful operational mistake into an insight.",
    prompt:
      "Act as an executive ghostwriter. Draft a LinkedIn post about [LESSON / MISTAKE] in [INDUSTRY].\nRules:\n- Strong 1-line hook that challenges conventional wisdom\n- Short, punchy lines with generous whitespace\n- 4 actionable bullet points on what we did instead\n- No cheesy emojis, no hashtags at the end.",
    variables: ["[LESSON / MISTAKE]", "[INDUSTRY]"],
    coverImage: "/templates/b2b-linkedin-breakdown.svg",
    coverAlt: "LinkedIn post framework template",
    createdAt: "2026-03-02",
  },
  {
    slug: "socratic-learning-tutor",
    title: "Socratic Deep Learning Tutor",
    category: "learning",
    tool: ["ChatGPT", "Claude", "Gemini"],
    description: "Interactive tutor that asks probing diagnostic questions instead of lecturing.",
    prompt:
      "Act as a master tutor in [SUBJECT].\nTeach me [COMPLEX CONCEPT] using the Socratic method.\nRules:\n- Never give me the full answer directly in paragraph form.\n- Ask me one targeted conceptual question at a time.\n- Wait for my response before advancing.\n- If I make an error, gently guide me with a real-world counterexample.",
    variables: ["[SUBJECT]", "[COMPLEX CONCEPT]"],
    coverImage: "/templates/socratic-learning-tutor.svg",
    coverAlt: "Socratic interactive tutor prompt structure",
    createdAt: "2026-03-02",
  },
  {
    slug: "production-code-refactor",
    title: "Senior Engineer Code Refactor",
    category: "coding",
    tool: ["ChatGPT", "Claude"],
    description: "Comprehensive refactoring prompt focusing on performance and edge-cases.",
    prompt:
      "Act as a Principal Software Engineer. Review and refactor the following [LANGUAGE] code:\n```\n[CODE_SNIPPET]\n```\nProvide:\n1. Identified bottlenecks, security risks, or memory leaks\n2. Refactored implementation with TypeScript typing / docstrings\n3. 3 critical unit tests covering boundary conditions",
    variables: ["[LANGUAGE]", "[CODE_SNIPPET]"],
    coverImage: "/templates/production-code-refactor.svg",
    coverAlt: "Senior engineer code refactor review framework",
    createdAt: "2026-03-02",
  },
  {
    slug: "executive-decision-memo",
    title: "Amazon-Style 1-Page Memo",
    category: "business",
    tool: ["ChatGPT", "Claude"],
    description: "Rigorous 6-pager style executive brief proposing a strategic initiative.",
    prompt:
      "Draft a 1-page executive decision memo proposing [INITIATIVE] to leadership.\nFormat:\n1. Context & Problem Statement (quantified impact)\n2. Options considered (Pros, Cons, Estimated Cost)\n3. Recommended Path with 30-60-90 day milestone roadmap\n4. Top 3 risks and mitigations\nTone: Objective, data-driven, decisive.",
    variables: ["[INITIATIVE]"],
    coverImage: "/templates/executive-decision-memo.svg",
    coverAlt: "Executive decision memo framework",
    createdAt: "2026-03-02",
  },
  {
    slug: "flux-photorealistic-portrait",
    title: "FLUX.1 Photorealistic Portrait Generator",
    category: "image-generation",
    tool: ["FLUX.1", "Midjourney", "Stable Diffusion"],
    description: "Ultra-detailed 35mm portrait prompt optimized for FLUX.1 Schneller and Dev models with realistic skin textures.",
    prompt:
      "35mm candid portrait photograph of [SUBJECT], natural skin texture with subtle pores and imperfections, authentic catchlight in eyes, [LIGHTING_STYLE] lighting, shallow depth of field, shot on Leica M11 with Noctilux 50mm f/0.95 lens, authentic analog film grain, masterwork raw photography, no plastic smoothing, color graded in [COLOR_TONE] --ar 4:5",
    variables: ["[SUBJECT]", "[LIGHTING_STYLE]", "[COLOR_TONE]"],
    coverImage: "/templates/flux-photorealistic-portrait.svg",
    coverAlt: "FLUX.1 photorealistic portrait prompt blueprint",
    createdAt: "2026-03-10",
    tips: "Specify natural ambient light sources (e.g. golden hour window light) for optimum FLUX skin subsurface scattering.",
  },
  {
    slug: "instagram-reel-viral-hook",
    title: "Instagram Reel 3-Second Viral Hook Builder",
    category: "video",
    tool: ["ChatGPT", "Claude", "Gemini"],
    description: "High-retention short-form video script framework engineered to maximize completion rate and shareability on Instagram & TikTok.",
    prompt:
      "Act as a viral short-form video strategist with 10M+ aggregate views. Write a 45-second Instagram Reel script targeting [TARGET_AUDIENCE] about [TOPIC].\n\nStructure:\n1. 0-3s Visual & Verbal Hook (pattern interrupt using a contrarian or curiosity-gap statement)\n2. 4-15s Agitation & Core Relatable Problem\n3. 16-35s Actionable 3-Step Framework (with exact on-screen B-roll text overlays)\n4. 36-45s Save-Driven Call to Action (give a compelling reason to bookmark, not just follow)\n\nTone: Conversational, rapid pacing, zero corporate fluff.",
    variables: ["[TARGET_AUDIENCE]", "[TOPIC]"],
    coverImage: "/templates/instagram-reel-viral-hook.svg",
    coverAlt: "Instagram reel viral hook script framework",
    createdAt: "2026-03-10",
    tips: "Keep the spoken line in the first 3 seconds under 9 words for maximum retention.",
  },
  {
    slug: "kling-cinematic-video",
    title: "Kling AI Cinematic Scene & Camera Motion Builder",
    category: "video",
    tool: ["Kling AI", "Runway Gen-3", "Sora"],
    description: "Prompt formula for Kling AI & Sora specifying camera motion, focal depth, physics, and atmospheric lighting.",
    prompt:
      "Cinematic movie scene, [CAMERA_MOVEMENT] around [SUBJECT_ACTION], set in [ENVIRONMENT_ATMOSPHERE]. Ultra-realistic motion blur, 8k resolution, volumetric light rays penetrating dust particles, 24fps filmic shutter angle, shallow depth of field with cinematic anamorphic lens flare, natural physics and fluid cloth simulation, photorealistic grading.",
    variables: ["[CAMERA_MOVEMENT]", "[SUBJECT_ACTION]", "[ENVIRONMENT_ATMOSPHERE]"],
    coverImage: "/templates/kling-cinematic-video.svg",
    coverAlt: "Kling AI cinematic scene prompt blueprint",
    createdAt: "2026-03-10",
    tips: "Use active verbs for movement (e.g., 'dolly-in towards', 'orbit tracking shot') to trigger Kling's spatial model.",
  },
  {
    slug: "runway-gen3-camera-motion",
    title: "Runway Gen-3 Camera Motion Director",
    category: "video",
    tool: ["Runway Gen-3", "Luma Dream Machine"],
    description: "Specialized director-level prompt incorporating dynamic drone, crane, and dolly camera movements for Runway Gen-3 Alpha.",
    prompt:
      "Hyper-realistic video shot: [CAMERA_COMMAND] tracking [CHARACTER_OR_OBJECT] moving through [LOCATION]. Golden hour warm backlighting, dramatic slow motion at 60fps slowed to 24fps, high fidelity atmospheric mist, sharp optical focus, seamless temporal consistency without morphing artifacts.",
    variables: ["[CAMERA_COMMAND]", "[CHARACTER_OR_OBJECT]", "[LOCATION]"],
    coverImage: "/templates/runway-gen3-camera-motion.svg",
    coverAlt: "Runway Gen-3 camera motion director blueprint",
    createdAt: "2026-03-10",
  },
  {
    slug: "linkedin-carousel-creator",
    title: "LinkedIn Thought Leadership Carousel Creator",
    category: "career",
    tool: ["ChatGPT", "Claude"],
    description: "Turn complex domain knowledge into an engaging 7-slide PDF carousel designed for high saves and reposts.",
    prompt:
      "Act as a top 1% LinkedIn content creator in [INDUSTRY]. Write the exact slide-by-slide copy for a high-converting 7-slide LinkedIn carousel on [SUBJECT_OR_LESSON].\n\nSlide Architecture:\n• Slide 1 (Hook Cover): Contrarian title + subtitle + visual cue\n• Slide 2 (The Cost of the Status Quo): Why the traditional way is failing\n• Slides 3-5 (The 3-Pillar Solution): One crisp actionable insight per slide with bullet points\n• Slide 6 (Summary Cheat Sheet): 1-glance summary table or checklist\n• Slide 7 (CTA): High-intent conversation prompt encouraging comments\n\nRules: Under 35 words per slide. Punchy sentences. No buzzwords.",
    variables: ["[INDUSTRY]", "[SUBJECT_OR_LESSON]"],
    coverImage: "/templates/linkedin-carousel-creator.svg",
    coverAlt: "LinkedIn carousel creator layout prompt",
    createdAt: "2026-03-10",
  },
  {
    slug: "chatgpt-ats-resume-rewrite",
    title: "ATS Resume Bullet Optimizer & Job Matcher",
    category: "career",
    tool: ["ChatGPT", "Claude", "Gemini"],
    description: "Rewrite resume bullets into quantifiable Google XYZ format (Accomplished X, measured by Y, by doing Z) optimized for ATS algorithms.",
    prompt:
      "Act as a Senior Talent Acquisition Partner and ATS resume specialist. Review my current resume experience and rewrite it to match the target job description.\n\nTarget Job Description:\n\"\"\"\n[TARGET_JOB_DESCRIPTION]\n\"\"\"\n\nCurrent Experience Draft:\n\"\"\"\n[CURRENT_RESUME_EXPERIENCE]\n\"\"\"\n\nRequirements:\n1. Rewrite each bullet using Google's 'Accomplished [X] as measured by [Y] by doing [Z]' formula.\n2. Naturally integrate top hard skills and ATS keywords without keyword stuffing.\n3. Remove weak passive verbs (e.g., 'helped with', 'responsible for') and replace with high-impact power verbs.\n4. Provide a match score estimation (0-100%) and 3 missing skill recommendations.",
    variables: ["[TARGET_JOB_DESCRIPTION]", "[CURRENT_RESUME_EXPERIENCE]"],
    coverImage: "/templates/chatgpt-ats-resume-rewrite.svg",
    coverAlt: "ATS resume bullet rewrite prompt blueprint",
    createdAt: "2026-03-10",
  },
  {
    slug: "chatgpt-mock-interview",
    title: "Interactive Mock Interviewer & Feedback Coach",
    category: "career",
    tool: ["ChatGPT", "Claude"],
    description: "Simulate a tough multi-round job interview with real-time rubric grading, follow-up probes, and behavioral feedback.",
    prompt:
      "Act as a demanding yet constructive Hiring Manager at a top-tier company conducting an interview for a [JOB_ROLE] position. You have high standards.\n\nInterview Protocol:\n1. Ask me ONE question at a time. Do not list all questions at once.\n2. Wait for my response before giving feedback.\n3. After each answer, evaluate it on: Clarity (1-5), STAR Framework adherence (1-5), and Strategic Depth (1-5).\n4. Point out what was strong and give ONE concrete improvement to make it top-tier.\n5. Then ask the next question or a probing follow-up if my answer lacked specificity.\n\nStart now by introducing yourself and asking Question 1.",
    variables: ["[JOB_ROLE]"],
    coverImage: "/templates/chatgpt-mock-interview.svg",
    coverAlt: "Interactive mock interview coaching prompt",
    createdAt: "2026-03-10",
  },
  {
    slug: "youtube-shorts-script-visual",
    title: "YouTube Shorts Script with B-Roll Cues",
    category: "video",
    tool: ["ChatGPT", "Claude"],
    description: "Complete dual-column script formatting spoken audio alongside precise B-roll cues and sound design directions.",
    prompt:
      "Write a high-energy 60-second YouTube Shorts script about [VIDEO_TOPIC].\n\nFormat the output in a clean markdown table with 3 columns:\n| Timestamp | Spoken Audio (What I Say) | Visual / B-Roll / SFX Cue (What Viewers See & Hear) |\n\nRules:\n• Hook within the first 2 seconds\n• Change visual scene every 2.5-3 seconds\n• Pacing: ~140 words total across 60 seconds\n• Include text-on-screen keywords for silent autoplay scrollers\n• End with an open-ended engagement question.",
    variables: ["[VIDEO_TOPIC]"],
    coverImage: "/templates/youtube-shorts-script-visual.svg",
    coverAlt: "YouTube shorts dual column script framework",
    createdAt: "2026-03-10",
  },
  {
    slug: "midjourney-v6-architecture",
    title: "Midjourney v6 Architectural & Interior Design Builder",
    category: "image-generation",
    tool: ["Midjourney", "FLUX.1"],
    description: "Architectural photography prompt generating magazine-worthy modern, brutalist, or Scandinavian interiors.",
    prompt:
      "Architectural interior photograph of [SPACE_TYPE], [ARCHITECTURAL_STYLE] style, floor-to-ceiling glass windows overlooking [EXTERIOR_VIEW], natural diffused morning sunlight casting soft geometric shadows, minimalist bespoke furniture made of [MATERIALS], clean lines, polished concrete and warm oak wood, shot on Hasselblad H6D-100c with 24mm tilt-shift lens, Architectural Digest feature quality --ar 16:9 --style raw --v 6.0",
    variables: ["[SPACE_TYPE]", "[ARCHITECTURAL_STYLE]", "[EXTERIOR_VIEW]", "[MATERIALS]"],
    coverImage: "/templates/midjourney-v6-architecture.svg",
    coverAlt: "Midjourney v6 architectural interior design prompt",
    createdAt: "2026-03-10",
  },
  {
    slug: "cold-email-b2b-outreach",
    title: "B2B Cold Email 4-Sentence Outreach Generator",
    category: "business",
    tool: ["ChatGPT", "Claude"],
    description: "Cold outreach email framework that gets 35%+ open rates and 12%+ response rates by avoiding spam triggers.",
    prompt:
      "Act as an elite B2B sales development strategist. Write a high-converting 4-sentence cold email to [PROSPECT_TITLE] at [COMPANY_TYPE] pitching [VALUE_PROPOSITION].\n\nStructure:\n• Line 1 (Observation/Trigger): Specific observation about their recent company milestone or pain point without fake pleasantries.\n• Line 2 (Problem/Insight): The hidden cost or inefficiency they are currently facing with [COMMON_ALTERNATIVE].\n• Line 3 (Proof Point): How we solved this for a similar peer with a specific metric ([METRIC_EXAMPLE]).\n• Line 4 (Low-Friction Call-to-Interest): Ask if they are open to seeing a 2-minute breakdown, NOT asking for a 30-minute call.\n\nStrict Rules: Under 90 words total. Plain-text aesthetic. Subject line under 4 words.",
    variables: ["[PROSPECT_TITLE]", "[COMPANY_TYPE]", "[VALUE_PROPOSITION]", "[COMMON_ALTERNATIVE]", "[METRIC_EXAMPLE]"],
    coverImage: "/templates/cold-email-b2b-outreach.svg",
    coverAlt: "B2B cold outreach email template framework",
    createdAt: "2026-03-10",
  },
  {
    slug: "negative-prompt-builder",
    title: "Universal Negative Prompt Builder & Artifact Remover",
    category: "image-generation",
    tool: ["FLUX.1", "Stable Diffusion", "Midjourney"],
    description: "Eliminate distorted hands, deformed limbs, floating artifacts, bad anatomy, and text watermarks in AI image generation.",
    prompt:
      "bad anatomy, deformed limbs, extra fingers, missing fingers, fused fingers, distorted hands, unnatural hand poses, poorly drawn face, poorly drawn eyes, asymmetrical eyes, double heads, cloned facial features, blurry, low resolution, jpeg artifacts, over-smoothed plastic skin, oversaturated, amateur photography, watermark, signature, text, out of frame, cropped head, draft, bad proportions",
    variables: [],
    coverImage: "/templates/negative-prompt-builder.svg",
    coverAlt: "Universal negative prompt builder blueprint",
    createdAt: "2026-03-10",
  },
];

export function getTemplateBySlug(slug: string): Template | undefined {
  return TEMPLATES.find((t) => t.slug === slug);
}

export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return TEMPLATES.filter((t) => t.category === category);
}

export function getRelatedTemplates(currentSlug: string, count = 4): Template[] {
  const current = getTemplateBySlug(currentSlug);
  if (!current) return TEMPLATES.slice(0, count);

  const sameCategory = TEMPLATES.filter(
    (t) => t.category === current.category && t.slug !== currentSlug
  );
  if (sameCategory.length >= count) {
    return sameCategory.slice(0, count);
  }

  const others = TEMPLATES.filter(
    (t) => t.slug !== currentSlug && !sameCategory.includes(t)
  );
  return [...sameCategory, ...others].slice(0, count);
}
