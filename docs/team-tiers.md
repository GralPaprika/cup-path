# Team tiers (FIFA points cuts)

Strength tiers for World Cup participants, derived from FIFA ranking points.

## Cuts

| Condition | Key | EN label | ES label | Notes |
|-----------|-----|----------|----------|-------|
| `points >= 1800` | `titleFavorites` | Title favorites | Favoritos | |
| `points >= 1700` | `contenders` | Contenders | Contendientes | |
| `points >= 1580` | `darkHorses` | Dark horses | Caballo negro | ¿Y si sí? |
| `points >= 1450` | `outsiders` | Outsiders | Luchadores | Está difícil |
| `points < 1450` | `makeweights` | Makeweights | Sin pretensiones | Fuimos al mundial 😁 |

## Logic

```ts
if (points >= 1800) return "titleFavorites";
if (points >= 1700) return "contenders";
if (points >= 1580) return "darkHorses";
if (points >= 1450) return "outsiders";
return "makeweights";
```

## Typical bucket sizes (48 teams)

Cuts sit near natural cliffs in the live ranking distribution. Across ranking modes, sizes are roughly:

- Title favorites: 4–6
- Contenders: 7–9
- Dark horses: 10–13
- Outsiders: 11–15
- Makeweights: 10–12
