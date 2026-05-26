import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlassBackground } from './GlassBackground';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  className?: string;
}

export function Screen({ children, scroll = true, className }: ScreenProps) {
  const content = (
    <Animated.View
      entering={FadeInDown.duration(320)}
      className={`flex-1 gap-[18px] p-5 ${className ?? ''}`}>
      {children}
    </Animated.View>
  );

  return (
    <GlassBackground>
      <SafeAreaView className="flex-1">
        {scroll ? (
          <ScrollView contentContainerClassName="flex-grow" showsVerticalScrollIndicator={false}>
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </GlassBackground>
  );
}
<<<<<<< HEAD

const styles = StyleSheet.create({
  animatedWrap: {
    width: '100%',
  },
});
=======
>>>>>>> 4aa94f765dd3040c827dfb99439f850d651eaac5
