import './App.css'

const services = [
  { titre: 'Sites vitrines', texte: 'Un site rapide, clair et facile à modifier, livré en deux semaines.' },
  { titre: 'Boutiques en ligne', texte: 'Catalogue, panier et paiement branchés sur Shopify.' },
  { titre: 'Référencement', texte: 'Audit, mots-clés et suivi mensuel de vos positions sur Google.' },
]

export default function App() {
  return (
    <>
      <header className="entete">
        <span className="logo">Atelier Web</span>
        <a className="bouton" href="#contact">Demander un devis</a>
      </header>

      <main>
        <section className="hero">
          <h1>Des sites qui font venir des clients</h1>
          <p>Création de sites et marketing digital pour les indépendants et les petites entreprises.</p>
          <a className="bouton" href="#contact">Parlons de votre projet</a>
        </section>

        <section className="services">
          {services.map((s) => (
            <article key={s.titre}>
              <h2>{s.titre}</h2>
              <p>{s.texte}</p>
            </article>
          ))}
        </section>

        <section id="contact" className="contact">
          <h2>Un projet ?</h2>
          <p>Écrivez-nous, réponse sous 24 heures.</p>
          <a className="bouton" href="mailto:contact@example.com">contact@example.com</a>
        </section>
      </main>

      <footer>© {new Date().getFullYear()} Atelier Web</footer>
    </>
  )
}
