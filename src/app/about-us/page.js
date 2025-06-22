'use client';

import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Link,
  Divider,
} from '@mui/material';
import {
  pink,
  blue,
  green,
  orange,
  purple,
  yellow,
  deepOrange,
  teal,
} from '@mui/material/colors';
import GitHubIcon from '@mui/icons-material/GitHub';
import PublicIcon from '@mui/icons-material/Public';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function AboutUsPage() {
  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.background.default,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 2,
          borderRadius: 2,
          bgcolor: (theme) => theme.palette.background.paper,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          gutterBottom
          align="center"
          sx={{ color: purple[400] }}
        >
          About This Project
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Just trying to get my life together and stay on track each day — and a
          little friendly competition never hurts!
          <br />
          That’s how this project came to life. <br />
          Would love your support!{' '}
          <FavoriteIcon
            sx={{ color: pink[400], verticalAlign: 'middle' }}
            fontSize="small"
          />
          <br />
          <br />
          <b>Backend:</b>
          <ul>
            <li>Express.js framework</li>
            <li>Authentication: Firebase Auth</li>
            <li>Database: Firebase Firestore</li>
            <li>Hosted on Render</li>
          </ul>
          <b>Frontend:</b>
          <ul>
            <li>Next.js framework</li>
            <li>UI: Material-UI (MUI)</li>
            <li>Hosted on Vercel</li>
          </ul>
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          alignItems="center"
        >
          Connect With ME :{' '}
          <IconButton
            component={Link}
            href="https://github.com/VisheshVGR"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            size="large"
          >
            <GitHubIcon fontSize="inherit" />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" align="center" color="text.secondary">
          Big thanks to{' '}
          <Box sx={{ display: 'inline-block', color: pink[400] }}>
            <SmartToyIcon sx={{ height: '1ch', width: '1ch' }} /> GitHub Copilot
          </Box>{' '}
          for writing 99% of code with{' '}
          <FavoriteIcon
            sx={{ color: pink[400], verticalAlign: 'middle' }}
            fontSize="small"
          />
        </Typography>
      </Paper>
    </Box>
  );
}
