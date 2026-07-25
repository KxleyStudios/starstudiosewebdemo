/* ============================================================
   Star Studios - Careers data
   Single source of truth for open roles + public projects.
   Add a role or project here and it shows up everywhere
   automatically (careers list, apply page, project dropdown).
   ============================================================ */

const STUDIO_ABOUT = "Star Studios is an indie animation studio focused on original series and fan projects. We're small, but we're doing our best to bring new shows to the table, built by a remote, volunteer-based team who care about the craft and about each other.";

/* Every publicly listed production. Keep this in sync with the
   projects shown on the homepage. */
const PROJECTS = [
  { id: "kazz-bibble", name: "Kazz & Bibble: Wannabe Wizards", loadingIcon: "kbww.gif" },
  { id: "scared-alotta-stuff", name: "I'm Scared of Alotta Stuff", loadingIcon: "isoas.gif" },
  { id: "home-sweet-home", name: "Home Sweet Home", loadingIcon: "hsh.gif" },
  { id: "pibby-armageddon", name: "Learning With Pibby: Armageddon", loadingIcon: "pibby.gif" },
  { id: "future-project", name: "A future / unannounced project", useFavicon: true },
  { id: "no-preference", name: "No preference - wherever I'm needed", useFavicon: true }
];

/* What we offer, shown as cards on the careers page. */
const OFFER_ITEMS = [
  { title: "Real production experience", body: "Work inside an actual episodic pipeline, not a hypothetical one." },
  { title: "Portfolio-ready work", body: "Finished shots, boards, or files you can show off afterward." },
  { title: "Official credits", body: "Your name on the productions you help bring to life." },
  { title: "Honest feedback", body: "Notes from teammates who want your work and you to grow." },
  { title: "A friendly team", body: "Low-drama, high-support. We're here because we like this stuff." },
  { title: "Room to grow", body: "New tools, new challenges, and people happy to help you learn them." }
];

/* Our Values */
const VALUES_ITEMS = [
  { title: "Passion", body: "We love creating animation and telling meaningful stories." },
  { title: "Creativity", body: "We encourage experimentation, innovation, and fresh ideas." },
  { title: "Teamwork", body: "Animation is built through collaboration and supporting one another." },
  { title: "Integrity", body: "Respect, honesty, communication, and professionalism are at the heart of our productions." },
  { title: "Growth", body: "Everyone has room to improve, learn, and develop new skills." }
];

const INCLUSIVITY_STATEMENT = "At Star Studios, we welcome applicants from all backgrounds. We believe great ideas come from diverse experiences, and we evaluate applicants based on their skills, passion, professionalism, and willingness to learn. If you love animation and want to help create something amazing, we'd love to hear from you.";

/* Volunteer+ explainer, shown in the info modal on both pages. */
const VOLUNTEER_PLUS_HTML = `
  <p>Volunteer<span class="vp-plus">+</span> is Star Studios' production model while we continue to grow as a studio.</p>
  <p>Most of our original productions currently use deferred payment, meaning there is no guaranteed upfront compensation during production. Instead, contributors volunteer their time with the understanding that our goal is to compensate team members if and when projects generate revenue through funding, sponsorships, merchandise, commissions, or other income sources.</p>
  <p>In addition to our original productions, Star Studios also accepts paid studio commissions. These projects also operate under a deferred payment model, but compensation is provided per completed project rather than hourly.</p>
  <p>We believe creative work deserves to be valued, and as the studio grows, our goal is to transition toward paying contributors whenever financially possible.</p>
  <p><strong>What to expect:</strong></p>
  <ul>
    <li>Remote collaboration with team members from around the world.</li>
    <li>Flexible scheduling around agreed-upon deadlines.</li>
    <li>Reasonable production timelines (for example, approximately 2 months to complete a 1-minute storyboard using provided voice acting and audio assets).</li>
    <li>Opportunities to gain professional production experience, receive feedback, build your portfolio, and earn official production credits.</li>
  </ul>
  <p>By applying, you acknowledge that you understand the Volunteer<span class="vp-plus">+</span> model and agree to complete assigned work by the deadlines established with your production lead.</p>
`;

/* ------------------------------------------------------------
   OPEN ROLES
   slug   - used in the URL: apply/?role=slug
   tag    - short label shown on the career card
   type   - employment type shown in header (e.g. "Remote")
   status - always "Volunteer+" today, kept as a field in case
            that ever changes for a specific role
   ------------------------------------------------------------ */
const UNIVERSAL_REQUIREMENTS = [
  "Minimum of 3 years of direct experience in the specific role.",
  "Strong cinematic understanding, familiarity with editorial workflows, and excellent organization skills.",
  "Strong communication skills.",
  "Ability to multitask and pay close attention to detail.",
  "Ability to work independently and collaboratively within teams.",
  "A professional attitude toward constructive feedback and the ability to act on critique."
];

const COMMON_BONUS = ["A strong work ethic", "A positive attitude", "Passion for storytelling", "Willingness to learn"];

const ROLES = {
  "2d-rough-animator": {
    title: "2D Rough Animator", tag: "Animation", type: "Remote", status: "Volunteer+",
    summary: "2D Rough Animators establish the movement, posing, and performance that become each final animated shot.",
    duties: ["Create rough animation from approved boards and animatics.", "Plan clear poses, timing, and character acting.", "Prepare scenes for clean-up while following the production schedule."],
    requirements: ["Proficiency in Adobe Animate, Toon Boom Harmony, TVPaint, Umoupen, or another 2D animation app capable of exporting 1920 x 1080, 24 fps MP4 files."],
    software: ["Adobe Animate", "Toon Boom Harmony", "TVPaint", "Umoupen"], bonus: COMMON_BONUS
  },
  "2d-cleanup-animator": {
    title: "2D Clean-Up Animator", tag: "Animation", type: "Remote", status: "Volunteer+",
    summary: "2D Clean-Up Animators refine rough animation into clean, consistent drawings ready for final production.",
    duties: ["Clean rough animation while preserving performance and timing.", "Keep drawings on-model and consistent with the established style.", "Prepare approved scenes for final export and handoff."],
    requirements: ["Proficiency in Adobe Animate, Toon Boom Harmony, Umoupen, or another 2D app capable of exporting 1920 x 1080, 24 fps MP4 files."],
    software: ["Adobe Animate", "Toon Boom Harmony", "Umoupen"], bonus: COMMON_BONUS
  },
  "senior-animator": {
    title: "Senior Animator", tag: "Animation", type: "Remote", status: "Volunteer+",
    summary: "Senior Animators lead complex shots and help maintain a high animation standard across the production.",
    duties: ["Animate complex shots to the final production standard.", "Guide animation choices through notes and revisions.", "Help maintain consistent performance, timing, and style across scenes."],
    requirements: ["Advanced understanding of both Adobe Animate and Toon Boom Harmony.", "Extensive prior training or lessons from a qualified professor."],
    software: ["Adobe Animate", "Toon Boom Harmony"], bonus: COMMON_BONUS
  },
  "2d-rig-creator": {
    title: "2D Rig Creator", tag: "Animation", type: "Remote", status: "Volunteer+",
    summary: "2D Rig Creators build flexible, reliable character rigs that support the studio's animation workflow.",
    duties: ["Build character rigs for production use.", "Set up controls that support posing and performance.", "Test, revise, and organize rigs for animator handoff."],
    requirements: ["Expertise in creating animation rigs within Adobe Animate and Toon Boom Harmony."],
    software: ["Adobe Animate", "Toon Boom Harmony"], bonus: COMMON_BONUS
  },
  "3d-modeler": {
    title: "3D Modeler", tag: "3D", type: "Remote", status: "Volunteer+",
    summary: "3D Modelers create production-ready characters, props, and environments for the studio's 3D work.",
    duties: ["Model characters, props, or environments from approved references.", "Maintain clean topology and organized production files.", "Revise models from art direction feedback."],
    requirements: ["Comprehensive understanding and proficiency in Blender."], software: ["Blender"], bonus: COMMON_BONUS
  },
  "3d-rigger": {
    title: "3D Rigger", tag: "3D", type: "Remote", status: "Volunteer+",
    summary: "3D Riggers create the controls and deformation systems that make 3D characters ready to animate.",
    duties: ["Create and test character rigs in Blender.", "Build controls that support clear posing and motion.", "Troubleshoot rig issues and prepare rigs for animation handoff."],
    requirements: ["Comprehensive understanding and proficiency in Blender."], software: ["Blender"], bonus: COMMON_BONUS
  },
  "3d-animator": {
    title: "3D Animator", tag: "3D", type: "Remote", status: "Volunteer+",
    summary: "3D Animators bring approved shots to life through believable acting, timing, and motion.",
    duties: ["Animate shots from approved boards and layouts.", "Develop clear character acting and cinematic movement.", "Apply direction notes and prepare shots for review."],
    requirements: ["Comprehensive understanding and proficiency in Blender."], software: ["Blender"], bonus: COMMON_BONUS
  },
  "3d-compositor": {
    title: "3D Compositor", tag: "3D", type: "Remote", status: "Volunteer+",
    summary: "3D Compositors assemble rendered elements into polished final shots that match the director's vision.",
    duties: ["Composite rendered 3D passes into final shots.", "Balance lighting, color, and effects between elements.", "Deliver organized files and revised shots on schedule."],
    requirements: ["Comprehensive understanding and proficiency in Blender."], software: ["Blender"], bonus: COMMON_BONUS
  },
  "storyboard-artist": {
    title: "Storyboard Artist", tag: "Story", type: "Remote", status: "Volunteer+",
    summary: "Storyboard Artists translate scripts into clear visual sequences that guide every department.",
    duties: ["Create boards with clear staging, shots, timing, and perspective.", "Recreate the production style while presenting story choices clearly.", "Prepare boards and notes for review and animatic handoff."],
    requirements: ["Strong understanding of cinematic shots, proper style recreation, timing, and perspective.", "Proficiency in Toon Boom Storyboard Pro, Umoupen, or another storyboarding app that supports notes.", "Familiarity with Google Slides for presenting boards."],
    software: ["Toon Boom Storyboard Pro", "Umoupen", "Google Slides"], bonus: COMMON_BONUS
  },
  "character-designer": {
    title: "Character Designer", tag: "Art", type: "Remote", status: "Volunteer+",
    summary: "Character Designers establish memorable, consistent character designs that work across production.",
    duties: ["Design characters from creative direction and approved concepts.", "Create turnarounds and reference materials for the production team.", "Maintain visual consistency through revision rounds."],
    requirements: ["Ability to recreate styles, maintain style consistency, and define key traits that establish character identity."],
    software: [], bonus: COMMON_BONUS
  },
  "background-artist": {
    title: "Background Artist", tag: "Art", type: "Remote", status: "Volunteer+",
    summary: "Background Artists create the environments that establish each scene's space, tone, and visual depth.",
    duties: ["Design and paint environments from approved layouts.", "Use perspective and composition to create believable spaces.", "Revise backgrounds to match the production's style and direction."],
    requirements: ["Strong understanding of perspective, spatial design, and environment composition.", "Perspective skills are also essential for Animators and Storyboard Artists."],
    software: [], bonus: COMMON_BONUS
  },
  "animatic-editor": {
    title: "Animatic Editor", tag: "Editorial", type: "Remote", status: "Volunteer+",
    summary: "Animatic Editors turn storyboards into a timed editorial blueprint for the rest of production.",
    duties: ["Edit storyboards into clear, paced animatics.", "Add temporary audio and maintain sequence timing.", "Keep editorial files organized through review and delivery."],
    requirements: ["Mastery of timing, basic sound design, and proper file organization."],
    software: ["Adobe Premiere Pro", "DaVinci Resolve"], bonus: COMMON_BONUS
  },
  "compositor": {
    title: "Compositor", tag: "Post", type: "Remote", status: "Volunteer+",
    summary: "Compositors combine production elements into final shots with color and effects that support the director's vision.",
    duties: ["Composite shot elements into polished final images.", "Build visual effects that serve the approved direction.", "Use color adjustments to maintain shot continuity."],
    requirements: ["Solid grasp of color theory and the ability to build visual effects aligned with the director's vision."],
    software: ["DaVinci Resolve", "Adobe After Effects"], bonus: COMMON_BONUS
  },
  "sound-designer": {
    title: "Sound Designer", tag: "Audio", type: "Remote", status: "Volunteer+",
    summary: "Sound Designers build effects that give each scene its texture, clarity, and impact.",
    duties: ["Create and edit sound effects for approved scenes.", "Match effects to the director's creative direction.", "Deliver organized audio sessions and revisions."],
    requirements: ["Deep understanding of EQ and overall audio manipulation.", "Ability to create or recreate sound effects that match the director's vision."],
    software: ["FL Studio"], bonus: COMMON_BONUS
  },
  "sound-mixer": {
    title: "Sound Mixer", tag: "Audio", type: "Remote", status: "Volunteer+",
    summary: "Sound Mixers shape dialogue, music, and effects into a balanced final soundtrack.",
    duties: ["Balance dialogue, music, and effects for final delivery.", "Use EQ and effects to support the director's vision.", "Address mix notes and maintain consistent audio levels."],
    requirements: ["Mastery of audio balance, EQ, and shaping effects to match the director's vision."],
    software: ["FL Studio"], bonus: COMMON_BONUS
  },
  "composer-music-creator": {
    title: "Composer / Music Creator", tag: "Audio", type: "Remote", status: "Volunteer+",
    summary: "Composers create original music that gives each project its emotional and stylistic identity.",
    duties: ["Compose original music for approved scenes and episodes.", "Create arrangements ranging from symphonic to modern synth styles.", "Revise cues from direction and deliver organized final assets."],
    requirements: ["Strong foundation in music theory.", "Ability to compose genres ranging from full symphonic arrangements to modern synth formats."],
    software: ["Native Instruments KONTAKT"], bonus: COMMON_BONUS
  }
};
