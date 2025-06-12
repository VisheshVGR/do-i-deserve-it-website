'use client';

import withAuth from '@/utils/withAuth';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  IconButton,
} from '@mui/material';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PublicIcon from '@mui/icons-material/Public';
import api from '@/utils/axios';
import { ICON_MAP } from '@/utils/muiIcons';
import moment from 'moment';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function Report() {
  const [selectedTab, setSelectedTab] = useState('week');
  const [reportData, setReportData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const stepId = searchParams.get('stepId');
  const [stepDetails, setStepDetails] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!stepId) return;

      try {
        const response = await api.get(
          `/reports/targetStep/${stepId}/${selectedTab}`
        );
        setReportData(response.data);
        // console.log(`Report data for ${selectedTab}:`, response.data);
      } catch (error) {
        console.error(`Error fetching report data for ${selectedTab}:`, error);
        // Handle error appropriately (e.g., show a message to the user)
      }
    };

    const fetchStepDetails = async () => {
      if (!stepId) return;

      try {
        const response = await api.get(`/targetSteps/${stepId}`);
        setStepDetails(response.data);
        // console.log('Step details:', response.data);
      } catch (error) {
        console.error('Error fetching step details:', error);
        // Handle error appropriately (e.g., show a message to the user)
      }
    };

    fetchReportData();
    fetchStepDetails();
  }, [stepId, selectedTab]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const IconComp = ICON_MAP[stepDetails?.icon] || ICON_MAP['Assessment'] || ICON_MAP['Star'];

  // Function to get min and max dates from reportData
  const getMinMaxDates = (data) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { minDate: null, maxDate: null };
    }

    const dates = data.map((item) => new Date(item.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    return { minDate, maxDate };
  };

  const { minDate, maxDate } = getMinMaxDates(reportData?.targetStepData);

  const chartSetting = {
    yAxis: [{ label: 'Value' }],
    width: 700,
    height: 300,
  };

  const dataset =
    reportData?.targetStepData && Array.isArray(reportData?.targetStepData)
      ? reportData.targetStepData.map((item) => ({
          date: item.date, // Assuming each item in targetStepData has a date property
          count: item.count, // Assuming each item has a dataCount property
          kudos: item.kudos, // Assuming each item has a dataKudos property
        }))
      : [];

  // console.log('data', dataset);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return moment(date).format('D MMM');
  };

  // Calculate total count and kudos
  const totalCount = reportData?.targetStepData?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  const totalKudos = reportData?.targetStepData?.reduce((sum, item) => sum + (item.kudos || 0), 0) || 0;
  return (
    <Box sx={{ p: 2, minHeight: '70vh' }}>
      {/* Step Title and Icon (similar to StepRow) */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ mr: 2 }}>
            <IconComp fontSize="large" color="primary" />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <Typography fontWeight={500}>
              {stepDetails?.title}
              {stepDetails?.isPublic && (
                <PublicIcon sx={{ height: '1ch', ml: 0.5 }} />
              )}
            </Typography>
            {stepDetails?.description && (
              <Typography variant="body2" color="text.secondary">
                {stepDetails?.description}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            Started On: {moment(stepDetails?.createdAt).format('MMMM D, YYYY')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Status:{' '}
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                px: 1,
                borderRadius: 1,
                fontWeight: 600,
                fontSize: 12,
                backgroundColor:
                  stepDetails?.status === 'active'
                    ? 'primary.light'
                    : stepDetails?.status === 'suspended'
                    ? 'warning.light'
                    : stepDetails?.status === 'completed'
                    ? 'success.light'
                    : 'grey.300',
                color:
                  stepDetails?.status === 'active'
                    ? 'primary.dark'
                    : stepDetails?.status === 'suspended'
                    ? 'warning.dark'
                    : stepDetails?.status === 'completed'
                    ? 'success.dark'
                    : 'grey.700',
              }}
            >
              {stepDetails?.status || 'Unknown'}
            </Box>
          </Typography>
        </Box>
      </Paper>

      {/* Tabs */}
      <Paper square elevation={0} sx={{ borderRadius: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Report view"
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{
            '.MuiTabs-flexContainer': {
              justifyContent: 'space-around',
            },
          }}
        >
          <Tab label="Week" value="week" />
          <Tab label="Month" value="month" />
          <Tab label="Year" value="year" />
        </Tabs>
      </Paper>

      {/* Display report data */}
      {reportData ? (
        <Box>
          {/* Bar Chart */}
          {dataset.length === 0 ? (
            <Typography align="center" sx={{ my: 4 }}>No data available for this period.</Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={dataset}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#388e3c" />
                <Bar dataKey="kudos" fill="#ffc107" />
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* Date Range */}
          <Box
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {minDate && maxDate
                ? `Data from ${moment(minDate).format(
                    'D MMM'
                  )} to ${moment(maxDate).format('D MMM')}`
                : 'No data available'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Count: <Box sx={{display:"inline-block", color:"#388e3c"}}>{totalCount}</Box> | Kudos: <Box sx={{display:"inline-block", color:"#ffc107"}}>{totalKudos}</Box>
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body1">Loading report data...</Typography>
      )}
    </Box>
  );
}

export default withAuth(Report);
