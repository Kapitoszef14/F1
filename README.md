# Gridline — lokalny turniej F1

Lokalny panel wyników i zarządzania sezonem inspirowany aplikacjami live-score.

## Uruchomienie

```bash
python3 -m http.server 4173
```

Następnie otwórz http://localhost:4173.

## Funkcje

- przegląd sezonu z liderem, statystykami i następnym wyścigiem,
- kalendarz rund z rozwijanymi wynikami kierowców,
- dopisywanie do wyścigu kierowcy, zespołu, czasu / straty i punktów,
- dodawanie własnych zawodników z poziomu klasyfikacji,
- automatyczne odliczanie do najbliższego przyszłego wyścigu co sekundę,
- klasyfikacja kierowców i zespołów,
- panel administratora do dodawania wyścigów,
- zapis nowych danych lokalnie w przeglądarce przez `localStorage`.