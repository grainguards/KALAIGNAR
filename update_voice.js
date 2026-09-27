const fs = require('fs');
const file = 'C:/Users/indir/Downloads/Kalaignar/KalaSetu-App/apps/mobile/src/components/VoiceAssistant.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { useNavigation } from')) {
  content = content.replace("import { useTheme } from '../theme/useTheme';", "import { useTheme } from '../theme/useTheme';\nimport { useNavigation, NavigationProp } from '@react-navigation/native';");
}

if (!content.includes('const navigation = useNavigation<')) {
  content = content.replace("const { colors } = useTheme();", "const { colors } = useTheme();\n  const navigation = useNavigation<NavigationProp<any>>();");
}

content = content.replace("// TODO: Actually navigate", "if (data.destination) navigation.navigate(data.destination);");

fs.writeFileSync(file, content);
