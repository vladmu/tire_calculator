import React from "react";
import { observer } from "mobx-react-lite";
import { calculatorStore } from "../stores/CalculatorStore";
import { Box, Paper, Typography, Grid } from "@mui/material";
import { MAX_DELTA_PERCENT } from "../services/calculator";
import { ResultCard } from "./ResultCard";

export const ResultsArea: React.FC = observer(() => {
  const results = calculatorStore.results;
  if (!results) return null;

  const { resultsMain, bestMainResult, bestAlternativeResult, D_total_old, initialSizeKey } = results as any;
  // Derive initial values from the guaranteed initialSizeKey (format: "W/V R") to avoid binding to live inputs
  const [initWStr, rest] = String(initialSizeKey).split('/');
  const initW = Number(initWStr);
  const [initVStr, rPart] = String(rest).split(' ');
  const initV = Number(initVStr);
  const initR = Number((rPart || '').replace(/^R/, ''));
  const baseWidth = initW;

  return (
    <Box mt={2}>
      {/* Initial size card-like summary */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          Поточний розмір
        </Typography>
        <Typography variant="h6" fontWeight={800}>{initW}/{initV} R{initR}</Typography>
        <Typography variant="body2"><strong>Діаметр:</strong> {D_total_old.toFixed(1)} мм</Typography>
        <Typography variant="body2"><strong>Ширина (W):</strong> {initW} мм</Typography>
        <Typography variant="body2"><strong>Профіль (V):</strong> {initV}%</Typography>
      </Paper>

      <Grid container spacing={2}>
        {resultsMain.map((r: import('../types/types').SingleProfileResult) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={r.newSize}>
            <ResultCard
              result={r}
              isBestInMain={!!bestMainResult && r.newSize === bestMainResult.newSize}
              baseWidth={baseWidth}
              maxDeltaPercent={MAX_DELTA_PERCENT}
            />
          </Grid>
        ))}

        {bestAlternativeResult && (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={bestAlternativeResult.newSize}>
            <ResultCard
              result={bestAlternativeResult}
              isAlternative
              baseWidth={baseWidth}
              maxDeltaPercent={MAX_DELTA_PERCENT}
            />
          </Grid>
        )}
      </Grid>
    </Box>
  );
});
