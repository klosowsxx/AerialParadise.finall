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
| `polityka-prywatnosci.html` | Jedyna podstrona — polityka prywatności |
| `css/style.css` | Arkusz stylów (tokeny kolorów i typografii w sekcji `:root` na górze) |
| `js/main.js` | Menu mobilne, wejścia sekcji, karuzela, okno kadry, formularz |
| `img/` | Logo, favicony, zdjęcia |
| `robots.txt` | Zgoda dla wyszukiwarek + wskazanie mapy strony |
| `sitemap.xml` | Mapa strony (strona główna + polityka prywatności) |
| `.vercelignore` | Lista plików, których Vercel **nie** wgrywa na produkcję |
| `serve.ps1` | Prosty serwer statyczny do podglądu |
| `.claude/launch.json` | Konfiguracja podglądu (port 5900) |

## Sekcje i kotwice

`#gora` (hero) → `#o-nas` → `#zajecia` (w środku `#szarfy`, `#kolo`,
`#akrobatyka`, `#stretching`) → `#oferta` (w środku `#kolonie`, `#urodziny`)
→ `#galeria` → `#kadra` → `#lokalizacje` →
`#opinie` → `#formularz` → `#kontakt`.

Menu w górnym pasku, menu mobilne i stopka trzymają dokładnie tę kolejność.

**Nadkreślenie każdej sekcji (`.eyebrow`) brzmi tak samo jak pozycja w pasku**
— „Kadra”, „Lokalizacje”, „Kontakt” — żeby po kliknięciu w menu od razu
było widać, że to ta sekcja (ujednolicone 25.09.2026; wcześniej stało tam
„Poza treningami”, „Gdzie trenujemy” i „Napisz do nas”). Zmieniając etykietę
w menu, zmień też nadkreślenie. Wyjątek: **„O nas”** ma układ dwukolumnowy
bez `.section__head`, więc nie ma nad sobą kreski — sam napis jest na miejscu.

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

**Trzy warunki, bez których ten powrót drga na telefonie** (wszystkie
wyszły dopiero na prawdziwym urządzeniu):

- **Nie wolno przestawiać taśmy, dopóki palec jej dotyka.** Przewijanie
  dotykiem ma bezwład i zdarzenia potrafią się urwać na dłużej niż 160 ms
  jeszcze przed puszczeniem. Flagę zdejmuje `pointerup` **na oknie**, nie
  na torze — palec często wyjeżdża poza taśmę i zdarzenie trafiłoby w inny
  element, przez co pętla przestałaby się domykać na dobre.
- **Skok musi naprawdę być natychmiastowy.** Samo `behavior: "instant"`
  nie wystarcza: starsze Safari tej wartości nie zna i spada na `auto`,
  czyli na CSS-owe `scroll-behavior: smooth` z `.carousel__track` — cichy
  powrót stawał się widocznym przejazdem taśmy wstecz. Na czas skoku
  ustawiamy `scroll-behavior: auto` własnością inline i po wszystkim ją
  **usuwamy** (`removeProperty`), a nie nadpisujemy na sztywno — inaczej
  reguła dla „ogranicz ruch" przestałaby działać.
- **Snapowanie trzeba wyłączyć na czas skoku.** `scroll-snap-type: x
  mandatory` po skoku dociąga taśmę do najbliższego punktu i wysyła kolejne
  zdarzenia przewijania, które znów uruchamiają wyrównanie — to była
  pętla drgania. Zdarzenie po własnym skoku pomijamy też flagą (120 ms).

Zmierzone po poprawce: skok o cały komplet wraca w jednym kroku i pozycja
jest stabilna przez kolejną sekundę (7 próbek co 120 ms, zero odbić) —
w obu karuzelach.

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

Licznik na styku pętli pokazuje np. „9 i 1 z 9" zamiast „9–1 z 9" — zakres
malejący czytałby się jak usterka.

Dodanie zajęć lub trenerki: skopiuj w `index.html` blok
`<article class="class-block" id="…">` albo `<article class="coach" data-flip>`
wewnątrz `carousel__track`. Kopie, licznik i zapętlenie zrobią się same.

## Kadra: zdjęcie zamienia się w opis

W sekcji jest **dziewięć trenerek**. Opisy pochodzą wprost od klienta
(aktualizacja 27.08.2026, Iwona Łukanowicz doszła 25.09.2026); Zofia Kłak
i Weronika Koślińska mają wersje z pierwszej partii materiałów.

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
Na zdjęciu, pod nazwiskiem (18 px), stoi podpowiedź „Kliknij, aby zobaczyć
opis" — 15 px, bo w 12 px ginęła na tle zdjęcia (zmienione 22.09.2026).
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

Pułapka: w sekcji mobilnej (do 768 px) leży stara reguła `.coach .photo
{ max-width: 11rem }` — kadr dla układu bez JavaScriptu, gdzie zdjęcie stoi
obok tekstu. Przy karcie z przełączaniem obcinała zdjęcie do połowy kafelka,
więc `.js .coach__strona--foto .photo` kasuje ją przez `max-width: none`
(poprawione 22.09.2026). Jeśli kiedyś zdjęcie znów zajmie pół karty na
telefonie, zacznij od tej pary reguł.

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

## Kolonie i urodziny

Obie oferty siedzą w **jednej sekcji** (`#oferta`), a nie w dwóch. Osobne
sekcje wydłużyłyby i tak długą stronę o dwa pełne ekrany, a jedna i druga
odpowiada na to samo pytanie rodzica: „co jeszcze robicie poza cotygodniowymi
zajęciami". Wewnątrz są dwa bloki z własnymi kotwicami — `#kolonie`
i `#urodziny` — więc menu mobilne prowadzi prosto do każdego z osobna.

Drugi blok ma `.oferta--odwrotna`: od 992 px zdjęcie idzie na lewo, a tekst
na prawo. Bez tego sekcja wyglądałaby jak ten sam blok postawiony dwa razy.

**Gradient musiał dostać nowy przystanek.** Sekcje dzielą barwę na styku,
więc wstawienie czegokolwiek w środek łańcucha rozjeżdża zejście barw.
Doszedł token `--niebo-4` (`#93D3F0`, w połowie drogi między `--niebo-3`
a `--powierzchnia`): „Zajęcia" kończą się teraz na nim, a nowa sekcja
prowadzi z niego do `--powierzchnia`. Przy każdej kolejnej wstawce trzeba
zrobić to samo — sprawdzianem jest porównanie koloru końcowego każdej
sekcji z początkowym następnej.

**Akcent w tej sekcji jest ciemniejszy niż na reszcie strony.** Tło schodzi
tu do `#7FCBEC`, czyli najciemniejszego błękitu w strefie jasnej, i markowy
`--brand-700` dawał na etykiecie oraz obu odnośnikach **3,89:1** — poniżej
progu. `#oferta` nadpisuje więc `--accent` i `--focus` na `#07496C`
(5,4:1 w najgorszym miejscu), zamiast ruszać token używany wszędzie indziej.

**Cennik urodzin nie ma ramki ani tła** — pierwsza wersja miała je i odcinała
się od reszty strony, bo nigdzie indziej takich pudełek nie ma; rytm trzyma
tu kreska i typografia, nie obrys. Zostały więc dwa podtytuły pod cienką
linią (`.podtytul`), lista „w cenie" łamana na dwie kolumny od 480 px
i dwa wiersze cennika rozdzielone hairline'em, z kwotą w kroju nagłówkowym.
Znacznik przy liście jest **rysowany obróconą kreską**, nie znakiem „✓" —
nie zależy od kroju pisma i czytnik ekranu nie odczyta go jako treści.

**Opisy obu ofert są przeklejone dosłownie z materiałów klienta**
(`kolonie.txt`, `oferta urodzinowa.txt`) — nie skracać ani nie przeredagowywać.
To samo dotyczy nagłówków: „Kolonie i półkolonie AerialParadise" oraz
„Urodziny w AerialParadise".

Zdjęcia przy koloniach: `kolonie-1.jpg` **poziome, na obie kolumny**
(klasa `.szeroki`, kadr 3:2, 1200 × 800) i pod nim dwa pionowe —
`kolonie-3.jpg`, `kolonie-4.jpg` (3:4, 900 × 1200). Kadr poziomy w pionowym
slocie ucinałby to, co najważniejsze: grupę ludzi. Dlatego takie zdjęcie
dostaje obie kolumny i własne proporcje, zamiast być przycinane.

Przy urodzinach `urodziny.jpg` (4:5, 960 × 1200) — zdjęcie z prawdziwej
imprezy w sali (girlanda, balony, stół), a nie ilustracja z zajęć. Blok urodzin ma **kolumnę „handlową"** (`.oferta__bok`): zdjęcie górą,
pod nim cennik i przycisk. Wcześniej zdjęcie było wyśrodkowane w pionie,
a cennik siedział w kolumnie z opisem — pod zdjęciem zostawało 400 px
pustki, a tekst obok niepotrzebnie się wydłużał. Po przeniesieniu blok
zeszedł z 979 do 915 px na desktopie. Na telefonie kolejność to opis,
zdjęcie, cennik, przycisk — cena tuż przed wezwaniem do działania.

**Górny pasek ma pełne „Kolonie i urodziny", ale menu poziome pokazuje się
dopiero od 1120 px** (wcześniej od 992 px). Siedem pozycji z tą nazwą
potrzebuje 740 px; z logotypem (176 px) i przyciskiem zapisów (108 px) daje
to 1056 px, a przy 992 px pasek ma 977 px. Poniżej 1120 px nawigację
przejmuje menu pod hamburgerem — bogatsze, z rozbiciem zajęć i obu ofert
na osobne pozycje.

**Flexbox nie zgłasza takiego braku miejsca jako przepełnienia.** Ściskał
logotyp do 44 px, a napis „AerialParadise" wychodził poza jego ramkę
i wjeżdżał pod pozycję „O nas" — wyglądało to, jakby menu nachodziło na
logo. Stąd `.brand { flex: none }`: lepiej, żeby zabrakło miejsca widocznie,
niż żeby elementy po cichu na siebie nachodziły.

Druga pułapka z tej samej rodziny: pozycje menu kurczyły się poniżej własnej
treści i tekst łamał się w środku. Naprawia to `white-space: nowrap` na
`.nav__link`.

**Dodając kolejną pozycję do paska, zmierz odstęp logo↔menu, nie tylko
menu↔przycisk** — po tej stronie pęka najpierw i najciszej.

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

**Stan na 30.08.2026:** formularz jest podpięty pod FormSubmit na skrzynkę
klubu `aerialparadiseclub@gmail.com`. **Aktywacja jeszcze nie przeszła** —
dopóki ktoś nie kliknie linku „Activate Form" w mailu od FormSubmit, usługa
odrzuca wszystkie zgłoszenia (strona pokazuje wtedy czerwony komunikat).
Link przychodzi dopiero po pierwszym wysłaniu formularza i musi go kliknąć
właściciel skrzynki, czyli Justyna.

Po aktywacji FormSubmit wyda **identyfikator zastępczy** — warto go wstawić
zamiast gołego adresu, żeby skrzynki nie zbierały roboty spamowe. Adres
klubu i tak widnieje na stronie w kontakcie, więc to poprawa, nie warunek.

**Aktywacja jest przypisana do adresu strony.** Mail potwierdzający mówi
wprost o `http://localhost:5900/`, bo stamtąd poszło pierwsze żądanie. Po
przeniesieniu strony na docelową domenę trzeba się liczyć z ponowną
aktywacją — sprawdzić to od razu po wdrożeniu, jednym testowym wysłaniem,
a nie dopiero wtedy, gdy zapytania zaczną ginąć.

**Kod 200 nie znaczy, że wiadomość poszła.** FormSubmit odpowiada dwusetką
także wtedy, gdy jej nie wysłał — dopóki skrzynka nie potwierdzi formularza
linkiem aktywacyjnym, a także przy blokadach i limitach. Powód siedzi
w treści odpowiedzi (`success: "false"`, `message`). Skrypt sprawdza jedno
i drugie; przy niepowodzeniu **nie czyści pól**, żeby odwiedzający nie
stracił napisanej wiadomości, a powód wypisuje do konsoli. Gdyby kiedyś
zostało samo `response.ok`, strona wróciłaby do mówienia „wiadomość
dotarła" wtedy, gdy nic nie dotarło.

**Wariant bez żadnej konfiguracji** (pusty `data-endpoint`) — otwiera program pocztowy
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

## Polityka prywatności (25.09.2026)

Osobna podstrona `polityka-prywatnosci.html`. Korzysta z tego samego
`css/style.css` i tej samej stopki co strona główna, więc nie wygląda jak
doklejka; style własne (`.doc…`) leżą w sekcji 21 arkusza.

Prowadzą do niej **dwa linki**: pod polem zgody w formularzu
(`.form__prywatnosc`) i w stopce. Oba miejsca są świadome — pierwszy jest
tam, gdzie odwiedzający właśnie oddaje dane, drugi tam, gdzie takich
dokumentów się szuka.

Treść opisuje **to, co strona naprawdę robi**, nie wzorzec z internetu:

| W dokumencie | Skąd to wiadomo |
|---|---|
| Pola formularza | `index.html`, sekcja `#formularz` |
| FormSubmit jako odbiorca | `data-endpoint` w znaczniku `<form>` |
| Gmail klubu | adres w `data-endpoint` i w pasie kontaktowym |
| Google Fonts widzi IP | `<link>` do `fonts.googleapis.com` w nagłówku |
| Brak ciasteczek i analityki | w `js/main.js` nie ma `cookie`, `localStorage` ani żadnego licznika |

**Jeśli zmienisz którąś z tych rzeczy, popraw też politykę.** Najbardziej
prawdopodobne zmiany: podłączenie statystyk odwiedzin (dojdzie rozdział
o ciasteczkach i zgoda), przeniesienie czcionek na własny serwer (wtedy
akapit o Google Fonts znika) albo zmiana usługi obsługującej formularz.

Na stronie stoi wyraźnie oznaczona ramka **„Do uzupełnienia przed
publikacją"** z prośbą o pełną nazwę podmiotu, adres rejestrowy i NIP —
tych danych nie ma w żadnym materiale od klienta, a zmyślanie ich
w dokumencie o ochronie danych byłoby najgorszym z możliwych pomysłów.
Ramka ma klasę `.doc__uwaga` i atrybut `data-do-uzupelnienia`, więc łatwo
ją znaleźć i usunąć razem z akapitem, który opisuje.

**To nie jest porada prawna.** Dokument opisuje stan faktyczny strony
i trzyma się struktury wymaganej przez RODO, ale przed rozgłoszeniem adresu
warto, żeby przeczytała go Justyna — zwłaszcza fragmenty o okresie
przechowywania korespondencji (przyjęto 3 lata) i o tym, że dane z formularza
nie są używane do marketingu.

## Portrety trenerek (22.09.2026)

Sesja studyjna na niebieskim tle, oryginały 1867×2800 (2:3), bez znacznika
obrotu EXIF. Na stronie ramka jest 4:5, więc każdy portret jest przycięty
do 1867×2334 i przeskalowany do **800×1000**, jakość JPEG 86.

Kadr schodzi **26 % nadmiaru od góry, resztę z dołu** — twarze w tej sesji
siedzą w górnej jednej trzeciej kadru, więc równy kadr z obu stron obcinałby
głowy. Przy dokładaniu kolejnych portretów z tej samej sesji trzymaj tę samą
proporcję, inaczej jeden kafelek odstaje od reszty.

Przypisania zdjęć do nazwisk podała Justyna (wiadomość z 22.09.2026 —
same numery plików, bez nazwisk w EXIF, więc nie da się ich odtworzyć
z samych zdjęć):

| Plik na stronie | Oryginał | Uwagi |
|---|---|---|
| `justyna-moczulska.jpg` | DSC04147 | |
| `agnieszka-polak.jpg` | DSC04261 | |
| `monika-ochmanska.jpg` | DSC04242 | |
| `zofia-klak.jpg` | DSC04280 | |
| `weronika-joachimiak.jpg` | DSC04187 | |
| `weronika-koslinska.jpg` | DSC04194 | alternatywa DSC04283 — szpagat stojący, kadr 4:5 ucinałby uniesioną nogę |
| `katarzyna-kosiorek.jpg` | DSC04170 | alternatywa DSC04270 — z szarfą, ale postać poza osią i lekko prześwietlona |
| `iwona-lukanowicz.jpg` | DSC04253 | potwierdzone przez klienta 25.09.2026 — patrz niżej |

**Marleny Pikor-Leczowicz nie było na sesji**, więc jej karta stoi z ramką
zastępczą. Brakujący plik: `marlena-pikor-leczowicz.jpg`.

Przy dwóch osobach Justyna zostawiła wybór. W obu przypadkach wygrało ujęcie
portretowe, bo kafelki stoją obok siebie w karuzeli i każde odstępstwo
od wspólnego kadru rzuca się w oczy.

### Ósma osoba z sesji to Iwona, nie Marlena

Na liście przypisań od Justyny brakowało jednej osoby. Ustaliłem ją przez
eliminację — blondynka ze związanymi włosami, klatki **04160/04162** (na tle)
i **04253–04256** (z szarfą) — i podpisałem jako Marlenę Pikor-Leczowicz,
bo tylko jej brakowało na liście.

Zdjęcia były dobrane dobrze, nazwisko źle. **25.09.2026 klient wyjaśnił, że to
Iwona „Panda” Łukanowicz**, której wcześniej w ogóle nie było na stronie,
a Marleny na sesji nie było i jej zdjęcia po prostu nie ma. Teraz DSC04253
stoi podpisane jako Iwona, a karta Marleny wróciła do ramki zastępczej.

Przy okazji wyjaśniły się dwie mylące grupy: **04154–04156 to Agnieszka**
(te same rysy co na 04261–63 z szarfą), **04176–04179 to Monika**,
a **04173/04174 to Kasia**, nie osobna osoba.

Wniosek na przyszłość: eliminacja potrafi pokazać, że dwie serie zdjęć
przedstawiają tę samą osobę, ale nie powie, jak ta osoba się nazywa.
Nazwiska bierz z listy od klienta albo dopytaj.

Oryginały leżą w `C:\Users\marcel\Desktop\trenerki` (45 plików z sesji).

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

### Portrety trenerek — **brakuje jednego z dziewięciu**

Pionowe 4:5, folder `img/trenerki/`. Osiem plików jest na miejscu; brakuje
tylko `marlena-pikor-leczowicz.jpg`, bo Marleny nie było na sesji zdjęciowej.

Wskazówki: dłuższy bok ok. 1600 px, plik do ~400 KB. Zdjęcia są przycinane
(`object-fit: cover`), więc postać nie powinna być tuż przy krawędzi kadru.

**To teraz najbardziej widoczny brak na stronie** — w sekcji „Kadra" na
pierwszym planie jest zdjęcie, więc dopóki portretów nie ma, widać tam ramki
zastępcze z nazwiskami. Kliknięcie i tak działa: opis odsłania się normalnie.

## Co jest inne na telefonie

Strona jest długa z natury — cztery pełne opisy zajęć, dziewięć biogramów
i formularz. Żeby dało się z niej korzystać kciukiem, poniżej 768 px zmienia
się kilka rzeczy:

| Element | Na telefonie | Dlaczego |
|---|---|---|
| Przycisk **Zapisz się** | widoczny w pasku | wcześniej był schowany w menu, a to główna akcja strony |
| Sterowanie karuzelą | strzałki **nad** slajdem, licznik między nimi | na bokach zasłaniałyby zdjęcie; w kodzie strzałki idą przed torem, więc fokus klawiatury biegnie zgodnie z układem |
| Sekcja „O nas" | mieści się w jednym ekranie (ok. 0,9 wysokości) | po kliknięciu w menu widać całą treść bez przewijania |
| Zdjęcie sali w „O nas" | ukryte | zdjęć jest na stronie dużo; tutaj liczy się tekst |
| Galeria | dwa rzędy jadące powoli w bok | osiem kafli w pionie zajmowało cztery ekrany; teraz 432 px |
| Zdjęcie w „Urodzinach" | ukryte | kadr 4:5 zajmował ponad 400 px, a konkret jest w cenniku; blok schudł z 1560 do 1141 px |
| Zdjęcia w „Zajęciach" | ukryte | kadr zjadał pół ekranu i odsuwał opis; te same zdjęcia są w galerii. Slajd schudł z 1041 do 599 px |
| Nagłówki slajdów „Zajęć" | wyrównane do góry | slajdy mają wysokość najwyższego z nich, a `align-content: center` spychał krótsze opisy w dół — tytuł skakał o 83 px przy przewijaniu |
| Kadry zdjęć | sale 2:1, portret 11 rem | pionowe kadry zjadały pół ekranu |
| Tekst | 16 px / 1,65 | 45 znaków w linii — mieści się w zalecanym zakresie |
| Marginesy sekcji | 36 px zamiast 120 px | ponad 2 ekrany samego pustego miejsca mniej |
| Nazwa marki w pasku | znika poniżej 352 px | miejsce dla przycisku zapisów i menu |
| Filary w „O nas" | jedna kolumna poniżej 480 px | w dwóch kolumnach zostawało 18–20 znaków w wierszu |

Efekt: 11,9 ekranu przewijania przy 375 px i 13,8 przy 320 px — przy ośmiu
zdjęciach w galerii, pasie pełnoekranowym i całej treści.

### Efekty `:hover` a dotyk

Każdy efekt pod wskaźnikiem musi siedzieć w `@media (hover: hover)`.
Na dotyku przeglądarka udaje `:hover` po dotknięciu i **zostawia go** na
ostatnio dotkniętym elemencie. Przy przewijaniu karuzeli palcem stan
przeskakiwał z kafla na kafel i każde zdjęcie puchło o 4,5 % przez 600 ms
— bloczki w „Kadrze" i „Zajęciach" wyglądały, jakby drgały.

Efekty samej „Kadry" miały tę osłonę od początku; brakowało jej ogólnej
regule `.photo:hover img`, która obejmuje wszystkie zdjęcia na stronie.

### Galeria: przesuwający się pas i powiększanie

**Na każdej szerokości** (nie tylko na telefonie) pas to **dwa rzędy jadące
powoli w prawo** — zdjęć jest 14, więc siatka zajęłaby kilka ekranów.
Szerokość kafla to `clamp(9rem, 40vw, 15rem)`: 144–150 px na telefonie,
240 px na dużym ekranie. Ta sama metoda co w karuzelach: skrypt dokłada komplet
kopii, więc `translateX(-50%)` przesuwa taśmę dokładnie o jeden zestaw
i wraca do kadru identycznego z początkowym — pętla nie ma szwu.

**Sprzątanie po zamknięciu powiększenia nie może wisieć na zdarzeniu
`close`.** W osadzonych przeglądarkach `<dialog>` potrafi go w ogóle nie
wysłać — sprawdzone pomiarem: własny nasłuch łapał zero zdarzeń mimo
zamkniętego okna, przez co pas galerii zostawał zatrzymany na zawsze,
a tło zablokowane. Dlatego sprzątanie siedzi w osobnej funkcji wołanej
z trzech miejsc (przycisk, kliknięcie w tło, `cancel` od Esc) i jest
odporne na powtórzenie.

Prędkość jest stała w pikselach, nie w czasie: skrypt liczy `--tempo-galerii`
z szerokości jednego zestawu przy 18 px/s (przy 375 px wychodzi 37 s). Bez
tego na szerszym telefonie pas jechałby zauważalnie szybciej.

**Kopie muszą mieć skasowany `data-slot-gotowy`.** Ten znacznik pilnuje, żeby
ramka zastępcza nie była zakładana dwa razy — ale kopia dziedziczy go razem
z resztą atrybutów, przez co `wyposazSloty` ją pomijało. Kopia nie dostawała
nasłuchu wczytania i **ramka zastępcza zostawała narysowana na wierzchu
wczytanego zdjęcia**: widać było zdjęcie, a na nim podpis i nazwę pliku.
Dlatego przy klonowaniu kasujemy `data-slot-gotowy` oraz klasy `is-loaded`
i `is-empty`, a po wstawieniu kopii wołamy `wyposazSloty` jeszcze raz.

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
| `#zajecia` | `--niebo-3` | `--niebo-4` |
| `#oferta` | `--niebo-4` | `--powierzchnia` |
| `#galeria` | `--powierzchnia` | `--woda-1` |
| `#kadra` | `--woda-1` | `--woda-2` |
| `#lokalizacje` | `--woda-2` | `--woda-3` |
| `#opinie` | `--woda-3` | `--glebia-1` |
| `#formularz` | `--glebia-1` | `--glebia-2` |
| `#kontakt` | `--glebia-2` | `--otchlan` |

**Chcesz przesunąć moment zanurzenia?** Zmień barwy na styku dwóch sekcji —
reszta gradientu dopasuje się sama, bo sąsiedzi zawsze biorą tę samą wartość.

### Wynurzenie z chmury (01.09.2026)

Strona zaczyna się **czystą bielą i pustym niebem** — założenie jest takie,
że jesteśmy w środku chmury, więc nie ma czego rysować. Dopiero w miarę
schodzenia niżej wynurzamy się: tło błękitnieje, a chmury się pojawiają.

| Sekcja | Tło | Chmur | Krycie |
|---|---|---|---|
| `#gora` | `#FFFFFF → #F4FBFE` | **0** | — |
| `#o-nas` | `#F4FBFE → #DFF2FC` | 9 | 0.30–0.80 |
| `#zajecia` | `#DFF2FC → #A8DCF4` | 15 | 0.56–0.92 |
| `#oferta` | `#A8DCF4 → #7FCBEC` | 6 | 0.30–0.60 |

Krycie w „O nas" **celowo rośnie razem z `top`** — to ono niesie efekt
wynurzania: górne chmury toną w bieli tła, dolne mają już pełną bryłę.
To jedyny parametr chmur, który wolno powiązać z wysokością; fazy ruchu
nadal muszą być przetasowane (patrz niżej).

**Dwie pułapki, na które trzeba uważać przy zmianie palety:**

1. **Biała chmura na białym niebie znika.** Dlatego `.chmura` ma
   `filter: blur(7px) drop-shadow(…)` — miękki błękitny cień daje jej bryłę
   tam, gdzie tło jest jasne. `drop-shadow` musi iść **po** `blur`, bo tylko
   wtedy obrysowuje całą sylwetkę razem z kłębami z `box-shadow`
   i pseudoelementów; `box-shadow` objąłby samą główną elipsę.
2. **Nagłówek i rozmycie hero mają barwy wpisane na sztywno**
   (`rgba(255,255,255,…)` w `.site-header`, `.site-header.is-stuck`,
   `.hero__tlo::after` i `.hero__rozmycie`) — nie biorą ich z tokenów.
   Przy zmianie `--niebo-1`/`--niebo-2` trzeba je poprawić ręcznie, inaczej
   pasek nawigacji odcina się od hero jako obcy kolorystycznie prostokąt.

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
| `.chmura` × 30 | `#o-nas` 9, `#zajecia` 15, `#oferta` 6 — **w hero zero** | dryfują po niebie, 82–210 s; ujemne opóźnienia rozrzucają je na starcie po całym niebie; cztery odmiany kształtu i paralaksa przy przewijaniu |
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

### Cztery odmiany chmur (01.09.2026)

Sama `.chmura` to cumulus. Trzy klasy modyfikujące zmieniają rozkład brył,
żeby niebo nie było jednym kształtem powielonym trzydzieści razy:

| Klasa | Sylwetka | Rozmycie | `--glebokosc` | Ile |
|---|---|---|---|---|
| *(brak)* | kłąb — dwa garby, klasyczny cumulus | 7 px | 0.8 | 10 |
| `.chmura--wieza` | wieża — wyrasta pionowo, bryły spiętrzone | 7 px | 1.15 | 5 |
| `.chmura--pasmo` | pasmo — płaskie, rozciągnięte, prawie bez pionu | 10 px | 0.5 | 10 |
| `.chmura--strzep` | strzęp — sama mgiełka, pseudoelementy wyłączone | 13 px | 0.25 | 5 |

Każda odmiana nadpisuje **cały** `box-shadow` — lista cieni nie sumuje się
z regułą bazową, tylko ją zastępuje. Rozmycie rośnie wraz z lekkością:
im chmura rzadsza, tym mniej ma ostrych krawędzi.

Rozkład odmian idzie za scenariuszem wynurzania: w „O nas" u góry siedzą
strzępy i pasma (jesteśmy jeszcze we mgle), niżej pojawiają się kłęby;
„Zajęcia" mają pełną mieszankę; „Kolonie" wracają do lekkich kształtów.

### Paralaksa chmur

Chmura ma już animowany `transform` (poziomy dryf), a jeden element **nie może
mieć dwóch transformacji naraz**. Rozwiązanie: pionowe przesunięcie wchodzi
do klatek kluczowych jako zmienna CSS.

```css
@keyframes plynie {
  from { transform: translate3d(-35vw, var(--paralaksa, 0px), 0); }
  to   { transform: translate3d(120vw, var(--paralaksa, 0px), 0); }
}
```

Przeglądarka przelicza `translate3d` od nowa, gdy `--paralaksa` się zmieni,
a poziomy dryf trwa nieprzerwanie. Bez JS zmienna zostaje na `0px` i nic
się nie psuje.

Skrypt ustawia `--postep-sekcji` (−1 przed sekcją, 0 na środku ekranu,
+1 za nią) na **warstwie `.efekt`**, a nie na każdej chmurze — trzy zapisy
na klatkę zamiast trzydziestu, resztę załatwia dziedziczenie. Chmura mnoży
tę wartość przez własną `--glebokosc`, więc strzępy przebywają 28 px,
kłęby 90 px, a wieże 128 px. Stąd wrażenie planów.

**Paralaksa jest wyłączona poniżej 48 rem** i przy „ogranicz ruch". Powód
jest wydajnościowy: każda zmiana zmiennej każe przeliczyć klatki kluczowe
wszystkich trzydziestu chmur, a każda ma filtr rozmycia. Na telefonie efekt
jest ledwie widoczny, a rachunek realny.

### Odmiany wejścia przy przewijaniu

Domyślnie każdy `.reveal` wjeżdża z dołu. Cztery odmiany dobierają kierunek
do tego, czym element jest — ruch ma coś znaczyć, a nie tylko się dziać:

| Klasa | Gdzie | Ruch |
|---|---|---|
| `.reveal--kurtyna` | nagłówki sekcji (7) | odsłania się od dołu, `clip-path` |
| `.reveal--skala` | ramki na zdjęcia (18) | delikatne przybliżenie z 0.94 |
| `.reveal--z-lewej` | „O nas", „Kolonie" | wjeżdża z lewej, po której leży |
| `.reveal--z-prawej` | „Urodziny" (układ odwrócony) | wjeżdża z prawej |

Wszystkie kończą na `transform: none`, więc wspólna reguła `.js .reveal.is-in`
gasi je bez wyjątków. Kurtyna wymaga osobnej linii, bo `clip-path` nie jest
transformacją.

**Pułapka przy karcie w tle.** Obsługa przewijania chodzi na
`requestAnimationFrame`, a przeglądarka wstrzymuje go w niewidocznej karcie.
Zaplanowana ramka nigdy wtedy nie dochodzi do skutku, `idRamki` zostaje
ustawione na stałe i **każde kolejne przewinięcie odbija się od strażnika** —
pasek postępu i paralaksa zamierają do końca życia strony. Dlatego jest
nasłuch `visibilitychange`, który po powrocie do karty kasuje zawieszoną
ramkę i przelicza wszystko od nowa. Nie usuwaj go.

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
| `--niebo-1` | `#FFFFFF` | czysta biel — szczyt strony |
| `--niebo-2` | `#F4FBFE` | biel z ledwie wyczuwalnym błękitem |
| `--niebo-3` | `#DFF2FC` | tu błękit dopiero się zaczyna |
| `--niebo-4` | `#A8DCF4` | pełny jasny błękit |
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
| Wejście sekcji | delikatne podniesienie + pojawienie, kaskadowo | 240 ms |
| Kreska nad nagłówkiem sekcji | dorysowuje się od lewej | 300 ms |
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
a nie przyciągać wzrok.

### Kiedy sekcja się odkrywa (poprawione 25.09.2026)

Wejścia sekcji wyglądały, jakby strona doczytywała się w trakcie przewijania.
Składały się na to trzy rzeczy naraz i wszystkie trzy zostały skrócone:

| Co | Było | Jest |
|---|---|---|
| `rootMargin` obserwatora | `0px 0px -12% 0px` — element musiał wjechać głęboko w ekran | `0px 0px 15% 0px` — zaczyna wchodzić jeszcze pod krawędzią |
| `threshold` | `0.08` — do tego 8 % wysokości elementu | `0` — wystarczy pierwszy piksel |
| Czas animacji | `--t-slow` (380 ms) | `--t-base` (240 ms) |
| Kaskada w grupach | co 70 ms, do 420 ms | co 45 ms, do 240 ms |

Razem daje to około **220 px wcześniejszy start** przy ekranie 812 px
i o 140 ms krótszy ruch — nagłówek jest gotowy, zanim wjedzie w kadr.
Zabezpieczenie na wypadek nieczynnego obserwatora zeszło z 2500 na 1200 ms.

Gdyby kiedyś trzeba było **wyłączyć wejścia całkiem**, wystarczy w `.js .reveal`
ustawić `opacity: 1; transform: none` — reszta mechanizmu jest wtedy niegroźna,
bo JS tylko dokleja klasę `is-in`. **Wszystko znika przy systemowym ustawieniu
„ogranicz ruch"**; bąbelkom zostaje wtedy stała, ledwie widoczna przezroczystość.

Do wydruku strona spłaszcza się do czerni na bieli: gradienty, efekty i pasy
pełnoekranowe znikają, a strefy głębokości przestawiają tokeny na czarny tekst.

## SEO — jak strona przedstawia się wyszukiwarkom

Uporządkowane 01.09.2026. Trzy rzeczy warto rozumieć, zanim się tu cokolwiek ruszy.

### 1. Adres strony jest wpisany na sztywno w ośmiu miejscach

Strona jest statyczna — nie ma serwera, który podstawiłby adres w locie. Pełny
adres (`https://…`) musi więc być wpisany literalnie wszędzie tam, gdzie
wyszukiwarka i portale społecznościowe go oczekują:

| Gdzie | Co |
|---|---|
| `index.html` | `<link rel="canonical">` |
| `index.html` | `og:url` |
| `index.html` | `og:image` |
| `index.html` | `twitter:image` |
| `index.html` | JSON-LD: `url` i `@id` klubu |
| `index.html` | JSON-LD: `url`, `@id` i `logo`/`image` witryny |
| `robots.txt` | linia `Sitemap:` |
| `sitemap.xml` | `<loc>` |

Obecnie wszędzie widnieje adres Vercela. **Po wykupieniu domeny** wystarczy
zamiana ciągu `https://aerial-paradise-finall.vercel.app` na docelowy —
w `index.html`, `robots.txt` i `sitemap.xml`. Komentarz nad `canonical`
przypomina o tym w kodzie.

**Dlaczego adres względny nie wystarczy:** Facebook, LinkedIn i Twitter pobierają
obrazek z osobnego serwera, który nie wie, z jakiej strony pochodzi ścieżka
`img/logo.png`. Ścieżka względna = brak podglądu. To był realny błąd do 01.09.2026.

### 2. Karta do udostępniania: `img/og-card.jpg`

Format 1200×630 px, wymagany przez `summary_large_image`. Wcześniej wskazywaliśmy
tu `logo.png` — kwadrat 512×512, który portale przycinały do paska.

Kartę wygenerowano z `pas-glebia.jpg`: kadr 1,91:1, przyciemniający gradient
od lewej (żeby tekst był czytelny), logo i dwie linie podpisu. Jeśli trzeba ją
odtworzyć — skrypt siedzi w historii rozmowy; kluczowe parametry to jakość JPEG 88
i gradient `rgba(4,26,48)` od `230` do `20` alfa, poziomo.

### 3. Dane strukturalne: `SportsClub` + `WebSite`

Jeden blok JSON-LD w `<head>`, dwa powiązane obiekty w `@graph`. Zawiera adresy
obu sal, godziny otwarcia, katalog zajęć, ceny urodzin i link do zapisów
(`ReserveAction`). Sprawdzanie: <https://search.google.com/test/rich-results>.

**Czego tam świadomie nie ma:** `aggregateRating` ani obiektów `Review`.
Google zabrania oznaczania opinii o samym sobie zebranych na własnej stronie.
Gwiazdki i tak nie pojawiłyby się w wynikach, a strona mogłaby dostać
ostrzeżenie w Search Console. Opinie widnieją w wizytówce Google i to wystarcza.

### 4. Pliki robocze nie trafiają na produkcję

Vercel domyślnie serwuje **wszystko**, co jest w repozytorium. Do 01.09.2026 pod
adresem strony dało się otworzyć `CONTEXT.md`, `serve.ps1` i pliki
`_TU-WGRAJ-*.txt`. `.vercelignore` je wyklucza; `robots.txt` dodatkowo prosi
wyszukiwarki, żeby ich nie indeksowały (na wypadek gdyby ktoś wgrał stronę
gdzie indziej niż na Vercela).

### 5. Czego nie zmieniano, a warto rozważyć

- **`<h1>` brzmi „AerialParadise"** — sama nazwa, bez słów kluczowych. Podtytuł
  „Akrobatyka powietrzna" siedzi obok, w osobnym `<p>`. Wciągnięcie go do `<h1>`
  wzmocniłoby sygnał dla Google, ale zmienia strukturę nagłówka w hero —
  decyzja wizualna, nie techniczna.
- **Zdjęcia są w JPEG.** WebP dałby 25–35% mniej wagi, ale wymaga wygenerowania
  drugiego kompletu plików i przepisania 37 tagów `<img>` na `<picture>`.
- **Fonty z Google Fonts blokują pierwsze malowanie.** Wgranie ich lokalnie
  usunęłoby dwa połączenia do obcego serwera.

## Do uzupełnienia

Kolejność od najbardziej widocznego braku:

- **Dane podmiotu w polityce prywatności** — pełna nazwa, adres rejestrowy
  i NIP. Do czasu uzupełnienia na podstronie widać ramkę „Do uzupełnienia
  przed publikacją", więc brak rzuca się w oczy i nie da się o nim zapomnieć.
- **Portret Marleny Pikor-Leczowicz** — jedyna karta kadry bez zdjęcia.
  Marleny nie było na sesji z 09.2026, więc trzeba osobnego kadru: pionowy
  4:5, najlepiej na tym samym niebieskim tle. Po wgraniu pliku o nazwie
  `marlena-pikor-leczowicz.jpg` do `img/trenerki/` ramka zastępcza znika sama.
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
- **Domena** — po jej wykupieniu podmień adres w ośmiu miejscach wypisanych
  w rozdziale „SEO", a potem zgłoś stronę w Google Search Console.
- **Cennik i grafik** — materiałów nie było; zapisy prowadzą do systemu ActiveNow.
