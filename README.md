# 📚BookScout

En webbapplikation för bokupptäckt som kombinerar Open Library API med Wikipedia API för författarinformation.

## Funktioner

- Sök böcker från Open Library API
- Spara böcker till personlig hylla
- Visa detaljerad bokinformation med författarbiografier från Wikipedia API
- Mörkt/ljust tema
- Responsiv design

### Installation

1. **Klona repositoryt**
   ```bash
   git clone https://github.com/iShotHarambe123/bookscout.git
   cd bookscout
   ```

2. **Installera beroenden**
   ```bash
   npm install
   ```

3. **Starta utvecklingsservern**
   ```bash
   npm run dev
   ```

## Utvecklingsverktyg

- **Parcel** - Byggverktyg och utvecklingsserver
- **Sass** - CSS-preprocessor för styling
- **MicroModal** - Tillgängliga modaler
- **ESModules** - Modern JavaScript-moduler

## Projektstruktur

```
bookscout/
├── .gitignore
├── package.json
├── README.md
├── public/
│   └── index.html
└── src/
    ├── app.js
    ├── scss/
    │   ├── main.scss
    │   ├── _variables.scss
    │   ├── _mixins.scss
    │   ├── _base.scss
    │   ├── _layout.scss
    │   ├── _cards.scss
    │   ├── _modal.scss
    │   ├── _home.scss
    │   ├── _animations.scss
    │   └── _footer.scss
    ├── services/
    │   ├── openlibrary.js
    │   └── wikipedia.js
    ├── ui/
    │   ├── components.js
    │   ├── renderResults.js
    │   ├── renderShelf.js
    │   ├── renderBookModal.js
    │   └── renderHome.js
    ├── state/
    │   └── store.js
    └── utils/
        └── utils.js
```

## API:er som används

- [Open Library](https://openlibrary.org/developers/api) - Bokdata
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) - Författarinformation

## Byggprocess

Parcel hanterar automatiskt:
- Sass-kompilering
- JavaScript-bundling
- Hot module replacement
- Optimering för produktion

Kör `npm run build` för produktionsbygge.
