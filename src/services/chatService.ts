import { GoogleGenerativeAI } from "@google/generative-ai";
import { log_interaction_data, request_sales_callback, generate_interior_render } from './geminiTools';

const KNOWLEDGE_BASE = `# Baza Wiedzy FAQ - MDM Energy

=== DANE KONTAKTOWE I LINKI ===
Link do Formularza: https://forms.gle/cUXUqb9E51UHf6vU8
Email Handlowca: prefab@mdmenergy.pl
Telefon Handlowca: +48 533 989 987

=== Bezpieczeństwo i Trwałość (Ogień, Czas, Akustyka) ===

=== BEZPIECZEŃSTWO I TRWAŁOŚĆ (OGIEŃ, CZAS, AKUSTYKA) ===
P: Jaka jest klasa ognioodporności (REI) domów MDM Energy? Czy dom się spali?
O: Konstrukcje MDM Energy są bezpieczne. Stosujemy sprawdzone systemy Rigips/Isover. Ściany zewnętrzne i działowe osiągają klasę od REI 30 do REI 90, a stropy REI 30 lub REI 60. Nawet przy REI 60 dom zachowuje nośność przez pełną godzinę. Drewno ulega zwęgleniu (karbonizacji), co tworzy warstwę ochronną spowalniającą ogień.

P: Jaka jest trwałość i żywotność domu szkieletowego? Czy to "poważny" dom?
O: Trwałość domu MDM Energy wynosi minimum 100 lat, co jest porównywalne z domami murowanymi. Udzielamy 30-letniej gwarancji na konstrukcję szkieletową. Używamy drewna KVH (suszone komorowo, <15% wilgotności), co eliminuje biokorozję, grzyby i szkodniki. Najstarsze domy szkieletowe w Europie stoją od 200-300 lat.

P: Czy w domu szkieletowym jest głośno? Jak wygląda izolacja akustyczna?
O: Nie, w dobrze wykonanym domu MDM Energy jest cicho. Ściany zewnętrzne tłumią hałas o 10-15 dB lepiej niż standardowe okna. Wypełnienie wełną mineralną oraz wielowarstwowa budowa ścian doskonale pochłaniają dźwięki. Stosujemy "podłogi pływające" i izolację akustyczną w stropach, aby wyeliminować dźwięki uderzeniowe (kroki).

=== FINANSE I PROCES (CENY, TERMINY, FORMALNOŚCI) ===
P: Czy MDM Energy gwarantuje stałą cenę?
O: Tak. Gwarantujemy stałą cenę przez 12 miesięcy od podpisania umowy. Chroni to klienta przed inflacją i wzrostem cen materiałów. Warunkiem jest brak istotnych zmian w projekcie wprowadzanych przez Inwestora po jego akceptacji.

P: Ile trwa budowa domu (czas realizacji)?
O: Czas formalności (pozwolenie, kredyt) zależy od urzędów. Realizacja MDM (od wejścia na halę do kluczy) trwa zazwyczaj od 2 do 4 miesięcy (2 miesiące dla domów parterowych, 4 dla domów z poddaszem). Sam montaż konstrukcji na działce trwa kilka dni.

P: Czy budownictwo prefabrykowane jest droższe od tradycyjnego?
O: Patrząc na całkowity koszt (TCO), prefabrykacja jest często korzystniejsza ekonomicznie. Oszczędzasz na krótszym czasie budowy (mniejsze koszty kredytu/wynajmu), masz niższe rachunki za ogrzewanie i stałą cenę bez niespodzianek.

=== TECHNOLOGIA I STANDARDY (ENERGOOSZCZĘDNOŚĆ, MATERIAŁY) ===
P: W jakim standardzie energooszczędności budujecie? Czy to dom pasywny?
O: Budujemy domy energooszczędne, przekraczające normy WT 2021. Współczynnik EP wynosi poniżej 45 kWh/(m2*rok), a współczynnik U ścian 0,15 - 0,09 W/(m*K). Nie są to domy pasywne w sensie certyfikatu (co jest drogie), ale oferują bardzo niskie koszty ogrzewania (np. 2000-3500 zł rocznie przy pompie ciepła).

P: Co zawiera Stan Podstawowy vs Stan Deweloperski?
O: Oferujemy dwa główne standardy. Stan Podstawowy (Surowy Zamknięty Plus) to dom gotowy z zewnątrz z ociepleniem i oknami 3-szybowymi, wewnątrz płyta GK (Inwestor robi fundament, instalacje, wylewki). Stan Deweloperski zawiera dodatkowo płytę fundamentową, pełne instalacje (elektryka, hydraulika, pompa ciepła), wylewki, szpachlowanie GK i ocieplenie dachu.

P: Czy wymagana jest płyta fundamentowa? Czy można mieć piwnicę?
O: Rekomendujemy płytę fundamentową (jest w ofercie Deweloperskiej), ale budujemy też na fundamentach tradycyjnych i piwnicach. Ważne: Prace ziemne są zawsze po stronie Inwestora (lokalne firmy są tańsze), my dostarczamy samą płytę.

P: Gdzie budujecie? Jaki jest obszar działania?
O: Budujemy w całej Polsce i Europie. Najlepsze ceny oferujemy do 300 km od naszej hali produkcyjnej ze względu na niskie koszty logistyki. Powyżej tego dystansu dochodzą koszty transportu i delegacji.

=== SZCZEGÓŁOWE DANE TECHNICZNE (REI I MATERIAŁY) ===
P: Jakie są dokładne klasy ognioodporności dla poszczególnych elementów konstrukcji?
O: Ściany konstrukcyjne zewnętrzne oraz działowe wewnętrzne osiągają klasę od REI 30 do REI 90. Stropy osiągają klasę REI 30 lub REI 60. Oznacza to zachowanie nośności, szczelności i izolacyjności przez 30 do 90 minut pożaru.

P: Czym charakteryzuje się drewno konstrukcyjne (KVH/BSH) w MDM?
O: Drewno KVH (Konstruktionsvollholz) to klasa C24, suszone komorowo (<15% wilgotności), strugane czterostronnie, naturalnie odporne na szkodniki. Drewno BSH (klejone warstwowo) stosujemy opcjonalnie w miejscach wymagających dużej wytrzymałości lub estetyki.

P: Jakie materiały izolacyjne i wykończeniowe są stosowane?
O: Wypełnienie ścian/stropów stanowi wełna mineralna (klasa A1). Elewacja to styropian grafitowy lub wełna elewacyjna. Okładziny wewnętrzne to płyty gipsowo-kartonowe lub płyta konstrukcyjna Rigips RIDURO. Stosujemy również paroizolacje i membrany paroprzepuszczalne.

=== PORÓWNANIE: PREFABRYKACJA VS TRADYCYJNE (TCO) ===
P: Jak wygląda porównanie kosztów budowy i eksploatacji?
O: W MDM cena jest stała (gwarancja 12 mc), a w tradycyjnym zmienna i narażona na inflację. Koszty ogrzewania w MDM są niższe dzięki szczelności i lepszemu U ścian. Koszty kredytu są niższe w MDM dzięki szybkiej budowie (brak opóźnień).

P: Jak wypada porównanie czasu budowy i trwałości?
O: MDM to kilka miesięcy budowy (elementy z hali), tradycyjne to rok lub dłużej. MDM daje gwarantowaną trwałość 100 lat i 30 lat gwarancji na konstrukcję, czego zazwyczaj brakuje w budownictwie tradycyjnym.

=== DANE OGÓLNE I DOKUMENTACJA ===
P: Jaki jest cel instrukcji użytkowania domu?
O: Instrukcja ma na celu przedstawienie zamawiającemu zasad prawidłowego użytkowania, serwisowania oraz obsługi domu jednorodzinnego wykonanego w technologii szkieletowej, prefabrykowanej.

P: Kogo dotyczy ta instrukcja i kto jest wykonawcą?
O: Instrukcja dotyczy inwestycji przy ul. Leśnej 17 w Konopiskach (Zamawiający: Anna i Karol Kowalscy). Wykonawcą jest Miedziński Grupa Kapitałowa Sp. z o.o.

P: Z jakimi przepisami należy użytkować budynek?
O: Budynek należy użytkować zgodnie z Prawem budowlanym, Rozporządzeniem w sprawie warunków technicznych, zasadami sztuki budowlanej oraz treścią niniejszej instrukcji (w tym zasadami przeglądów i konserwacji).

P: Jak długo należy przechowywać dokumentację domu?
O: Właściciel powinien przechowywać niezbędną dokumentację dotyczącą obiektu do końca jego użytkowania.

=== KONSTRUKCJA I ZASADY BEZPIECZEŃSTWA ===
P: Czy można dokonywać samodzielnych zmian w konstrukcji domu?
O: Nie. Zabrania się dokonywania samowolnych zmian, takich jak usuwanie ścian (nawet działowych), wycinanie elementów konstrukcyjnych czy zmiana położenia schodów bez konsultacji z projektantem. Każda ingerencja może wpłynąć negatywnie na nośność i szczelność obiektu.

P: Jakie są dopuszczalne obciążenia stropu i poddasza?
O: Maksymalne obciążenie stropu w domu piętrowym wynosi 150 kg/m2. Maksymalne obciążenie „stryszku” na poddaszu (pomiędzy słupkami wiązarów) wynosi 100 kg/m2.

P: Czy można wieszać ciężkie przedmioty na belkach konstrukcyjnych?
O: Nie należy podwieszać dużych ciężarów do belek drewnianych, zwłaszcza blisko dolnej krawędzi, bez konsultacji z projektantem, aby nie osłabić konstrukcji.

P: Jak dbać o połączenia konstrukcyjne?
O: Należy regularnie monitorować stan połączeń (szczególnie śrubowych) i w razie potrzeby dokręcać poluzowane elementy, co jest istotne przy zmiennych obciążeniach i drganiach.

=== ŚCIANY, IZOLACJA I MONTAŻ NA PŁYTACH GK ===
P: Czego nie wolno robić z folią paroprzepuszczalną w ścianach zewnętrznych?
O: Nie wolno samodzielnie wiercić otworów, przybijać gwoździ ani rozrywać folii. Jej uszkodzenie prowadzi do zawilgocenia ścian i utraty izolacji. Wszelkie montaże na ścianach zewnętrznych należy konsultować z fachowcem.

P: Jak montować lekkie przedmioty (do kilku kg) na ścianach gipsowo-kartonowych?
O: Można użyć specjalnych haczyków samoprzylepnych lub standardowych kołków rozporowych do płyt GK.

P: Jak montować średnio ciężkie przedmioty (10-15 kg) na ścianach GK?
O: Zaleca się użycie kołków rozporowych typu "Molly" lub kołków motylkowych.

P: Jak montować ciężkie przedmioty (powyżej 15 kg) na ścianach GK?
O: Należy mocować je bezpośrednio do legarów/belek za płytą lub używać specjalnych systemów (stelaże, wsporniki). W przypadku dużych obciążeń należy skontaktować się z Wykonawcą.

P: Jak użytkować ściany w pomieszczeniach mokrych (łazienka)?
O: W pomieszczeniach tych zastosowano płyty o podwyższonej odporności na wilgoć. Należy dbać o szczelną hydroizolację (szczególnie przy prysznicu/wannie) i niezwłocznie naprawiać uszkodzenia silikonu.

P: Czy można malować ściany GK dowolną farbą?
O: Należy unikać zbyt intensywnych farb lub tapet, które drastycznie zwiększają wilgotność, co może prowadzić do odkształcenia płyt.

=== FUNDAMENTY, DACH I OTOCZENIE ===
P: Jak dbać o płytę fundamentową?
O: Należy unikać ciężkich robót ziemnych i wstrząsów w pobliżu fundamentu oraz nie parkować tam ciężkich pojazdów. Zaleca się stosowanie i kontrolowanie drożności drenażu opaskowego.

P: Jak dbać o dach zimą?
O: Nie dopuszczać do zalegania grubej warstwy śniegu. Odśnieżać równomiernie, nie używając ostrych narzędzi, które mogłyby uszkodzić pokrycie.

P: Jak dbać o elementy drewniane na zewnątrz?
O: Elementy niezabezpieczone należy chronić przed UV. W przypadku zawilgocenia lub wymycia impregnatu (szczególnie NRO) należy uzupełnić powłoki ochronne.

P: Jak dbać o otoczenie domu?
O: Należy regularnie przycinać roślinność przy ścianach (aby nie uszkadzała elewacji) oraz zabezpieczać dom przed gryzoniami, które mogą niszczyć drewno.

=== INSTALACJE I OGRZEWANIE ===
P: Kto może naprawiać instalacje w domu?
O: Instalacje elektryczne, wodno-kanalizacyjne i gazowe mogą być montowane i naprawiane wyłącznie przez wyspecjalizowanych fachowców.

P: Jak często czyścić komin?
O: Komin musi być czyszczony i konserwowany co najmniej raz w roku.

P: Jakie są wymogi dla kominka/pieca?
O: Wymagana jest sprawna wentylacja (otwarta kratka/dopływ powietrza). Otoczenie kominka (ściany, podłoga) musi być wykonane z materiałów niepalnych, a elementy łatwopalne (meble, firany) muszą znajdować się w bezpiecznej odległości.

P: Co zaleca się dla ochrony przeciwpożarowej?
O: Zaleca się montaż autonomicznych domowych czujek pożarowych.

=== POZWOLENIE NA BUDOWĘ ===
P: Kiedy wymagane jest pozwolenie na budowę?
O: Pozwolenie na budowę jest decyzją administracyjną niezbędną do rozpoczęcia budowy, rozbudowy, nadbudowy, odbudowy oraz przebudowy większych obiektów, takich jak budynki wielorodzinne, biurowe czy przemysłowe. Jest również wymagane, gdy inwestycja wymaga oceny oddziaływania na środowisko lub na obszar Natura 2000, oraz przy robotach przy zabytkach.

P: Gdzie składa się wniosek o pozwolenie na budowę?
O: Wniosek składa się zazwyczaj w starostwie powiatowym lub urzędzie miasta na prawach powiatu. W szczególnych przypadkach (np. drogi krajowe, koleje, lotniska, tereny zamknięte, inwestycje morskie) wniosek składa się do urzędu wojewódzkiego.

P: Ile kosztuje wydanie pozwolenia na budowę?
O: Wysokość opłaty zależy od rodzaju inwestycji. Budownictwo mieszkaniowe jest zazwyczaj zwolnione z opłat. Dla budynków przeznaczonych na działalność gospodarczą opłata wynosi 1 zł za każdy m² powierzchni użytkowej (max. 539 zł). Opłata za studnie wynosi 20 zł, a za sieci (wod-kan, elektryczne) powyżej 1 km – 2143 zł.

P: Jak długo czeka się na decyzję o pozwoleniu na budowę?
O: Urząd ma 65 dni na wydanie decyzji od dnia złożenia wniosku. W przypadku przekroczenia tego terminu, urząd płaci karę w wysokości 500 zł za każdy dzień zwłoki.

P: Jakie dokumenty są potrzebne do wniosku o pozwolenie na budowę?
O: Należy złożyć: 3 egzemplarze projektu zagospodarowania działki i projektu architektoniczno-budowlanego, oświadczenie o prawie do dysponowania nieruchomością na cele budowlane, decyzję o warunkach zabudowy (jeśli brak planu miejscowego) oraz inne wymagane opinie i uzgodnienia (np. decyzja środowiskowa).

P: Co to jest Dziennik Budowy i kiedy się go zakłada?
O: Dziennik budowy to dokument rejestrujący przebieg robót. Należy wystąpić o jego wydanie do urzędu po otrzymaniu ostatecznej decyzji o pozwoleniu na budowę. Urząd wydaje go w ciągu 3 dni. Dziennik może być prowadzony w formie papierowej lub elektronicznej (system EDB).

P: Kiedy wygasa decyzja o pozwoleniu na budowę?
O: Decyzja wygasa, jeśli budowa nie zostanie rozpoczęta w ciągu 3 lat od dnia, w którym decyzja stała się ostateczna, lub jeśli budowa zostanie przerwana na czas dłuższy niż 3 lata.

=== ZGŁOSZENIE BUDOWY I ROBÓT (BEZ POZWOLENIA) ===
P: Jakie inwestycje wymagają tylko zgłoszenia (bez pozwolenia na budowę)?
O: Zgłoszenia wymagają m.in.: wolnostojące budynki mieszkalne jednorodzinne (o ile ich obszar oddziaływania mieści się na działce), parterowe budynki gospodarcze, garaże i wiaty do 35 m², domki rekreacyjne do 35 m² (lub do 70 m² przy określonych parametrach), oczyszczalnie ścieków do 7,50 m³/dobę, szamba do 10 m³, ogrodzenia powyżej 2,20 m.

P: Na czym polega "milcząca zgoda" przy zgłoszeniu?
O: Jeśli w ciągu 21 dni od doręczenia kompletnego zgłoszenia urząd nie wniesie sprzeciwu w drodze decyzji, uznaje się, że wyraził tzw. milczącą zgodę. Inwestor może wtedy przystąpić do robót.

P: Kiedy urząd może wnieść sprzeciw do zgłoszenia?
O: Urząd wniesie sprzeciw, jeśli zgłoszenie jest niekompletne, inwestycja wymaga pozwolenia na budowę, narusza plan miejscowy, zagraża bezpieczeństwu lub pogarsza stan środowiska/zabytków.

P: Czy zgłoszenie robót budowlanych jest płatne?
O: Usługa zgłoszenia jest zazwyczaj bezpłatna. Płatne może być jedynie pełnomocnictwo (17 zł), jeśli jest składane.

=== ZAKOŃCZENIE BUDOWY I UŻYTKOWANIE ===
P: Kiedy składa się zawiadomienie o zakończeniu budowy?
O: Zawiadomienie składa się po zakończeniu wszystkich robót, a przed przystąpieniem do użytkowania obiektu. Dotyczy to obiektów budowanych na podstawie pozwolenia na budowę oraz domów jednorodzinnych i niektórych sieci budowanych na zgłoszenie.

P: Jakie dokumenty dołącza się do zawiadomienia o zakończeniu budowy?
O: Należy dołączyć m.in.: oryginał dziennika budowy, oświadczenie kierownika budowy o zgodności wykonania z projektem i uporządkowaniu terenu, protokoły badań i sprawdzeń (przyłączy, kominów, instalacji), inwentaryzację geodezyjną powykonawczą oraz (jeśli wymagane) potwierdzenie odbioru przez Sanepid i Straż Pożarną.

P: Co grozi za użytkowanie budynku bez zawiadomienia?
O: Grozi za to kara finansowa z tytułu nielegalnego użytkowania obiektu. Kara jest obliczana jako iloczyn stawki 500 zł, współczynnika kategorii obiektu i współczynnika wielkości obiektu (np. dla magazynu może to być 50 000 zł).

P: Ile czasu ma nadzór budowlany na reakcję po zgłoszeniu zakończenia budowy?
O: Nadzór budowlany ma 14 dni na wniesienie sprzeciwu. Jeśli tego nie zrobi, można legalnie rozpocząć użytkowanie obiektu (milcząca zgoda). Można też wystąpić o zaświadczenie o braku podstaw do sprzeciwu przed upływem tego terminu.

P: Kiedy zamiast zawiadomienia potrzebne jest pozwolenie na użytkowanie?
O: Pozwolenie na użytkowanie jest konieczne, gdy inwestor chce przystąpić do użytkowania obiektu przed wykonaniem wszystkich robót (odbiór częściowy) lub gdy wynika to wprost z przepisów dla danej kategorii obiektu.

=== PRACE NIEWYMAGAJĄCE ANI POZWOLENIA, ANI ZGŁOSZENIA ===
P: Jakie prace można wykonać bez żadnych formalności (bez pozwolenia i bez zgłoszenia)?
O: Bez formalności można budować m.in.: wiaty do 50 m² na działce z budynkiem mieszkalnym, altany do 35 m², ogrodzenia do 2,20 m, baseny i oczka wodne do 50 m², obiekty małej architektury (np. w ogrodzie), a także instalować pompy ciepła, panele fotowoltaiczne do 50 kW oraz klimatyzację.

P: Czy remont wymaga zgłoszenia?
O: Remont obiektów budowlanych (z wyłączeniem budowli wymagających pozwolenia na budowę) zazwyczaj nie wymaga zgłoszenia. Wyjątkiem są remonty budynków wymagających pozwolenia na budowę, jeśli dotyczą przegród zewnętrznych lub elementów konstrukcyjnych.

=== PROCEDURA UPROSZCZONA - DOM DO 70 M2 ===
P: Jakich domów dotyczy procedura uproszczona (zgłoszenie do 70 m2)?
O: Procedura dotyczy wolnostojących, maksymalnie dwukondygnacyjnych budynków mieszkalnych jednorodzinnych o powierzchni zabudowy do 70 m2. Obszar oddziaływania domu musi mieścić się w całości na działce, a inwestycja musi być realizowana w celu zaspokojenia własnych potrzeb mieszkaniowych inwestora.

P: Co zrobić, jeśli dla działki nie ma Miejscowego Planu Zagospodarowania Przestrzennego (MPZP)?
O: Należy złożyć wniosek o wydanie Decyzji o Warunkach Zabudowy (WZ). W procedurze uproszczonej dla domów do 70 m2 urząd ma tylko 21 dni na wydanie tej decyzji.

P: Jakie dokumenty są potrzebne do zgłoszenia domu do 70 m2?
O: Należy przygotować:
1. Formularz zgłoszenia (PB-2a).
2. Projekt budowlany w 3 egzemplarzach (projekt zagospodarowania działki + architektoniczno-budowlany).
3. Oświadczenie o prawie do dysponowania nieruchomością (PB-5).
4. Oświadczenie, że budowa jest realizowana w celu zaspokojenia własnych potrzeb mieszkaniowych (pod rygorem odpowiedzialności karnej).
5. Opcjonalnie: Oświadczenie o przejęciu odpowiedzialności za kierowanie budową (w przypadku rezygnacji z Kierownika Budowy).
6. Decyzję WZ (jeśli brak MPZP).

P: Czy muszę zatrudniać Kierownika Budowy przy domu do 70 m2?
O: W trybie uproszczonym nie ma obowiązku zatrudniania Kierownika Budowy, jednak wiąże się to z ryzykiem. Jeśli zrezygnujesz z Kierownika, musisz złożyć oświadczenie, że przejmujesz pełną odpowiedzialność za kierowanie budową. Eksperci zalecają jednak jego zatrudnienie, zwłaszcza przy technologiach energooszczędnych i szkieletowych, gdzie liczą się detale techniczne.

P: Gdzie i jak złożyć zgłoszenie?
O: Zgłoszenie składa się do Starosty lub Prezydenta Miasta na prawach powiatu. Można to zrobić tradycyjnie w urzędzie lub elektronicznie przez serwis e-Budownictwo (wymagany Profil Zaufany).

P: Kiedy mogę rozpocząć budowę po zgłoszeniu (w trybie do 70 m2)?
O: Budowę można rozpocząć zaraz po doręczeniu zgłoszenia organowi. W tej procedurze organ nie może wnieść sprzeciwu (o ile zgłoszenie spełnia warunki ustawy). Nie trzeba czekać ustawowych 21 dni, choć wielu inwestorów robi to dla pewności.

P: Kogo muszę powiadomić przed startem robót?
O: Przed rozpoczęciem prac należy zawiadomić Powiatowego Inspektora Nadzoru Budowlanego (PINB) o zamierzonym terminie rozpoczęcia robót.

P: Czy przy domu do 70 m2 potrzebny jest geodeta?
O: Tak, nawet w trybie uproszczonym wymagana jest pełna obsługa geodezyjna: wytyczenie obiektu w terenie przed startem prac oraz geodezyjna inwentaryzacja powykonawcza po zakończeniu budowy.

P: Jakie formalności obowiązują po zakończeniu budowy?
O: Należy złożyć do PINB zawiadomienie o zakończeniu budowy (PB-14), geodezyjną inwentaryzację powykonawczą oraz oświadczenie inwestora o zgodności wykonania z projektem i przepisami (jeśli nie było Kierownika Budowy).

=== PERSPEKTYWA TECHNOLOGII SZKIELETOWEJ (MDM ENERGY) ===
P: Dlaczego procedura do 70 m2 jest korzystna dla domów szkieletowych/prefabrykowanych?
O: Proces budowy prefabrykatu jest błyskawiczny (montaż w kilka dni), co idealnie współgra z uproszczonymi formalnościami (brak czekania na uprawomocnienie). Często stosowana w tej technologii płyta fundamentowa również przyspiesza start budowy.

P: Na co zwrócić uwagę wybierając projekt do 70 m2 w technologii szkieletowej?
O: Należy upewnić się, że projekt faktycznie nie przekracza 70 m2 powierzchni zabudowy i ma maksymalnie dwie kondygnacje. Warto korzystać z gotowych projektów ("typówek") dopasowanych do wymogów ustawy i technologii prefabrykacji.

=== POZWOLENIE NA BUDOWĘ - KIEDY STOSOWAĆ? ===
P: Kiedy należy wybrać tryb pozwolenia na budowę zamiast zgłoszenia?
O: Pozwolenie na budowę jest wymagane, gdy dom ma powyżej 70 m² powierzchni zabudowy, jego obszar oddziaływania wykracza poza działkę (np. rzuca cień na sąsiada) lub wymaga specjalistycznych warunków. Jest to również dobra opcja dla osób szukających "maksymalnego spokoju ducha", gdyż procedura jest bardziej ustrukturyzowana.

=== KROK 1: PLANOWANIE I WSTĘPNE FORMALNOŚCI ===
P: Co muszę sprawdzić przed rozpoczęciem projektowania?
O: Należy sprawdzić Miejscowy Plan Zagospodarowania Przestrzennego (MPZP). Jeśli go nie ma, trzeba uzyskać Decyzję o Warunkach Zabudowy (WZ). Jest to niezbędne, zanim projektant rozpocznie pracę.

P: Czy potrzebna jest mapa od geodety?
O: Tak, potrzebna jest aktualna mapa do celów projektowych sporządzona przez uprawnionego geodetę. Stanowi ona podstawę dla architekta do stworzenia projektu zagospodarowania działki.

P: Co z mediami (woda, prąd, gaz)?
O: Należy uzyskać warunki przyłączenia mediów od odpowiednich dostawców. Dokumenty te są potrzebne do kompletnego projektu budowlanego.

=== KROK 2 I 3: PROJEKT I WNIOSEK ===
P: Z czego składa się Projekt Budowlany?
O: Projekt budowlany składa się z trzech części:
1. Projekt Zagospodarowania Działki (PZT) – usytuowanie domu, wjazd, media.
2. Projekt Architektoniczno-Budowlany – szczegóły techniczne, konstrukcja, materiały (w tym specyfika szkieletu prefabrykowanego), rzuty, elewacje.
3. Projekt Techniczny – szczegółowe rozwiązania konstrukcyjne i instalacyjne (np. projekt płyty fundamentowej, instalacje grzewcze/rekuperacja).

P: Gdzie składa się wniosek o pozwolenie na budowę?
O: Wniosek składa się do Starosty lub Prezydenta Miasta.

P: Jakie dokumenty składa się wraz z wnioskiem o pozwolenie na budowę?
O: Należy złożyć:
1. Wniosek o Pozwolenie na Budowę (formularz PB-1).
2. 4 egzemplarze Projektu Budowlanego (3 dla urzędu, 1 dla inwestora).
3. Oświadczenie o Prawie do Dysponowania Nieruchomością (PB-5).
4. Zaświadczenia/oświadczenia projektantów o zgodności projektu z przepisami.
5. Kopię decyzji WZ (jeśli dotyczy).

=== KROK 4: OCZEKIWANIE NA DECYZJĘ ===
P: Ile czasu ma urząd na wydanie decyzji o pozwoleniu na budowę?
O: Urząd ma do 65 dni na wydanie decyzji, licząc od dnia złożenia kompletnego wniosku. Jeśli dokumenty są niekompletne, wezwanie do ich uzupełnienia wstrzymuje ten termin.

P: Kiedy decyzja staje się ostateczna?
O: Decyzja staje się ostateczna po 14 dniach od wydania, jeśli żadna ze stron postępowania nie wniesie odwołania.

=== KROK 5: ROZPOCZĘCIE ROBÓT ===
P: Czy przy pozwoleniu na budowę potrzebny jest Kierownik Budowy?
O: Tak, w trybie pozwolenia na budowę zatrudnienie uprawnionego Kierownika Budowy jest obowiązkowe.

P: Jakie formalności trzeba dopełnić przed wbiciem łopaty?
O: Należy:
1. Ustanowić Kierownika Budowy.
2. Uzyskać Dziennik Budowy.
3. Zgłosić zawiadomienie o zamiarze rozpoczęcia robót do Powiatowego Inspektora Nadzoru Budowlanego (PINB) na minimum 7 dni przed startem prac (wraz z oświadczeniem Kierownika Budowy).
4. Zlecić geodecie wytyczenie obiektu w terenie.

=== OPINIA EKSPERTA: TECHNOLOGIA SZKIELETOWA ===
P: Jak technologia prefabrykowana wpływa na czas budowy mimo długich formalności?
O: Choć proces administracyjny trwa 3-6 miesięcy, technologia prefabrykowana pozwala wykorzystać ten czas. W trakcie oczekiwania na decyzję urzędu, w fabryce mogą być produkowane panele ścienne. Po uzyskaniu zgody i wylaniu płyty fundamentowej, gotowe elementy montuje się na placu budowy w ciągu kilku dni, a nie miesięcy.

=== LINIA MDM OPTIMAL - KONCEPCJA I KORZYŚCI ===
P: Dlaczego warto wybrać projekt typowy z linii MDM Optimal?
O: Wybór ten to mądra strategia finansowa zapewniająca spokój ducha. Domy te są zaprojektowane tak, aby rosnąć razem z rodziną – pozwalają na etapowanie inwestycji (np. późniejszą adaptację poddasza), co chroni budżet i zapobiega zamrażaniu kapitału. To rozwiązanie zoptymalizowane pod kątem szybkiej budowy i niskich kosztów.

P: Dla kogo przeznaczone są domy MDM Optimal?
O: Jest to idealne rozwiązanie dla młodych rodzin oraz osób ceniących racjonalne planowanie, które szukają idealnego startu z opcją przyszłej rozbudowy.

P: Jakie są główne korzyści inwestorskie przy wyborze tej linii?
O:
1. Gwarancja Ceny: Stała cena przez 12 miesięcy (ochrona przed inflacją).
2. Szybka Realizacja: Montaż konstrukcji w kilka dni, stan deweloperski w 2–4 miesiące.
3. Energooszczędność: Domy spełniają z nawiązką normy WT 2021, co gwarantuje niskie koszty eksploatacji.

=== DOSTĘPNE MODELE I ICH CHARAKTERYSTYKA ===
P: Czym charakteryzuje się model MDM 58?
O: To model idealny dla singli, par lub na "oszczędny start".
- Powierzchnia parteru: 58 m².
- Układ: 2 pokoje, salon z aneksem, łazienka, wiatrołap.
- Potencjał: Możliwość adaptacji poddasza o powierzchni 32 m² (np. na 2 pokoje i toaletę).
- Opcje zmian: Możliwość wydzielenia praktycznej spiżarni kosztem części przestrzeni parteru.

P: Czym charakteryzuje się model MDM 74?
O: Model dedykowany dla rodzin 2+1 ("Potrzeba Przestrzeni").
- Powierzchnia parteru: 74 m².
- Układ: 3 pokoje, pomieszczenie techniczne, łazienka, wiatrołap.
- Potencjał: Możliwość adaptacji poddasza o powierzchni 42 m².
- Opcje zmian: Pomieszczenie techniczne można zaadaptować na dodatkową toaletę. Istnieje też opcja rezygnacji z jednego pokoju na rzecz powiększenia salonu.

P: Czym charakteryzuje się model MDM 82?
O: Model zapewniający "Maksymalny Komfort Parteru", idealny dla rodzin 2+2.
- Powierzchnia parteru: 82 m².
- Układ: 3 pokoje – w tym sypialnia główna z prywatną garderobą i dodatkową łazienką (standard komfortu).
- Potencjał: Możliwość adaptacji poddasza o powierzchni 42 m².
- Opcje zmian: Podobnie jak w MDM 74, można zrezygnować z jednego pokoju, aby uzyskać imponujący, przestronny salon.

=== ELASTYCZNOŚĆ I ROZBUDOWA ===
P: Na czym polega koncepcja "domu, który rośnie z rodziną"?
O: Polega ona na możliwości stopniowania inwestycji. Nie musisz od razu wykańczać całego domu. Możesz zamieszkać na parterze, a poddasze (32 m² lub 42 m² w zależności od modelu) zagospodarować we własnym zakresie w późniejszym terminie, gdy powiększy się rodzina lub budżet na to pozwoli.

P: Jakie zmiany układu pomieszczeń są możliwe w projektach typowych MDM Optimal?
O: Projekty oferują dużą elastyczność:
1. Adaptacja poddasza: Dodatkowe pokoje i łazienka na górze.
2. Zmiany funkcji pomieszczeń: Np. zamiana pomieszczenia technicznego na toaletę (w MDM 74).
3. Zmiana przestrzeni dziennej: Możliwość rezygnacji z jednego pokoju na parterze, aby powiększyć salon.
4. Przechowywanie: Opcja wydzielenia spiżarni w mniejszych modelach.

=== CENNIK DOMÓW MDM ENERGY (LISTOPAD 2025) ===
P: Co zawiera Zestaw Podstawowy (Stan Surowy Zamknięty) w ofercie MDM Energy?
O: Zestaw Podstawowy (ceny brutto 8%) obejmuje:
- Ściany szkieletowe z drewna klejonego KVH C24 ocieplone, wykończone od wewnątrz konstrukcyjną płytą GK.
- Elewację na styropianie grafitowym gr. 12 cm zakończoną klejem z siatką.
- Okna PCV białe 3-szybowe (współczynnik przenikania ciepła Uw ≤ 0,9 W/(m²·K)) z ciepłym montażem w zakładzie produkcyjnym oraz parapetami zewnętrznymi (aluminium lub blacha powlekana).
- Drzwi wejściowe.
- Ściany montażowe ze stelażami podtynkowymi WC.
- Więźbę dachową z wiązarów.
- Pokrycie dachu blachodachówką, podsufitkę stalową, orynnowanie PVC.
- Transport na plac budowy, usługi dźwigu i rusztowania do montażu.

P: Co zawiera dopłata za Stan Deweloperski?
O: Dopłata za Stan Deweloperski (ceny brutto 8%) obejmuje dodatkowo:
- Izolację termiczną stropu (dolny pas wiązarów dachowych) wełną mineralną 200 mm + 100 mm.
- Schody strychowe, sufit podwieszany z płyt GK.
- Wykończenie elewacji: tynk akrylowy w kolorze białym plus wstawki antracytowe, tynk mozaikowy.
- Posadzkę podłogową z ociepleniem ze styropianu 120 mm.
- Instalację elektryczną: okablowanie, puszki podtynkowe i rozdzielnia (bez białego montażu).
- Instalację wod-kan (bez białego montażu).
- Instalację centralnego ogrzewania: elektryczna (folia grzewcza), zbiornik c.w.u.
- Wentylację grawitacyjną (kominki dachowe).

P: Co obejmuje dopłata za Płytę Fundamentową?
O: Dopłata obejmuje wykonanie płyty fundamentowej o grubości 200 mm z instalacją podposadzkową i przepustami, bez prac ziemnych (ceny brutto 8%).

=== CENY POSZCZEGÓLNYCH MODELI ===
P: Jaka jest cena modelu MDM Optimal 58?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 58,0 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 207 380 zł | Stan Deweloperski (Razem): 327 060 zł | Fundament: 32 240 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 212 000 zł | Stan Deweloperski (Razem): 334 720 zł | Fundament: 33 240 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 222 190 zł | Stan Deweloperski (Razem): 348 430 zł | Fundament: 34 900 zł.

P: Jaka jest cena modelu MDM Optimal 74?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 74,0 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 243 090 zł | Stan Deweloperski (Razem): 384 830 zł | Fundament: 40 740 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 248 440 zł | Stan Deweloperski (Razem): 393 920 zł | Fundament: 42 020 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 260 360 zł | Stan Deweloperski (Razem): 409 860 zł | Fundament: 44 120 zł.

P: Jaka jest cena modelu MDM Optimal 82?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 82,0 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 273 330 zł | Stan Deweloperski (Razem): 426 380 zł | Fundament: 45 420 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 279 280 zł | Stan Deweloperski (Razem): 436 400 zł | Fundament: 46 840 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 292 420 zł | Stan Deweloperski (Razem): 453 730 zł | Fundament: 49 180 zł.

P: Jaka jest cena modelu MDM Optimal Z273A?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 106,5 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 323 140 zł | Stan Deweloperski (Razem): 524 190 zł | Fundament: 58 140 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 331 180 zł | Stan Deweloperski (Razem): 537 800 zł | Fundament: 59 960 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 350 260 zł | Stan Deweloperski (Razem): 561 580 zł | Fundament: 62 960 zł.

P: Jaka jest cena modelu MDM 58 BIS?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 93,5 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 270 860 zł | Stan Deweloperski (Razem): 436 570 zł | Fundament: 32 240 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 276 690 zł | Stan Deweloperski (Razem): 446 520 zł | Fundament: 33 240 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 291 650 zł | Stan Deweloperski (Razem): 465 050 zł | Fundament: 34 900 zł.

P: Jaka jest cena modelu MDM STODOŁA 77?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 92,0 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 309 000 zł | Stan Deweloperski (Razem): 462 370 zł | Fundament: 32 240 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 314 890 zł | Stan Deweloperski (Razem): 472 290 zł | Fundament: 33 240 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 330 030 zł | Stan Deweloperski (Razem): 490 930 zł | Fundament: 34 900 zł.

P: Jaka jest cena modelu MDM 70?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 73,3 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 245 300 zł | Stan Deweloperski (Razem): 395 090 zł | Fundament: 41 450 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 251 180 zł | Stan Deweloperski (Razem): 405 100 zł | Fundament: 42 750 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 265 910 zł | Stan Deweloperski (Razem): 423 680 zł | Fundament: 44 800 zł.

P: Jaka jest cena modelu MDM 80?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 80,5 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 263 240 zł | Stan Deweloperski (Razem): 424 330 zł | Fundament: 45 290 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 269 540 zł | Stan Deweloperski (Razem): 435 080 zł | Fundament: 46 710 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 285 110 zł | Stan Deweloperski (Razem): 454 670 zł | Fundament: 49 000 zł.

P: Jaka jest cena modelu MDM 90?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 93,5 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 286 330 zł | Stan Deweloperski (Razem): 472 660 zł | Fundament: 52 450 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 292 990 zł | Stan Deweloperski (Razem): 484 350 zł | Fundament: 54 090 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 309 850 zł | Stan Deweloperski (Razem): 505 740 zł | Fundament: 56 800 zł.

P: Jaka jest cena modelu MDM 110?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 113,0 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 337 820 zł | Stan Deweloperski (Razem): 553 510 zł | Fundament: 62 790 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 345 680 zł | Stan Deweloperski (Razem): 567 280 zł | Fundament: 64 750 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 365 100 zł | Stan Deweloperski (Razem): 591 780 zł | Fundament: 67 990 zł.

P: Jaka jest cena modelu DM1?
O: Cena zależy od lokalizacji montażu. Powierzchnia podłóg: 136,0 m².
- Lokalizacja do 30 km od zakładu: Zestaw Podstawowy: 405 630 zł | Stan Deweloperski (Razem): 597 420 zł | Fundament: 38 910 zł.
- Lokalizacja do 100 km od zakładu: Zestaw Podstawowy: 414 480 zł | Stan Deweloperski (Razem): 610 580 zł | Fundament: 40 130 zł.
- Lokalizacja do 300 km od zakładu: Zestaw Podstawowy: 434 290 zł | Stan Deweloperski (Razem): 634 740 zł | Fundament: 42 140 zł.

=== DODATKOWE DOPŁATY I OPCJE (CENNIK 2025) ===

P: Ile wynosi dopłata za zmianę konstrukcji ścian na dyfuzyjnie otwartą?
O: Opcja obejmuje aktywną paroizolację oraz elewację z wełny skalnej na płycie gipsowo-włóknowej. Ceny brutto (8%):
- MDM STODOŁA 77: 8 280 zł
- MDM Optimal 58: 13 200 zł
- MDM Optimal 74: 14 510 zł
- MDM Optimal Z273A: 14 700 zł
- MDM 70 / 80: ok. 15 360 - 15 390 zł
- MDM Optimal 82: 15 450 zł
- MDM 58 BIS: 15 900 zł
- MDM 90: 18 040 zł
- MDM 110: 20 680 zł
- DM1: 24 140 zł

P: Ile kosztuje zmiana pokrycia dachowego na dachówkę betonową?
O: Cena zależy od modelu i odległości montażu (30km / 100km / 300km). Przykładowe ceny brutto (8%):
- MDM Optimal 58: 7 430 zł / 7 890 zł / 8 450 zł
- MDM Optimal 74: 8 940 zł / 9 470 zł / 9 990 zł
- MDM Optimal 82: 9 780 zł / 10 340 zł / 10 840 zł
- MDM Optimal Z273A: 15 850 zł / 16 920 zł / 18 120 zł
- MDM 70: 8 050 zł / 8 550 zł / 9 090 zł
- MDM 80: 7 040 zł / 7 390 zł / 7 850 zł
- MDM 90: 10 080 zł / 10 700 zł / 11 330 zł
- MDM 110: 11 650 zł / 12 350 zł / 13 100 zł
- DM1: 8 180 zł / 8 870 zł / 9 630 zł
(Opcja niedostępna dla: MDM 58 BIS, MDM STODOŁA 77)

P: Ile kosztują rolety fasadowe (elektryczne)?
O: Rolety fasadowe z napędem elektrycznym i sterowaniem z klawisza. Ceny brutto (8%):
- MDM Optimal 58: 9 430 zł
- MDM 70: 11 680 zł
- MDM Optimal 74: 13 000 zł
- MDM 58 BIS: 13 610 zł
- MDM Optimal 82: 14 530 zł
- MDM STODOŁA 77: 14 780 zł
- MDM 80 / 90: ok. 15 500 zł
- MDM 110: 16 480 zł
- MDM Optimal Z273A: 19 700 zł
- DM1: 27 770 zł

P: Ile kosztują żaluzje fasadowe (elektryczne)?
O: Żaluzje fasadowe z napędem elektrycznym i sterowaniem z klawisza. Ceny brutto (8%):
- MDM Optimal 58: 10 710 zł
- MDM 70: 13 060 zł
- MDM Optimal 74: 14 720 zł
- MDM 58 BIS: 15 480 zł
- MDM 90: 16 520 zł
- MDM Optimal 82: 16 580 zł
- MDM 80: 16 880 zł
- MDM STODOŁA 77: 17 100 zł
- MDM 110: 18 430 zł
- MDM Optimal Z273A: 21 100 zł
- DM1: 30 800 zł

P: Ile wynosi dopłata za pompę ciepła z rekuperacją?
O: Zamiana CO na wentylacyjną pompę ciepła z ogrzewaniem podłogowym i rekuperacją. Ceny brutto (8%) zależą nieznacznie od lokalizacji (ok. 1000 zł różnicy między strefami). Średnie ceny:
- MDM 80: ok. 38 000 zł
- MDM 70 / MDM 58 BIS: ok. 38 500 - 39 000 zł
- MDM Optimal 58 / 110 / Stodoła 77: ok. 40 000 zł
- MDM Optimal Z273A / MDM 90: ok. 40 500 - 41 500 zł
- MDM Optimal 74: ok. 41 000 zł
- MDM Optimal 82: ok. 41 500 zł
- DM1: ok. 42 500 zł

P: Ile kosztują okna kolorowe obustronnie?
O: Dopłata brutto (8%):
- MDM Optimal 58: 1 700 zł
- MDM 70: 2 100 zł
- MDM 90: 2 270 zł
- MDM Optimal 74: 2 300 zł
- MDM 58 BIS: 2 350 zł
- MDM Optimal 82: 2 410 zł
- MDM 110: 2 460 zł
- MDM 80: 2 640 zł
- MDM Optimal Z273A: 3 100 zł
- MDM STODOŁA 77: 3 200 zł
- DM1: 4 150 zł

P: Ile kosztuje spoinowanie i szpachlowanie (Q3)?
O: Dopłata za spoinowanie i szpachlowanie połączeń płyt GK (standard Q3) i jednokrotne malowanie na biało. Ceny brutto (8%):
- MDM Optimal 58: 22 290 zł
- MDM Optimal 74: 25 530 zł
- MDM 70: 30 530 zł
- MDM 58 BIS: 30 790 zł
- MDM 80: 31 960 zł
- MDM 90: 33 960 zł
- MDM Optimal 82: 34 930 zł
- MDM Optimal Z273A: 36 140 zł
- MDM STODOŁA 77: 36 470 zł
- MDM 110: 41 540 zł
- DM1: 50 530 zł

P: Ile kosztuje adaptacja poddasza?
O: Adaptacja obejmuje wzmocnione wiązary, podest, ocieplenie, wykończenie ścian/sufitu, okna/drzwi balkonowe, schody drewniane, stelaż WC i instalacje. Opcja dostępna dla wybranych modeli. Ceny brutto (8%) zależne od lokalizacji (30km / 100km / 300km):
- MDM Optimal 58: 87 400 zł / 89 240 zł / 91 620 zł
- MDM Optimal 74: 101 180 zł / 103 440 zł / 106 350 zł
- MDM Optimal 82: 134 130 zł / 137 770 zł / 144 390 zł

P: Ile kosztuje zadaszenie na 2 samochody (dach płaski)?
O: Zadaszenie 5x5,5m. Ceny brutto (8%) zależne od lokalizacji (30km / 100km / 300km):
- MDM Optimal 58 / 74 / 82 / 58 BIS: 26 770 zł / 27 290 zł / 27 820 zł

P: Ile wynosi redukcja ceny za sufity napinane?
O: Zamiana sufitów GK na sufity napinane zmniejsza cenę domu. Kwota redukcji brutto (8%) zależy od modelu i lokalizacji:
- MDM Optimal 58 / 74 / 70: ok. -1 000 zł do -2 800 zł
- MDM Optimal 82 / 80: ok. -1 400 zł do -3 400 zł
- MDM 90 / 110 / Z273A / DM1: ok. -1 700 zł do -4 200 zł

P: Ile kosztuje pergola drewniana?
O: Pergola drewniana pomalowana 2x5 m dostępna jest dla modelu MDM STODOŁA 77.
- Cena (30km / 100km / 300km): 9 450 zł / 9 870 zł / 10 360 zł

P: Ile kosztuje komin systemowy do kominka?
O: Opcja wyceniana indywidualnie (brak stałej ceny w cenniku).

=== SZCZEGÓŁY ADAPTACJI PODDASZA ===

P: Co wchodzi w zakres adaptacji poddasza?
O: Opcja adaptacji poddasza (dostępna dla wybranych modeli, np. MDM Optimal) obejmuje kompleksowe przygotowanie górnej kondygnacji do zamieszkania. W skład pakietu wchodzą:
- Konstrukcja: Wzmocnione wiązary dachowe oraz wykonanie podestu na poddaszu.
- Izolacja i wykończenie: Ocieplenie i wykończenie ścian oraz sufitu poddasza użytkowego (w konstrukcji wiązarowej), a także ocieplenie i wykończenie ścian szczytowych. Ściany wewnętrzne są wykończone płytą GK.
- Stolarka: 2 sztuki drzwi balkonowych (1,6x2,05 m) z barierkami oraz 1 drewniane okno połaciowe (74x118 cm).
- Komunikacja: Schody z drewna iglastego (montowane w zamian za standardowe schody strychowe).
- Instalacje i sanitariaty: Stelaż podtynkowy WC, 3 dodatkowe punkty wod-kan oraz zwiększona powierzchnia instalacji grzewczej.
- Inne: Dodatkowa powierzchnia uwzględniona w pracach wykończeniowych (szpachlowanie).
`;

export const SYSTEM_PROMPT = `
Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy.
Twoja wiedza pochodzi WYŁĄCZNIE z załączonego pliku tekstowego [KNOWLEDGE_BASE].

ZASADY ODPOWIADANIA:
1. **ZAKAZ WIEDZY ZEWNĘTRZNEJ:** Odpowiadasz WYŁĄCZNIE na podstawie podanej Bazy Wiedzy. Jeśli w tekście nie ma nazwy producenta płyty (np. Fermacell), NIE WOLNO Ci jej wymyślać. Używaj tylko nazw z tekstu (np. płyta GK).
2. **Ceny:** Podawaj ceny dokładnie tak, jak są w tekście. Zawsze dodawaj, że są orientacyjne. Przykład: "Cena wynosi ok. 393 920 PLN (cena orientacyjna)".
3. **Linki:** ZAWSZE używaj formatu Markdown:
   - [Formularz Wyceny MDM](https://forms.gle/cUXUqb9E51UHf6vU8)
   - [Napisz e-mail](mailto:prefab@mdmenergy.pl)
4. **Brak wiedzy:** Jeśli w pliku nie ma odpowiedzi, nie zmyślaj. Napisz: 'To wymaga konsultacji z ekspertem. Proszę o kontakt: [Napisz e-mail](mailto:prefab@mdmenergy.pl)'.
5. **Styl:** Jesteś Wirtualnym Pomocnikiem Klienta MDM Energy. Bądź konkretny.
`;

export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    content: string;
}

/**
 * Uses Gemini API to process the message with the hardcoded knowledge base.
 */
export const processUserMessage = async (userMessage: string): Promise<string> => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY not found in environment variables");
            return "Przepraszam, wystąpił błąd konfiguracji (brak klucza API). Proszę o kontakt telefoniczny.";
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

        log_interaction_data('GEMINI_API_CALL', `Sending query to Gemini: "${userMessage}"`);

        // Construct the full prompt
        const fullPrompt = `
${SYSTEM_PROMPT}

[KNOWLEDGE_BASE]:
${KNOWLEDGE_BASE}

USER QUERY: ${userMessage}
`;

        const result = await model.generateContent(fullPrompt);
        const response = result.response;
        const text = response.text();

        log_interaction_data('GEMINI_API_SUCCESS', `Received response from Gemini`);

        // Check for visualization intent (simple heuristic to keep the tool working)
        if (userMessage.toLowerCase().includes('wizualizacj') || userMessage.toLowerCase().includes('wygląda')) {
            log_interaction_data('VISUALIZATION_GENERATED', `User asked for visualization`);
            return text + "\n\n" + generate_interior_render('salon', 'nowoczesny');
        }

        return text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        log_interaction_data('GEMINI_API_ERROR', `Error: ${error}`);
        return "Przepraszam, wystąpił chwilowy problem z moim mózgiem. Proszę spróbuj ponownie za chwilę lub skontaktuj się z nami mailowo.";
    }
};