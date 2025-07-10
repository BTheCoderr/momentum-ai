declare module 'react-native-calendar-heatmap' {
  interface CalendarHeatmapProps {
    values: Array<{
      date: string;
      count: number;
    }>;
    endDate: string;
    numDays: number;
    colorForValue: (value: { count: number } | null) => string;
    horizontal?: boolean;
  }

  export default function CalendarHeatmap(props: CalendarHeatmapProps): JSX.Element;
} 