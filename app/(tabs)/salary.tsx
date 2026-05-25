import { useMemo, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppTopBar } from '@/components/ui/AppTopBar';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { calculateIndianSalary } from '@/services/salary.service';

export default function SalaryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const [ctc, setCtc] = useState('1200000');
  const [basicPercent, setBasicPercent] = useState('40');
  const [hraPercent, setHraPercent] = useState('50');

  const result = useMemo(
    () =>
      calculateIndianSalary({
        ctc: Number(ctc) || 0,
        basicPercent: Number(basicPercent) || 40,
        hraPercent: Number(hraPercent) || 50,
      }),
    [basicPercent, ctc, hraPercent],
  );

  return (
    <Screen>
      <AppTopBar title="CareerMate" />
      <View style={styles.hero}>
        <Text variant="title">Salary Calculator</Text>
        <Text variant="muted">Indian CTC to in-hand estimate with PF, professional tax, and basic tax projection.</Text>
      </View>

      <Card>
        <SalaryInput label="Annual CTC" value={ctc} onChangeText={setCtc} colors={colors} />
        <SalaryInput label="Basic %" value={basicPercent} onChangeText={setBasicPercent} colors={colors} />
        <SalaryInput label="HRA on basic %" value={hraPercent} onChangeText={setHraPercent} colors={colors} />
      </Card>

      <Card style={{ backgroundColor: colors.secondary, borderWidth: 0 }}>
        <Text variant="label" style={{ color: colorScheme === 'dark' ? '#EAF1FF' : '#DBE1FF' }}>Final take home</Text>
        <Text variant="metric" style={{ color: '#FFFFFF' }}>{formatCurrency(result.inHandMonthly)}</Text>
        <Text style={{ color: '#F8F9FF' }}>Estimated net monthly salary</Text>
      </Card>

      <Card>
        <Text variant="heading">Monthly Breakdown</Text>
        <Row label="Monthly gross" value={result.monthlyGross} />
        <Row label="Basic monthly" value={result.basicMonthly} />
        <Row label="HRA monthly" value={result.hraMonthly} />
        <Row label="PF monthly" value={result.pfMonthly} />
        <Row label="Professional tax" value={result.professionalTaxMonthly} />
        <Row label="Estimated tax" value={result.estimatedTaxMonthly} />
      </Card>
    </Screen>
  );
}

function SalaryInput({ label, value, onChangeText, colors }: { label: string; value: string; onChangeText: (value: string) => void; colors: typeof Colors.light }) {
  return (
    <View style={styles.inputWrap}>
      <Text variant="label">{label}</Text>
      <TextInput
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
      />
    </View>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
      <Text style={styles.value}>{formatCurrency(value)}</Text>
    </View>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

const styles = StyleSheet.create({
  hero: { gap: 8 },
  inputWrap: { gap: 8 },
  input: { borderRadius: 8, borderWidth: 1, fontFamily: 'PlusJakartaSans_400Regular', fontSize: 16, minHeight: 48, paddingHorizontal: 14 },
  row: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  value: { fontWeight: '800' },
});
