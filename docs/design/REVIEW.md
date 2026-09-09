# Visual design review

Reference: [generated desktop concept](arl-workstation-concept.png), produced with the built-in image-generation tool. Browser evidence: [desktop authority gate](arl-desktop.png) and [Turkish mobile inspector](arl-mobile.png). These are design/QA evidence; the application renders real HTML/CSS and Three.js geometry, never the concept screenshot.

The user directed runtime-first vertical slices and conceptual correctness above spectacle. The reference was therefore used for composition and visual language, with deliberate corrections to preserve the specified causal ordering. No separate user design-approval gate was introduced.

Both the concept and the implementation screenshot were opened with `view_image` for direct comparison. Desktop was checked at 1600×1000, close to the generated reference's native dimensions; mobile at 390×844. Captures came from the in-app browser. Its full-page mobile capture produced unreliable duplicated composition, so the retained mobile evidence is an ordinary viewport screenshot.

| Comparison point | Inspection and decision |
|---|---|
| Layout | Retained compact brand/navigation, two-column introduction, scenario strip, four-tab lens row, central scene, right inspector and bottom timeline. Reduced panel height so transport controls remain visible at the desktop review size. |
| Typography | Local Inter UI/body and IBM Plex Mono exact fields; explicit control typography. The two-line tagline is retained with responsive line breaking. |
| Palette | White surfaces, pale blue-gray workspace, navy text, teal current-state/actual transition, amber authority boundary. No decorative glow or particle effects. |
| Topology | Intentional change: authority precedes isolated tool execution, then verification/evaluation precede the human commit gate. The generated reference wrongly placed its human gate before verification. A compact return path makes the correct ordering fit with readable labels. |
| Actual events | Intentional change: the solid transition comes from recorded event-zone pairs; dashed paths only describe the conceptual topology. The generated reference's generic moving path and seven-stage progress were replaced by actual event history. |
| Approval | Exact review and denial buttons remain outside the scrolling inspector body after a visible clipping finding. Full draft, evidence, resource, risk and one-use scope live in the review dialog. |
| Controls | Real Play/Pause, Step, Rewind, Reset, event seek, trace filter and JSON export are present. Added Text view, camera reset, pace, source inspection and an initial Start run control to satisfy functional/accessibility requirements. |
| Mobile | A single runtime view plus a native-dialog bottom sheet; no miniature desktop workstation. Text topology, translated descriptions and explicit labeled controls are available. |
| Icons and geometry | Code-native Lucide controls and semantic Three.js stations. The model is a plain cube, context a stack, authority a gate, verification a magnifier, and evaluation distinct bars; these describe educational roles rather than physical hardware. |

Above-the-fold copy was compared with the reference. The identity, tagline, four lens names, simulation disclaimer, action and permission labels are retained. Intentional copy deviations replace the reference's invented analyst sentence with the user's no-write task constraint, correct the initial state to Ready, show actual event counts rather than seven invented steps, and make simulation boundaries inspectable. The inspector's selected SEC tab corresponds to the visible SEC contents rather than the concept's inconsistent HNS selection.

The implementation was visually verified against the reference's composition and design language, with the documented conceptual/accessibility corrections. It is not represented as pixel-identical to an image whose event order was incorrect.

## Image-generation brief

The built-in tool was asked for a 1600×1000 code-native ARL workstation: white/light blue-gray surfaces, navy typography, teal execution, amber human gate; exact identity/tagline, four synchronized lenses, isometric runtime stations and isolated/consequential boundaries, an authority inspector, real transport controls, and research links. It explicitly excluded brains, particles, glow, fake metrics, extra pages and production raster UI. The resulting PNG is retained at `docs/design/arl-workstation-concept.png`; no external image asset is required at runtime.
