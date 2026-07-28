import { Reveal, Section } from "../components/ui";

/** Section D is reserved for the synthesis that combines the two measured forces
 *  (the field from outside, the strain from inside). The analysis itself is built
 *  next; for now this is the framing lead-in and a stable anchor. */
export function SectionD() {
  return (
    <Section id="section-d" eyebrow="Section D · Synthesis">
      <Reveal>
        <h2>Combining the two forces</h2>
        <p className="lead narrow">
          Sections B and C measured the two forces from the framework: the resistance from
          outside, meaning how strong the field was, and the strain from inside, meaning the
          physical load the squad carried and how it held up. This section brings them
          together, weighing each force against the model output, to read how hard each
          title was to win rather than just how dominant it looked.
        </p>
      </Reveal>
    </Section>
  );
}
