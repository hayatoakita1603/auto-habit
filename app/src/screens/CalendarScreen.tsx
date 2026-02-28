import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { useCalendar } from '../hooks/useCalendar';
import { formatDate } from '../utils/date';

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

const buildCalendarDays = (year: number, month: number): (number | null)[] => {
  // month は 1-12
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=日
  const lastDate = new Date(year, month, 0).getDate();
  const days: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= lastDate; d++) {
    days.push(d);
  }
  return days;
};

export const CalendarScreen = () => {
  const { user } = useUser();
  const { year, month, achievedDates, loading, goToPrevMonth, goToNextMonth } = useCalendar(user);
  const days = buildCalendarDays(year, month);
  const today = formatDate(new Date());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{year}年{month}月</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navText}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map(label => (
          <Text key={label} style={styles.weekLabel}>{label}</Text>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {days.map((day, i) => {
            if (day === null) {
              return <View key={`empty-${i}`} style={styles.cell} />;
            }
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const achieved = achievedDates.has(dateStr);
            const isToday = dateStr === today;
            return (
              <View
                key={dateStr}
                style={[styles.cell, achieved && styles.achievedCell]}
              >
                <Text style={[
                  styles.dayText,
                  achieved && styles.achievedText,
                  isToday && styles.todayText,
                ]}>
                  {day}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    padding: 8,
  },
  navText: {
    fontSize: 28,
    color: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  achievedCell: {
    backgroundColor: '#4CAF50',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
  },
  achievedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todayText: {
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 32,
  },
});
