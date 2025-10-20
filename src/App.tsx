import React from 'react';
import { observer } from 'mobx-react-lite';
import { Container, Paper, Box, Alert } from '@mui/material';
import { Header } from './components/Header';
import { InfoBlock } from './components/InfoBlock';
import { InputForm } from './components/InputForm';
import { ResultsArea } from './components/ResultsArea';
import { calculatorStore } from './stores/CalculatorStore';

const App: React.FC = observer(() => {
  const s = calculatorStore;
  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 } }}>
        <Header />
        <InfoBlock />
        <InputForm />
        {s.error.message && (
          <Box mt={2}>
            <Alert severity="error">{s.error.message}</Alert>
          </Box>
        )}
        <ResultsArea />
      </Paper>
    </Container>
  );
});

export default App;
