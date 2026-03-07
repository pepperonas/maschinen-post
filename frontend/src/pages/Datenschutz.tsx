export default function Datenschutz() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 mb-14">
      <a href="/" className="font-mono text-sm dark:text-machine-accent text-yellow-700 hover:underline">&larr; Zurück</a>

      <h1 className="font-mono font-bold text-2xl dark:text-white text-gray-900 mt-6 mb-6">Datenschutzerklärung</h1>

      <section className="space-y-4 dark:text-machine-text/80 text-gray-600 text-sm leading-relaxed">
        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">1. Verantwortlicher</h2>
        <p>
          Martin Pfeffer<br />
          Flughafenstraße 24, 12053 Berlin<br />
          E-Mail: martin.pfeffer@celox.io<br />
          Web: <a href="https://celox.io" target="_blank" rel="noopener noreferrer" className="dark:text-machine-accent text-yellow-700 hover:underline">celox.io</a>
        </p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">2. Überblick der Datenverarbeitung</h2>
        <p>MaschinenPost ist ein Nachrichtenaggregator für KI- und Robotik-Themen. Der Dienst erfordert <strong>keine Registrierung, kein Nutzerkonto und keine Eingabe personenbezogener Daten</strong>. Es werden keine Cookies gesetzt und kein Tracking durchgeführt.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">3. Server-Logdaten</h2>
        <p>Bei jedem Zugriff auf unsere Website werden durch den Webserver automatisch folgende Daten erfasst:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>IP-Adresse des anfragenden Rechners</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Aufgerufene URL und HTTP-Statuscode</li>
          <li>Übertragene Datenmenge</li>
          <li>Browser-Typ und Betriebssystem (User-Agent)</li>
        </ul>
        <p>Diese Daten dienen ausschließlich der Sicherstellung eines störungsfreien Betriebs und werden nicht mit einzelnen Personen in Verbindung gebracht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der IT-Sicherheit).</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">4. Cookies und lokale Speicherung</h2>
        <p>MaschinenPost verwendet <strong>keine Tracking-, Analyse- oder Werbe-Cookies</strong>. Lediglich eine Theme-Einstellung (Hell-/Dunkelmodus) wird im localStorage Ihres Browsers gespeichert. Diese Daten verlassen Ihren Browser nicht und enthalten keine personenbezogenen Informationen.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">5. RSS-Feed-Aggregation</h2>
        <p>MaschinenPost aggregiert öffentlich zugängliche RSS-Feeds von Drittanbieter-Nachrichtenquellen. Die angezeigten Artikel werden automatisch aus diesen Feeds bezogen, zusammengefasst und kategorisiert. Die Originalartikel sind stets über die verlinkten Quellen abrufbar. Es findet keine Erhebung personenbezogener Daten der Artikelverfasser statt.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">6. KI-Verarbeitung (Anthropic Claude API)</h2>
        <p>Zur Zusammenfassung und Kategorisierung von Artikeln werden Artikelinhalte an die API von Anthropic, PBC (San Francisco, USA) übermittelt. Es werden dabei <strong>keine personenbezogenen Daten der Websitebesucher</strong> an Anthropic übermittelt — ausschließlich öffentlich verfügbare Artikelinhalte. Anthropic speichert bei API-Nutzung standardmäßig keine Eingabedaten zum Training. Es gilt die <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="dark:text-machine-accent text-yellow-700 hover:underline">Datenschutzerklärung von Anthropic</a>.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">7. Hosting</h2>
        <p>Diese Website wird auf einem Server gehostet. Die Datenübertragung erfolgt verschlüsselt über HTTPS/TLS. SSL-Zertifikate werden über Let's Encrypt bereitgestellt.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">8. Speicherdauer</h2>
        <p>Server-Logdaten werden nach spätestens 7 Tagen gelöscht. Aggregierte Artikeldaten werden dauerhaft gespeichert, enthalten jedoch keine personenbezogenen Daten der Websitebesucher.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">9. Ihre Rechte</h2>
        <p>Sie haben gemäß DSGVO folgende Rechte:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Auskunft</strong> (Art. 15 DSGVO): Recht auf Auskunft über die Sie betreffenden personenbezogenen Daten.</li>
          <li><strong>Löschung</strong> (Art. 17 DSGVO): Recht auf Löschung Ihrer Daten.</li>
          <li><strong>Widerspruch</strong> (Art. 21 DSGVO): Recht auf Widerspruch gegen die Verarbeitung.</li>
          <li><strong>Beschwerde</strong>: Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.</li>
        </ul>
        <p>Da MaschinenPost keine personenbezogenen Nutzerdaten erhebt oder speichert, sind diese Rechte in der Praxis auf Server-Logdaten beschränkt. Für Anfragen wenden Sie sich bitte an martin.pfeffer@celox.io.</p>

        <h2 className="font-mono font-semibold text-base dark:text-white text-gray-900 mt-6">10. Änderungen</h2>
        <p>Diese Datenschutzerklärung kann bei Bedarf angepasst werden. Die aktuelle Version ist stets unter dieser URL abrufbar.</p>

        <p className="dark:text-machine-text/50 text-gray-400 mt-8"><em>Stand: März 2026</em></p>
      </section>
    </div>
  )
}
