# PROYECTO-BARBIERI-CIBERSEGURA

## API Endpoints

- `POST /api/responses` guarda las respuestas de los jugadores recibiendo `player_id`, `question_id` e `is_correct`.
- `GET /api/report/top-players` devuelve el ranking de jugadores por respuestas correctas.
- `GET /api/report/questions` entrega estadísticas de respuestas por pregunta.

## Ejecución

1. En el frontend:

   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. En el backend:

   ```bash
   cd ../backend
   npm install
   npm start
   ```

