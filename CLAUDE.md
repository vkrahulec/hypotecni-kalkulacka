# Hypoteční kalkulačka

Czech mortgage calculator app built with Expo (React Native), targeting Android and Web.

## Tech Stack

- **Framework**: Expo SDK 54, React Native 0.81.5, React 19
- **Language**: TypeScript
- **Targets**: Android + Web (no iOS)
- **New Architecture**: enabled (`newArchEnabled: true`)
- **UI**: Material Design 3, dark/light theme via `ThemeContext`
- **Ads**: `react-native-google-mobile-ads` (Android), custom `AdBanner.web.tsx` for web
- **Charts**: `react-native-gifted-charts`
- **Gradient**: `expo-linear-gradient` / `react-native-linear-gradient`

## Project Structure

```
App.tsx                    # Entry: SafeAreaProvider > ThemeProvider > CalculatorScreen
index.ts                   # Expo entry point
app.json                   # Expo config (package: cz.hypotecnikalkulacka.app)
src/
  screens/
    CalculatorScreen.tsx   # Main (and only) screen
  components/
    InputField.tsx
    ResultCard.tsx
    Charts.tsx / Charts.web.tsx
    AmortizationTable.tsx
    AdBanner.tsx / AdBanner.web.tsx
    LTVBadge.tsx
    SectionHeader.tsx
    SegmentedControl.tsx
  context/
    ThemeContext.tsx        # Theme + color scheme
  constants/
    colors.ts
    config.ts
  utils/
    calculator.ts          # Mortgage math
    formatting.ts          # Number/currency formatting
web/
  index.html               # Web entry
```

## Run Commands

```bash
npx expo start            # Start dev server
npx expo start --android  # Run on Android
npx expo start --web      # Run in browser
```

## Platform-Specific Files

Components with a `.web.tsx` variant use Expo's platform extension resolution — the `.web.tsx` file is used on web, `.tsx` on native. Keep both in sync when changing shared logic.

## Key Notes

- App is Czech-language (UI strings in Czech)
- Android package: `cz.hypotecnikalkulacka.app`
- AdMob test app ID is used in `app.json` — replace with production ID before release
- No navigation library — single-screen app
