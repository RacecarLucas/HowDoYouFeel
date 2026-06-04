import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Pressable,
  Dimensions,
} from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useMoodStore } from '../../store/useMoodStore';
import { getMoodById } from '../../constants/moods';
import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';
import { UserMoodEntry, MoodType } from '../../types';
import { MoodChart } from '../../components/MoodChart';

const { width } = Dimensions.get('window');

// Happiness scale: higher = happier
const moodScores: Record<MoodType, number> = {
  excited: 5,
  happy: 4,
  calm: 3,
  neutral: 2,
  tired: 2,
  anxious: 1,
  sad: 1,
  angry: 0,
};

export default function CalendarScreen() {
  const { userId } = useMoodStore();
  const [entries, setEntries] = useState<UserMoodEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<UserMoodEntry | null>(null);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    let mounted = true;
    if (!userId) return;

    if (!db) {
      const demoEntries: UserMoodEntry[] = [
        { id: '1', mood: 'happy', note: 'Had a great day!', createdAt: new Date() },
        { id: '2', mood: 'calm', note: 'Relaxed evening', createdAt: new Date(Date.now() - 86400000) },
        { id: '3', mood: 'excited', note: 'Big news!', createdAt: new Date(Date.now() - 172800000) },
        { id: '4', mood: 'sad', note: 'Rainy day', createdAt: new Date(Date.now() - 259200000) },
        { id: '5', mood: 'happy', note: 'Friends visiting', createdAt: new Date(Date.now() - 345600000) },
        { id: '6', mood: 'anxious', note: 'Interview', createdAt: new Date(Date.now() - 432000000) },
        { id: '7', mood: 'calm', note: 'Meditation', createdAt: new Date(Date.now() - 518400000) },
      ];
      setEntries(demoEntries);
      return;
    }

    const q = query(
      collection(db, 'userMoods', userId, 'history'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!mounted) return;
      const data: UserMoodEntry[] = [];
      snapshot.docs.forEach((doc) => {
        const entry = doc.data();
        data.push({
          id: doc.id,
          mood: entry.mood,
          note: entry.note,
          createdAt: entry.createdAt?.toDate() || new Date(),
        });
      });
      setEntries(data);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [userId]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days = chartPeriod === 'week' ? 7 : 30;
    const data: { value: number; label: string; date: Date }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      // Find entry for this day
      const dayEntry = entries.find((e) => {
        const eDate = new Date(e.createdAt);
        return (
          eDate.getDate() === date.getDate() &&
          eDate.getMonth() === date.getMonth() &&
          eDate.getFullYear() === date.getFullYear()
        );
      });

      const score = dayEntry ? moodScores[dayEntry.mood] : 0;
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Yesterday'
          : date.toLocaleDateString('en-US', { weekday: 'narrow' });

      data.push({
        value: score,
        label,
        date,
      });
    }

    return data;
  }, [entries, chartPeriod]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEntryForDay = (day: number) => {
    return entries.find((entry) => {
      const entryDate = new Date(entry.createdAt);
      return (
        entryDate.getDate() === day &&
        entryDate.getMonth() === selectedMonth.getMonth() &&
        entryDate.getFullYear() === selectedMonth.getFullYear()
      );
    });
  };

  const daysInMonth = getDaysInMonth(selectedMonth);
  const firstDay = getFirstDayOfMonth(selectedMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>This Month</Text>

        <View style={styles.monthHeader}>
          <Pressable
            onPress={() =>
              setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))
            }
          >
            <Text style={styles.arrow}>←</Text>
          </Pressable>
          <Text style={styles.monthText}>
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </Text>
          <Pressable
            onPress={() =>
              setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))
            }
          >
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        </View>

        <View style={styles.calendar}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <Text key={day} style={styles.dayHeader}>
              {day}
            </Text>
          ))}

          {blanks.map((i) => (
            <View key={`blank-${i}`} style={styles.dayCell} />
          ))}

          {days.map((day) => {
            const entry = getEntryForDay(day);
            const moodConfig = entry ? getMoodById(entry.mood) : null;

            return (
              <Pressable
                key={day}
                style={styles.dayCell}
                onPress={() => entry && setSelectedEntry(entry)}
              >
                {moodConfig ? (
                  <View
                    style={[
                      styles.moodDay,
                      { backgroundColor: moodConfig.color },
                    ]}
                  >
                    <Text style={styles.moodEmoji}>{moodConfig.emoji}</Text>
                    <Text style={styles.dayNumberActive}>{day}</Text>
                  </View>
                ) : (
                  <Text style={styles.dayNumber}>{day}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {selectedEntry && (
          <View style={styles.detailCard}>
            <Pressable
              style={styles.closeDetail}
              onPress={() => setSelectedEntry(null)}
            >
              <Text>✕</Text>
            </Pressable>
            {(() => {
              const moodConfig = getMoodById(selectedEntry.mood);
              return (
                <>
                  <Text style={styles.detailEmoji}>{moodConfig?.emoji}</Text>
                  <Text style={styles.detailMood}>{moodConfig?.label}</Text>
                  <Text style={styles.detailNote}>{selectedEntry.note}</Text>
                  <Text style={styles.detailDate}>
                    {new Date(selectedEntry.createdAt).toLocaleDateString()}
                  </Text>
                </>
              );
            })()}
          </View>
        )}

        {/* Mood Trend Chart */}
        {entries.length > 0 && (
          <View style={styles.chartSection}>
            <Text style={styles.statsTitle}>Mood Trend</Text>
            <View style={styles.periodToggle}>
              <Pressable
                style={[styles.periodBtn, chartPeriod === 'week' && styles.periodBtnActive]}
                onPress={() => setChartPeriod('week')}
              >
                <Text style={[styles.periodText, chartPeriod === 'week' && styles.periodTextActive]}>
                  Week
                </Text>
              </Pressable>
              <Pressable
                style={[styles.periodBtn, chartPeriod === 'month' && styles.periodBtnActive]}
                onPress={() => setChartPeriod('month')}
              >
                <Text style={[styles.periodText, chartPeriod === 'month' && styles.periodTextActive]}>
                  Month
                </Text>
              </Pressable>
            </View>
            <MoodChart
              data={chartData.map((d) => ({
                value: d.value,
                label: d.label,
              }))}
              width={width - 64}
              height={180}
              maxValue={5}
            />
            <View style={styles.legend}>
              <Text style={styles.legendText}>0 = Angry  →  5 = Excited</Text>
            </View>
          </View>
        )}

        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Your Mood Statistics</Text>
          <View style={styles.moodCounts}>
            {entries.length > 0 ? (
              Object.entries(
                entries.reduce((acc, entry) => {
                  acc[entry.mood] = (acc[entry.mood] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([mood, count]) => {
                const config = getMoodById(mood);
                return (
                  <View key={mood} style={styles.statItem}>
                    <Text style={styles.statEmoji}>{config?.emoji}</Text>
                    <Text style={styles.statCount}>{count}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.noData}>No mood entries yet</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    color: colors.text,
    marginTop: 16,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  arrow: {
    fontSize: 24,
    color: colors.text,
  },
  monthText: {
    fontSize: 16,
    fontFamily: fontFamily.semiBold,
    color: colors.text,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  dayHeader: {
    width: (width - 32) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: fontFamily.semiBold,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dayCell: {
    width: (width - 32) / 7,
    height: (width - 32) / 7,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.text,
  },
  dayNumberActive: {
    fontSize: 10,
    fontFamily: fontFamily.semiBold,
    color: '#FFFFFF',
  },
  moodDay: {
    width: '90%',
    height: '90%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 18,
  },
  detailCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeDetail: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  detailEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  detailMood: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    textAlign: 'center',
    color: colors.text,
    marginBottom: 8,
  },
  detailNote: {
    fontSize: 14,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  detailDate: {
    fontSize: 12,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  chartSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodToggle: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  periodBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  periodBtnActive: {
    backgroundColor: colors.text,
  },
  periodText: {
    fontSize: 12,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.white,
  },
  legend: {
    marginTop: 8,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 11,
    fontFamily: fontFamily.regular,
    color: colors.textSecondary,
  },
  statsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: fontFamily.bold,
    color: colors.text,
    marginBottom: 16,
  },
  moodCounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    minWidth: 70,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  statCount: {
    fontSize: 16,
    fontFamily: fontFamily.bold,
    color: colors.text,
  },
  noData: {
    fontSize: 14,
    fontFamily: fontFamily.medium,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
