import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { View, Text, StatusBar, ScrollView, TouchableOpacity, SafeAreaView, StyleSheet, Image, FlatList, Platform, PermissionsAndroid, TextInput, Linking } from 'react-native'
import Fonts from '../../common/Fonts'
import BackupStyles from './Styles'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import ContactList from '../../components/ContactList'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import CommonStyles from '../../common/Styles/Styles'
import HeaderTitle from '../../components/HeaderTitle'
import { TrustedContactRelationTypes, Trusted_Contacts } from '../../bitcoin/utilities/Interface'
import trustedContacts from '../../store/reducers/trustedContacts'
import { useSelector, useDispatch } from 'react-redux'
import ImageStyles from '../../common/Styles/ImageStyles'
import RecipientAvatar from '../../components/RecipientAvatar'
import LastSeenActiveIndicator from '../../components/LastSeenActiveIndicator'
import { agoTextForLastSeen } from '../../components/send/LastSeenActiveUtils'
import idx from 'idx'
import { v4 as uuid } from 'uuid'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { setIsPermissionGiven } from '../../store/actions/preferences'
import * as Permissions from 'expo-permissions'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as ExpoContacts from 'expo-contacts'
import ErrorModalContents from '../../components/ErrorModalContents'
import ModalContainer from '../../components/home/ModalContainer'
import RadioButton from '../../components/RadioButton'
import AntDesign from 'react-native-vector-icons/AntDesign'

const FNFToKeeper = ( props ) => {
  const [ contact, setContact ] = useState( [] )
  const [ IsExistingContact, setIsExistingContact ] = useState( false )
  const [ contacts, setContacts ] = useState( [] )
  const [ selectedItem, setSelected ] = useState( '' )
  const [ filterContactData, setFilterContactData ] = useState( [] )
  const [ permissionsModal, setPermissionsModal ] = useState( false )
  const [ radioOnOff, setRadioOnOff ] = useState( false )
  const [ errorMessage, setErrorMessage ] = useState( '' )
  const [ permissionsErrModal, setPermissionsErrModal ] = useState( false )
  const [ contactPermissionIOS, setContactPermissionIOS ] = useState( false )
  const [ contactData, setContactData ] = useState( [] )
  const [ searchName, setSearchName ] = useState( '' )
  const [ contactPermissionAndroid, setContactPermissionAndroid ] = useState(
    false,
  )
  const trustedContacts: Trusted_Contacts = useSelector( ( state ) => state.trustedContacts.contacts )
  const dispatch = useDispatch()

  useEffect( () => {
    const contacts: Trusted_Contacts = trustedContacts
    // getContact( contacts )
    const c = []
    for ( const channelKey of Object.keys( contacts ) ) {
      const contact = contacts[ channelKey ]
      if ( ( contact.relationType === TrustedContactRelationTypes.CONTACT || contact.relationType === TrustedContactRelationTypes.WARD ) && contact.contactDetails.contactName ) {
        c.push( {
          ...contact, channelKey
        } )
      }
    }
    // if ( c.length === 0 ) {
    //   props.navigation.state.params.selectContact( 'AddContact', {
    //   } )
    //   props.navigation.goBack()
    // }
    setContacts( c )
  }, [] )

  const selectedContactsList = useCallback( ( list ) => {
    console.log( 'sdfsdf' )
    if ( list.length > 0 ) {
      console.log( 'selectedContactsList' )
      setIsExistingContact( false )
      setContact( [ ...list ] )
    }
  }, [] )

  const onPressSkip = () => {
    const contactDummy = {
      id: uuid(),
    }
    props.navigation.state.params.onPressContinue( [ contactDummy ] )
    props.navigation.goBack()
  }

  // const getContact = () => {
  //   ExpoContacts.getContactsAsync().then( async ( { data } ) => {
  //     const filteredData = data.find( item => item.id === contactInfo.id )
  //     // setPhoneumber( filteredData.phoneNumbers )

  //     setContact( filteredData )
  //     // setEmails( filteredData.emails )
  //     // await AsyncStorage.setItem( 'ContactData', JSON.stringify( data ) )
  //   } )
  // }

  const firstNamePieceText = ( contact ) => {
    return contact && contact.contactName ? contact.contactName?.split( ' ' )[ 0 ] + ' ' : ''
  }

  const secondNamePieceText = ( contact ) => {
    return contact && contact.contactName ? contact.contactName?.split( ' ' ).slice( 1 ).join( ' ' ) : ''
  }

  const renderContactListItem = useCallback( ( {
    contactDescription,
    index,
    contact
  }: {
    contactDescription: any;
    index: number;
    contactsType: string;
    contact: any
  }
  ) => {
    const instreamId = contactDescription.streamId
    let lastSeenActive
    if( instreamId ) {
      const instream = idx( contactDescription, ( _ ) => _.unencryptedPermanentChannel[ instreamId ] )
      lastSeenActive = idx( instream, ( _ ) => _.metaData.flags.lastSeen )
    }
    return <TouchableOpacity style={{
      ...styles.listItem, backgroundColor: contact.length && contact[ 0 ].id == contactDescription.contactDetails.id && contact[ 0 ].isExisting ? Colors.primaryAccent : Colors.backgroundColor1
    }} onPress={() => {
      const obj = {
        name: contactDescription.contactDetails.contactName,
        imageAvailable: contactDescription.contactDetails.imageAvailable ? true : false,
        image: contactDescription.contactDetails.imageAvailable,
        id: contactDescription.contactDetails.id,
        channelKey: contactDescription.channelKey,
        isExisting: true
      }
      setContact( [ obj ] )
      setIsExistingContact( true )
    }}
    >
      <View style={styles.avatarContainer}>
        <RecipientAvatar recipient={contactDescription.contactDetails} contentContainerStyle={styles.avatarImage} />
        <LastSeenActiveIndicator
          style={{
            position: 'absolute',
            right: -2,
            top: -2,
            elevation: 2,
            zIndex: 2,
          }}
          timeSinceActive={lastSeenActive}
        />
      </View>
      <View style={{
        flexDirection:'column',
        justifyContent:'center'
      }}>
        <View style={{
          alignItems: 'flex-start'
        }}>
          <Text style={{
            textAlign: 'center', fontFamily: Fonts.FiraSansRegular, color: Colors.textColorGrey
          }}>{firstNamePieceText( contactDescription.contactDetails )}
            <Text style={{
              ...styles.secondNamePieceText, fontFamily: Fonts.FiraSansMedium
            }}>{secondNamePieceText( contactDescription.contactDetails )}</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>

  }, [] )

  const onPressContinue = () => {
    props.navigation.state.params.onPressContinue( contact )
    props.navigation.goBack()
  }

  // For contact List
  useEffect( () => {
    if ( props.selectedContacts ) {
      for ( let i = 0; i < filterContactData.length; i++ ) {
        if (
          props.selectedContacts.findIndex(
            ( value ) => value.id == filterContactData[ i ].id,
          ) > -1
        ) {
          filterContactData[ i ].checked = true
        } else {
          filterContactData[ i ].checked = false
        }
      }
      setRadioOnOff( !radioOnOff )
      setFilterContactData( filterContactData )
      // props.onSelectContact( selectedcontactlist )
    }
  }, [ filterContactData ] )

  const getContactsAsync = async () => {
    dispatch( setIsPermissionGiven( true ) )
    if ( Platform.OS === 'android' ) {
      const chckContactPermission = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.READ_CONTACTS )
      //console.log("chckContactPermission",chckContactPermission)
      if ( !chckContactPermission ) {
        // ( contactPermissionBottomSheet as any ).current.snapTo( 1 )
        setPermissionsModal( true )
      } else {
        getContactPermission()
      }
    } else if ( Platform.OS === 'ios' ) {
      if( ( await Permissions.getAsync( Permissions.CONTACTS ) ).status === 'undetermined' ){
        // ( contactPermissionBottomSheet as any ).current.snapTo( 1 )
        setPermissionsModal( true )
      }
      else {
        getContactPermission()
      }
    }
  }

  const getContact = () => {
    ExpoContacts.getContactsAsync().then( async ( { data } ) => {
      if ( !data.length ) {
        //Alert.alert('No contacts found!');
        setErrorMessage(
          'No contacts found. Please add contacts to your Address Book and try again',
        )
        // ( contactListErrorBottomSheet as any ).current.snapTo( 1 )
        setPermissionsErrModal( true )
      }
      setContactData( data )
      await AsyncStorage.setItem( 'ContactData', JSON.stringify( data ) )
      const contactList = data.sort( function ( a, b ) {
        if ( a.name && b.name ) {
          if ( a.name.toLowerCase() < b.name.toLowerCase() ) return -1
          if ( a.name.toLowerCase() > b.name.toLowerCase() ) return 1
        }
        return 0
      } )
      setFilterContactData( contactList )
    } )
  }

  const getContactPermission = async () => {
    dispatch( setIsPermissionGiven( true ) )
    if ( Platform.OS === 'android' ) {
      const granted = await requestContactsPermission()
      if ( granted !== PermissionsAndroid.RESULTS.GRANTED ) {
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        )
        // ( contactListErrorBottomSheet as any ).current.snapTo( 1 )
        setPermissionsErrModal( true )
        setContactPermissionAndroid( false )
        return
      } else {
        getContact()
      }
    } else if ( Platform.OS === 'ios' ) {
      const { status } = await Permissions.getAsync( Permissions.CONTACTS )
      if ( status === 'denied' ) {
        setContactPermissionIOS( false )
        setErrorMessage(
          'Cannot select contacts. Permission denied.\nYou can enable contacts from the phone settings page Settings > Hexa > contacts',
        )
        // ( contactListErrorBottomSheet as any ).current.snapTo( 1 )
        setPermissionsErrModal( true )
        return
      } else {
        getContact()
      }
    }
  }

  const requestContactsPermission = async () => {
    try {
      dispatch( setIsPermissionGiven( true ) )
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Hexa Would Like to Access Your Contacts',
          message:
            'Address book details are only stored locally',
          buttonPositive: 'Allow',
          buttonNegative: 'Deny',
        },
      )
      return result
    } catch ( err ) {
      console.warn( err )
    }
  }

  const filterContacts = ( keyword ) => {
    if ( contactData.length > 0 ) {
      if ( !keyword.length ) {
        setFilterContactData( contactData )
        return
      }
      const isFilter = true
      const filterContactsForDisplay = []
      for ( let i = 0; i < contactData.length; i++ ) {
        if (
          ( contactData[ i ].firstName &&
            contactData[ i ].firstName
              .toLowerCase()
              .startsWith( keyword.toLowerCase() ) ) ||
          ( contactData[ i ].lastName &&
            contactData[ i ].lastName
              .toLowerCase()
              .startsWith( keyword.toLowerCase() ) )
        ) {
          filterContactsForDisplay.push( contactData[ i ] )
        }
      }
      setFilterContactData( filterContactsForDisplay )
    } else {
      return
    }
  }

  useEffect( () => {
    ( async () => {
      await AsyncStorage.getItem( 'ContactData', ( err, value ) => {
        if ( err ) console.log( 'ERROR in COntactData', err )
        else {
          const data = JSON.parse( value )
          if ( data && data.length ) {
            setContactData( data )
            const contactList = data.sort( function ( a, b ) {
              if ( a.name && b.name ) {
                if ( a.name.toLowerCase() < b.name.toLowerCase() ) return -1
                if ( a.name.toLowerCase() > b.name.toLowerCase() ) return 1
              }
              return 0
            } )
            setFilterContactData( contactList )
          }
        }
      } )
    } )()
    getContactsAsync()
  }, [] )

  async function onContactSelect( index ) {
    let contact = []
    const contacts = filterContactData
    if ( contacts[ index ].checked ) {
      contact = []
    } else {
      contact[ 0 ] = contacts[ index ]
    }
    setContact( contact )
    for ( let i = 0; i < contacts.length; i++ ) {
      if (
        contact.findIndex( ( value ) => value.id == contacts[ i ].id ) > -1
      ) {
        contacts[ i ].checked = true
      } else {
        contacts[ i ].checked = false
      }
    }
    setRadioOnOff( !radioOnOff )
    setFilterContactData( contacts )
    // props.onSelectContact( selectedContacts )
  }

  const renderContactListErrorModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        // modalRef={contactListErrorBottomSheet}
        title={'Error while accessing your contacts '}
        info={errorMessage}
        proceedButtonText={'Open Setting'}
        isIgnoreButton={true}
        onPressProceed={() => {
          Linking.openURL( 'app-settings:' )
          // ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
          setPermissionsErrModal( false )
        }}
        onPressIgnore={() => {
          // ( contactListErrorBottomSheet as any ).current.snapTo( 0 )
          setPermissionsErrModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/errorImage.png' )}
      />
    )
  }, [ errorMessage ] )

  const renderContactPermissionModalContent = useCallback( () => {
    return (
      <ErrorModalContents
        // modalRef={contactPermissionBottomSheet}
        title={'Hexa needs access to your address book.'}
        info={'If you want to associate an address book contact with your Friends & Family in Hexa, you will need to give access to your address book \n\nIt is a good way to remember who the contacts are with their name and image'}
        otherText={'We neither store this data nor pass it to anyone else. This is for your convenience only'}
        proceedButtonText={'Continue'}
        isIgnoreButton={false}
        onPressProceed={() => {
          getContactPermission()
          // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
          setPermissionsModal( false )
        }}
        onPressIgnore={() => {
          // ( contactPermissionBottomSheet as any ).current.snapTo( 0 )
          setPermissionsModal( false )
        }}
        isBottomImage={true}
        bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
      />
    )
  }, [] )

  async function onCancel( value ) {
    if ( filterContactData.findIndex( ( tmp ) => tmp.id == value.id ) > -1 ) {
      filterContactData[
        filterContactData.findIndex( ( tmp ) => tmp.id == value.id )
      ].checked = false
    }
    contact.splice(
      contact.findIndex( ( temp ) => temp.id == value.id ),
      1,
    )
    setContact( contact )
    setRadioOnOff( !radioOnOff )
    // props.onSelectContact( selectedContacts )
  }

  return (
    <View style={{
      flex: 1,
      backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SafeAreaView />
      <View style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor
      }}>
        <View
          style={{
            ...BackupStyles.modalHeaderTitleView,
            paddingTop: hp( '0.5%' ),
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 20,
          }}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.navigation.goBack()
            }}
            style={{
              height: 30,
              width: 30,
              justifyContent: 'center'
            }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </AppBottomSheetTouchableWrapper>
          <View style={{
            flex:1,
          }}>
            <Text style={BackupStyles.modalHeaderTitleText}>Send Recovery Key</Text>
            <Text numberOfLines={2} style={{
              color: Colors.textColorGrey,
              fontSize: RFValue( 12 ),
              fontFamily: Fonts.FiraSansRegular
            }} >
              {'Send the Recovery Key to your Friends & Family, or select a new contact from the address book'}
            </Text>
          </View>
          <AppBottomSheetTouchableWrapper
            onPress={onPressSkip}
            style={{
              height: wp( '13%' ),
              width: wp( '13%' ),
              justifyContent: 'center',
              alignItems: 'flex-end',
            }}
          >
            <Text
              style={{
                ...{
                  color: Colors.white,
                  fontSize: RFValue( 13 ),
                  fontFamily: Fonts.FiraSansMedium,
                },
                color: Colors.blue,
              }}
            >
            Skip
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
        {contacts.length ? <View>
          <Text style={{
            marginHorizontal: wp( 2 ),
            color: Colors.blue,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue( 16 ),
            marginLeft: wp( 4 ),
            marginBottom: wp( 2 ),
            marginTop: wp( 2 )
          }}>Friends & Family: </Text>
          <View style={{
            height: 'auto',
          }}>
            <ScrollView style={{
              height: 'auto', backgroundColor: Colors.borderColor
            }} horizontal={true} alwaysBounceHorizontal={true}>
              {( contacts.length && contacts.map( ( item, index ) => {
                return renderContactListItem( {
                  contactDescription: item,
                  index,
                  contactsType: 'Other Contacts',
                  contact
                } )
              } ) ) ||
              <View style={styles.noContacts} >
                <Text style={{
                  color: Colors.gray2,
                }}>
              No contacts</Text>
              </View>
              }
            </ScrollView>
          </View>
        </View> : null}
        <Text style={{
          marginHorizontal: wp( 2 ),
          color: Colors.blue,
          fontFamily: Fonts.FiraSansRegular,
          fontSize: RFValue( 16 ),
          marginLeft: wp( 4 ),
          marginBottom: wp( 2 ),
          marginTop: wp( 2 )
        }}>Select from address book: </Text>
        <View style={{
        }}>
          <View style={styles.selectedContactContainer}>
            {contact.length > 0 && !contact[ 0 ].isExisting
              ? contact.map( ( value, index ) => {
                return (
                  <View key={index} style={styles.selectedContactView}>
                    <Text style={styles.selectedContactNameText}>
                      {value.name ? value.name.split( ' ' )[ 0 ] : ''}{' '}
                      <Text style={{
                        fontFamily: Fonts.FiraSansMedium
                      }}>
                        {value.name ? value.name.split( ' ' )[ 1 ] : ''}
                      </Text>
                    </Text>
                    <AppBottomSheetTouchableWrapper
                      onPress={() => onCancel( value )}
                    >
                      <AntDesign name="close" size={17} color={Colors.white} />
                    </AppBottomSheetTouchableWrapper>
                  </View>
                )
              } )
              : null}
          </View>
          <View style={[ styles.searchBoxContainer ]}>
            <View style={styles.searchBoxIcon}>
              <EvilIcons
                style={{
                  alignSelf: 'center'
                }}
                name="search"
                size={20}
                color={Colors.textColorGrey}
              />
            </View>
            <TextInput
              style={styles.searchBoxInput}
              keyboardType={
                Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
              }
              autoCorrect={false}
              autoFocus={false}
              autoCompleteType="off"
              placeholder="Search"
              placeholderTextColor={Colors.textColorGrey}
              onChangeText={( nameKeyword ) => {
                nameKeyword = nameKeyword.replace( /[^A-Za-z0-9 ]/g, '' )
                setSearchName( nameKeyword )
                filterContacts( nameKeyword )
              }
              }
              value={searchName}
            />
          </View>
          <View style={{
            position: 'relative',
            // flex:1
          }}>
            {filterContactData ? (
              <FlatList
                style={{
                }}
                contentInset={{
                  right: 0, top: 0, left: 0, bottom: hp( 24 )
                }}
                keyExtractor={( item, index ) => item.id}
                data={filterContactData}
                extraData={radioOnOff}
                showsVerticalScrollIndicator={false}
                renderItem={( { item, index } ) => {
                  let selected = false
                  if (
                    contact.findIndex( ( temp ) => temp.id == item.id && !temp.isExisting ) > -1
                  ) {
                    selected = true
                  }
                  //  if (item.phoneNumbers || item.emails) {
                  return (
                    <AppBottomSheetTouchableWrapper
                      onPress={() => onContactSelect( index )}
                      style={styles.contactView}
                      key={index}
                    >
                      <RadioButton
                        size={15}
                        color={Colors.lightBlue}
                        borderColor={Colors.borderColor}
                        isChecked={item.checked}
                        onpress={() => onContactSelect( index )}
                      />
                      <Text style={styles.contactText}>
                        {item.name && item.name.split( ' ' )[ 0 ]
                          ? item.name.split( ' ' )[ 0 ]
                          : ''}{' '}
                        <Text style={{
                          fontFamily: Fonts.FiraSansMedium
                        }}>
                          {item.name && item.name.split( ' ' )[ 1 ]
                            ? item.name.split( ' ' )[ 1 ]
                            : ''}
                        </Text>
                      </Text>
                    </AppBottomSheetTouchableWrapper>
                  )
                  // }
                  // else {
                  //   return null;
                  // }
                }}
              />
            ) : null}
          </View>
          {contact.length >= 1 &&
          <View
            style={{
              position: 'absolute',
              bottom: contacts.length ? hp( 63 ) : hp ( 35 ),
              flex:1,
              width: wp( '50%' ),
              alignSelf: 'center',
            }}
          >
            <AppBottomSheetTouchableWrapper
              // disabled={approvingTrustedContact}
              onPress={() => onPressContinue()}
              style={{
                ...styles.bottomButtonView,
                backgroundColor: Colors.blue,
              }}
            >
              <Text style={styles.buttonText}>Confirm & Proceed</Text>
            </AppBottomSheetTouchableWrapper>
          </View>
          }
        </View>
      </View>
      <ModalContainer visible={permissionsErrModal} closeBottomSheet={() => {}} >
        {renderContactListErrorModalContent()}
      </ModalContainer>
      <ModalContainer visible={permissionsModal} closeBottomSheet={() => {}} >
        {renderContactPermissionModalContent()}
      </ModalContainer>
      {/* </SafeAreaView> */}
    </View>
  )
}

export default FNFToKeeper

const styles = StyleSheet.create( {
  noContacts: {
    height: wp( '22%' ) + 30,
    alignSelf: 'center',
    marginTop: hp( 4 ),
  },
  addContactBtn: {
    marginHorizontal: wp( 4 ),
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp( 1 )
  },
  plusIcon: {
    height: wp( 9 ),
    width: wp( 8 ),
    resizeMode: 'contain'
  },
  listItem: {
    marginHorizontal: wp( 2 ),
    marginVertical: hp( 2 ),
    borderRadius: wp( 2 ),
    padding: wp( 3 ),
    height: wp( 30 ),
    width: wp( 25 ),
    justifyContent:'center',
    alignItems:'center'
  },
  secondNamePieceText: {
    fontWeight: 'bold',
    fontSize: RFValue( 13 )
  },
  avatarImage: {
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 ) / 2,
    marginHorizontal: wp( 1 ),
  },
  avatarContainer: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
  },
  contactView: {
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: 20,
  },
  contactText: {
    marginLeft: 10,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  contactIndexView: {
    flex: 0.5,
    height: '100%',
    justifyContent: 'space-evenly',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 0.5,
    marginLeft: 10,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  searchBoxIcon: {
    justifyContent: 'center',
    marginBottom: -10,
  },
  searchBoxInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.blacl,
    borderBottomColor: Colors.borderColor,
    alignSelf: 'center',
    marginBottom: -10,
  },
  bottomButtonView: {
    height: 50,
    width: wp( '50%' ),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
  selectedContactContainer: {
    height: wp( '20%' ),
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
  },
  selectedContactView: {
    width: wp( '42%' ),
    height: wp( '12%' ),
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedContactNameText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
} )

