/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { Box, Card, CardHeader, Grid, Container, Typography } from '@mui/material';
// components
import Page from '../components/Page';
// graph
import { ForceGraph3D } from 'react-force-graph';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SizeMe } from 'react-sizeme';

// ----------------------------------------------------------------------

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function Index() {
  const search = useQuery().get('search');
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });

  useEffect(() => {
    async function fetchData() {
      let response;
      // console.log(search);
      if (search) {
        response = await fetch(`http://localhost:5000/search?keyword=${search}`).then((res) => res.json());
      } else {
        response = await fetch(`http://localhost:5000/overview`).then((res) => res.json());
      }
      console.log(response);
      setGraphData(response);

      const bloomPass = new UnrealBloomPass();
      bloomPass.strength = 0.5;
      bloomPass.radius = 0.5;
      bloomPass.threshold = 0.1;
      fgRef.current.postProcessingComposer().addPass(bloomPass);

      fgRef.current.d3Force('link').distance(120);
    }
    fetchData();
  }, [search]);

  const handleClick = useCallback(
    (node) => {
      const distance = 100;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      if (fgRef.current) {
        fgRef.current.cameraPosition(
          {
            x: node.x * distRatio,
            y: node.y * distRatio,
            z: node.z * distRatio,
          },
          node,
          3000
        );
      }
    },
    [fgRef]
  );

  return (
    <Page title="Index">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mt: 0.5, mb: 1.5 }}>
          MDS
        </Typography>

        {/* <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}> */}
        <Card sx={{ bgcolor: '#000011' }}>
          <CardHeader
            title={search === null ? 'Overview (limit 1000)' : `${search} (${graphData.nodes.length})`}
            sx={{ color: '#ffffff' }}
          />

          <Box sx={{ p: 3 }}>
            <SizeMe>
              {({ size }) => (
                <>
                  <ForceGraph3D
                    ref={fgRef}
                    showNavInfo={false}
                    width={size.width}
                    height={600}
                    graphData={graphData}
                    nodeRelSize={6}
                    nodeOpacity={1}
                    nodeAutoColorBy={(n) => n.id}
                    onNodeClick={handleClick}
                    onNodeDragEnd={(node) => {
                      node.fx = node.x;
                      node.fy = node.y;
                      node.fz = node.z;
                    }}
                    linkOpacity={0.3}
                    linkLabel={(r) => `${r.relation.name} ${r.relation.journal}`}
                    linkAutoColorBy={(r) => r.relation}
                  />
                </>
              )}
            </SizeMe>
          </Box>
        </Card>
        {/* </Grid>
        </Grid> */}
      </Container>
    </Page>
  );
}
