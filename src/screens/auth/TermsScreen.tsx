import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Colors } from "../../utils";

export default function TermsScreen({navigation}: any) {
  const terms = `Subject to your compliance with these Terms, you have the right to download and install a copy of any App(s) to your mobile device, and to access and use the Services, for your own personal use. With respect to each App you download, you may not: (i) copy, modify or distribute the App for any purpose; (ii) transfer, sublicense, lease, lend, rent or otherwise distribute the App or the Services to any third party; (iii) decompile, reverse-engineer, disassemble, or create derivative works of the App or the Services; (iv) make the functionality of the App or the Services available to multiple users through any means; or (v) use the Services in any unlawful manner, for any unlawful purpose, or in any manner inconsistent with these Terms. The following terms apply to any App accessed through or downloaded from any app store or distribution platform (like the Apple App Store or Google Play) where the App is made available (each, an “App Provider”). You acknowledge and agree that: These Terms are concluded between you and CHAT Z Y R , and not with the App Provider, and that CHAT Z Y R (not the App Provider), is solely responsible for the App. The App Provider has no obligation to furnish any maintenance and support services with respect to the App. In the event of any failure of the App to conform to any applicable warranty, you may notify the App Provider, and the App Provider will refund the purchase price for the App to you (if applicable) and to the maximum extent permitted by applicable law, the App Provider will have no other warranty obligation whatsoever with respect to the App. Any other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any warranty will be the sole responsibility of CHAT Z Y R . The App Provider is not responsible for addressing any claims you have or any claims of any third party relating to the App or your possession and use of the App, including, but not limited to: (i) product liability claims; (ii) any claim that the App fails to conform to any applicable legal or regulatory requirement; and (iii) claims arising under consumer protection or similar legislation. In the event of any third party claim that the App or your possession and use of that App infringes that third party’s intellectual property rights, CHAT Z Y R will be solely responsible for the investigation, defense, settlement and discharge of any such intellectual property infringement claim to the extent required by these Terms. The App Provider, and its subsidiaries, are third party beneficiaries of these Terms as related to your license of the App, and that, upon your acceptance of the terms and conditions of these Terms, the App Provider will have the right (and will be deemed to have accepted the right) to enforce these Terms as related to your license of the App against you as a third party beneficiary thereof. You must also comply with all applicable third-party terms of service when using the App. Our Services may change from time to time and/or we may stop (permanently or temporarily) providing the Services (or features within the Services), possibly without prior notice to you. Our Services may include advertisements, which may be targeted to the content or information on the Services, queries made through the Services, or from other information. The types and extent of advertising on the Services are also subject to change over time. In consideration for providing, you the Services, you agree that we and our third party providers and partners may place advertising on our Services or in connection with the display of content or information on our Services.`;

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: Colors.white }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 15 }}>
        Terms & Conditions
      </Text>

      <ScrollView style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, lineHeight: 22 }}>{terms}</Text>
      </ScrollView>

      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: Colors.redprimary,
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
        onPress={() => navigation.goBack()}
      >
        <Text style={{ color: "white", fontSize: 18 }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
