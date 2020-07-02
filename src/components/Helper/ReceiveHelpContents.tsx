import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';

export default function ReceiveHelpContents(props) {

    const openLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
          if (supported) {
            Linking.openURL(url);
          } else {
            console.log("Don't know how to open URI: " + url);
          }
        })
    }

  return (
    <ScrollView
        style={styles.modalContainer}
        snapToInterval={hp('89%')}
        decelerationRate='fast'
    >
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingBottom: hp('4%')}}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{
                        color: Colors.white,
                        fontFamily: Fonts.FiraSansMedium,
                        fontSize: RFValue(20),
                        marginTop: hp('1%'),
                        marginBottom: hp('1%'),
                    }}
                >
                    Receive bitcoin
                </Text>
            </View>
            <View
                style={{
                backgroundColor: Colors.homepageButtonColor,
                height: 1,
                marginLeft: wp('5%'),
                marginRight: wp('5%'),
                marginBottom: hp('1%'),
                }}
            />
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                When you want to receive bitcoin, the sender{'\n'}needs to know where to send them to. This is{'\n'}given by your address shown as a QR code and{'\n'}as plaintext above 
            </Text>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/icons/bitcoin_receive_info_1.png')}
                    style={{ width: wp('80%'), height: wp('80%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                Bitcoin transactions can not be reversed or cancelled.{'\n'}For this reason, it is recommended that you scan a QR{'\n'}code instead of keying in characters
            </Text>
            <Text
            style={{
                textAlign: 'center',
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
            }}
            >
                To improve your privacy, a new address is{'\n'}generated each time you want to receive{'\n'}bitcoin. If you would like to receive bitcoin{'\n'}from Friends and Family, please check the{'\n'}checkbox above
            </Text>
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <View
                    style={{
                        borderStyle: 'dotted',
                        borderWidth: 1,
                        borderRadius: 1,
                        borderColor: Colors.white,
                        width: wp('70%'),
                        height: 0,
                    }}
                />
            </View>
        </View>
        <View style={{height: hp('89%'), justifyContent: 'space-between', paddingTop:hp('2%'), paddingBottom: hp('6%')}}>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text
                    style={{
                        textAlign: 'center',
                        color: Colors.white,
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansRegular,
                    }}
                >
                    Once the sender sends the transaction, the{'\n'}transaction is relayed to a bitcoin full node.{'\n'}This full node then announces the{'\n'}transactions to other full nodes, including{'\n'}those of miners
                </Text>
                <Image
                    source={require('../../assets/images/icons/bitcoin_send_info_2.png')}
                    style={{ width: wp('75%'), height: wp('75%'), resizeMode: 'contain' }}
                />
            </View>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                }}
            >
                A miner includes a transaction within a{'\n'}block only if the fee associated is{'\n'}sufficiently high. Please make sure the sender{'\n'}sends the transaction with appropriate fees{'\n'}for it to reach you faster
            </Text>
            <Text
                style={{
                    textAlign: 'center',
                    color: Colors.white,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                }}
            >
                If the fee associated with a transaction is low,{'\n'}you may increase the fee paid by RBF or{'\n'}Replace-By-Fee. This provides additional{'\n'}incentive for the miner to mine your{'\n'}transaction, and may result in you receiving{'\n'}bitcoin earlier
            </Text>
            <View style={{flexDirection: 'row', marginLeft: wp('10%'), marginRight: wp('10%'), justifyContent: 'center', flexWrap: 'wrap'}}>
                <Text
                    style={{
                        color: Colors.white,
                        // textAlign: 'center',
                        fontSize: RFValue(12),
                        fontFamily: Fonts.FiraSansRegular,
                    }}
                >
                    To know more,
                </Text>
                <TouchableOpacity style={{marginLeft: 5}} onPress={() => openLink("https://github.com/6102bitcoin/bitcoin-intro#step-12-buying-privately")}> 
                    <Text
                        style={{
                            color: Colors.white,
                            fontSize: RFValue(12),
                            fontFamily: Fonts.FiraSansRegular,
                            textDecorationLine: 'underline',
                            textAlign: 'center',
                        }}
                    >
                        click here
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    width: '100%',
    paddingBottom: hp('5%'),
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});