import { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Paper, Box } from '@mui/material';

function App() {
  const [siteTimings, setSiteTimings] = useState<Array<{
    url: string;
    timeSpent: number;
    startTime: number;
  }>>([]);

  useEffect(() => {
    const loadTimes = () => {
      chrome.storage.local.get(['siteTimings'], (result) => {
        if (result.siteTimings) {
          setSiteTimings(result.siteTimings);
        }
      });
    };

    loadTimes();
    const interval = setInterval(loadTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const aggregatedTimings = siteTimings.reduce((acc, site) => {
    const hostname = new URL(site.url).hostname;
    acc[hostname] = (acc[hostname] || 0) + site.timeSpent;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Screen Time Tracker
        </Typography>
        <Paper elevation={3}>
          <List>
            {Object.entries(aggregatedTimings).map(([hostname, totalTime], index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={hostname}
                  secondary={`${totalTime} seconds`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Container>
  );
  }

export default App;