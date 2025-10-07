export default function About() {
    return (
      <main className="p-8 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">About Rhythmos</h1>
        <section className="space-y-3 text-sm leading-6">
          <p>
            Rhythmos is an experiment in reclaiming the value of personal health data. I publish
            portions of my self-healing log as a public resource, mixing medical, spiritual, and
            symbolic systems. Some entries are anonymized; private notes are never shown.
          </p>
          <p className="opacity-80">
            What’s here: tags, practices, symptoms, mood, lunar phase, threads (narratives across
            time), and occasional domain-specific fields (e.g., digestion). Download buttons let you
            explore the data elsewhere.
          </p>
          <p className="opacity-80">
            Ethics: this is my data. Others should treat it as qualitative research material, not
            medical advice. Please cite “Rhythmos Log” if you reuse it.
          </p>
          <p className="opacity-80">
          Rhythmos is a living experiment, a personal log system in continuous evolution.
          It’s not a finished product or wellness tool, but a digital sketchbook for rhythm, emotion, and ecology.
          </p>
        </section>
      </main>
    );
  }