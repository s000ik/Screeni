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
  
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${mins}m ${secs}s`;
  };
  const sortedTimings = Object.entries(aggregatedTimings)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5);
  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Screen Time Tracker
        </Typography>
        <Paper elevation={3}>
        <List>
  {sortedTimings.map(([hostname, totalTime], index) => (
    <ListItem key={index} divider>
      <ListItemText
        primary={hostname}
        secondary={formatTime(totalTime)}
      />
    </ListItem>
  ))}
</List>
        </Paper>
      </Box>
      <Box my={4}>
        <Typography variant="h5" component="h2" gutterBottom>
          Detailed Timings
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