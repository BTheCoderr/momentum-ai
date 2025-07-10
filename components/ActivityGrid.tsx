'use client';

import React from 'react';

interface ContributionDay {
  date: string;
  level: number;
  day: number;
  week: number;
}

interface ActivityGridProps {
  className?: string;
}

export default function ActivityGrid({ className = '' }: ActivityGridProps) {
  const generateContributionData = (): ContributionDay[] => {
    const data: ContributionDay[] = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 84); // 12 weeks * 7 days

    for (let i = 0; i < 84; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Simulate activity levels (0-4) with realistic patterns
      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      let activityLevel = 0;
      if (Math.random() > 0.25) { // 75% chance of some activity
        if (isWeekend) {
          activityLevel = Math.floor(Math.random() * 3) + 1; // 1-3 for weekends
        } else {
          activityLevel = Math.floor(Math.random() * 4) + 1; // 1-4 for weekdays
        }
      }

      data.push({
        date: currentDate.toISOString().split('T')[0],
        level: activityLevel,
        day: dayOfWeek,
        week: Math.floor(i / 7),
      });
    }
    return data;
  };

  const contributionData = generateContributionData();
  
  // Group data into weeks for display
  const weeks: ContributionDay[][] = [];
  for (let i = 0; i < 12; i++) {
    weeks.push(contributionData.slice(i * 7, (i + 1) * 7));
  }

  const getBoxColor = (level: number): string => {
    const colors = [
      '#F0F0F0', // No activity (light gray)
      '#FFE4D6', // Very low (very light orange)
      '#FFCC99', // Low activity (light orange)
      '#FF8C42', // Medium high (bright orange)
      '#FF6B35', // High activity (main orange)
    ];
    return colors[level] || colors[0];
  };

  const totalContributions = contributionData.filter(d => d.level > 0).length;
  const weeklyAverage = Math.round(totalContributions / 12);
  const currentStreak = Math.floor(Math.random() * 15) + 1; // Mock current streak

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-lg border border-gray-100 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your 12-Week Journey</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span><strong>{totalContributions}</strong> active days</span>
          <span><strong>{weeklyAverage}</strong> per week</span>
          <span><strong>{currentStreak}</strong> day streak</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Month labels */}
          <div className="flex justify-between mb-2 text-xs text-gray-500">
            <span>3 months ago</span>
            <span>2 months ago</span>
            <span>1 month ago</span>
            <span>Today</span>
          </div>

          {/* Activity grid */}
          <div className="space-y-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, dayIndex) => (
              <div key={dayIndex} className="flex items-center space-x-1">
                <div className="w-8 text-xs text-gray-500 text-right">
                  {dayName}
                </div>
                <div className="flex space-x-1">
                  {weeks.map((week, weekIndex) => {
                    const dayData = week.find(d => d.day === dayIndex);
                    return (
                      <div
                        key={weekIndex}
                        className="w-3 h-3 rounded-sm border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer"
                        style={{
                          backgroundColor: dayData ? getBoxColor(dayData.level) : '#F3F4F6',
                        }}
                        title={dayData ? `${dayData.date}: ${dayData.level} activities` : 'No data'}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Less</span>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="w-3 h-3 rounded-sm border border-gray-200"
                    style={{ backgroundColor: getBoxColor(level) }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 