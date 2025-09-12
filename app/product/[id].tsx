import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text } from "react-native";

export default function Product () {
   const { id } = useLocalSearchParams<{ id: string }>();

   return (
    <SafeAreaView>
      <Text>product with {id}</Text>
    </SafeAreaView>
   )
}