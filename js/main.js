/* AerialParadise — skrypty interfejsu.
   Wszystko jest opcjonalne: bez JS strona nadal działa i jest czytelna. */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Nagłówek: tło po odjechaniu od góry + podświetlenie sekcji ------
     Na stronie jednostronicowej „gdzie jestem" musi być widoczne, więc
     pozycja w menu podświetla się wraz z przewijaniem.                     */
  var header = document.querySelector(".site-header");

  if (header) {
    var spy = [];
    Array.prototype.forEach.call(document.querySelectorAll('.nav__link[href^="#"]'), function (link) {
      var section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) { spy.push({ link: link, section: section }); }
    });

    var offsetTop = function (el) {
      var top = 0;
      while (el) { top += el.offsetTop; el = el.offsetParent; }
      return top;
    };

    var markCurrent = function () {
      if (!spy.length) { return; }
      var line = window.scrollY + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 88) + 8;
      var active = null;
      spy.forEach(function (item) {
        if (offsetTop(item.section) <= line) { active = item; }
      });
      // Ostatnia sekcja zaczyna się poniżej miejsca, do którego da się doscrollować —
      // na samym dole strony podświetlamy ją mimo to.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = spy[spy.length - 1];
      }
      spy.forEach(function (item) {
        if (item === active) { item.link.setAttribute("aria-current", "true"); }
        else { item.link.removeAttribute("aria-current"); }
      });
    };

    var progressBar = header.querySelector("[data-scroll-bar]");

    var headerTimer = null;
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
      markCurrent();
      if (progressBar) {
        var scrollable = document.documentElement.scrollHeight - window.innerHeight;
        var done = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        progressBar.style.setProperty("--progress", done.toFixed(4));
      }
    };
    onScroll();
    window.addEventListener("scroll", function () {
      if (headerTimer) { return; }
      headerTimer = window.setTimeout(function () {
        headerTimer = null;
        onScroll();
      }, 80);
    }, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  }

  /* --- Menu mobilne ---------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.getElementById("menu-mobilne");

  if (toggle && panel) {
    var backdropped = document.querySelectorAll("main, .info-band, .site-footer");

    var setInert = function (state) {
      Array.prototype.forEach.call(backdropped, function (el) { el.inert = state; });
    };

    var openMenu = function () {
      panel.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("is-locked");
      setInert(true);
      var first = panel.querySelector("a, button");
      if (first) { first.focus(); }
    };

    var closeMenu = function (returnFocus) {
      panel.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("is-locked");
      setInert(false);
      if (returnFocus) { toggle.focus(); }
    };

    toggle.addEventListener("click", function () {
      if (panel.classList.contains("is-open")) { closeMenu(true); } else { openMenu(); }
    });

    panel.addEventListener("click", function (event) {
      if (event.target.closest("a")) { closeMenu(false); }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        closeMenu(true);
      }
    });

    // Po powrocie do widoku desktopowego panel nie może zostać otwarty.
    window.matchMedia("(min-width: 62rem)").addEventListener("change", function (event) {
      if (event.matches && panel.classList.contains("is-open")) { closeMenu(false); }
    });
  }

  /* --- Miejsca na zdjęcia ---------------------------------------------
     Ramka z opisem znika sama, gdy plik o danej nazwie pojawi się w /img.
     Nie trzeba wtedy zmieniać kodu HTML.                                  */
  // Wywoływane też po sklonowaniu slajdów karuzeli — kopie muszą same
  // rozpoznać, czy plik już jest, inaczej ramka zostałaby na wierzchu zdjęcia.
  var wyposazSloty = function (root) {
    Array.prototype.forEach.call(root.querySelectorAll(".photo"), function (slot) {
      var img = slot.querySelector("img");
      if (!img || slot.dataset.slotGotowy) { return; }
      slot.dataset.slotGotowy = "1";

      var markLoaded = function () { slot.classList.add("is-loaded"); slot.classList.remove("is-empty"); };
      var markEmpty = function () { slot.classList.add("is-empty"); };

      if (img.complete) {
        if (img.naturalWidth > 0) { markLoaded(); } else { markEmpty(); }
      }
      img.addEventListener("load", markLoaded);
      img.addEventListener("error", markEmpty);
    });
  };
  wyposazSloty(document);

  /* --- Wejścia sekcji przy przewijaniu --------------------------------- */
  var revealables = document.querySelectorAll(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
  } else {
    var sawIntersection = false;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        sawIntersection = true;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) { observer.observe(el); });

    // Zabezpieczenie: gdyby obserwator nie zadziałał, treść nigdy nie może zostać ukryta.
    window.setTimeout(function () {
      if (!sawIntersection) {
        observer.disconnect();
        Array.prototype.forEach.call(revealables, function (el) { el.classList.add("is-in"); });
        return;
      }
      Array.prototype.forEach.call(revealables, function (el) {
        if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight * 1.5) {
          el.classList.add("is-in");
        }
      });
    }, 2500);
  }

  // Opóźnienia kaskadowe dla elementów w tej samej grupie.
  var groups = document.querySelectorAll("[data-stagger]");
  Array.prototype.forEach.call(groups, function (group) {
    var items = group.querySelectorAll(":scope > .reveal");
    Array.prototype.forEach.call(items, function (item, index) {
      item.style.setProperty("--delay", Math.min(index * 70, 420) + "ms");
    });
  });

  /* --- Karuzele (zajęcia, kadra) ----------------------------------------
     Bez JS to zwykłe paski przewijane palcem lub gładzikiem. JS dokłada
     strzałki, licznik, przesuw o jeden slajd i PĘTLĘ BEZ SZWU.

     Pętla działa tak: po obu stronach oryginalnych slajdów dokładamy komplet
     ich kopii. Taśma wygląda więc na nieskończoną — z ostatniego slajdu jedzie
     się dalej w prawo, prosto na kopię pierwszego. Kiedy przewijanie się
     zatrzyma, przestawiamy pozycję o szerokość jednego kompletu na odpowiadający
     slajd w środkowym zestawie. Ten skok jest niewidoczny, bo w tym miejscu stoi
     dokładnie ta sama treść — nigdy nie widać przewijania taśmy wstecz.

     Kopie są `aria-hidden` i mają `tabindex="-1"`, więc czytnik ekranu i
     tabulator widzą każdą trenerkę i każde zajęcia dokładnie raz.          */
  var setupCarousel = function (root) {
    var track = root.querySelector("[data-carousel-track]");
    var prevBtn = root.querySelector("[data-carousel-prev]");
    var nextBtn = root.querySelector("[data-carousel-next]");
    var counter = root.querySelector("[data-carousel-status]");
    if (!track || !prevBtn || !nextBtn || track.children.length < 2) { return; }

    var originals = Array.prototype.slice.call(track.children);
    var count = originals.length;

    var przygotujKopie = function (slide) {
      var copy = slide.cloneNode(true);
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("data-klon", "");
      copy.removeAttribute("id");
      // Identyfikatory muszą zostać niepowtarzalne — kotwice (#szarfy, #kolo…)
      // i powiązania aria mają wskazywać na oryginał, nie na kopię.
      Array.prototype.forEach.call(copy.querySelectorAll("[id]"), function (el) {
        el.removeAttribute("id");
      });
      Array.prototype.forEach.call(copy.querySelectorAll("[aria-controls]"), function (el) {
        el.removeAttribute("aria-controls");
      });
      Array.prototype.forEach.call(
        copy.querySelectorAll('a, button, input, select, textarea, [tabindex]'),
        function (el) { el.setAttribute("tabindex", "-1"); }
      );
      // Kopie nie są obserwowane przez IntersectionObserver, więc ich animacja
      // wejścia nigdy by nie wystartowała i zostałyby niewidoczne.
      copy.classList.add("is-in");
      Array.prototype.forEach.call(copy.querySelectorAll(".reveal"), function (el) {
        el.classList.add("is-in");
      });
      copy.removeAttribute("data-slot-gotowy");
      Array.prototype.forEach.call(copy.querySelectorAll("[data-slot-gotowy]"), function (el) {
        el.removeAttribute("data-slot-gotowy");
      });
      return copy;
    };

    var loop = count >= 3;
    if (loop) {
      var przed = document.createDocumentFragment();
      var po = document.createDocumentFragment();
      originals.forEach(function (slide) {
        przed.appendChild(przygotujKopie(slide));
        po.appendChild(przygotujKopie(slide));
      });
      track.insertBefore(przed, track.firstChild);
      track.appendChild(po);
      wyposazSloty(track);
    }

    var slides = track.children;          // żywa lista: kopie + oryginały + kopie
    var offset = loop ? count : 0;        // pierwszy oryginalny slajd
    var fizyczny = offset;

    prevBtn.hidden = false;
    nextBtn.hidden = false;

    // Ile slajdów widać naraz — liczone z układu, nie zapisane na sztywno.
    var visibleCount = function () {
      var step = slides[1].offsetLeft - slides[0].offsetLeft;
      if (step <= 0) { return 1; }
      return Math.min(count, Math.max(1, Math.round(track.clientWidth / step)));
    };

    var logiczny = function () {
      return ((fizyczny - offset) % count + count) % count;
    };

    var render = function () {
      if (!counter) { return; }
      var visible = visibleCount();
      var od = logiczny() + 1;
      if (visible > 1) {
        var doKtorego = ((logiczny() + visible - 1) % count) + 1;
        // Na styku pętli widać np. ósmą i pierwszą — zakres „8–1" czytałby się
        // jak usterka, więc w tym jednym przypadku łączymy je słowem.
        counter.textContent = (doKtorego > od ? od + "–" + doKtorego : od + " i " + doKtorego) + " z " + count;
      } else {
        counter.textContent = od + " z " + count;
      }
    };

    // Punktem odniesienia jest WNĘTRZE toru, nie jego krawędź: przy jednej
    // karcie na ekranie tor ma symetryczne wcięcie i liczenie od krawędzi
    // przyklejało kartę do lewej strony.
    var lewaWnetrza = function () {
      return track.getBoundingClientRect().left + parseFloat(getComputedStyle(track).paddingLeft || 0);
    };

    /* Skok bez animacji — używany tylko do cichego powrotu do środkowego
       kompletu. Samo `behavior: "instant"` nie wystarcza z dwóch powodów:

       1. Starsze Safari tej wartości nie zna i spada na `auto`, czyli na
          CSS-owe `scroll-behavior: smooth` z `.carousel__track` — „cichy"
          powrót stawał się widocznym przejazdem taśmy wstecz.
       2. `scroll-snap-type: x mandatory` po skoku dociąga taśmę do
          najbliższego punktu i wysyła kolejne zdarzenia przewijania,
          które znów uruchamiają wyrównanie. Stąd drganie.

       Dlatego na czas skoku wyłączamy jedno i drugie, a potem przywracamy
       wartości z arkusza (usunięcie własności inline, nie wpisanie na
       sztywno — inaczej reguła dla „ogranicz ruch" przestałaby działać). */
    var pomijamScroll = false;
    var skok = function (delta) {
      pomijamScroll = true;
      track.style.scrollSnapType = "none";
      track.style.scrollBehavior = "auto";
      track.scrollLeft += delta;
      void track.offsetWidth;   // przeliczenie, zanim snapowanie wróci
      track.style.removeProperty("scroll-snap-type");
      track.style.removeProperty("scroll-behavior");
      // Zdarzenie przewijania po naszym własnym skoku przychodzi dopiero
      // w następnej klatce — flagę zdejmujemy z zapasem.
      window.setTimeout(function () { pomijamScroll = false; }, 120);
    };

    var przesun = function (docelowy, natychmiast) {
      var delta = slides[docelowy].getBoundingClientRect().left - lewaWnetrza();
      if (!delta) { return; }
      if (natychmiast) { skok(delta); return; }
      // Bez pola "behavior" decyduje CSS — a tam reguła prefers-reduced-motion
      // przełącza przewijanie na natychmiastowe.
      track.scrollBy({ left: delta });
    };

    // Cichy powrót do środkowego kompletu. Wykonywany dopiero po zatrzymaniu
    // przewijania, żeby nie przerwać trwającej animacji.
    var wyrownaj = function () {
      if (!loop) { return; }
      var cel = offset + logiczny();
      if (cel === fizyczny) { return; }
      fizyczny = cel;
      przesun(cel, true);
    };

    var goToSlide = function (step) {
      if (loop) {
        fizyczny += step;
      } else {
        var last = Math.max(0, count - visibleCount());
        fizyczny = step > 0
          ? (fizyczny >= last ? 0 : fizyczny + 1)
          : (fizyczny <= 0 ? last : fizyczny - 1);
      }
      render();
      przesun(fizyczny, false);
    };

    // Pozycję wyznacza slajd przy LEWEJ krawędzi toru, nie ten najbliżej
    // środka. Przy dwóch widocznych slajdach środek wypada między nimi,
    // więc liczenie od środka przesuwało indeks o jeden za dużo.
    var zeScrolla = function () {
      var trackLeft = lewaWnetrza();
      var best = 0;
      var bestDistance = Infinity;
      for (var i = 0; i < slides.length; i++) {
        var distance = Math.abs(slides[i].getBoundingClientRect().left - trackLeft);
        if (distance < bestDistance) { bestDistance = distance; best = i; }
      }
      return best;
    };

    prevBtn.addEventListener("click", function () { goToSlide(-1); });
    nextBtn.addEventListener("click", function () { goToSlide(1); });

    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { event.preventDefault(); goToSlide(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); goToSlide(-1); }
    });

    // Odliczanie startuje od nowa przy każdym zdarzeniu przewijania, więc
    // cichy powrót do środkowego kompletu następuje dopiero, gdy taśma
    // naprawdę stanie. Zwykły ogranicznik częstotliwości przerywałby
    // animację w połowie i przejście szarpało.
    var timer = null;

    // Dopóki palec dotyka taśmy, nie przestawiamy niczego. Przewijanie na
    // telefonie ma bezwład: zdarzenia potrafią się urwać na dłużej niż
    // 160 ms jeszcze przed puszczeniem, a skok wykonany pod palcem to
    // najbardziej widoczny rodzaj szarpnięcia. Po puszczeniu liczymy od nowa.
    var palecNaTasmie = false;

    var zaplanujWyrownanie = function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        timer = null;
        if (palecNaTasmie) { return; }
        fizyczny = zeScrolla();
        render();
        wyrownaj();
      }, 160);
    };

    track.addEventListener("scroll", function () {
      if (pomijamScroll) { return; }
      zaplanujWyrownanie();
    }, { passive: true });

    track.addEventListener("pointerdown", function () {
      palecNaTasmie = true;
      window.clearTimeout(timer);
    }, { passive: true });

    // Puszczenie łapiemy na oknie, nie na torze: palec często wyjeżdża poza
    // taśmę i `pointerup` trafiłby w inny element. Wtedy flaga zostałaby
    // podniesiona na zawsze i pętla przestałaby się domykać.
    var puszczone = function () {
      if (!palecNaTasmie) { return; }
      palecNaTasmie = false;
      zaplanujWyrownanie();
    };
    window.addEventListener("pointerup", puszczone, { passive: true });
    window.addEventListener("pointercancel", puszczone, { passive: true });

    window.addEventListener("resize", function () { render(); }, { passive: true });

    // Start na pierwszym oryginale — bez animacji, żeby nie było widać przejazdu.
    if (loop) { przesun(offset, true); }
    render();
  };

  Array.prototype.forEach.call(document.querySelectorAll("[data-carousel]"), setupCarousel);

  /* --- Formularz kontaktowy --------------------------------------------
     Bez adresu w data-endpoint formularz otwiera program pocztowy z gotową
     wiadomością. Po wpisaniu adresu (formspree.io, formsubmit.co itp.)
     wysyła ją w tle, bez opuszczania strony.                               */
  var form = document.querySelector("[data-contact-form]");

  if (form) {
    var status = form.querySelector("[data-form-status]");
    var submitBtn = form.querySelector("[type=submit]");
    var controls = form.querySelectorAll("input, select, textarea");

    var wrapperOf = function (input) { return input.closest(".field"); };

    var messageFor = function (input) {
      var v = input.validity;
      if (v.valueMissing) {
        return input.type === "checkbox"
          ? "Zaznacz zgodę, żebyśmy mogli odpisać."
          : "To pole jest wymagane.";
      }
      if (v.typeMismatch && input.type === "email") {
        return "Podaj adres e-mail w formacie jan@przyklad.pl.";
      }
      if (v.tooShort) {
        return "Napisz co najmniej " + input.minLength + " znaków.";
      }
      return "Sprawdź, czy wpis jest poprawny.";
    };

    var setError = function (input) {
      var wrap = wrapperOf(input);
      if (!wrap) { return; }
      var slot = wrap.querySelector("[data-error]");
      wrap.setAttribute("data-invalid", "");
      input.setAttribute("aria-invalid", "true");
      if (slot) { slot.textContent = messageFor(input); }
    };

    var clearError = function (input) {
      var wrap = wrapperOf(input);
      if (!wrap) { return; }
      var slot = wrap.querySelector("[data-error]");
      wrap.removeAttribute("data-invalid");
      input.removeAttribute("aria-invalid");
      if (slot) { slot.textContent = ""; }
    };

    var say = function (kind, text) {
      status.className = "form__status is-" + kind;
      status.textContent = text;
    };

    Array.prototype.forEach.call(controls, function (input) {
      // Sprawdzamy dopiero po opuszczeniu pola — nie przy każdym znaku.
      input.addEventListener("blur", function () {
        if (!input.required && input.value === "") { clearError(input); return; }
        if (input.checkValidity()) { clearError(input); } else { setError(input); }
      });
      input.addEventListener("input", function () {
        var wrap = wrapperOf(input);
        if (wrap && wrap.hasAttribute("data-invalid") && input.checkValidity()) { clearError(input); }
      });
      input.addEventListener("change", function () {
        var wrap = wrapperOf(input);
        if (wrap && wrap.hasAttribute("data-invalid") && input.checkValidity()) { clearError(input); }
      });
    });

    var mailtoFallback = function () {
      var data = new FormData(form);
      var body = [
        "Imię i nazwisko: " + data.get("imie"),
        "E-mail: " + data.get("email"),
        "Telefon: " + (data.get("telefon") || "nie podano"),
        "Kogo dotyczą zajęcia: " + data.get("uczestnik"),
        "Interesujące zajęcia: " + data.get("zajecia"),
        "",
        data.get("wiadomosc")
      ].join("\n");

      window.location.href = "mailto:aerialparadiseclub@gmail.com"
        + "?subject=" + encodeURIComponent("Zapytanie ze strony — " + data.get("imie"))
        + "&body=" + encodeURIComponent(body);

      submitBtn.disabled = false;
      say("ok", "Otworzyliśmy Twój program pocztowy z gotową wiadomością — wystarczy ją wysłać. "
        + "Jeśli nic się nie otworzyło, napisz na aerialparadiseclub@gmail.com albo zadzwoń: 731 032 617.");
    };

    var sendToEndpoint = function (endpoint) {
      window.fetch(endpoint, {
        method: "POST",
        headers: { "Accept": "application/json" },
        body: new FormData(form)
      }).then(function (response) {
        if (!response.ok) { throw new Error("HTTP " + response.status); }
        // Sam kod 200 NIE oznacza, że wiadomość poszła. FormSubmit odpowiada
        // dwusetką również wtedy, gdy jej nie wysłał — dopóki skrzynka nie
        // potwierdzi formularza linkiem aktywacyjnym, a także przy blokadach
        // i limitach. Powód siedzi w treści odpowiedzi: `success: "false"`.
        // Bez tego sprawdzenia strona mówiła „wiadomość dotarła", kiedy nic
        // nie dotarło — a odwiedzający czekałby na odpowiedź, której nie ma.
        return response.json().catch(function () { return null; });
      }).then(function (dane) {
        if (dane && String(dane.success) === "false") {
          throw new Error(dane.message || "usługa odrzuciła wiadomość");
        }
        form.reset();
        Array.prototype.forEach.call(controls, clearError);
        submitBtn.disabled = false;
        say("ok", "Dziękujemy, wiadomość dotarła. Odpiszemy w godzinach kontaktu: pon.–pt. 16:00–21:00, sob. 10:00–13:00.");
      }).catch(function (blad) {
        // Powód trafia do konsoli — odwiedzającemu nic nie mówi, a przy
        // wdrożeniu pozwala odróżnić brak aktywacji od awarii sieci.
        if (window.console && window.console.warn) {
          window.console.warn("Formularz kontaktowy — wysyłka nieudana:", blad && blad.message);
        }
        submitBtn.disabled = false;
        say("error", "Nie udało się wysłać wiadomości. Spróbuj ponownie albo napisz na aerialparadiseclub@gmail.com.");
      });
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      Array.prototype.forEach.call(controls, function (input) {
        if (input.checkValidity()) { clearError(input); }
        else { setError(input); if (!firstInvalid) { firstInvalid = input; } }
      });

      if (firstInvalid) {
        say("error", "Popraw zaznaczone pola i spróbuj ponownie.");
        firstInvalid.focus();
        return;
      }

      submitBtn.disabled = true;
      say("busy", "Wysyłanie…");

      var endpoint = (form.getAttribute("data-endpoint") || "").trim();
      if (endpoint && window.fetch) { sendToEndpoint(endpoint); } else { mailtoFallback(); }
    });
  }


  /* --- Kadra: zdjęcie zamienia się w opis --------------------------------
     Obie strony karty są zwykłym HTML-em. Bez JS leżą jedno pod drugim
     i opis jest widoczny od razu; tutaj chowamy opis i przełączamy
     strony klikiem. Fokus wędruje za widoczną stroną, żeby nie został
     na elemencie, którego już nie widać.                                  */
  var karty = document.querySelectorAll("[data-flip]");

  Array.prototype.forEach.call(karty, function (karta) {
    var pokaz = karta.querySelector("[data-flip-pokaz]");
    var wroc = karta.querySelector("[data-flip-ukryj]");
    var strFoto = karta.querySelector(".coach__strona--foto");
    var strTekst = karta.querySelector(".coach__strona--tekst");
    if (!pokaz || !wroc || !strFoto || !strTekst) { return; }

    var ustaw = function (odsloniety, przenies) {
      strTekst.hidden = !odsloniety;
      strFoto.hidden = odsloniety;
      pokaz.setAttribute("aria-expanded", odsloniety ? "true" : "false");
      if (!przenies) { return; }
      // preventScroll: karta leży w przewijanym w bok torze — bez tego
      // ustawienie fokusu przesunęłoby karuzelę.
      if (odsloniety) { wroc.focus({ preventScroll: true }); }
      else { pokaz.focus({ preventScroll: true }); }
    };

    ustaw(false, false);

    pokaz.addEventListener("click", function () { ustaw(true, true); });
    wroc.addEventListener("click", function () { ustaw(false, true); });

    /* Esc na odsłoniętym opisie wraca do zdjęcia */
    karta.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !strTekst.hidden) {
        event.stopPropagation();
        ustaw(false, true);
      }
    });
  });

  /* --- Powiększanie zdjęć z galerii --------------------------------------
     Na każdy kafel wchodzi przezroczysty przycisk na całej jego
     powierzchni. Dzięki temu powiększenie działa nie tylko pod palcem,
     ale i z klawiatury — zwykłe `click` na <figure> byłoby niedostępne.

     Musi się wykonać PRZED dołożeniem kopii pasa, żeby kopie miały
     przyciski od razu i nie trzeba było ich dorabiać drugą ścieżką.      */
  var lupa = document.querySelector("[data-lupa]");
  var kafleGalerii = document.querySelectorAll(".strip > .photo");

  if (lupa && kafleGalerii.length && typeof lupa.showModal === "function") {
    var lupaFoto = lupa.querySelector("[data-lupa-foto]");
    var lupaZamknij = lupa.querySelector("[data-lupa-zamknij]");
    var pasDoZatrzymania = document.querySelector("[data-galeria]");
    var wracaDo = null;

    Array.prototype.forEach.call(kafleGalerii, function (kafel) {
      var foto = kafel.querySelector("img");
      var etykieta = kafel.querySelector(".photo__label");
      if (!foto) { return; }

      var przycisk = document.createElement("button");
      przycisk.type = "button";
      przycisk.className = "photo__lupa";
      przycisk.setAttribute("data-lupa-otworz", "");
      // Nazwa przycisku to opis zdjęcia — czytnik ekranu powie, co się otworzy.
      przycisk.setAttribute("aria-label", "Powiększ zdjęcie: " + (foto.getAttribute("alt") || (etykieta ? etykieta.textContent : "zdjęcie")));
      kafel.appendChild(przycisk);
    });

    var otworzLupe = function (kafel, zrodloFokusu) {
      var foto = kafel.querySelector("img");
      if (!foto) { return; }

      lupaFoto.src = foto.currentSrc || foto.src;
      lupaFoto.alt = foto.getAttribute("alt") || "";
      wracaDo = zrodloFokusu;

      // Pas jedzie dalej pod spodem, więc po zamknięciu kadr byłby gdzie
      // indziej niż w chwili kliknięcia. Zatrzymujemy go na czas oglądania.
      if (pasDoZatrzymania) { pasDoZatrzymania.setAttribute("data-zatrzymany", ""); }
      document.body.classList.add("is-locked");
      lupa.showModal();
    };

    /* Sprzątanie po zamknięciu. Wywoływane z kilku miejsc i odporne na
       powtórzenie, bo nie da się polegać na jednym zdarzeniu: `close`
       na <dialog> bywa w osadzonych przeglądarkach w ogóle nieodpalane
       (sprawdzone — własny nasłuch łapał zero zdarzeń mimo zamknięcia
       okna). Gdyby zostało samo `close`, pas galerii zostawał zatrzymany
       na zawsze, a tło zablokowane.                                      */
    var posprzataj = function () {
      document.body.classList.remove("is-locked");
      if (pasDoZatrzymania) { pasDoZatrzymania.removeAttribute("data-zatrzymany"); }
      lupaFoto.removeAttribute("src");
      // Fokus wraca na zdjęcie, z którego przyszliśmy — inaczej wylądowałby
      // na początku strony. Kopie pasa są poza tabulatorem, więc dla nich
      // po prostu nic nie robimy.
      if (wracaDo && wracaDo.isConnected && wracaDo.tabIndex >= 0) {
        wracaDo.focus({ preventScroll: true });
      }
      wracaDo = null;
    };

    var zamknijLupe = function () {
      if (lupa.open) { lupa.close(); }
      posprzataj();
    };

    document.addEventListener("click", function (event) {
      var przycisk = event.target.closest("[data-lupa-otworz]");
      if (!przycisk) { return; }
      var kafel = przycisk.closest(".photo");
      if (kafel) { otworzLupe(kafel, przycisk); }
    });

    if (lupaZamknij) { lupaZamknij.addEventListener("click", zamknijLupe); }

    // Kliknięcie w tło (poza zdjęciem) zamyka — tak działa każda galeria.
    lupa.addEventListener("click", function (event) {
      if (event.target === lupa) { zamknijLupe(); }
    });

    // Esc zamyka <dialog> sam. `cancel` leci PRZED zamknięciem, więc
    // sprzątamy w następnym takcie, kiedy okno jest już zamknięte.
    lupa.addEventListener("cancel", function () {
      window.setTimeout(posprzataj, 0);
    });

    // Trzecia ścieżka na wypadek zamknięcia okna w inny sposób.
    lupa.addEventListener("close", posprzataj);
  }

  /* --- Galeria na telefonie: dwa rzędy jadące w bok ----------------------
     Osiem kafli w pionie zajmowało cztery ekrany. Poniżej 768 px pas
     zamienia się w dwa rzędy przesuwające się powoli w prawo.

     Pętla bez szwu tą samą metodą co karuzele: dokładamy komplet kopii,
     więc `translateX(-50%)` przesuwa taśmę dokładnie o jeden zestaw i
     wraca do kadru identycznego z początkowym.

     Nie uruchamiamy tego, gdy w systemie włączone jest „ogranicz ruch" —
     wtedy zostaje zwykła siatka ze wszystkimi zdjęciami.                  */
  var pasGalerii = document.querySelector("[data-galeria]");

  if (pasGalerii) {
    var torGalerii = pasGalerii.querySelector("[data-galeria-tor]");
    var bezRuchu = window.matchMedia("(prefers-reduced-motion: reduce)");
    var kopieGotowe = false;

    // Prędkość w pikselach na sekundę — czas trwania liczymy z szerokości
    // jednego zestawu, żeby na każdym telefonie jechało tak samo wolno.
    var PIKSELI_NA_SEKUNDE = 18;

    var dolozKopie = function () {
      if (kopieGotowe) { return; }
      var oryginaly = torGalerii.querySelectorAll(":scope > .photo:not([data-klon-galerii])");
      Array.prototype.forEach.call(oryginaly, function (kafel) {
        var kopia = kafel.cloneNode(true);
        kopia.setAttribute("aria-hidden", "true");
        kopia.setAttribute("data-klon-galerii", "");
        // Kopie powstają po starcie obserwatora wejść, więc same nigdy nie
        // dostałyby klasy `is-in` i zostałyby niewidoczne.
        kopia.classList.add("is-in");
        // Przycisk powiększania w kopii da się kliknąć, ale nie wolno go
        // zostawić w kolejności tabulatora: kopia jest `aria-hidden`,
        // a fokus nie może wejść w gałąź ukrytą przed czytnikiem ekranu.
        var lupaKopii = kopia.querySelector(".photo__lupa");
        if (lupaKopii) { lupaKopii.setAttribute("tabindex", "-1"); }

        // Kopia dziedziczy `data-slot-gotowy`, przez co `wyposazSloty` by ją
        // pominęło — nasłuch wczytania nigdy by nie powstał i **ramka
        // zastępcza zostałaby narysowana na wierzchu wczytanego zdjęcia**.
        // Kasujemy więc cały stan slotu i pozwalamy rozpoznać go od nowa.
        kopia.removeAttribute("data-slot-gotowy");
        kopia.classList.remove("is-loaded", "is-empty");
        torGalerii.appendChild(kopia);
      });
      wyposazSloty(torGalerii);
      kopieGotowe = true;
    };

    var ustawTempo = function () {
      // scrollWidth to obie kopie razem; jeden zestaw to połowa.
      var zestaw = torGalerii.scrollWidth / 2;
      if (!zestaw) { return; }
      pasGalerii.style.setProperty("--tempo-galerii",
        Math.round(zestaw / PIKSELI_NA_SEKUNDE) + "s");
    };

    var wlacz = function () {
      dolozKopie();
      pasGalerii.setAttribute("data-galeria-gotowy", "");
      ustawTempo();
    };

    var wylacz = function () {
      pasGalerii.removeAttribute("data-galeria-gotowy");
      pasGalerii.removeAttribute("data-zatrzymany");
    };

    var przelicz = function () {
      if (bezRuchu.matches) { wylacz(); } else { wlacz(); }
    };

    przelicz();
    bezRuchu.addEventListener("change", przelicz);
    // Tylko przy zmianie SZEROKOŚCI. Na telefonie chowanie się paska adresu
    // wywołuje `resize` co chwilę, a przeliczanie tempa przy niezmienionej
    // szerokości nic nie wnosi.
    var ostatniaSzerokosc = window.innerWidth;
    window.addEventListener("resize", function () {
      if (window.innerWidth === ostatniaSzerokosc) { return; }
      ostatniaSzerokosc = window.innerWidth;
      if (pasGalerii.hasAttribute("data-galeria-gotowy")) { ustawTempo(); }
    }, { passive: true });
  }

  /* --- Rok w stopce ----------------------------------------------------- */
  var year = document.querySelector("[data-year]");
  if (year) { year.textContent = String(new Date().getFullYear()); }
})();
