import { MailPlus, Save } from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GlassIcon } from "@/components/ui/GlassIcon";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { trackEvent } from "@/services/analytics.service";
import { generateHrMail, saveHrMail } from "@/services/hrMail.service";
import { buildPaywallMessage } from "@/services/paywall.service";
import { useAuth } from "@/store/userStore";
import type {
  GenerateHrMailResult,
  HrMailTone,
  HrMailType,
} from "@/types/hr-mail.types";

const mailTypes: { label: string; value: HrMailType }[] = [
  { label: "Resignation", value: "resignation_email" },
  { label: "Salary negotiation", value: "salary_negotiation" },
  { label: "Interview follow-up", value: "interview_follow_up" },
  { label: "Referral request", value: "referral_request" },
  { label: "Offer acceptance", value: "offer_acceptance" },
  { label: "Offer rejection", value: "offer_rejection" },
  { label: "Notice reduction", value: "notice_period_reduction" },
  { label: "Experience letter", value: "experience_letter_request" },
  { label: "Relieving letter", value: "relieving_letter_request" },
  { label: "WFH request", value: "work_from_home_request" },
];

const tones: HrMailTone[] = ["formal", "polite", "confident", "concise"];

export default function HrMailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  const { user, demoMode } = useAuth();
  const [mailType, setMailType] = useState<HrMailType>("interview_follow_up");
  const [tone, setTone] = useState<HrMailTone>("polite");
  const [name, setName] = useState("Rahul Sharma");
  const [companyName, setCompanyName] = useState("CareerMate Labs");
  const [role, setRole] = useState("Frontend Engineer");
  const [hrOrManagerName, setHrOrManagerName] = useState("");
  const [result, setResult] = useState<GenerateHrMailResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!user && !demoMode) {
      setError("Please sign in before generating HR mail.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextResult = await generateHrMail({
        userId: user?.id,
        mailType,
        tone,
        name,
        companyName,
        role,
        hrOrManagerName,
      });
      setResult(nextResult);
      await trackEvent("hr_mail_generated", { mailType });
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "Unable to generate HR mail right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user?.id || !result) {
      Alert.alert("Sign in required", "Please sign in to save generated mail.");
      return;
    }
    await saveHrMail(user.id, result);
    Alert.alert("Saved", "The generated mail is saved to your profile.");
  }

  return (
    <Screen>
      <View className="gap-2">
        <GlassIcon icon={MailPlus} tone="green" size={72} />
        <Text variant="label" style={{ color: colors.primary }}>
          Premium Tool
        </Text>
        <Text variant="title">HR Mail Generator</Text>
        <Text variant="muted">
          Generate professional HR emails and short messages without aggressive
          or false claims.
        </Text>
      </View>

      <Card>
        <Text variant="heading">Mail type</Text>
        <View className="flex-row flex-wrap gap-2">
          {mailTypes.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              active={mailType === item.value}
              onPress={() => setMailType(item.value)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text variant="heading">Details</Text>
        <Field value={name} onChangeText={setName} placeholder="Your name" />
        <Field
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="Company name"
        />
        <Field value={role} onChangeText={setRole} placeholder="Role" />
        <Field
          value={hrOrManagerName}
          onChangeText={setHrOrManagerName}
          placeholder="HR/Manager name optional"
        />
        <View className="flex-row flex-wrap gap-2">
          {tones.map((item) => (
            <Chip
              key={item}
              label={item}
              active={tone === item}
              onPress={() => setTone(item)}
            />
          ))}
        </View>
        <Button
          title={loading ? "Generating..." : "Generate Mail"}
          icon={MailPlus}
          loading={loading}
          onPress={handleGenerate}
        />
      </Card>

      {error ? (
        <UpgradePrompt
          title="Premium access needed"
          message={
            error.includes("requires") || error.includes("credits")
              ? buildPaywallMessage({
                  entitlement: "hr_mail_generator",
                  creditType: "hr_mail",
                  featureName: "HR Mail Generator",
                })
              : error
          }
          onMaybeLater={() => setError(null)}
        />
      ) : null}

      {result ? (
        <>
          <Card>
            <Text variant="label">Subject</Text>
            <Text variant="heading">{result.subject}</Text>
            <Text variant="label">Body</Text>
            <Text>{result.body}</Text>
            {result.shortMessage ? (
              <>
                <Text variant="label">Short message</Text>
                <Text>{result.shortMessage}</Text>
              </>
            ) : null}
          </Card>
          <Button
            title="Save generated mail"
            icon={Save}
            variant="secondary"
            onPress={handleSave}
          />
        </>
      ) : null}
    </Screen>
  );
}

function Field({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.muted}
      style={{
        backgroundColor: colors.surfaceLow,
        borderColor: colors.border,
        borderRadius: 12,
        borderWidth: 1,
        color: colors.text,
        fontFamily: "PlusJakartaSans_400Regular",
        minHeight: 48,
        padding: 14,
      }}
    />
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.primary : colors.surfaceLow,
        borderColor: active ? colors.primary : colors.border,
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
      }}
    >
      <Text
        style={{
          color: active ? "#FFFFFF" : colors.text,
          fontFamily: "PlusJakartaSans_700Bold",
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
