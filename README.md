# AerialParadise — strona klubu

Strona **jednostronicowa** (one-page): cała treść w `index.html`, nawigacja
przewija do sekcji. HTML + CSS + JS, bez frameworków i bez build-stepu —
wystarczy wgrać folder na hosting.

## Podgląd lokalny

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Potem otwórz `http://localhost:8095/`. Port zmienia przełącznik `-Port`,
np. `-Port 5900` (tak jest ustawiony podgląd w `.claude/launch.json`).

## Pliki

| Plik | Zawartość |
|---|---|
| `index.html` | Cała strona |
| `css/style.css` | Arkusz stylów (tokeny kolorów i typografii w sekcji `:root` na górze) |
| `js/main.js` | Menu mobilne, wejścia sekcji, karuzela, okno kadry, formularz |
| `img/` | Logo, favicony, zdjęcia |
| `serve.ps1` | Prosty serwer statyczny do podglądu |
| `.claude/launch.json` | Konfiguracja podglądu (port 5900) |

## Sekcje i kotwice

`#gora` (hero) → `#o-nas` → `#zajecia` (w środku `#szarfy`, `#kolo`,
`#akrobatyka`, `#stretching`) → `#galeria` → `#kadra` → `#lokalizacje` →
`#opinie` → `#formularz` → `#kontakt`.

Menu w górnym pasku, menu mobilne i stopka trzymają dokładnie tę kolejność.

Linkowanie do konkretnej sekcji z zewnątrz: `adres-strony/#szarfy`.

Kotwice celują w nagłówek sekcji, nie w jej górną krawędź (`scroll-margin-top`
liczony od wewnętrznego marginesu sekcji) — po kliknięciu treść ląduje zawsze
39 px pod przyklejonym paskiem, tak samo na telefonie i na desktopie.

Zakładka **Kontakt** prowadzi do formularza (`#formularz`); dane teleadresowe
są w granatowym pasie pod nim (`#kontakt`).

## Pętla bez szwu (obie karuzele)

Zajęcia i kadra przewijają się w bok i **zapętlają się w nieskończoność** —
z ostatniego slajdu jedzie się dalej w prawo, prosto na pierwszy, i odwrotnie.
Nigdy nie widać przewijania taśmy wstecz ani przeskoku.

Działa to tak: po obu stronach oryginalnych slajdów skrypt dokłada **komplet
ich kopii**. Taśma ma więc trzy zestawy — kopie, oryginały, kopie. Przejście
przez „koniec" to zwyczajne przewinięcie w prawo na kopię pierwszego slajdu.
Dopiero **gdy taśma stanie**, pozycja wraca o szerokość jednego kompletu na
odpowiadający slajd w środkowym zestawie. Skok jest niewidoczny, bo w tym
miejscu stoi dokładnie ta sama treść.

Kluczowe jest **odczekanie na koniec przewijania**, a nie zwykły ogranicznik
częstotliwości: powrót wykonany w połowie animacji ucinałby ją i przejście
szarpało. Odliczanie 160 ms startuje od nowa przy każdym zdarzeniu przewijania.

Kopie są niewidoczne dla technologii wspomagających: mają `aria-hidden`,
a wszystkie ich odnośniki i przyciski `tabindex="-1"`. Skrypt zdejmuje im też
`id` i `aria-controls`, żeby identyfikatory zostały niepowtarzalne — kotwice
`#szarfy`, `#kolo`, `#akrobatyka`, `#stretching` dalej prowadzą do oryginałów.
Kopie nie kosztują transferu: te same adresy zdjęć, więc przeglądarka bierze
je z pamięci (29 zapytań na 26 unikalnych adresów, 2,4 MB — tyle co przed
zapętleniem).

Sterowanie: strzałki, przeciągnięcie palcem lub gładzikiem, oraz ← → na
klawiaturze po ustawieniu fokusu na panelu. **Na telefonie strzałki stoją nad
slajdem, z licznikiem między nimi**; od 768 px wracają po bokach toru.

Licznik na styku pętli pokazuje np. „8 i 1 z 8" zamiast „8–1 z 8" — zakres
malejący czytałby się jak usterka.

Dodanie zajęć lub trenerki: skopiuj w `index.html` blok
`<article class="class-block" id="…">` albo `<article class="coach" data-flip>`
wewnątrz `carousel__track`. Kopie, licznik i zapętlenie zrobią się same.

## Kadra: zdjęcie zamienia się w opis

Opisy sześciu trenerek pochodzą wprost od klienta (aktualizacja 27.08.2026);
Zofia Kłak i Weronika Koślińska mają wersje z pierwszej partii materiałów.

Sekcja „Kadra" przewija się w bok — **jedna trenerka na ekranie telefonu,
dwie od 992 px**. Karta ma stałą szerokość (26 rem), więc od 992 px
sama karuzela jest zwężona do 56 rem: bez tego w kolumnie zostawało po ok.
48 px luzu, para kart rozjeżdżała się na 128 px, a strzałki wisiały daleko
od nich. Teraz przerwa między kartami to 32 px, para stoi na osi sekcji,
a strzałki są symetryczne. Strzałka przesuwa zawsze o jedną osobę (jedna znika, jedna
wjeżdża), licznik pokazuje „1–2 z 8". Zapętlenie opisane wyżej.

**Wyrównanie slajdu liczone jest od wnętrza toru, nie od jego krawędzi.**
Na tablecie (768–992 px) mieści się jedna karta, więc kolumna ma dokładnie
jej szerokość, a resztę toru zjada symetryczne wcięcie — dzięki temu karta
stoi na środku, a sąsiednie zaglądają równo z obu stron. Gdyby skrypt liczył
od krawędzi toru (tak było wcześniej), przyklejałby kartę do lewej strzałki
i zostawiał po prawej 258 px pustki.

Uwaga na przyszłość: `margin-inline: auto` **nie centruje** karty w tym
gridzie — wychodzi zerowy margines. Nie pomaga też `justify-self: center`,
bo skrypt i tak ustawia kartę przy krawędzi. Działa dopiero para: wcięcie
toru plus liczenie pozycji od jego wnętrza.

Karta ma dwie „strony" leżące w tym samym miejscu: **zdjęcie** i **opis**.
Kliknięcie zdjęcia przenika do opisu, przycisk „Pokaż zdjęcie" wraca.
Widoczne jest zawsze tylko jedno; strona schowana dostaje `visibility: hidden`,
więc znika też dla czytnika ekranu i nie da się na nią wejść tabulatorem.

**Wysokości nie ustawiamy na sztywno.** Karta jest tak wysoka, jak najdłuższy
biogram — dlatego opisu nigdy nie trzeba przewijać, a zdjęcie wypełnia całą tę
wysokość. Skutek uboczny: im węższy ekran, tym wyższa i węższa karta.

| Szerokość okna | Karta | Proporcja zdjęcia |
|---|---|---|
| 1280 px | 416 × 541 | 0,77 (blisko 4:5) |
| 375 px | 335 × 471 | 0,71 (blisko 2:3) |
| 320 px | 280 × 568 | 0,49 |

Poniżej 416 px opis schodzi z 14 na 13 px — bez tego karta przy 320 px miałaby
proporcję 0,42, czyli wąski pasek. Zdjęcia są kadrowane `object-fit: cover`
z `object-position: 50% 28%`, żeby przy wysokim kadrze głowa nie wypadła poza
ramkę. **Portrety warto więc wybierać z zapasem miejsca nad głową.**

**Bez JavaScriptu nic nie przepada.** Obie strony to zwykły HTML — leżą wtedy
jedna pod drugą, opis jest widoczny od razu, a przyciski przełączania znikają.

Dostępność:

- przycisk na zdjęciu ma `aria-expanded` i `aria-controls` wskazujące na opis;
- po odsłonięciu opisu fokus przechodzi na „Pokaż zdjęcie", a po powrocie
  wraca na zdjęcie — fokus nigdy nie zostaje na niewidocznej stronie;
- **Esc** na odsłoniętym opisie wraca do zdjęcia;
- tor karuzeli ma `overflow-y: hidden`. Bez tego `overflow-x: auto`
  automatycznie włącza też pionowe przewijanie toru, a przy wysokiej karcie
  robi się kilka pikseli pionowego zapasu, który przechwytuje przesunięcie
  palcem — strona przestawała się wtedy przewijać na telefonie;
- ustawianie fokusu używa `preventScroll`, inaczej przeglądarka przesuwałaby
  karuzelę przy każdym przełączeniu.

Dodanie trenerki: skopiuj w `index.html` blok `<article class="coach" data-flip>`
wewnątrz `carousel__track`. Pilnuj, żeby `aria-controls` przycisku i `id`
strony z opisem miały tę samą, niepowtarzalną wartość. Licznik i zapętlenie
karuzeli dostosują się same.

## Opinie

Sekcja `#opinie` ma trzy karty i przycisk do wizytówki Google. Wszystkie trzy
są **wypełnione prawdziwymi opiniami** (Jakub Zębik, Krystian Gral, Michał
Borkowski — po 5 gwiazdek, przeklejone dosłownie 29.08.2026). Google blokuje
automatyczne pobranie, więc każdą kolejną trzeba przekleić ręcznie: treść,
imię autora tak jak wyświetla Google i liczbę gwiazdek. W `index.html` tuż nad
listą jest komentarz z gotowym wzorem karty.

Zasady, które trzymają tę sekcję wiarygodną:

- **Treść bez redakcji** — literówki i brakujące kropki zostają. Wygładzona
  opinia przestaje brzmieć jak opinia, a pod kartami stoi przycisk prowadzący
  prosto do Google, więc każdy może porównać.
- **Bez dat** — „rok temu" sugeruje, że nowszych opinii nie ma.
- **Bez zrzutów ekranu** — tekst na obrazku nie jest indeksowany ani czytany
  przez czytniki ekranu, rozmywa się na telefonie i wnosi cudzy interfejs.
- **Gwiazdki są grafiką niosącą znaczenie**, więc potrzebują 3:1 do tła.
  Markowy błękit dawał 2,47:1 na granatowej karcie — stąd osobny token
  `--gwiazdka` (`#F2B93C`, 5,69:1) i wypełniony symbol `#i-star`. Na wydruku
  token schodzi do czerni, bo złoto na bieli jest nieczytelne.
- Liczbę gwiazdek niesie `aria-label` na `.review__stars`; same `<svg>` są
  `aria-hidden`, żeby czytnik nie wyliczał pięciu identycznych ikon.

## Formularz kontaktowy

Formularz jest na samym dole strony (`#formularz`) i działa w dwóch trybach:

**Teraz (bez żadnej konfiguracji)** — po wysłaniu otwiera program pocztowy
odwiedzającego z gotową, wypełnioną wiadomością do
`aerialparadiseclub@gmail.com`. Nic nie trzeba zakładać, ale wymaga to od
odwiedzającego skonfigurowanej poczty na urządzeniu.

**Docelowo (zalecane)** — żeby wiadomości trafiały prosto na skrzynkę, bez
otwierania poczty u odwiedzającego, załóż darmowy formularz w
[formspree.io](https://formspree.io) albo [formsubmit.co](https://formsubmit.co)
i wklej otrzymany adres w atrybut `data-endpoint` w `index.html`:

```html
<form class="form reveal" data-contact-form data-endpoint="https://formspree.io/f/TWOJ_KOD" novalidate>
```

To wszystko — skrypt sam przełączy się na wysyłkę w tle i pokaże potwierdzenie
na stronie. Adres e-mail klubu zostaje wtedy po stronie usługi, nie w kodzie.

## Zdjęcia

Na stronie jest **18 zdjęć** (ok. 2,4 MB łącznie, dłuższy bok maks. 1600 px,
JPEG). Wszystkie poza hero mają `loading="lazy"`, więc przy wejściu na stronę
pobiera się tylko to, co widać.

Brakujące kadry **nie psują strony** — w ich miejscu zostaje ramka
z przerywaną obwódką, opisem i nazwą pliku. Podmiana nie wymaga zmian w kodzie:
wystarczy wgrać plik o dokładnie takiej nazwie do `img/`, a ramka zniknie sama.

| Plik | Co przedstawia | Gdzie | Kadr |
|---|---|---|---|
| `hero.jpg` | trening na szarfach | **tło hero** | wypełnia sekcję |
| `sala.jpg` | wnętrze sali | o nas | 4:5 |
| `szarfy.jpg` | figura na szarfach | zajęcia | 4:5 |
| `kolo.jpg` | figura na kole | zajęcia | 4:5 |
| `akrobatyka.jpg` | element na macie | zajęcia | 4:5 |
| `stretching.jpg` | rozciąganie | zajęcia | 4:5 |
| `galeria-1…7.jpg` | treningi, pokazy, zawody | galeria | 3:4 |
| `kolo-szerokie.jpg` | zawody na kole | galeria | 3:4 (kadr poziomy docięty) |
| `pas-glebia.jpg` | szpagat na białych szarfach | pas przed formularzem | pełna szerokość |
| `sala-funka.jpg` | sala przy Kazimierza Funka 11 | lokalizacje | 16:10 |
| `sala-baltycka.jpg` | sala przy Bałtyckiej 15 | lokalizacje | pionowe 3:4, kadr przesunięty w górę |


**Uwaga na zdjęcia z telefonu.** `sala-baltycka.jpg` przyszła z EXIF-owym
znacznikiem orientacji 6 (obrót o 90°). Przeglądarka taki znacznik honoruje,
ale `System.Drawing` — nie: po samym przeskalowaniu zdjęcie zostałoby
położone na bok i to na stałe, bo zapis gubi EXIF. Przy każdym zdjęciu
z telefonu trzeba więc sprawdzić właściwość `0x0112` i obrócić piksele
samodzielnie.

### Hero: logo, nazwa i zdjęcie

Hero jest celowo pusty — stoi w nim **tylko logo i napis „AerialParadise"**
z podpisem „Akrobatyka powietrzna". Nie ma tam akapitu wstępnego ani
przycisków; przycisk **Zapisz się** jest zawsze pod ręką w górnym pasku.

`hero.jpg` nie stoi w ramce — **wypełnia całą sekcję i rozpływa się ku górze
w niebie**. Sterują tym trzy warstwy w `.hero__tlo`:

1. **maska pionowa** (`--maska-tla`) — siła zdjęcia rośnie w dół, od 10 %
   u samej góry do 98 % w dolnym pasie;
2. **zasłona w barwie nieba** (`.hero__tlo::after`) — radialna, umieszczona
   na wysokości napisów (72 %), a nie na twarzy, żeby postać została
   odsłonięta, a tekst miał kontrast;
3. **domknięcie dolnej krawędzi** do `--niebo-2`, żeby gradient płynnie
   przeszedł w sekcję „O nas".

**Zdjęcie gaśnie długo** — na przestrzeni ostatnich ok. 20 % wysokości hero,
i jest już całkiem niewidoczne 2 % przed dolną krawędzią (92 % → 65 % → 34 %
→ 10 % → 2 % → 0). Wcześniej schodziło z 98 % do zera na 47 px tuż nad granicą
sekcji i ten skok było widać jako twarde przejście barw.

Na samym styku z sekcją „O nas" leży dodatkowo **pas rozmycia**
(`.hero__rozmycie`): `backdrop-filter: blur(20px)` rozmywa to, co jest pod
spodem — zdjęcie i gradient — a maska sprawia, że efekt narasta ku dołowi
zamiast zaczynać się twardą krawędzią. Wysokość jest ograniczona do
`clamp(5rem, 16vh, 11rem)`: przy 22vh pas wchodził na podpis i rozmywał
dolne krawędzie liter. Teraz zostaje 43 px zapasu pod napisem na desktopie
i 157 px na telefonie.

Maska pasa **wygasza rozmycie także przed dolną krawędzią hero**. Gdy sięgało
do 100 %, tło było rozmyte nad linią styku i ostre pod nią — i sam pas robił
się widoczną krawędzią, czyli dokładnie tym, co miał usunąć.

**Uwaga przy podmianie zdjęcia.** Kontrast jest policzony dla *najciemniejszego
realnego piksela pod napisem* — w `hero.jpg` są miejsca niemal czarne (włosy,
cień). Po wstawieniu ciemniejszego kadru trzeba to przeliczyć: albo podnieść
zasłonę, albo osłabić maskę.

Napis idzie pełnym granatem (`--ink`) i nie ma tu miejsca na błękit z logo —
`--brand` nad zdjęciem daje ok. 1,7:1 i byłby nieczytelny.

### Pas pełnoekranowy

Jedno zdjęcie (`pas-glebia.jpg`) idzie przez całą szerokość okna jako
`.pas-foto` i rozdziela opinie od formularza, już w strefie głębi. Jego górna
i dolna krawędź **wtapia się w barwę sąsiednich sekcji** — steruje tym jedna
zmienna wpisana prosto w HTML:

```html
<figure class="pas-foto reveal" style="--pas-krawedz: var(--glebia-1)">
```

Dzięki temu ciągły gradient nieba i wody nie zostaje przecięty. Kadr bardzo
powoli dryfuje (26 s, `transform`), żeby zdjęcie „żyło" jak woda.

Wcześniej był tu drugi taki pas (`pas-scena.jpg`, między zajęciami a galerią) —
**usunięty**, bo w poziomym kadrze na całą szerokość ucinał postaci głowę.
Plik został w `img/`, gdyby przydał się w innym miejscu.

### Portrety trenerek — **brakuje wszystkich ośmiu**

Pionowe 4:5, folder `img/trenerki/`:
`justyna-moczulska.jpg`, `agnieszka-polak.jpg`, `monika-ochmanska.jpg`,
`zofia-klak.jpg`, `weronika-joachimiak.jpg`, `weronika-koslinska.jpg`,
`marlena-pikor-leczowicz.jpg`, `katarzyna-kosiorek.jpg`

Wskazówki: dłuższy bok ok. 1600 px, plik do ~400 KB. Zdjęcia są przycinane
(`object-fit: cover`), więc postać nie powinna być tuż przy krawędzi kadru.

**To teraz najbardziej widoczny brak na stronie** — w sekcji „Kadra" na
pierwszym planie jest zdjęcie, więc dopóki portretów nie ma, widać tam ramki
zastępcze z nazwiskami. Kliknięcie i tak działa: opis odsłania się normalnie.

## Co jest inne na telefonie

Strona jest długa z natury — cztery pełne opisy zajęć, osiem biogramów
i formularz. Żeby dało się z niej korzystać kciukiem, poniżej 768 px zmienia
się kilka rzeczy:

| Element | Na telefonie | Dlaczego |
|---|---|---|
| Przycisk **Zapisz się** | widoczny w pasku | wcześniej był schowany w menu, a to główna akcja strony |
| Sterowanie karuzelą | strzałki **nad** slajdem, licznik między nimi | na bokach zasłaniałyby zdjęcie; w kodzie strzałki idą przed torem, więc fokus klawiatury biegnie zgodnie z układem |
| Sekcja „O nas" | mieści się w jednym ekranie (ok. 0,9 wysokości) | po kliknięciu w menu widać całą treść bez przewijania |
| Zdjęcie sali w „O nas" | ukryte | zdjęć jest na stronie dużo; tutaj liczy się tekst |
| Galeria | dwa rzędy jadące powoli w bok | osiem kafli w pionie zajmowało cztery ekrany; teraz 432 px |
| Zdjęcia w „Zajęciach" | ukryte | kadr zjadał pół ekranu i odsuwał opis; te same zdjęcia są w galerii. Slajd schudł z 1041 do 599 px |
| Nagłówki slajdów „Zajęć" | wyrównane do góry | slajdy mają wysokość najwyższego z nich, a `align-content: center` spychał krótsze opisy w dół — tytuł skakał o 83 px przy przewijaniu |
| Kadry zdjęć | sale 2:1, portret 11 rem | pionowe kadry zjadały pół ekranu |
| Tekst | 16 px / 1,65 | 45 znaków w linii — mieści się w zalecanym zakresie |
| Marginesy sekcji | 36 px zamiast 120 px | ponad 2 ekrany samego pustego miejsca mniej |
| Nazwa marki w pasku | znika poniżej 352 px | miejsce dla przycisku zapisów i menu |
| Filary w „O nas" | jedna kolumna poniżej 480 px | w dwóch kolumnach zostawało 18–20 znaków w wierszu |

Efekt: 11,9 ekranu przewijania przy 375 px i 13,8 przy 320 px — przy ośmiu
zdjęciach w galerii, pasie pełnoekranowym i całej treści.

### Galeria: przesuwający się pas i powiększanie

**Na telefonie** (poniżej 768 px) pas zamienia się w **dwa rzędy jadące
powoli w prawo**. Ta sama metoda co w karuzelach: skrypt dokłada komplet
kopii, więc `translateX(-50%)` przesuwa taśmę dokładnie o jeden zestaw
i wraca do kadru identycznego z początkowym — pętla nie ma szwu.

Prędkość jest stała w pikselach, nie w czasie: skrypt liczy `--tempo-galerii`
z szerokości jednego zestawu przy 18 px/s (przy 375 px wychodzi 37 s). Bez
tego na szerszym telefonie pas jechałby zauważalnie szybciej.

Kopie mają `aria-hidden`, a ich przyciski `tabindex="-1"` — fokus nie może
wejść w gałąź ukrytą przed czytnikiem ekranu. Poza pasem (duży ekran,
„ogranicz ruch") kopie są `display: none`, żeby nie dołożyły ośmiu kafli
do siatki.

**Ruch nie ma przycisku zatrzymania** — to świadoma decyzja klienta.
Formalnie WCAG 2.2.2 wymaga takiego przycisku dla ruchu, który startuje sam
i trwa dłużej niż 5 sekund. Częściowo łagodzą to dwie rzeczy: przy
systemowym „ogranicz ruch" pas w ogóle nie rusza (zostaje zwykła siatka),
a otwarcie powiększenia go zatrzymuje. Gdyby przycisk miał wrócić,
wystarczy `data-zatrzymany` na `.strip-pas` — reguła CSS już istnieje.

**Powiększanie działa wszędzie**, nie tylko na telefonie. Na każdy kafel
skrypt nakłada przezroczysty przycisk na całej powierzchni — dzięki temu
zdjęcie otwiera się i palcem, i klawiaturą, czego samo `click` na `<figure>`
by nie dało. Okno to natywny `<dialog>` z `showModal()`: Esc, przytrzymanie
fokusu w środku i niedostępność tła są w standardzie, bez pisania własnej
pułapki na fokus. Po zamknięciu fokus wraca na kliknięte zdjęcie, a `src`
jest czyszczony, żeby zamknięte okno nie trzymało obrazka w pamięci.

Uwaga na dwie pułapki, obie już raz kosztowały czas:

- Ruch pasa włącza się **własnościami długimi**, nie skrótem `animation:`.
  Skrót ustawia przy okazji `animation-play-state: running`, przez co
  zatrzymanie pasa przy otwartym powiększeniu nie działało.
- `<img src="">` **wysyła żądanie na adres samej strony**. Powiększenie
  nie ma atrybutu `src` w HTML — skrypt wstawia go dopiero przy otwarciu.

### Telefon obrócony na bok

Osobny przypadek, bo decyduje **wysokość** okna, nie szerokość
(`@media (max-height: 30rem)`):

- **Hero.** Duży odstęp pod logo (dolne ograniczenie 7 rem) ma sens tylko
  w pionie — zrzuca nazwę poniżej twarzy z kadru. W poziomie ta sama wartość
  plus nazwa liczona z szerokości okna rozdymały hero do **125 % ekranu**,
  więc sama nazwa klubu nie mieściła się w widoku. W poziomie logo, odstęp
  i nazwa schodzą do wartości liczonych z wysokości: hero zajmuje 70 %.
- **Menu.** Pozycje z 3,5 rem schodzą do 2,75 rem (nadal ≥ 44 px), przez co
  lista jest o ok. 110 px krótsza. Reguła **musi stać po** `.mobile-nav__list a`
  — ma tę samą specyficzność, więc decyduje kolejność w pliku.
- Panel menu ma `overscroll-behavior: contain`, żeby dojechanie palcem do
  końca listy nie zaczynało przewijać strony pod spodem.

### Pole zgody w formularzu

Kwadracik pola wyboru ma 24 px i większy być nie powinien — wyglądałby
jak przycisk. Celem dotyku jest więc **cała etykieta**: pole i tekst leżą
wewnątrz jednego `<label class="consent__pole">`, a `padding-block`
podnosi wiersz do ponad 44 px. Ujemny `margin-block` zdejmuje ten dodatek
z układu, więc odstępy w formularzu wyglądają tak samo jak wcześniej.

Walidacja tego nie zauważa: `data-invalid` i `[data-error]` dalej siedzą
na `.field.consent`, czyli tam, gdzie szuka ich `wrapperOf()` w `main.js`.

## Dostępność i jakość

Strona przeszła przegląd według listy UI/UX (dostępność → cele dotykowe →
wydajność → układ → typografia → animacje → formularze → nawigacja):

- **Kontrast** — sprawdzony automatycznie na całej stronie po redesignie:
  262–265 elementów poza hero (z kopiami slajdów i odsłoniętymi biogramami)
  plus osobny pomiar hero, na czterech szerokościach —
  **zero błędów** WCAG AA (4,5:1 dla zwykłego tekstu, 3:1 dla dużego).
  Pomiar liczy tło z *interpolacji gradientu* w miejscu, w którym stoi dany
  element, bo barwa tła zmienia się na przestrzeni jednej sekcji.
  W hero, gdzie tekst stoi na zdjęciu, tło liczone jest inaczej: skrypt
  próbkuje **realne piksele `hero.jpg`** pod każdym napisem, składa maskę,
  zasłonę i gradient dokładnie tak jak CSS, i bierze najciemniejszy wynik.
  Najsłabszy napis w hero ma tam 5,38:1.
- **Cele dotykowe** — każdy odnośnik, przycisk i pole ma min. 44 px wysokości
  i min. 8 px odstępu od sąsiada. Sprawdzone przy 320 / 375 / 414 / 768 /
  1280 px oraz w orientacji poziomej. Uwaga przy powtarzaniu pomiaru: liczy
  się **realny obszar aktywacji**, więc dla pola wyboru w etykiecie mierzy
  się etykietę, nie sam kwadracik. Trzeba też wcześniej odsłonić animacje
  wejścia (`.reveal` → `.is-in`), inaczej przy `opacity: 0` skrypt pomija
  większość strony i wychodzi fałszywe zero.
- **Klawiatura** — pełna obsługa: skip link, widoczne obramowanie fokusu na
  wszystkim, karuzele sterowane ← →, menu mobilne zamykane Esc z powrotem
  fokusu na przycisk, tło oznaczone `inert` przy otwartym menu.
- **Czytniki ekranu** — jeden `h1`, hierarchia nagłówków bez przeskoków, alt
  przy każdym zdjęciu, `aria-label` na przyciskach z samą ikoną, `aria-live`
  przy statusie formularza i liczniku karuzeli.
- **Bez skoków układu (CLS)** — każde zdjęcie ma `width`/`height`, każda ramka
  `aspect-ratio`, więc treść nie przeskakuje przy wczytywaniu.
- **Brak animacji** przy ustawieniu „ogranicz ruch" w systemie — łącznie
  z przesuwem galerii, który wtedy w ogóle nie startuje.
- **Jeden świadomy wyjątek od AA:** przesuw galerii na telefonie nie ma
  przycisku zatrzymania (WCAG 2.2.2). Szczegóły i sposób przywrócenia —
  w rozdziale „Galeria".
- **Bez poziomego przewijania** od 320 px wzwyż, także w orientacji poziomej
  (sprawdzone: `scrollWidth` nie przekracza szerokości okna na żadnej z badanych
  szerokości).
- **Podświetlenie sekcji** — pozycja w górnym menu zaznacza się wraz
  z przewijaniem, żeby było widać, w którym miejscu strony się jest.
- **Kolejność fokusu** — zgodna z układem wizualnym na każdej szerokości;
  sterowanie karuzelami idzie po taśmie, nie przed nią.
- **Długość wiersza** — 45 znaków na telefonie, 64–71 na tablecie i desktopie
  (limity liczone z realnej szerokości znaku, nie z jednostki `ch`, która
  mierzy zero i daje wynik o jakieś 28 procent za szeroki).

Zdjęcia mogą być `.jpg` (tak są podpięte). Jeśli masz możliwość zapisania ich
jako `.webp`, będą lżejsze — trzeba wtedy podmienić rozszerzenia w `index.html`.

## Motyw: niebo, które przechodzi w ocean

Strona czyta się jak zanurzenie. Im niżej przewijasz, tym głębiej jesteś:
jasne niebo w hero, powierzchnia wody przy zajęciach, laguna w galerii,
otwarta woda przy kadrze i lokalizacjach, ciemna głębia przy formularzu.

Zrobione jest to **bez JavaScriptu**. Każda sekcja ma własny wycinek
gradientu, a sąsiednie sekcje dzielą barwę na styku — dzięki temu przejście
jest ciągłe, a przewijanie nic nie przelicza:

| Sekcja | Od | Do |
|---|---|---|
| `#gora` | `--niebo-1` | `--niebo-2` |
| `#o-nas` | `--niebo-2` | `--niebo-3` |
| `#zajecia` | `--niebo-3` | `--powierzchnia` |
| `#galeria` | `--powierzchnia` | `--woda-1` |
| `#kadra` | `--woda-1` | `--woda-2` |
| `#lokalizacje` | `--woda-2` | `--woda-3` |
| `#opinie` | `--woda-3` | `--glebia-1` |
| `#formularz` | `--glebia-1` | `--glebia-2` |
| `#kontakt` | `--glebia-2` | `--otchlan` |

**Chcesz przesunąć moment zanurzenia?** Zmień barwy na styku dwóch sekcji —
reszta gradientu dopasuje się sama, bo sąsiedzi zawsze biorą tę samą wartość.

### Strefy głębokości

Tekst nie może mieć jednej barwy na całej długości: u góry tło jest niemal
białe, na dole prawie czarne. Dlatego każda sekcja dostaje jedną z trzech klas,
a ta przestawia komplet tokenów (`--heading`, `--on-surface`, `--muted`,
`--accent`, `--rule`, `--karta`, `--karta-obrys`):

| Klasa | Gdzie | Tekst |
|---|---|---|
| `strefa--jasna` | hero, o nas, zajęcia | granatowy na błękicie |
| `strefa--zanurzenie` | galeria | przejściowa |
| `strefa--glebia` | kadra → kontakt | jasny na granacie |

Karty (`--karta`) to **matowe szkło** — półprzezroczyste tło z rozmyciem tego,
co jest pod spodem, więc gradient prześwituje i nic nie „wycina" prostokąta
z wody.

### Efekty morskie

Wszystkie są dekoracją: `aria-hidden`, `pointer-events: none`, wyłącznie
`transform`/`opacity`, i **wszystkie gasną przy systemowym „ogranicz ruch"**.
Siedzą pod treścią (`z-index: 1`, treść ma 10), więc nigdy nie wchodzą
w drogę czytaniu ani klikaniu.

| Efekt | Gdzie | Co robi |
|---|---|---|
| `.slonce` | hero | miękka poświata w rogu |
| `.chmura` × 27 | hero, `#o-nas`, `#zajecia` — po 9 | dryfują po niebie, 82–210 s; ujemne opóźnienia rozrzucają je na starcie po całym niebie |
| `.fala` × 2 | góra `#zajecia` | dwie fale SVG przesuwają się w przeciwnych kierunkach — to linia wody; blok pod falą wygaszany maską, inaczej kończył się prostą linią |
| `.kaustyka` | góra `#zajecia` | świetlna siatka jak na dnie basenu |
| `.promienie` | `#kadra` | snopy światła z góry, powolne chwianie |
| `.babelek` × 12 | `#lokalizacje`, `#formularz` | bąbelki wznoszą się wężykiem |
| `.babelek` × 8 | `#opinie`, `#kontakt` | to samo, rzadziej — im głębiej, tym mniej światła |


**Pułapka ze specyficznością.** Ruch chmur włącza się trzema osobnymi
własnościami (`animation-name`, `-timing-function`, `-iteration-count`),
a nie skrótem `animation:`. Skrót w regule `.js .chmura` (specyficzność 0,2,0)
zerował `animation-duration` ustawiane w `.chmura--N` (0,1,0) — przez co
**wszystkie chmury stały nieruchomo w lewym rogu sekcji**. Jeśli kiedyś wróci
tam skrót, wróci i ta usterka.



**Chmury nie mogą się ucinać na krawędziach sekcji.** Warstwa efektów ma
`overflow: hidden`, więc chmura sięgająca krawędzi była ścinana płaską linią.
Przesuwanie chmur tego nie rozwiązuje na stałe: wysokość sekcji zależy od
okna, więc przy niższym ekranie ucina się inna. Zamiast tego warstwa wygasza
się maską przy górnej i dolnej krawędzi (8 %), a chmura po prostu rozpływa
się, zanim dojdzie do cięcia.

Maska jest zawężona selektorem `.efekt:has(.chmura)` — promienie w „Kadrze"
i bąbelki niżej mają wychodzić z samej krawędzi i nie wolno ich przygaszać.

### Jak zbudowana jest chmura

Prawdziwy cumulus ma kilkanaście kłębów różnej wielkości wzdłuż krawędzi.
Kilka gładkich elips tego nie odda — wychodzi smuga albo mgła. Dlatego bryły
dokładamy **`box-shadow`-em**: każdy cień to kopia okręgu przesunięta
i zmniejszona spreadem. Razem z podstawą i dwoma pseudoelementami daje to
**17 brył na chmurę dryfującą** i **9 na chmurę nad nagłówkiem**.

Cienie liczone są w `em`, a `font-size` chmury skaluje się z szerokością okna
(`clamp`), więc bryły rosną razem z nią.

**Rozmycie musi być umiarkowane** — 7–11 px na desktopie, 6–8 px na telefonie.
Przy mocniejszym kłęby zlewały się z powrotem w gładką mgłę i cała robota
z bryłami szła na marne.

Do tego każdy kłąb ma inny promień zaokrąglenia i inną wysokość wierzchołka,
więc żadne dwie sylwetki się nie powtarzają.

## Kolory

Niebieskie pobrane bezpośrednio z pliku logo; reszta skali to ta sama barwa
prowadzona w dół do granatu, żeby motyw wody trzymał się logo.

| Token | Wartość | Zastosowanie |
|---|---|---|
| `--niebo-1` | `#EAF7FE` | najjaśniejsze niebo (start strony) |
| `--niebo-2` | `#CDEAFB` | niebo |
| `--niebo-3` | `#A8DCF4` | niebo tuż nad wodą |
| `--powierzchnia` | `#7FCBEC` | linia wody |
| `--woda-1` | `#0F5D8E` | laguna |
| `--woda-2` | `#0B4D77` | otwarta woda |
| `--woda-3` | `#083D5F` | woda niżej |
| `--glebia-1` | `#062F49` | głębia |
| `--glebia-2` | `#042236` | głębia niżej |
| `--otchlan` | `#031829` | dno (stopka) |
| `--brand` | `#107EBF` | niebieski z logo — akcenty, pasek postępu |
| `--sky` | `#B7DCF5` | błękit z logo |
| `--ink` | `#06304A` | tekst w strefie jasnej |
| `--on-deep` | `#D8ECF8` | tekst w strefie głębi |

Wszystko jest w `:root` na początku `css/style.css`.

## Ikony

Strona nie ma ikon dekoracyjnych — zostały tylko dwie funkcjonalne: strzałka
karuzeli i gwiazdka do ocen w opiniach. Cały zestaw siedzi w `<svg>` na górze
`index.html`. Znaczenie niosą podpisy tekstowe, nie obrazki.

## Typografia

| Rola | Krój | Uwagi |
|---|---|---|
| Nagłówki | **Fraunces** | serif ze zmienną osią optyczną — im większy stopień, tym większy kontrast kresek; pisany wersją mieszaną, nie wersalikami |
| Tekst | **Figtree** | 17 px bazowo, interlinia 1,7 |
| Etykiety | Figtree | wersaliki 12 px z rozstrzeleniem — tylko na drobnych podpisach |

Oba kroje mają pełny zestaw polskich znaków (sprawdzone: `latin-ext`).

## Ruch

| Gdzie | Co | Czas |
|---|---|---|
| Wejście sekcji | delikatne podniesienie + pojawienie, kaskadowo | 380 ms |
| Kreska nad nagłówkiem sekcji | dorysowuje się od lewej | 400 ms |
| Zdjęcia | powiększenie pod wskaźnikiem | 600 ms |
| Przyciski i strzałki | zmiana barwy + wciśnięcie | 160 ms |
| Nagłówek strony | pasek postępu przewijania pod przyklejonym paskiem | na bieżąco |
| Zapętlenie karuzeli | zwykłe przewinięcie w prawo na kopię pierwszego slajdu | jak każdy krok |
| Chmury | płyną w poprzek trzech sekcji nieba | 82–210 s |
| Fale na linii wody | dwie warstwy w przeciwnych kierunkach | 18 / 26 s |
| Kaustyka | siatka światła faluje | 12 s |
| Promienie w głębi | powolne chwianie | 14 s |
| Bąbelki (40 sztuk w czterech sekcjach) | płyną wężykiem, nie po prostej | 16–30 s |
| Pasy pełnoekranowe | bardzo powolny dryf kadru | 26 s |

Wszystko na `transform`/`opacity` (nie powoduje przeliczania układu). Efekty
morskie są długie i o niskim kontraście celowo — mają dawać wrażenie wody,
a nie przyciągać wzrok. **Wszystko znika przy systemowym ustawieniu
„ogranicz ruch"**; bąbelkom zostaje wtedy stała, ledwie widoczna przezroczystość.

Do wydruku strona spłaszcza się do czerni na bieli: gradienty, efekty i pasy
pełnoekranowe znikają, a strefy głębokości przestawiają tokeny na czarny tekst.

## Do uzupełnienia

Kolejność od najbardziej widocznego braku:

- **Portrety ośmiu trenerek** (`img/trenerki/`) — to jedyne miejsce, gdzie
  na stronie wciąż widnieją ramki zastępcze.
- **Pliki HEIC** — pięciu zdjęć z telefonu nie dało się otworzyć (Windows nie
  ma tu kodeka HEIF, nie ma też ffmpeg ani ImageMagick). Wystarczy wyeksportować
  je z telefonu jako JPG i wrzucić do folderu z materiałami.
- **Filmy** — dwa nagrania (61 MB i 68 MB) są za ciężkie na stronę; trzeba je
  skompresować albo wrzucić na YouTube i osadzić. Trzeci (4 MB) nadaje się
  do użycia od razu.
- **Opinie** — trzy karty wypełnione 29.08.2026. Google blokuje automatyczne
  pobranie (sprawdzenie „czy jesteś robotem" w wyszukiwarce, ściana zgód
  w Mapach), więc kolejne trzeba przekleić ręcznie: treść, imię autora
  i liczbę gwiazdek. Zasady — w rozdziale „Opinie".
- **Nazwiska** — Justyna Moczulska (zgodnie z notatką o zmianie) i Monika
  Ochmańska (poprawione 27.08.2026 wraz z opisami). Jeśli któreś jeszcze nie
  weszło w życie, trzeba je poprawić w `index.html` — pamiętaj, że nazwisko
  występuje w pięciu miejscach karty: nagłówku, podpisie zdjęcia, etykiecie
  ramki zastępczej, treści `alt` i nazwie pliku ze zdjęciem.
- **Domena** — po jej wykupieniu uzupełnij pełny adres obrazka w `og:image`
  (komentarz w `<head>`).
- **Cennik i grafik** — materiałów nie było; zapisy prowadzą do systemu ActiveNow.
