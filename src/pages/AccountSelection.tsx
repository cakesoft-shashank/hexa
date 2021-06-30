import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  ImageSourcePropType,
  Modal,
  ImageBackground
} from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../common/Fonts'
import Colors from '../common/Colors'
import CommonStyles from '../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import HeaderTitle from '../components/HeaderTitle'
import { useDispatch, useSelector } from 'react-redux'
import { setupWallet } from '../store/actions/setupAndAuth'
import ButtonBlue from '../components/ButtonBlue'
import { ActivityIndicator } from 'react-native-paper'
import Toast from '../components/Toast'
interface AccountOption {
    id: number;
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    screenName?: string;
    onOptionPressed?: () => void;
  }

const accountOptions: AccountOption[] = [
  {
    id: 1,
    title: 'Test Account',
    imageSource: require( '../assets/images/accIcons/icon_test.png' ),
    subtitle: 'An on-chain, single-signature wallet Fast and easy. Ideal for small amounts',
    // screenName: 'FriendsAndFamily',
  },
  {
    id: 2,
    title: 'Checking Account',
    imageSource: require( '../assets/images/accIcons/icon_checking.png' ),
    subtitle: 'An on-chain, single-signature wallet Fast and easy. Ideal for small amounts',
  },
  {
    id: 3,
    title: 'Savings Account',
    imageSource: require( '../assets/images/accIcons/icon_savings.png' ),
    subtitle: 'An on-chain, 2 of 3 multi-signature wallet. Use for securing larger amounts',
  },
  {
    id: 4,
    title: 'Donation Account',
    imageSource: require( '../assets/images/accIcons/icon_donation.png' ),
    subtitle: 'An on-chain, 2 of 3 multi-signature wallet. Use for securing larger amountss',
  },
  {
    id: 5,
    title: 'F&F Account',
    imageSource: require( '../assets/images/accIcons/icon_F&F.png' ),
    subtitle: 'A separate account where you can receive funds from your contacts',
  },
  {
    id: 6,
    title: 'Bought BTC Account',
    imageSource: require( '../assets/images/accIcons/boughtbtc.png' ),
    subtitle: 'Bought or Exchange Account where newly bought bitcoins land',
  }
]

export default function AccountSelection( props: { navigation: { getParam: ( arg0: string ) => any; navigate: ( arg0: string, arg1: { walletName: any, selectedAcc: string[] } ) => void } } ) {
  const [ processing, showProcessing ] = useState( false )
  const [ knowMore, showKnowMore ] = useState( false )
  const [ dropdownBoxOpenClose, setDropdownBoxOpenClose ] = useState( false )
  const dispatch = useDispatch()
  const walletName = props.navigation.getParam( 'walletName' )
  const [ isDisabled, setIsDisabled ] = useState( false )
  const { walletSetupCompleted } = useSelector( ( state ) => state.setupAndAuth )
  const [ selectedAcc, setSelectedAcc ] = useState( [ 'Checking Account' ] )

  useEffect( () => {
    requestAnimationFrame(
      () => {
        dispatch( setupWallet( walletName, '', {
          REGULAR_ACCOUNT: true
        } ) )
      }
    )
  }, [] )


  const confirmAction = ( isAccountselected ) => {
    if ( isAccountselected ) {
      props.navigation.navigate( 'NewWalletQuestion', {
        walletName, selectedAcc
      } )
    } else {
      props.navigation.navigate( 'NewWalletQuestion', {
        walletName, selectedAcc: []
      } )
    }

  }

  const selectAccount = ( title ) => {

    if ( title === 'Checking Account' ) {
      return
    }
    if ( selectedAcc.includes( title ) ) {
      setSelectedAcc( selectedAcc.filter( item => item !== title ) )
    } else {
      showProcessing( true )
      setTimeout( () => {
        showProcessing( false )
        Toast( `${title} has been added successfully` )
      }, 700 )
      const newArr = [ ...selectedAcc ]
      newArr.push( title )
      setSelectedAcc( newArr )
    }
    switch( title ) {
        case 'Test Account': requestAnimationFrame(
          () => {
            dispatch( setupWallet( walletName, '', {
              TEST_ACCOUNT: true
            } ) )
          }
        )
          break
        case 'Savings Account': requestAnimationFrame(
          () => {
            dispatch( setupWallet( walletName, '', {
              SECURE_ACCOUNT: true
            } ) )
          }
        )
          break
    }
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor1
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <SafeAreaView style={{
        flex: 0
      }} />
      <Modal visible={processing} transparent
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
          // flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            // paddingBottom: hp( '9%' )
            // borderRadius: 20

          }}
        >
          <ActivityIndicator color={Colors.white} style={{
            alignSelf: 'center',
          }} />
        </View>
      </Modal>
      <ScrollView>
        <View style={{
          flex: 1,
          backgroundColor: Colors.backgroundColor
        }}>
          <View style={[ CommonStyles.headerContainer, {
            backgroundColor: Colors.backgroundColor,
            borderBottomWidth: 0
          } ]}>
            <TouchableOpacity
              style={CommonStyles.headerLeftIconContainer}
              onPress={() => {
                props.navigation.goBack()
              }}
            >
              <View style={CommonStyles.headerLeftIconInnerContainer}>
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={10}
            style={{
              flex: 1
            }}
            onPress={() => {
              setDropdownBoxOpenClose( false )
              Keyboard.dismiss()
            }}
            disabled={isDisabled}
          >
            <HeaderTitle
              firstLineTitle={'Step 2'}
              secondLineTitle={'Personalize your accounts'}
              infoTextNormal={'New Wallet creation '}
              infoTextBold={''}
              infoTextNormal1={''}
              step={''}
            />
            <View style={{
              marginTop: hp( 3 )
            }}/>
            {accountOptions.map( ( item, index ) => {
              return(
                <TouchableOpacity
                  key={index}
                  onPress={() => selectAccount( item.title )}
                  style={{
                    // flex: 1,
                    width: '90%', height: hp( '11%' ), backgroundColor: selectedAcc.includes( item.title ) ?  Colors.lightBlue: Colors.white,
                    alignSelf: 'center', justifyContent: 'center',
                    borderRadius: wp( '4' ),
                    marginBottom: hp( '1%' ),
                  }}>
                  {/* <TouchableWithoutFeedback> */}
                  <TouchableOpacity
                    onPress={() => showKnowMore( true )
                    }
                    style={{
                      borderRadius: 6, borderWidth: selectedAcc.includes( item.title ) ? 0.6 : 0, borderColor: selectedAcc.includes( item.title ) ? Colors.white : Colors.textColorGrey, backgroundColor: selectedAcc.includes( item.title ) ? Colors.lightBlue : Colors.backgroundColor,
                      alignSelf: 'flex-end',  position: 'absolute', right: 10, top: 10
                    }}>
                    <Text style={{
                      margin: 6, color: selectedAcc.includes( item.title ) ? Colors.white : Colors.textColorGrey, fontSize: RFValue( 10 )
                    }}>
                          Know More
                    </Text>
                  </TouchableOpacity>
                  {/* </TouchableWithoutFeedback> */}
                  <View style={{
                    flexDirection:'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginHorizontal: wp( '4%' )
                  }}>
                    <View style={{
                      width: 45,
                      height: 45,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                      <Image
                        style={{
                          width: '100%', height: '100%'
                        }}
                        source={item.imageSource}
                      />
                    </View>
                    <View style={{
                      flex: 1,
                      marginLeft: wp( 2 )
                    }}>
                      <Text style={{
                        marginBottom: hp( 1 ),
                        fontSize: RFValue( 12 ), fontFamily:  Fonts.FiraSansRegular, color: selectedAcc.includes( item.title ) ? Colors.white : Colors.black
                      }}>
                        {item.title}
                      </Text>
                      <Text style={{
                        // flex: 1,
                        marginRight: wp( 10 ),
                        fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: selectedAcc.includes( item.title ) ? Colors.white : Colors.textColorGrey
                      }}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {/* {isSelected && ( */}


                  {/* )} */}
                </TouchableOpacity>
              )
            } )}


          </TouchableOpacity>

        </View>
      </ScrollView>
      <Modal visible={knowMore} transparent
        onRequestClose={() => showKnowMore( false )}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity onPressOut={() => {
          showKnowMore( false )
        }}
        style={{
          // flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: hp( '9%' )

        }}
        >
          <TouchableWithoutFeedback>
            <View style={{
              width: '95%',
              borderRadius: wp( '2%' ),
              overflow: 'hidden',
            }}>
              <ImageBackground
                source={require( '../assets/images/home-bg.png' )}
                style={{
                  width: '100%',
                //   flex: 1,
                }}
                imageStyle={{
                  resizeMode: 'stretch',
                }}
              >
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {showKnowMore( false )}}
                  style={{
                    width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
                    alignSelf: 'flex-end',
                    backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
                    marginTop: wp( 3 ), marginRight: wp( 3 )
                  }}
                >
                  <FontAwesome name="close" color={Colors.white} size={19} style={{
                    // marginTop: hp( 0.5 )
                  }} />
                </TouchableOpacity>
                <View style={{
                //   flex: 1,
                //   height: '63%'
                  alignItems: 'center'
                }}>
                  <Text style={{
                    marginTop: hp( 1 ), marginBottom: hp( 4 ), color: Colors.backgroundColor1, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 18 )
                  }}>Checking Account</Text>
                  <Text style={{
                    textAlign: 'center',
                    marginHorizontal: hp( 2 ),
                    color: Colors.backgroundColor1, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 12 )
                  }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.</Text>

                  <View style={{
                    alignSelf: 'center',
                    borderWidth: 1,
                    borderColor: Colors.white,
                    borderRadius: wp( 20 ), width: wp( 40 ), height: wp( 40 ), padding: wp( 6 ),
                    marginVertical: hp( 5 )
                  }}>
                    <View style={{
                      alignSelf: 'center',
                      borderWidth: 1,
                      borderColor: Colors.white,
                      borderRadius: wp( 15 ), width: wp( 30 ), height: wp( 30 ), padding: wp( 6 ),
                      alignItems: 'center',
                      justifyContent: 'center',
                    //   marginVertical: hp( 6 )
                    }}>
                      <Image source={require( '../assets/images/icons/icon_checking_blue.png' )}
                        style={ {
                          width: 60, height: 60, alignSelf: 'center'
                        }} />
                    </View>
                  </View>
                  <Text style={{
                    textAlign: 'center',
                    margin: hp( 2 ),
                    color: Colors.backgroundColor1, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 12 )
                  }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididun.</Text>
                </View>

              </ImageBackground>
            </View>
          </TouchableWithoutFeedback>

        </TouchableOpacity>
      </Modal>
      <View style={{
        alignItems: 'center', marginLeft: wp( '9%' ), marginBottom: hp( '3%' ),
        flexDirection: 'row', backgroundColor: Colors.backgroundColor
      }}>
        <ButtonBlue
          buttonText="Proceed"
          handleButtonPress={() => confirmAction( true )}
          buttonDisable={false}
        />
        {/* <TouchableOpacity
          onPress={() => confirmAction( false )}
        >
          <Text style={{
            color: Colors.blue,
            fontFamily: Fonts.FiraSansMedium,
            alignSelf: 'center',
            marginLeft: wp( '5%' )
          }}>Skip</Text>
        </TouchableOpacity> */}
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  dropdownBox: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: 'center',
  },
  dropdownBoxOpened: {
    flexDirection: 'row',
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  buttonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  bottomButtonView: {
    flexDirection: 'row',
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomButtonView1: {
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',
  },
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 2, height: 2
    },
    backgroundColor: Colors.white,
  },
  modalInputBox: {
    // flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    marginRight: 15,
  },
  dropdownBoxModal: {
    borderRadius: 10,
    margin: 15,
    height: 'auto',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: {
      width: 0, height: 10
    },
    backgroundColor: Colors.white,
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: 'center',
    paddingLeft: 15,
    paddingRight: 15,
  },

  helpText: {
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
    paddingHorizontal: 24,
  }
} )
