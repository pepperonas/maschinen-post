export default function Impressum() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mb-14">
      <a href="/" className="font-mono text-sm dark:text-machine-accent text-yellow-700 hover:underline">&larr; Zurück</a>

      <h1 className="font-mono font-bold text-2xl dark:text-white text-gray-900 mt-6 mb-6">Impressum</h1>

      <section className="space-y-4 dark:text-machine-text/80 text-gray-600 text-sm leading-relaxed">
        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">Angaben gemäß § 5 TMG</h2>
        <p>
          Martin Pfeffer<br />
          Softwareentwicklung<br />
          Flughafenstraße 24, 12053 Berlin<br />
          E-Mail: martin.pfeffer@celox.io<br />
          Web: <a href="https://celox.io" target="_blank" rel="noopener noreferrer" className="dark:text-machine-accent text-yellow-700 hover:underline">celox.io</a>
        </p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
        <p>Martin Pfeffer, Flughafenstraße 24, 12053 Berlin</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">EU-Streitschlichtung</h2>
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
          <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="dark:text-machine-accent text-yellow-700 hover:underline">
            https://ec.europa.eu/consumers/odr/
          </a>. Unsere E-Mail-Adresse finden Sie oben im Impressum.
        </p>
        <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">Haftung für Inhalte</h2>
        <p>Die Inhalte dieser Seite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">Haftung für Links</h2>
        <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">Urheberrecht</h2>
        <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">KI-generierte Inhalte</h2>
        <p>MaschinenPost nutzt die Claude API von Anthropic zur Generierung von Zusammenfassungen und Kategorisierungen. Die generierten Texte stellen maschinell erzeugte Zusammenfassungen dar. Für die Richtigkeit oder Vollständigkeit der KI-generierten Inhalte wird keine Haftung übernommen. Die Originalartikel sind stets über die verlinkten Quellen abrufbar.</p>

        <p className="dark:text-machine-text/50 text-gray-400 mt-8"><em>Stand: März 2026</em></p>
      </section>
    </div>
  )
}
