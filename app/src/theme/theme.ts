/**
 * Little Log — design tokens
 *
 * Direction: a parent's paper logbook, not a SaaS dashboard.
 * The competitors in this space (Brightwheel, Procare, Famly) all read as
 * corporate/institutional blue-on-white admin tools because they're sold to
 * the daycare. Little Log is sold to (and lives in the pocket of) the parent,
 * so it should feel warm, tactile, and a little bit handmade — like a
 * sticker chart taped to a fridge, not a fleet-management console.
 *
 * Signature element: the "stamp". Every confirmed state in the app (a
 * drop-off logged, a day marked present, an agenda successfully scanned)
 * renders as a small stamped/ticket shape with a torn or perforated edge,
 * echoing the physical sticker charts and paper agendas parents already use.
 */

export const colors = {
  // Primary — deep pine/teal. Calm and trustworthy without being generic
  // "app blue". Reads as forest/outdoors, appropriate for a childcare brand.
  pine: "#1F4B43",
  pineDark: "#123A33",
  pineLight: "#3D6E64",

  // Accent — warm honey/marigold. Used for the stamp motif and primary CTAs.
  honey: "#E8A33D",
  honeyDark: "#C4801F",
  honeyLight: "#F3C776",

  // Status — muted, not traffic-light-saturated.
  present: "#5B8C5A", // sage green
  absent: "#C1543D", // muted brick (deliberately shifted off the
  // clichéd #D97757 terracotta so it doesn't read as a generic AI accent)
  closed: "#8A8578", // warm graphite/taupe

  // Surface
  paper: "#F1F4EC", // warm sage-white background, not cream
  paperRaised: "#FFFFFF",
  paperLine: "#E1E6D8",

  // Text
  ink: "#26261F", // warm near-black
  inkMuted: "#5B5A4E",
  inkFaint: "#8C8A7B",

  white: "#FFFFFF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

// Display face: Fraunces (a soft-edged serif with real warmth — used with
// restraint for the logo, screen titles, and the big status stamp).
// Body/utility face: Nunito Sans (rounded terminals, friendly, but sober
// enough for dense agenda/calendar text at small sizes).
export const fonts = {
  display: "Fraunces_600SemiBold",
  displayItalic: "Fraunces_500Medium_Italic",
  body: "NunitoSans_400Regular",
  bodyMedium: "NunitoSans_600SemiBold",
  bodyBold: "NunitoSans_800ExtraBold",
};

export const type = {
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.bodyBold, fontSize: 17, lineHeight: 22 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 16 },
  captionMedium: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
};

export const shadow = {
  card: {
    shadowColor: "#1A2A1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  stamp: {
    shadowColor: "#1A2A1F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
};

const theme = { colors, spacing, radius, fonts, type, shadow };
export default theme;
