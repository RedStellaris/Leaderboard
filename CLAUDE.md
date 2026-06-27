## Exports par fichier

### logic/ranking.js
- courseRanking(data, course) → classement d'un circuit
- cumulativeRanking(data, pilots, courses) → classement global temps
- pointsRanking(data, pilots, courses) → classement global points
- getPilotInfo(data, pilote) → { ecurie, numero }

### utils/timeUtils.js
- parseTime(str) → ms (number)
- formatTime(ms) → "mm:ss.ms"
- formatDelta(ms) → "+s.ms"
- computeTimeAgo(date) → "il y a X min"

### utils/sheetsFetch.js
- fetchSheetData() → rows[]

### logic/sortUtils.js
- useSortConfig() → [sortConfig, onSort]
- sortRows(rows, sortConfig, getVal) → rows[]