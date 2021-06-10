import React from 'react'
import { View, Image, Text, StyleSheet, } from 'react-native'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'

export default function NotificationInfoContents( props ) {

  return (
    <View style={{
      ...styles.modalContentContainer, height: '100%'
    }}>
      <View style={{
        height: '100%'
      }}>
        <View style={styles.successModalHeaderView}>
          <Text
            style={{
              color: props.headerTextColor
                ? props.headerTextColor
                : Colors.blue,
              fontSize: RFValue( 18 ),
              fontFamily: Fonts.FiraSansMedium,
              flex: 1,
            }}
          >
            {props.title}
          </Text>
          {
            props.cancelButtonText !== '' && (
              <AppBottomSheetTouchableWrapper
                style={{
                  height: wp( '8%' ),
                  width: wp( '20%' ),
                  backgroundColor: Colors.lightBlue,
                  borderWidth: 1,
                  borderColor: Colors.borderColor,
                  borderRadius: 7,
                  marginLeft: 'auto',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                }}
                onPress={() => {
                  props.onPressClose()
                }
                }
              >
                <Text
                  onPress={() => {
                    props.onPressClose()
                  }
                  }
                  style={{
                    color: Colors.white,
                    fontSize: RFValue( 12 ),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                    Close
                </Text>
                <Image
                  style={{
                    width: 12,
                    height: 12,
                    resizeMode: 'contain',
                    marginLeft: 5,
                  }}
                  source={require( '../assets/images/icons/icon_remove.png' )}
                />
              </AppBottomSheetTouchableWrapper>
            )
          }

        </View>

        {props.info &&
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: wp( '8%' ),
                marginBottom: wp( '4%' ),
              }}
            >
              <Text
                style={{
                  marginLeft: wp( '2%' ),
                  color: Colors.greyTextColor,
                  fontSize: RFValue( 13 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {props.info}
              </Text>
            </View>
        }
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: wp( '8%' ),
          }}
        >
          <Text
            style={{
              marginLeft: wp( '2%' ),
              color: Colors.blue,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.releaseNotes}
          </Text>
        </View>
        {/* {props.info && props.info.map( ( value, index ) => {
          return (
            <View
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginLeft: wp( '8%' ),
              }}
            >
              <Octicons
                name={'primitive-dot'}
                size={RFValue( 10 )}
                color={Colors.blue}
              />
              <Text
                style={{
                  marginLeft: wp( '2%' ),
                  color: Colors.blue,
                  fontSize: RFValue( 13 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                {value}
              </Text>
            </View>
          )
        } )} */}

        <View
          style={{
            marginTop: 'auto',
            marginBottom: hp( '5%' ),
            marginLeft: wp( '8%' ),
          }}
        >
          <Text style={{
            ...styles.modalInfoText, marginBottom: hp( '3%' )
          }}>
            {props.note}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 'auto',
              alignItems: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              disabled={false}
              onPress={props.onPressProceed}
              style={{
                ...styles.successModalButtonView
              }}
            >
              <Text style={styles.proceedButtonText}>
                {props.proceedButtonText}</Text>
            </AppBottomSheetTouchableWrapper>


            {
              props.cancelButtonText !== '' && (
                <AppBottomSheetTouchableWrapper
                  onPress={() => {
                    props.onPressIgnore()
                  // if ( isOpenFromNotificationList ) props.navigation.goBack()
                  // else
                  //   onClick( false, true )
                  }}
                  style={{
                    height: wp( '13%' ),
                    width: wp( '35%' ),
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginLeft: 15,
                  }}
                >
                  <Text
                    onPress={() => {
                      props.onPressIgnore()
                    // if ( isOpenFromNotificationList ) props.navigation.goBack()
                    // else
                    //   onClick( false, true )
                    }}
                    style={{
                      ...styles.proceedButtonText, color: Colors.blue
                    }}
                  >
                    {props.cancelButtonText}
                  </Text>
                </AppBottomSheetTouchableWrapper>
              )
            }

          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginHorizontal: wp( '8%' ),
    marginVertical: wp( '4%' ),
    flexDirection:'row'
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalAmountView: {
    justifyContent: 'center',
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: hp( '2%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '4%' ),
  },
  successModalImage: {
    width: wp( '30%' ),
    height: wp( '35%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginRight: -5,
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
