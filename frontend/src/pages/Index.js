// @mui
import { Box, Card, CardHeader, Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';

import { ForceGraph3D } from 'react-force-graph';

// ----------------------------------------------------------------------

const genRandomTree = (N = 300, reverse = false) => {
  return {
    nodes: [...Array(N).keys()].map((i) => ({ id: i })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        [reverse ? 'target' : 'source']: id,
        [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1)),
      })),
  };
};

export default function Index() {
  return (
    <Page title="Index">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          MDS
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Card>
              <CardHeader title={'asd'} subheader={'asd'} />

              <Box sx={{ p: 3, pb: 1 }} dir="ltr">
                <ForceGraph3D graphData={genRandomTree()} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
