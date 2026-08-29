# AerialParadise — kontekst prac

Krótkie podsumowanie: co to jest, co jest zrobione, co dalej.
Szczegóły techniczne (jak działa każdy mechanizm) siedzą w `README.md`.

---

## Czym to jest

Strona **jednostronicowa** dla klubu akrobatyki powietrznej AerialParadise
we Wrocławiu. HTML + CSS + JS, **bez frameworków i bez build-stepu** — wgrywa
się folder na hosting i działa.

| Plik | Zawartość |
|---|---|
| `index.html` | cała strona, 912 linii |
| `css/style.css` | arkusz stylów, 1776 linii, tokeny w `:root` |
| `js/main.js` | menu, karuzele, karty kadry, formularz, 537 linii |
| `img/` | 18 zdjęć (3,3 MB), logo, favicony |
| `README.md` | pełna dokumentacja techniczna, 525 linii |

**Podgląd:** `powershell -ExecutionPolicy Bypass -File serve.ps1` (port 8095).
W sesjach z Claude Code chodzi przez `.claude/launch.json` na porcie 5900.

**Zapisy prowadzi zewnętrzny ActiveNow**, nie formularz na stronie — to główna
ścieżka konwersji i główny przycisk.

---

## Co jest zrobione

**Struktura.** Jedna strona, nawigacja kotwicowa:
`#gora` → `#o-nas` → `#zajecia` → `#galeria` → `#kadra` → `#lokalizacje` →
`#opinie` → `#formularz` → `#kontakt`. Zakładka „Kontakt" prowadzi do
formularza; dane teleadresowe są w granatowym pasie pod nim.

**Motyw: niebo przechodzące w ocean.** Każda sekcja ma własny wycinek
gradientu, a sąsiednie dzielą barwę na styku — przejście jest ciągłe, od
błękitu nieba na górze po granatową otchłań w stopce, **bez JavaScriptu**.
Trzy klasy stref przestawiają komplet tokenów tekstu, więc kontrast trzyma
się na każdej wysokości. Karty to matowe szkło.

**Efekty.** 27 chmur dryfujących po trzech sekcjach nieba, słońce, dwie fale
SVG na linii wody, kaustyka, promienie w głębi, 40 bąbelków. Wszystkie są
`aria-hidden`, chodzą wyłącznie na `transform`/`opacity` i **gasną przy
systemowym „ogranicz ruch"**.

**Karuzele z pętlą bez szwu.** Zajęcia (4 slajdy) i kadra (8 trenerek,
2 na ekranie od 992 px). Po obu stronach taśmy leży komplet kopii slajdów,
więc z ostatniego jedzie się dalej w prawo prosto na pierwszy — nie widać
przewijania wstecz ani przeskoku. Kopie są `aria-hidden` i poza tabulatorem.

**Kadra: zdjęcie zamienia się w opis.** Karta ma dwie strony w tym samym
miejscu; kliknięcie przenika do biogramu, Esc wraca. Wysokość karty wyznacza
najdłuższy tekst, więc **opisu nigdy nie trzeba przewijać**.

**Treść.** Komplet opisów zajęć i biogramów ośmiu trenerek (poprawione przez
klienta 27.08.2026). 18 zdjęć wgranych i podpiętych, w tym obie sale.

**Opinie.** Trzy prawdziwe opinie z Google, przeklejone dosłownie
(29.08.2026), po pięć gwiazdek. Bez dat, bez redakcji treści, bez zrzutów
ekranu — pod kartami stoi przycisk do wizytówki, więc wszystko da się
sprawdzić. Gwiazdki dostały własny ciepły token, bo markowy błękit nie
wyrabiał kontrastu na granatowej karcie.

**Formularz kontaktowy.** Działa bez konfiguracji przez `mailto:`; podanie
adresu w `data-endpoint` (Formspree / FormSubmit) przełącza go na wysyłkę
w tle. Walidacja i komunikaty po polsku.

**Telefon i tablet — przejrzane osobno (29.08.2026).** Układy schodzą do
jednej kolumny, nawigacja od 992 px w dół to hamburger (48 px) z panelem
na pełny ekran, żadnego poziomego przewijania od 320 px wzwyż. Poprawione
trzy rzeczy: pole zgody w formularzu (cel dotyku podniesiony z 24 px do
całego wiersza), filary w „O nas" (dwie kolumny po 18 znaków → jedna),
oraz hero i menu przy telefonie obróconym na bok.

**Jakość — mierzona, nie deklarowana.** Przy każdej zmianie sprawdzam
skryptem: kontrast (tło liczone z interpolacji gradientu, a w hero
z **realnych pikseli zdjęcia** pod napisem), cele dotykowe, brak poziomego
przewijania. Aktualnie: **zero błędów WCAG AA**, zero celów poniżej 44 px,
brak przewijania w poziomie od 320 px wzwyż. Pełna obsługa klawiatury,
`prefers-reduced-motion`, style do druku.

---

## Następny krok

**Osiem portretów trenerek** (`img/trenerki/`) — jedyne miejsce, gdzie na
stronie wciąż widnieją ramki zastępcze. Pionowe 4:5, dłuższy bok ok. 1600 px.
Nazwy plików są wypisane w `README.md`; po wgraniu ramka znika sama, bez
zmian w kodzie.

---

## Dalej, gdy będą materiały

- **Cennik i grafik** — materiałów nie było, na razie wszystko prowadzi do ActiveNow.
- **Domena** — po wykupieniu uzupełnić pełny adres obrazka w `og:image`.
- **Pliki HEIC** (5 zdjęć) — nie da się ich tu otworzyć, trzeba wyeksportować
  z telefonu jako JPG.
- **Filmy** — dwa nagrania (61 i 68 MB) są za ciężkie; do skompresowania albo
  na YouTube. Trzeci (4 MB) nadaje się od razu, ale nie ma jeszcze miejsca,
  w którym miałby stanąć.

---

## Rzeczy, o których łatwo zapomnieć

- **Nazwisko trenerki występuje w pięciu miejscach karty** — nagłówek, podpis
  zdjęcia, etykieta ramki zastępczej, `alt` i nazwa pliku. Zmieniać komplet.
- **Zdjęcia z telefonu mają EXIF-owy znacznik orientacji.** Przeglądarka go
  honoruje, narzędzie do obróbki — nie. Bez ręcznego obrotu zdjęcie zostaje
  położone na bok na stałe.
- **Kontrast w hero trzeba przeliczać po każdej podmianie zdjęcia** — tekst
  stoi na kadrze, w którym są miejsca niemal czarne.
- **Ruch chmur włącza się trzema osobnymi własnościami, nie skrótem
  `animation:`.** Skrót ma wyższą specyficzność i zeruje czasy z `.chmura--N`
  — chmury stanęłyby nieruchomo w lewym rogu.
- **Odrzucone kierunki** (nie wracać bez wyraźnej prośby): hero na bieli
  z wycinkiem postaci i gradientem od bieli; efekt „znikającej chmury"
  nad nagłówkami.
