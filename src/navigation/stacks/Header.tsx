import React, { createRef, PureComponent } from 'react'
import {
  View,
  Platform,
  Linking,
  Alert,
  AppState,
  InteractionManager,
  TouchableOpacity,
  Modal,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Easing } from 'react-native-reanimated'
import {
  heightPercentageToDP,
  // widthPercentageToDP,
} from 'react-native-responsive-screen'
import DeviceInfo from 'react-native-device-info'
import CustodianRequestRejectedModalContents from '../../components/CustodianRequestRejectedModalContents'
import * as RNLocalize from 'react-native-localize'
import { BottomSheetView } from '@gorhom/bottom-sheet'
import Colors from '../../common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import {
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
  SECURE_ACCOUNT,
  FAST_BITCOINS,
} from '../../common/constants/wallet-service-types'
import {
  downloadMShare,
  uploadRequestedShare,
  // initHealthCheck,
} from '../../store/actions/sss'
import {
  initializeHealthSetup,
  onApprovalStatusChange,
  autoDownloadShareContact,
  uploadSecondaryShareForPK,
  downloadSMShard,
  updateKeeperInfoToUnderCustody,
  updateCloudPermission,
} from '../../store/actions/health'
import { createRandomString } from '../../common/CommonFunctions/timeFormatter'
import { connect } from 'react-redux'
import {
  initializeTrustedContact,
  rejectTrustedContact,
  InitTrustedContactFlowKind,
} from '../../store/actions/trustedContacts'
import {
  updateFCMTokens,
  fetchNotifications,
  notificationsUpdated,
} from '../../store/actions/notifications'
import {
  setCurrencyCode,
  setCardData,
  setIsPermissionGiven,
  updateLastSeen
} from '../../store/actions/preferences'
import {
  getCurrencyImageByRegion,
  getKeeperInfoFromShareId,
} from '../../common/CommonFunctions/index'
import ErrorModalContents from '../../components/ErrorModalContents'
import Toast from '../../components/Toast'
import PushNotification from 'react-native-push-notification'
import NotificationListContent from '../../components/NotificationListContent'
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter'
import RelayServices from '../../bitcoin/services/RelayService'
// import AddContactAddressBook from '../Contacts/AddContactAddressBook'
import config from '../../bitcoin/HexaConfig'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import HomeHeader from '../../components/home/home-header_update'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import CustomBottomTabs, {
  BottomTab,
  TAB_BAR_HEIGHT,
} from '../../components/home/custom-bottom-tabs'
import {
  addTransferDetails,
  autoSyncShells,
  addNewAccountShell,
  fetchFeeAndExchangeRates
} from '../../store/actions/accounts'
import {
  LevelHealthInterface,
  MetaShare,
  QRCodeTypes,
} from '../../bitcoin/utilities/Interface'
import { ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import moment from 'moment'
import { NavigationActions, StackActions, withNavigationFocus } from 'react-navigation'
import CustodianRequestModalContents from '../../components/CustodianRequestModalContents'
import {
  updatePreference,
  setFCMToken,
  setSecondaryDeviceAddress,
} from '../../store/actions/preferences'
import { fetchKeeperTrustedChannel } from '../../store/actions/keeper'
import S3Service from '../../bitcoin/services/sss/S3Service'
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount'
import Bitcoin from '../../bitcoin/utilities/accounts/Bitcoin'
// import TrustedContactRequestContent from './TrustedContactRequestContent'
import BottomSheetBackground from '../../components/bottom-sheets/BottomSheetBackground'
import BottomSheetHeader from '../Accounts/BottomSheetHeader'
import { Button } from 'react-native-elements'
import checkAppVersionCompatibility from '../../utils/CheckAppVersionCompatibility'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import BottomSheet from '@gorhom/bottom-sheet'
import { resetToHomeAction } from '../../navigation/actions/NavigationActions'
import { Milliseconds } from '../../common/data/typealiases/UnitAliases'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { getEnvReleaseTopic } from '../../utils/geEnvSpecificParams'
import { AccountsState } from '../../store/reducers/accounts'
import HomeAccountCardsList from './HomeAccountCardsList'
import AccountShell from '../../common/data/models/AccountShell'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import SourceAccountKind from '../../common/data/enums/SourceAccountKind'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import CloudBackupStatus from '../../common/data/enums/CloudBackupStatus'
import SwanAccountCreationStatus from '../../common/data/enums/SwanAccountCreationStatus'
import messaging from '@react-native-firebase/messaging'
import firebase from '@react-native-firebase/app'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import BuyBitcoinHomeBottomSheet, { BuyBitcoinBottomSheetMenuItem, BuyMenuItemKind } from '../../components/home/BuyBitcoinHomeBottomSheet'
import BottomSheetWyreInfo from '../../components/bottom-sheets/wyre/BottomSheetWyreInfo'
import BottomSheetRampInfo from '../../components/bottom-sheets/ramp/BottomSheetRampInfo'
import BottomSheetSwanInfo from '../../components/bottom-sheets/swan/BottomSheetSwanInfo'
import { setVersion } from '../../store/actions/versionHistory'
import { clearSwanCache, updateSwanStatus, createTempSwanAccountInfo } from '../../store/actions/SwanIntegration'
import { clearRampCache } from '../../store/actions/RampIntegration'
import { clearWyreCache } from '../../store/actions/WyreIntegration'
import { setCloudData } from '../../store/actions/cloud'
import { credsAuthenticated } from '../../store/actions/setupAndAuth'
import { setShowAllAccount } from '../../store/actions/accounts'
import ModalContainer from '../../components/home/ModalContainer'
import TrustedContactRequestContent from '../../pages/Home/TrustedContactRequestContent'

export const BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY: Milliseconds = 800

export enum BottomSheetState {
  Closed,
  Open,
}

export enum BottomSheetKind {
  TAB_BAR_BUY_MENU,
  CUSTODIAN_REQUEST,
  CUSTODIAN_REQUEST_REJECTED,
  TRUSTED_CONTACT_REQUEST,
  ADD_CONTACT_FROM_ADDRESS_BOOK,
  NOTIFICATIONS_LIST,
  SWAN_STATUS_INFO,
  WYRE_STATUS_INFO,
  RAMP_STATUS_INFO,
  ERROR,
  CLOUD_ERROR,
}

interface HomeStateTypes {
  notificationLoading: boolean;
  notificationData?: any[];
  CurrencyCode: string;
  netBalance: number;

  bottomSheetState: BottomSheetState;
  currentBottomSheetKind: BottomSheetKind | null;

  secondaryDeviceOtp: any;
  currencyCode: string;
  errorMessageHeader: string;
  errorMessage: string;
  selectedContact: any[];
  notificationDataChange: boolean;
  appState: string;
  trustedContactRequest: any;
  recoveryRequest: any;
  custodyRequest: any;
  isLoadContacts: boolean;
  lastActiveTime: string;
  swanDeepLinkContent: string | null;
  isBalanceLoading: boolean;
  addContactModalOpened: boolean;
  encryptedCloudDataJson: any;
  wyreDeepLinkContent: string | null;
  rampDeepLinkContent: string | null;
  rampFromBuyMenu: boolean | null;
  rampFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreFromDeepLink: boolean | null;
}

interface HomePropsTypes {
  navigation: any;
  notificationList: any[];
  exchangeRates?: any[];

  accountsState: AccountsState;
  cloudPermissionGranted: any;

  currentWyreSubAccount: ExternalServiceSubAccountInfo | null;
  currentRampSubAccount: ExternalServiceSubAccountInfo | null;
  currentSwanSubAccount: ExternalServiceSubAccountInfo | null;
  walletName: string;
  UNDER_CUSTODY: any;
  fetchNotifications: any;
  updateFCMTokens: any;
  downloadMShare: any;
  initializeTrustedContact: any;
  rejectTrustedContact: any;
  uploadRequestedShare: any;
  uploadSecondaryShareForPK: any;
  s3Service: S3Service;
  initializeHealthSetup: any;
  // initHealthCheck: any;
  overallHealth: any;
  levelHealth: LevelHealthInterface[];
  currentLevel: number;
  keeperInfo: any[];
  autoSyncShells: any;
  clearWyreCache: any;
  clearRampCache: any;
  clearSwanCache: any;
  updateSwanStatus: any;
  addNewAccountShell: any;
  fetchFeeAndExchangeRates: any;
  createTempSwanAccountInfo: any;
  addTransferDetails: any;
  trustedContacts: TrustedContactsService;
  isFocused: boolean;
  notificationListNew: any;
  notificationsUpdated: any;
  setCurrencyCode: any;
  currencyCode: any;
  updatePreference: any;
  fcmTokenValue: any;
  setFCMToken: any;
  setSecondaryDeviceAddress: any;
  secondaryDeviceAddressValue: any;
  releaseCasesValue: any;
  swanDeepLinkContent: string | null;
  regularAccount: RegularAccount;
  database: any;
  setCardData: any;
  cardDataProps: any;
  fetchKeeperTrustedChannel: any;
  keeperApproveStatus: any;
  onApprovalStatusChange: any;
  secureAccount: any;
  autoDownloadShareContact: any;
  accountShells: AccountShell[];
  setVersion: any;
  wyreDeepLinkContent: string | null;
  rampDeepLinkContent: string | null;
  downloadSMShard: any;
  rampFromBuyMenu: boolean | null;
  rampFromDeepLink: boolean | null;
  wyreFromBuyMenu: boolean | null;
  wyreFromDeepLink: boolean | null;
  setCloudData: any;
  updateKeeperInfoToUnderCustody: any;
  newBHRFlowStarted: any;
  cloudBackupStatus: CloudBackupStatus;
  updateCloudPermission: any;
  credsAuthenticated: any;
  setShowAllAccount: any;
  setIsPermissionGiven: any;
  isPermissionSet: any;
  updateLastSeen: any;
  isAuthenticated: any;
}

const releaseNotificationTopic = getEnvReleaseTopic()

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;

  bottomSheetRef = createRef<BottomSheet>();
  openBottomSheetOnLaunchTimeout: null | ReturnType<typeof setTimeout>;

  static whyDidYouRender = true;

  constructor( props ) {
    super( props )
    this.props.setShowAllAccount( false )
    this.focusListener = null
    this.appStateListener = null
    this.openBottomSheetOnLaunchTimeout = null

    this.state = {
      notificationData: [],
      CurrencyCode: 'USD',
      netBalance: 0,
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
      secondaryDeviceOtp: {
      },
      currencyCode: 'USD',
      errorMessageHeader: '',
      errorMessage: '',
      selectedContact: [],
      notificationDataChange: false,
      appState: '',
      trustedContactRequest: null,
      recoveryRequest: null,
      custodyRequest: null,
      isLoadContacts: false,
      lastActiveTime: moment().toISOString(),
      notificationLoading: true,
      swanDeepLinkContent: null,
      isBalanceLoading: true,
      addContactModalOpened: false,
      encryptedCloudDataJson: [],
      wyreDeepLinkContent: null,
      rampDeepLinkContent: null,
      rampFromBuyMenu: null,
      rampFromDeepLink: null,
      wyreFromBuyMenu: null,
      wyreFromDeepLink: null
    }
  }

  navigateToQRScreen = () => {
    this.props.navigation.navigate( 'QRScanner', {
      onCodeScanned: this.processQRData,
    } )
  };


  onPressNotifications = async () => {
    const notificationList = JSON.parse(
      await AsyncStorage.getItem( 'notificationList' )
    )
    const tmpList = []
    if ( notificationList ) {
      for ( let i = 0; i < notificationList.length; i++ ) {
        const element = notificationList[ i ]
        const obj = {
          ...element,
          read: element.isMandatory ? false : true,
        }
        tmpList.push( obj )
      }
    }
    await AsyncStorage.setItem( 'notificationList', JSON.stringify( tmpList ) )
    tmpList.sort( function ( left, right ) {
      return moment.utc( right.date ).unix() - moment.utc( left.date ).unix()
    } )
    this.setState( {
      notificationData: tmpList,
      notificationDataChange: !this.state.notificationDataChange,
    } )
    setTimeout( () => {
      this.setState( {
        notificationLoading: false,
      } )
    }, 500 )

    this.openBottomSheetOnLaunch( BottomSheetKind.NOTIFICATIONS_LIST )
  };

  processQRData = async ( qrData ) => {
    const { accountsState, addTransferDetails, navigation } = this.props

    const network = Bitcoin.networkType( qrData )
    if ( network ) {
      const serviceType =
        network === 'MAINNET' ? REGULAR_ACCOUNT : TEST_ACCOUNT // default service type

      const service = accountsState[ serviceType ].service
      const { type } = service.addressDiff( qrData )

      if ( type ) {
        let item

        switch ( type ) {
            case ScannedAddressKind.ADDRESS:
              const recipientAddress = qrData

              item = {
                id: recipientAddress
              }

              addTransferDetails( serviceType, {
                selectedContact: item,
              } )

              navigation.navigate( 'SendToContact', {
                selectedContact: item,
                serviceType,
              } )
              break

            case ScannedAddressKind.PAYMENT_URI:
              let address, options

              try {
                const res = service.decodePaymentURI( qrData )
                address = res.address
                options = res.options

              } catch ( err ) {
                Alert.alert( 'Unable to decode payment URI' )
                return
              }

              item = {
                id: address
              }

              addTransferDetails( serviceType, {
                selectedContact: item,
              } )

              navigation.navigate( 'SendToContact', {
                selectedContact: item,
                serviceType,
                bitcoinAmount: options.amount
                  ? `${Math.round( options.amount * SATOSHIS_IN_BTC )}`
                  : '',
              } )
              break
        }
      } else {
        Toast( 'Invalid QR' )
      }
    }

    try {
      const scannedData = JSON.parse( qrData )

      // check version compatibility
      if ( scannedData.version ) {
        const isAppVersionCompatible = await checkAppVersionCompatibility( {
          relayCheckMethod: scannedData.type,
          version: scannedData.ver,
        } )

        if ( !isAppVersionCompatible ) {
          return
        }
      }

      switch ( scannedData.type ) {
          case QRCodeTypes.CONTACT_REQUEST:
          case QRCodeTypes.KEEPER_REQUEST:
            const trustedContactRequest = {
              walletName: scannedData.walletName,
              channelKey: scannedData.channelKey,
              contactsSecondaryChannelKey: scannedData.secondaryChannelKey,
              isKeeper: scannedData.type === QRCodeTypes.KEEPER_REQUEST,
              isQR: true,
              version: scannedData.version,
              type: scannedData.type
            }
            this.setState( {
              trustedContactRequest
            },
            () => {
              this.openBottomSheetOnLaunch(
                BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                1
              )
            }
            )
            break

          case 'trustedGuardian':
            const trustedGuardianRequest = {
              isGuardian: scannedData.isGuardian,
              approvedTC: scannedData.approvedTC,
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              uploadedAt: scannedData.uploadedAt,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
              isFromKeeper: scannedData.isFromKeeper
                ? scannedData.isFromKeeper
                : false,
            }
            this.setState(
              {
                secondaryDeviceOtp: trustedGuardianRequest,
                trustedContactRequest: trustedGuardianRequest,
                recoveryRequest: null,
                isLoadContacts: true,
              },
              () => {
                navigation.goBack()

                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'secondaryDeviceGuardian':
            // console.log( 'scannedData', scannedData )
            const secondaryDeviceGuardianRequest = {
              isGuardian: scannedData.isGuardian,
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              uploadedAt: scannedData.uploadedAt,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
              isFromKeeper: true,
            }

            this.setState(
              {
                secondaryDeviceOtp: secondaryDeviceGuardianRequest,
                trustedContactRequest: secondaryDeviceGuardianRequest,
                recoveryRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'trustedContactQR':
            const tcRequest = {
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
            }

            this.setState(
              {
                secondaryDeviceOtp: tcRequest,
                trustedContactRequest: tcRequest,
                recoveryRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'paymentTrustedContactQR':
            const paymentTCRequest = {
              isPaymentRequest: true,
              requester: scannedData.requester,
              publicKey: scannedData.publicKey,
              info: scannedData.info,
              type: scannedData.type,
              isQR: true,
              version: scannedData.ver,
            }

            this.setState(
              {
                secondaryDeviceOtp: paymentTCRequest,
                trustedContactRequest: paymentTCRequest,
                recoveryRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )

            break

          case 'recoveryQR':
            const recoveryRequest = {
              isRecovery: true,
              requester: scannedData.requester,
              publicKey: scannedData.KEY,
              isQR: true,
            }
            this.setState(
              {
                recoveryRequest: recoveryRequest,
                trustedContactRequest: null,
              },
              () => {
                this.openBottomSheetOnLaunch(
                  BottomSheetKind.TRUSTED_CONTACT_REQUEST,
                  1
                )
              }
            )
            break

          case 'ReverseRecoveryQR':
            Alert.alert(
              'Restoration QR Identified',
              'Restoration QR only works during restoration mode'
            )
            break

          default:
            break
      }
    } catch ( err ) {
      console.log( err )
      Toast( 'Invalid QR' )
    }
  };

  // scheduleNotification = async () => {
  //   PushNotification.cancelAllLocalNotifications()
  //   const channelIdRandom = moment().valueOf()

  //   PushNotification.createChannel(
  //     {
  //       channelId: `${channelIdRandom}`,
  //       channelName: 'reminder',
  //       channelDescription: 'A channel to categorise your notifications',
  //       playSound: false,
  //       soundName: 'default',
  //       importance: 4, // (optional) default: 4. Int value of the Android notification importance
  //       vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
  //     },
  //     ( created ) => console.log( `createChannel returned '${created}'` ) // (optional) callback returns whether the channel was created, false means it already existed.
  //   )
  //   const date = new Date()
  //   date.setHours( date.getHours() + config.NOTIFICATION_HOUR )

  //   //let date =  new Date(Date.now() + (3 * 60 * 1000));
  //   PushNotification.localNotificationSchedule( {
  //     channelId: channelIdRandom,
  //     vibrate: true,
  //     vibration: 300,
  //     priority: 'high',
  //     showWhen: true,
  //     autoCancel: true,
  //     soundName: 'default',
  //     title: 'We have not seen you in a while!',
  //     message:
  //       'Opening your app regularly ensures you get all the notifications and security updates', // (required)
  //     date: date,
  //     repeatType: 'day',
  //     allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
  //   } )

  //   PushNotification.getScheduledLocalNotifications( ( notiifcations ) => {
  //     console.log( 'SCHEDULE notiifcations', notiifcations )
  //   } )
  // };

  localNotification = async ( notificationDetails ) => {
    const channelIdRandom = moment().valueOf()
    PushNotification.createChannel(
      {
        channelId: `${channelIdRandom}`,
        channelName: 'reminder',
        channelDescription: 'A channel to categorise your notifications',
        playSound: false,
        soundName: 'default',
        importance: 4, // (optional) default: 4. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
      },
      ( created ) =>
        console.log( `createChannel localNotification returned '${created}'` ) // (optional) callback returns whether the channel was created, false means it already existed.
    )

    PushNotification.localNotification( {
      /* Android Only Properties */
      channelId: `${channelIdRandom}`,
      showWhen: true, // (optional) default: true
      autoCancel: true, // (optional) default: true
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      priority: 'high', // (optional) set notification priority, default: high

      /* iOS and Android properties */
      id: notificationDetails.id,
      title: notificationDetails.title,
      message: notificationDetails.body,
      soundName: 'default',
    } )
  };

  bootStrapNotifications = async () => {
    this.props.setIsPermissionGiven( true )
    const t0 = performance.now()
    if ( Platform.OS === 'ios' ) {
      firebase
        .messaging()
        .hasPermission()
        .then( ( enabled ) => {
          if ( enabled ) {
            this.storeFCMToken()
            this.createNotificationListeners()
          } else {
            firebase
              .messaging()
              .requestPermission( {
                provisional: true,
              } )
              .then( () => {
                this.storeFCMToken()
                this.createNotificationListeners()
              } )
              .catch( () => {
                console.log( 'Permission rejected.' )
              } )
          }
        } )
        .catch()
    } else {
      this.storeFCMToken()
      this.createNotificationListeners()
    }
    const t1 = performance.now()
    console.log( 'Call bootStrapNotifications took ' + ( t1 - t0 ) + ' milliseconds.' )
  };

  storeFCMToken = async () => {
    const fcmToken = await messaging().getToken()
    console.log( 'TOKEN', fcmToken )
    const fcmArray = [ fcmToken ]
    const fcmTokenFromAsync = this.props.fcmTokenValue
    if ( !fcmTokenFromAsync || fcmTokenFromAsync != fcmToken ) {
      this.props.setFCMToken( fcmToken )

      await AsyncStorage.setItem( 'fcmToken', fcmToken )
      this.props.updateFCMTokens( fcmArray )
    }
  };

  createNotificationListeners = async () => {
    this.props.setIsPermissionGiven( true )
    PushNotification.configure( {
      onNotification: ( notification ) => {
        console.log( 'NOTIFICATION:', notification )
        // process the notification
        if ( notification.data ) {
          this.props.fetchNotifications()
          this.onNotificationOpen( notification )
          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish( PushNotificationIOS.FetchResult.NoData )
        }
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: ( notification ) => {
        console.log( 'ACTION:', notification.action )
        console.log( 'NOTIFICATION:', notification )

        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: ( err ) => {
        console.error( err.message, err )
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    } )
  };

  onNotificationOpen = async ( item ) => {
    console.log( 'item', item )
    const content = JSON.parse( item.data.content )
    // let asyncNotificationList = notificationListNew;
    let asyncNotificationList = JSON.parse(
      await AsyncStorage.getItem( 'notificationList' )
    )
    if ( !asyncNotificationList ) {
      asyncNotificationList = []
    }
    let readStatus = true
    if ( content.notificationType == releaseNotificationTopic ) {
      const releaseCases = this.props.releaseCasesValue
      //JSON.parse(await AsyncStorage.getItem('releaseCases'));
      if ( releaseCases.ignoreClick ) {
        readStatus = true
      } else if ( releaseCases.remindMeLaterClick ) {
        readStatus = false
      } else {
        readStatus = false
      }
    }
    const obj = {
      type: content.notificationType,
      isMandatory: false,
      read: readStatus,
      title: item.title,
      time: timeFormatter( moment( new Date() ), moment( new Date() ).valueOf() ),
      date: new Date(),
      info: item.body,
      notificationId: content.notificationId,
    }
    asyncNotificationList.push( obj )
    // this.props.notificationsUpdated(asyncNotificationList);

    await AsyncStorage.setItem(
      'notificationList',
      JSON.stringify( asyncNotificationList )
    )
    asyncNotificationList.sort( function ( left, right ) {
      return moment.utc( right.date ).unix() - moment.utc( left.date ).unix()
    } )
    this.setState( {
      notificationData: asyncNotificationList,
      notificationDataChange: !this.state.notificationDataChange,
    } )
    this.onPressNotifications()
  };

  onAppStateChange = async ( nextAppState ) => {
    const { appState } = this.state
    const { isPermissionSet, setIsPermissionGiven } = this.props
    try {
      // TODO: Will this function ever be called if the state wasn't different? If not,
      // I don't think we need to be holding on to `appState` in this component's state.
      if ( appState === nextAppState ) return
      if ( isPermissionSet ) {
        setIsPermissionGiven( false )
        return
      }
      this.setState(
        {
          appState: nextAppState,
        },
        async () => {
          if ( nextAppState === 'active' ) {
          //this.scheduleNotification()
          }
          if ( nextAppState === 'inactive' || nextAppState == 'background' ) {
            console.log( 'inside if nextAppState', nextAppState )
            this.props.updatePreference( {
              key: 'hasShownNoInternetWarning',
              value: false,
            } )
            this.props.updateLastSeen( new Date() )
            this.props.navigation.dispatch( StackActions.reset( {
              index: 0,
              actions: [ NavigationActions.navigate( {
                routeName: 'Launch'
              } ) ],
            } ) )
          }
        }
      )
    } catch ( error ) {
      // do nothing
    }
  };

  componentDidMount = () => {
    const {
      navigation,
      s3Service,
      initializeHealthSetup,
      newBHRFlowStarted,
      credsAuthenticated
    } = this.props
    this.appStateListener = AppState.addEventListener(
      'change',
      this.onAppStateChange
    )
    InteractionManager.runAfterInteractions( () => {
      // This will sync balances and transactions for all account shells
      // this.props.autoSyncShells()
      // Keeping autoSynn disabled
      credsAuthenticated( false )
      console.log( 'isAuthenticated*****', this.props.isAuthenticated )

      this.closeBottomSheet()

      this.calculateNetBalance()

      if( newBHRFlowStarted === true )
      {
        const { healthCheckInitializedKeeper } = s3Service.levelhealth
        if ( healthCheckInitializedKeeper === false ) {
          initializeHealthSetup()
        }
      }

      //const { healthCheckInitialized } = s3Service.sss;
      //   console.log("healthCheckInitialized", healthCheckInitialized);
      //   if (!healthCheckInitialized) {
      //     initHealthCheck();
      //   }
      // }
      this.bootStrapNotifications()
      this.setUpFocusListener()
      //this.getNewTransactionNotifications()

      Linking.addEventListener( 'url', this.handleDeepLinkEvent )
      Linking.getInitialURL().then( this.handleDeepLinking )

      // call this once deeplink is detected aswell
      // this.handleDeepLinkModal()

      const unhandledDeepLinkURL = navigation.getParam( 'unhandledDeepLinkURL' )

      if ( unhandledDeepLinkURL ) {
        navigation.setParams( {
          unhandledDeepLinkURL: null,
        } )
        this.handleDeepLinking( unhandledDeepLinkURL )
      }

      // this.props.setVersion()
      this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
    } )
  };

  // getNewTransactionNotifications = async () => {
  //   const t0 = performance.now()
  //   const newTransactions = []
  //   const { accountsState } = this.props
  //   const regularAccount = accountsState[ REGULAR_ACCOUNT ].service.hdWallet
  //   const secureAccount = accountsState[ SECURE_ACCOUNT ].service.secureHDWallet

  //   const newTransactionsRegular =
  //     regularAccount.derivativeAccounts[ FAST_BITCOINS ][ 1 ] &&
  //     regularAccount.derivativeAccounts[ FAST_BITCOINS ][ 1 ].newTransactions
  //   const newTransactionsSecure =
  //     secureAccount.derivativeAccounts[ FAST_BITCOINS ][ 1 ] &&
  //     secureAccount.derivativeAccounts[ FAST_BITCOINS ][ 1 ].newTransactions

  //   if ( newTransactionsRegular && newTransactionsRegular.length )
  //     newTransactions.push( ...newTransactionsRegular )
  //   if ( newTransactionsSecure && newTransactionsSecure.length )
  //     newTransactions.push( ...newTransactionsSecure )

  //   if ( newTransactions.length ) {
  //     // let asyncNotification = notificationListNew;
  //     const asyncNotification = JSON.parse(
  //       await AsyncStorage.getItem( 'notificationList' )
  //     )
  //     let asyncNotificationList = []
  //     if ( asyncNotification.length ) {
  //       asyncNotificationList = []
  //       for ( let i = 0; i < asyncNotification.length; i++ ) {
  //         asyncNotificationList.push( asyncNotification[ i ] )
  //       }
  //     }

  //     for ( let i = 0; i < newTransactions.length; i++ ) {
  //       let present = false
  //       for ( const tx of asyncNotificationList ) {
  //         if (
  //           tx.notificationsData &&
  //           newTransactions[ i ].txid === tx.notificationsData.txid
  //         )
  //           present = true
  //       }
  //       if ( present ) continue

  //       const obj = {
  //         type: 'contact',
  //         isMandatory: false,
  //         read: false,
  //         title: 'Alert from FastBitcoins',
  //         time: timeFormatter( moment( new Date() ), moment( new Date() ).valueOf() ),
  //         date: new Date(),
  //         info: 'You have a new transaction',
  //         notificationId: createRandomString( 17 ),
  //         notificationsData: newTransactions[ i ],
  //       }
  //       asyncNotificationList.push( obj )
  //       const notificationDetails = {
  //         id: obj.notificationId,
  //         title: obj.title,
  //         body: obj.info,
  //       }
  //       console.log( ':asyncNotificationList', asyncNotificationList )

  //       this.localNotification( notificationDetails )
  //     }
  //     //this.props.notificationsUpdated(asyncNotificationList);
  //     await AsyncStorage.setItem(
  //       'notificationList',
  //       JSON.stringify( asyncNotificationList )
  //     )
  //     asyncNotificationList.sort( function ( left, right ) {
  //       return moment.utc( right.date ).unix() - moment.utc( left.date ).unix()
  //     } )
  //     setTimeout( () => {
  //       this.setState( {
  //         notificationData: asyncNotificationList,
  //         notificationDataChange: !this.state.notificationDataChange,
  //       } )
  //     }, 2 )
  //   }
  //   const t1 = performance.now()
  //   console.log( 'getNewTransactionNotifications took ' + ( t1 - t0 ) + ' milliseconds.' )
  // };

  componentDidUpdate = ( prevProps, prevState ) => {

    if (
      prevProps.notificationList !== this.props.notificationList ||
      prevProps.releaseCasesValue !== this.props.releaseCasesValue
    ) {
      this.setupNotificationList()
    }

    if (
      prevProps.accountsState.accountShells !==
      this.props.accountsState.accountShells
    ) {
      this.calculateNetBalance()
      // this.getNewTransactionNotifications()
    }

    if ( prevProps.fcmTokenValue !== this.props.fcmTokenValue ) {
      this.storeFCMToken()
    }

    if (
      prevProps.secondaryDeviceAddressValue !==
      this.props.secondaryDeviceAddressValue
    ) {
      this.setSecondaryDeviceAddresses()
    }

    // if ( this.props.paymentDetails !== null && this.props.paymentDetails ) {
    //   const serviceType = REGULAR_ACCOUNT
    //   const {
    //     paymentDetails,
    //     accountsState,
    //     navigation,
    //     addTransferDetails,
    //   } = this.props
    //   let { address, paymentURI } = paymentDetails
    //   let options: any = {
    //   }
    //   if ( paymentURI ) {
    //     try {
    //       const details = accountsState[ serviceType ].service.decodePaymentURI(
    //         paymentURI
    //       )
    //       address = details.address
    //       options = details.options
    //     } catch ( err ) {
    //       Alert.alert( 'Unable to decode payment URI' )
    //       return
    //     }
    //   }

    //   const item = {
    //     id: address,
    //   }

    //   addTransferDetails( serviceType, {
    //     selectedContact: item,
    //   } )

    //   navigation.navigate( 'SendToContact', {
    //     selectedContact: item,
    //     serviceType,
    //     bitcoinAmount: options.amount
    //       ? `${Math.round( options.amount * SATOSHIS_IN_BTC )}`
    //       : '',
    //   } )
    // }
  };

  openBottomSheetOnLaunch(
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) {
    this.openBottomSheetOnLaunchTimeout = setTimeout( () => {
      this.openBottomSheet( kind, snapIndex )
    }, BOTTOM_SHEET_OPENING_ON_LAUNCH_DELAY )
  }

  handleDeepLinkEvent = async ( { url } ) => {
    console.log( 'Home::handleDeepLinkEvent::URL: ', url )

    const { navigation, isFocused } = this.props

    // If the user is on one of Home's nested routes, and a
    // deep link is opened, we will navigate back to Home first.
    if ( !isFocused ) {
      navigation.dispatch(
        resetToHomeAction( {
          unhandledDeepLinkURL: url,
        } )
      )
    } else {
      this.handleDeepLinking( url )
    }

  };

  handleDeepLinking = async ( url: string | null ) => {
    if ( url == null ) {
      return
    }

    console.log( 'handleDeepLinking: ' + url )

    const splits = url.split( '/' )
    if ( splits.includes( 'swan' ) ) {
      this.setState( {
        swanDeepLinkContent:url,
      }, () => {
        this.props.currentSwanSubAccount
          ? this.props.updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED )
          : this.props.updateSwanStatus( SwanAccountCreationStatus.AUTHENTICATION_IN_PROGRESS )
        this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
      } )

    }

    if ( splits.includes( 'wyre' ) ) {
      this.props.clearWyreCache()
      this.setState( {
        wyreDeepLinkContent:url,
        wyreFromBuyMenu: false,
        wyreFromDeepLink: true
      }, () => {
        this.openBottomSheet( BottomSheetKind.WYRE_STATUS_INFO )
      } )
    }
    if ( splits.includes( 'ramp' ) ) {
      this.props.clearRampCache()
      this.setState( {
        rampDeepLinkContent:url,
        rampFromBuyMenu: false,
        rampFromDeepLink: true
      }, () => {
        this.openBottomSheet( BottomSheetKind.RAMP_STATUS_INFO )
      } )
    }
    if ( splits[ 5 ] === 'sss' ) {
      const requester = splits[ 4 ]

      if ( splits[ 6 ] === 'ek' ) {
        const custodyRequest = {
          requester,
          ek: splits[ 7 ],
          uploadedAt: splits[ 8 ],
        }

        this.setState(
          {
            custodyRequest,
          },
          () => {
            this.openBottomSheetOnLaunch( BottomSheetKind.CUSTODIAN_REQUEST )
          }
        )
      } else if ( splits[ 6 ] === 'rk' ) {
        const recoveryRequest = {
          requester,
          rk: splits[ 7 ],
        }

        this.setState(
          {
            recoveryRequest,
            trustedContactRequest: null,
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            )
          }
        )
      }
    } else if ( [ 'tc', 'tcg', 'atcg', 'ptc' ].includes( splits[ 4 ] ) ) {
      if ( splits[ 3 ] !== config.APP_STAGE ) {
        Alert.alert(
          'Invalid deeplink',
          `Following deeplink could not be processed by Hexa:${config.APP_STAGE.toUpperCase()}, use Hexa:${
            splits[ 3 ]
          }`
        )
      } else {
        const version = splits.pop().slice( 1 )

        if ( version ) {
          const isAppVersionCompatible = await checkAppVersionCompatibility( {
            relayCheckMethod: splits[ 4 ],
            version,
          } )

          if ( !isAppVersionCompatible ) {
            return
          }
        }
        let hint = splits[ 8 ]
        let isFromKeeper = false
        if ( splits[ 8 ].includes( '_' ) ) {
          const hintStr = splits[ 8 ].split( '_' )
          hint = hintStr[ 0 ]
          isFromKeeper = hintStr[ 1 ] == 'keeper' ? true : false
        }

        const trustedContactRequest = {
          isGuardian: [ 'tcg', 'atcg' ].includes( splits[ 4 ] ),
          approvedTC: splits[ 4 ] === 'atcg' ? true : false,
          isPaymentRequest: splits[ 4 ] === 'ptc' ? true : false,
          requester: splits[ 5 ],
          encryptedKey: splits[ 6 ],
          hintType: splits[ 7 ],
          hint,
          uploadedAt: splits[ 9 ],
          version,
          isFromKeeper,
        }

        this.setState(
          {
            trustedContactRequest,
            recoveryRequest: null,
          },
          () => {
            this.openBottomSheetOnLaunch(
              BottomSheetKind.TRUSTED_CONTACT_REQUEST,
              1
            )
          }
        )
      }
    } else if ( splits[ 4 ] === 'rk' ) {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[ 5 ],
        encryptedKey: splits[ 6 ],
        hintType: splits[ 7 ],
        hint: splits[ 8 ],
      }

      this.setState(
        {
          recoveryRequest,
          trustedContactRequest: null,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }
      )
    } else if ( splits[ 4 ] === 'scns' ) {
      const recoveryRequest = {
        isRecovery: true,
        requester: splits[ 5 ],
        encryptedKey: splits[ 6 ],
        hintType: splits[ 7 ],
        hint: splits[ 8 ],
        isPrimaryKeeperRecovery: true,
      }
      this.setState(
        {
          recoveryRequest,
          trustedContactRequest: null,
        },
        () => {
          this.openBottomSheetOnLaunch(
            BottomSheetKind.TRUSTED_CONTACT_REQUEST,
            1
          )
        }
      )
    } else if ( splits[ 4 ] === 'rrk' ) {
      Alert.alert(
        'Restoration link Identified',
        'Restoration links only works during restoration mode'
      )
    }

    if ( url && url.includes( 'fastbitcoins' ) ) {
      const userKey = url.substr( url.lastIndexOf( '/' ) + 1 )
      this.props.navigation.navigate( 'VoucherScanner', {
        userKey
      } )
    }
  };

  setUpFocusListener = () => {
    const t0 = performance.now()
    const { navigation } = this.props

    this.focusListener = navigation.addListener( 'didFocus', () => {
      this.setCurrencyCodeFromAsync()
      this.props.fetchFeeAndExchangeRates( this.props.currencyCode )
      this.props.fetchNotifications()
      this.setState( {
        lastActiveTime: moment().toISOString(),
      } )
    } )

    this.setCurrencyCodeFromAsync()
    const t1 = performance.now()
    console.log( 'setUpFocusListener ' + ( t1 - t0 ) + ' milliseconds.' )
  };

  setSecondaryDeviceAddresses = async () => {
    let secondaryDeviceOtpTemp = this.props.secondaryDeviceAddressValue

    if ( !secondaryDeviceOtpTemp ) {
      secondaryDeviceOtpTemp = []
    }
    if (
      secondaryDeviceOtpTemp.findIndex(
        ( value ) => value.otp == ( this.state.secondaryDeviceOtp as any ).otp
      ) == -1
    ) {
      secondaryDeviceOtpTemp.push( this.state.secondaryDeviceOtp )
      this.props.setSecondaryDeviceAddress( secondaryDeviceOtpTemp )
    }
  };

  getAssociatedContact = async () => {
    // TODO -- need to check this
    this.setSecondaryDeviceAddresses()
  };

  setCurrencyCodeFromAsync = async () => {
    const { currencyCode } = this.props
    if ( !currencyCode ) {
      this.props.setCurrencyCode( RNLocalize.getCurrencies()[ 0 ] )
      this.setState( {
        currencyCode: RNLocalize.getCurrencies()[ 0 ],
      } )
    } else {
      this.setState( {
        currencyCode: currencyCode,
      } )
    }
  };

  calculateNetBalance = () => {
    const { accountShells } = this.props.accountsState

    let totalBalance = 0
    accountShells.forEach( ( accountShell: AccountShell ) => {
      if (
        accountShell.primarySubAccount.sourceKind !==
        SourceAccountKind.TEST_ACCOUNT
      )
        totalBalance += AccountShell.getTotalBalance( accountShell )
    } )

    this.setState( {
      netBalance: totalBalance,
    } )
  };



  handleBuyBitcoinBottomSheetSelection = ( menuItem: BuyBitcoinBottomSheetMenuItem ) => {
    switch ( menuItem.kind ) {
        case BuyMenuItemKind.FAST_BITCOINS:
          this.props.navigation.navigate( 'VoucherScanner' )
          break
        case BuyMenuItemKind.SWAN:
          this.props.clearSwanCache()
          if ( !this.props.currentSwanSubAccount ) {
            const newSubAccount = new ExternalServiceSubAccountInfo( {
              instanceNumber: 1,
              defaultTitle: 'Swan Account',
              defaultDescription: 'Sats purchased from Swan',
              serviceAccountKind: ServiceAccountKind.SWAN,
            } )
            this.props.createTempSwanAccountInfo( newSubAccount )
            this.props.updateSwanStatus( SwanAccountCreationStatus.BUY_MENU_CLICKED )
          }
          else {
            this.props.updateSwanStatus( SwanAccountCreationStatus.ACCOUNT_CREATED )
          }
          this.setState( {
            swanDeepLinkContent: null
          }, () => {
            this.openBottomSheet( BottomSheetKind.SWAN_STATUS_INFO )
          } )
          break
        case BuyMenuItemKind.RAMP:
          if ( !this.props.currentRampSubAccount ) {
            const newSubAccount = new ExternalServiceSubAccountInfo( {
              instanceNumber: 1,
              defaultTitle: 'Ramp Account',
              defaultDescription: 'Sats purchased from Ramp',
              serviceAccountKind: ServiceAccountKind.RAMP,
            } )

            this.props.addNewAccountShell( newSubAccount )
          }
          this.props.clearRampCache()
          this.setState( {
            rampDeepLinkContent: null,
            rampFromDeepLink: false,
            rampFromBuyMenu: true
          }, () => {
            this.openBottomSheet( BottomSheetKind.RAMP_STATUS_INFO )
          } )
          break
        case BuyMenuItemKind.WYRE:
          if ( !this.props.currentWyreSubAccount ) {
            const newSubAccount = new ExternalServiceSubAccountInfo( {
              instanceNumber: 1,
              defaultTitle: 'Wyre Account',
              defaultDescription: 'Sats purchased from Wyre',
              serviceAccountKind: ServiceAccountKind.WYRE,
            } )
            this.props.addNewAccountShell( newSubAccount )
            // this.props.navigation.navigate( 'NewWyreAccountDetails', {
            //   currentSubAccount: newSubAccount,
            // } )
          }
          this.props.clearWyreCache()
          this.setState( {
            wyreDeepLinkContent: null,
            wyreFromDeepLink: false,
            wyreFromBuyMenu: true
          }, () => {
            this.openBottomSheet( BottomSheetKind.WYRE_STATUS_INFO )
          } )
          break
    }
  };



  openBottomSheet = (
    kind: BottomSheetKind,
    snapIndex: number | null = null
  ) => {
    this.setState(
      {
        bottomSheetState: BottomSheetState.Open,
        currentBottomSheetKind: kind,
      },
      () => {
        if ( snapIndex == null ) {
          this.bottomSheetRef.current?.expand()
        } else {
          this.bottomSheetRef.current?.snapTo( snapIndex )
        }
      }
    )
  };

  onBottomSheetClosed() {
    this.setState( {
      bottomSheetState: BottomSheetState.Closed,
      currentBottomSheetKind: null,
    } )
  }

  closeBottomSheet = () => {
    this.bottomSheetRef.current?.close()
    this.onBottomSheetClosed()
  };


  onNotificationClicked = async ( value ) => {
    const asyncNotifications = JSON.parse(
      await AsyncStorage.getItem( 'notificationList' )
    )
    console.log( 'Notification clicked Home>onNotificationClicked' )
    console.log( 'asyncNotifications ', asyncNotifications )
    console.log( 'notification passed ', value )

    const { notificationData } = this.state
    const { navigation, } = this.props
    const tempNotificationData = notificationData
    for ( let i = 0; i < tempNotificationData.length; i++ ) {
      const element = tempNotificationData[ i ]
      if ( element.notificationId == value.notificationId ) {
        if (
          asyncNotifications &&
          asyncNotifications.length &&
          asyncNotifications.findIndex(
            ( item ) => item.notificationId == value.notificationId
          ) > -1
        ) {
          asyncNotifications[
            asyncNotifications.findIndex(
              ( item ) => item.notificationId == value.notificationId
            )
          ].read = true
        }
        tempNotificationData[ i ].read = true
      }
    }

    await AsyncStorage.setItem(
      'notificationList',
      JSON.stringify( asyncNotifications )
    )

    this.setState( {
      notificationData: tempNotificationData,
      notificationDataChange: !this.state.notificationDataChange,
    } )

    if ( value.info && value.info.includes( 'F&F request accepted by' ) ) {
      navigation.navigate( 'FriendsAndFamily' )
      return
    }

    if ( value.type == releaseNotificationTopic ) {
      RelayServices.fetchReleases( value.info.split( ' ' )[ 1 ] )
        .then( async ( res ) => {
          if ( res.data.releases.length ) {
            const releaseNotes = res.data.releases.length
              ? res.data.releases.find( ( el ) => {
                return el.build === value.info.split( ' ' )[ 1 ]
              } )
              : ''
            navigation.navigate( 'UpdateApp', {
              releaseData: [ releaseNotes ],
              isOpenFromNotificationList: true,
              releaseNumber: value.info.split( ' ' )[ 1 ],
            } )
          }
        } )
        .catch( ( error ) => {
          console.error( error )
        } )
    }
    if ( value.type == 'contact' ) {
      this.closeBottomSheet()
    }
  };

  onPressElement = ( item ) => {
    const { navigation } = this.props
    if ( item.title == 'Backup Health' ) {
      navigation.navigate( 'ManageBackupNewBHR' )
      return
    }
    if ( item.title == 'Friends and Family' ) {
      navigation.navigate( 'AddressBookContents' )
      return
    } else if ( item.title == 'Wallet Settings' ) {
      navigation.navigate( 'SettingsContents' )
      // this.settingsBottomSheetRef.current?.snapTo(1);
      // setTimeout(() => {
      //   this.setState({
      //     tabBarIndex: 0,
      //   });
      // }, 10);
    } else if ( item.title == 'Funding Sources' ) {
      navigation.navigate( 'ExistingSavingMethods' )
    } else if ( item.title === 'Hexa Community (Telegram)' ) {
      const url = 'https://t.me/HexaWallet'
      Linking.openURL( url )
        .then( ( data ) => {} )
        .catch( ( e ) => {
          alert( 'Make sure Telegram installed on your device' )
        } )
      return
    }
  };

  setupNotificationList = async () => {
    const {
      releaseCasesValue,
      keeperApproveStatus,
      onApprovalStatusChange,
      s3Service,
      levelHealth,
      notificationList,
      fetchKeeperTrustedChannel,
      secureAccount,
      UNDER_CUSTODY,
      database,
      updateKeeperInfoToUnderCustody
    } = this.props
    // let asyncNotification = notificationListNew;
    const asyncNotification = JSON.parse(
      await AsyncStorage.getItem( 'notificationList' )
    )
    let asyncNotificationList = []
    if ( asyncNotification ) {
      asyncNotificationList = []
      for ( let i = 0; i < asyncNotification.length; i++ ) {
        asyncNotificationList.push( asyncNotification[ i ] )
      }
    }
    const tmpList = asyncNotificationList
    if ( notificationList ) {
      // console.log(
      //   "notificationList['notifications']",
      //   notificationList["notifications"]
      // );
      for ( let i = 0; i < notificationList[ 'notifications' ].length; i++ ) {
        const element = notificationList[ 'notifications' ][ i ]
        // console.log("element", element);
        let readStatus = false
        if ( element.notificationType == releaseNotificationTopic ) {
          const releaseCases = this.props.releaseCasesValue
          // JSON.parse(
          //   await AsyncStorage.getItem('releaseCases'),
          // );
          if (
            element.body &&
            element.body.split( ' ' )[ 1 ] == releaseCases.build
          ) {
            if ( releaseCases.remindMeLaterClick ) {
              readStatus = false
            }
            if ( releaseCases.ignoreClick ) {
              readStatus = true
            }
          } else {
            readStatus = true
          }
        }

        if ( element.notificationType == 'newKeeperInfo' ) {
          const data = JSON.parse( element.data )
          if ( data.walletName && data.walletId ) {
            updateKeeperInfoToUnderCustody( data.walletName, data.walletId )
          }
        }
        if ( element.notificationType == 'uploadSecondaryShare' ) {
          const data = JSON.parse( element.data )
          if ( data.shareID == keeperApproveStatus.shareId ) {
            onApprovalStatusChange( {
              status: true,
              initiatedAt: moment( new Date() ).valueOf(),
              shareId: data.shareID,
            } )
          }
        }
        if (
          element.notificationType == 'secureXpub' &&
          !database.DECENTRALIZED_BACKUP.PK_SHARE
        ) {
          const shareId = s3Service.levelhealth.metaSharesKeeper[ 1 ].shareId
          const share = getKeeperInfoFromShareId( levelHealth, shareId )
          fetchKeeperTrustedChannel(
            shareId,
            element.notificationType,
            share.name
          )
        }
        if ( element.notificationType == 'reShare' ) {
          // console.log('element.notificationType', element.notificationType)
          // console.log('UNDER_CUSTODY', UNDER_CUSTODY)

          let existingShares: MetaShare[]
          if ( Object.keys( UNDER_CUSTODY ).length ) {
            existingShares = Object.keys( UNDER_CUSTODY ).map( ( tag ) => {
              console.log( tag )
              return UNDER_CUSTODY[ tag ].META_SHARE
            } )
          }
          if ( existingShares.length ) {
            console.log(
              'existingShares.length',
              existingShares.length,
              existingShares
            )
            if (
              existingShares.findIndex(
                ( value ) =>
                  value.shareId === JSON.parse( element.data ).selectedShareId
              ) == -1
            ) {
              console.log(
                'element.notificationType 1',
                element.notificationType
              )
              this.props.autoDownloadShareContact(
                JSON.parse( element.data ).selectedShareId,
                JSON.parse( element.data ).walletId
              )
            }
          }
        }
        if ( element.notificationType == 'smUploadedForPK' ) {
          if (
            keeperApproveStatus.shareId == 'PK_recovery' &&
            keeperApproveStatus.transferDetails &&
            keeperApproveStatus.transferDetails.key
          ) {
            const result = await S3Service.downloadSMShare(
              keeperApproveStatus.transferDetails.key
            )
            if ( result && result.data ) {
              onApprovalStatusChange( {
                status: true,
                initiatedAt: moment( new Date() ).valueOf(),
                shareId: 'PK_recovery',
                secondaryShare: result.data.metaShare,
              } )
            }
          }

          let existingShares: MetaShare[]
          if ( Object.keys( UNDER_CUSTODY ).length ) {
            existingShares = Object.keys( UNDER_CUSTODY ).map( ( tag ) => {
              console.log( tag )
              return UNDER_CUSTODY[ tag ].META_SHARE
            } )
          }

          if ( existingShares.length ) {
            console.log(
              'existingShares.length',
              existingShares.length,
              existingShares
            )
            if (
              existingShares.findIndex(
                ( value ) =>
                  value.shareId === JSON.parse( element.data ).selectedShareId
              ) == -1
            ) {
              console.log(
                'element.notificationType 1',
                element.notificationType
              )
              this.props.autoDownloadShareContact(
                JSON.parse( element.data ).selectedShareId,
                JSON.parse( element.data ).walletId
              )
            }
          }
        }

        if (
          asyncNotificationList.findIndex(
            ( value ) => value.notificationId == element.notificationId
          ) > -1
        ) {
          const temp =
            asyncNotificationList[
              asyncNotificationList.findIndex(
                ( value ) => value.notificationId == element.notificationId
              )
            ]
          if ( element.notificationType != releaseNotificationTopic ) {
            readStatus = temp.read
          }

          const obj = {
            ...temp,
            read: readStatus,
            type: element.notificationType,
            title: element.title,
            info: element.body,
            isMandatory: element.tag == 'mandatory' ? true : false,
            time: timeFormatter(
              moment( new Date() ),
              moment( element.date ).valueOf()
            ),
            date: new Date( element.date ),
          }
          tmpList[
            tmpList.findIndex(
              ( value ) => value.notificationId == element.notificationId
            )
          ] = obj
        } else {
          const obj = {
            type: element.notificationType,
            isMandatory: element.tag == 'mandatory' ? true : false,
            read: readStatus,
            title: element.title,
            time: timeFormatter(
              moment( new Date() ),
              moment( element.date ).valueOf()
            ),
            date: new Date( element.date ),
            info: element.body,
            notificationId: element.notificationId,
          }
          tmpList.push( obj )
        }
      }
      //this.props.notificationsUpdated(tmpList);
      await AsyncStorage.setItem( 'notificationList', JSON.stringify( tmpList ) )
      tmpList.sort( function ( left, right ) {
        return moment.utc( right.date ).unix() - moment.utc( left.date ).unix()
      } )

      this.setState( {
        notificationData: tmpList,
        notificationDataChange: !this.state.notificationDataChange,
      } )
    }
  };

  getBottomSheetSnapPoints(): any[] {
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.SWAN_STATUS_INFO:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 70 : 65,
            ),
            heightPercentageToDP( 71 ),
          ]
        case BottomSheetKind.WYRE_STATUS_INFO:
          return ( this.state.wyreFromDeepLink )
            ? [ 0, '67%' ]
            : Platform.OS == 'ios' ? [ 0, '67%' ] : [ 0, '65%' ]
        case BottomSheetKind.RAMP_STATUS_INFO:
          return ( this.state.rampFromDeepLink )
            ? [ 0, '67%' ]
            : Platform.OS == 'ios' ? [ 0, '67%' ] : [ 0, '65%' ]
        case BottomSheetKind.TAB_BAR_BUY_MENU:
          return Platform.OS == 'ios' ? [ 0, '65%' ] : [ 0, '70%' ]
        case BottomSheetKind.CUSTODIAN_REQUEST:
        case BottomSheetKind.CUSTODIAN_REQUEST_REJECTED:
          return defaultBottomSheetConfigs.snapPoints

        case BottomSheetKind.TRUSTED_CONTACT_REQUEST:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 70 : 65,
            ),
            heightPercentageToDP( 95 ),
          ]

        case BottomSheetKind.ERROR:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 40 : 50,
            ),
          ]

        case BottomSheetKind.CLOUD_ERROR:
          return [
            -50,
            heightPercentageToDP(
              Platform.OS == 'ios' && DeviceInfo.hasNotch ? 45 : 50,
            ),
          ]

        case BottomSheetKind.ADD_CONTACT_FROM_ADDRESS_BOOK:
        case BottomSheetKind.NOTIFICATIONS_LIST:
          return [ -50, heightPercentageToDP( 82 ) ]

        default:
          return defaultBottomSheetConfigs.snapPoints
    }
  }


  onTrustedContactRequestAccepted = ( key ) => {
    this.closeBottomSheet()
    const { navigation } = this.props
    const { trustedContactRequest } = this.state

    navigation.navigate( 'ContactsListForAssociateContact', {
      postAssociation: ( contact ) => {
        this.props.initializeTrustedContact( {
          contact,
          flowKind: InitTrustedContactFlowKind.APPROVE_TRUSTED_CONTACT,
          channelKey: trustedContactRequest.channelKey,
          contactsSecondaryChannelKey: trustedContactRequest.contactsSecondaryChannelKey,
        } )
        // TODO: navigate post approval (from within saga)
        navigation.navigate( 'Home' )
      }
    } )
  };

  onTrustedContactRejected = () => {
    this.closeBottomSheet()
    const { trustedContactRequest } = this.state
    this.props.rejectTrustedContact( {
      channelKey: trustedContactRequest.channelKey,
    } )
  };

  onPhoneNumberChange = () => {};

  renderBottomSheetContent() {
    const { UNDER_CUSTODY, navigation } = this.props
    const { custodyRequest } = this.state
    switch ( this.state.currentBottomSheetKind ) {
        case BottomSheetKind.NOTIFICATIONS_LIST:
          const { notificationLoading, notificationData } = this.state
          return (
            <NotificationListContent
              notificationLoading={notificationLoading}
              NotificationData={notificationData}
              onNotificationClicked={this.onNotificationClicked}
              onPressBack={this.closeBottomSheet}
            />
          )

        case BottomSheetKind.CUSTODIAN_REQUEST:
          return (
            <>
              <CustodianRequestModalContents
                userName={custodyRequest.requester}
                onPressAcceptSecret={() => {
                  this.closeBottomSheet()

                  if ( Date.now() - custodyRequest.uploadedAt > 600000 ) {
                    Alert.alert(
                      'Request expired!',
                      'Please ask the sender to initiate a new request',
                    )
                  } else {
                    if ( UNDER_CUSTODY[ custodyRequest.requester ] ) {
                      Alert.alert(
                        'Failed to store',
                        'You cannot custody multiple shares of the same user.',
                      )
                    } else {
                      if ( custodyRequest.isQR ) {
                        downloadMShare( custodyRequest.ek, custodyRequest.otp )
                      } else {
                        navigation.navigate( 'CustodianRequestOTP', {
                          custodyRequest,
                        } )
                      }
                    }
                  }
                }}
                onPressRejectSecret={() => {
                  this.closeBottomSheet()
                  this.openBottomSheet( BottomSheetKind.CUSTODIAN_REQUEST_REJECTED )
                }}
              />

              <BuyBitcoinHomeBottomSheet
                onMenuItemSelected={this.handleBuyBitcoinBottomSheetSelection}
              />
            </>
          )
        case BottomSheetKind.CUSTODIAN_REQUEST_REJECTED:
          return (
            <CustodianRequestRejectedModalContents
              onPressViewTrustedContacts={this.closeBottomSheet}
              userName={custodyRequest.requester}
            />
          )
        case BottomSheetKind.TRUSTED_CONTACT_REQUEST:
          const { trustedContactRequest } = this.state

          return (
            <TrustedContactRequestContent
              trustedContactRequest={trustedContactRequest}
              onPressAccept={this.onTrustedContactRequestAccepted}
              onPressReject={this.onTrustedContactRejected}
              onPhoneNumberChange={this.onPhoneNumberChange}
              bottomSheetRef={this.bottomSheetRef}
            />
          )
    }
  }

  render() {
    const { netBalance, notificationData, currencyCode } = this.state

    const {
      navigation,
      exchangeRates,
      walletName,
      currentLevel,
      newBHRFlowStarted
    } = this.props


    return (
      <View
        style={{
          flex: 3.8,
          paddingTop:
                Platform.OS == 'ios' && DeviceInfo.hasNotch
                  ? heightPercentageToDP( '5%' )
                  : 0,
        }}
      >
        <HomeHeader
          onPressNotifications={this.onPressNotifications}
          navigateToQRScreen={this.navigateToQRScreen}
          notificationData={notificationData}
          walletName={walletName}
          getCurrencyImageByRegion={getCurrencyImageByRegion}
          netBalance={netBalance}
          exchangeRates={exchangeRates}
          CurrencyCode={currencyCode}
          navigation={navigation}
          currentLevel={currentLevel}
          //  onSwitchToggle={this.onSwitchToggle}
          // setCurrencyToggleValue={this.setCurrencyToggleValue}
          // navigation={this.props.navigation}
          // overallHealth={overallHealth}
        />
        <ModalContainer
          visible={this.state.currentBottomSheetKind != null}
          closeBottomSheet={() => {}}
        >
          {this.renderBottomSheetContent()}
        </ModalContainer>
      </View>
    )
  }
}
const mapStateToProps = ( state ) => {
  return {
    notificationList: state.notifications,
    accountsState: state.accounts,
    cloudPermissionGranted: state.health.cloudPermissionGranted,
    currentWyreSubAccount: state.accounts.currentWyreSubAccount,
    currentRampSubAccount: state.accounts.currentRampSubAccount,
    currentSwanSubAccount: state.accounts.currentSwanSubAccount,
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    walletName:
      idx( state, ( _ ) => _.storage.database.WALLET_SETUP.walletName ) || '',
    UNDER_CUSTODY: idx(
      state,
      ( _ ) => _.storage.database.DECENTRALIZED_BACKUP.UNDER_CUSTODY
    ),
    cardDataProps: idx( state, ( _ ) => _.preferences.cardData ),
    secureAccount: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
    s3Service: idx( state, ( _ ) => _.health.service ),
    overallHealth: idx( state, ( _ ) => _.sss.overallHealth ),
    trustedContacts: idx( state, ( _ ) => _.trustedContacts.service ),
    notificationListNew: idx( state, ( _ ) => _.notifications.notificationListNew ),
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    fcmTokenValue: idx( state, ( _ ) => _.preferences.fcmTokenValue ),
    secondaryDeviceAddressValue: idx(
      state,
      ( _ ) => _.preferences.secondaryDeviceAddressValue
    ),
    releaseCasesValue: idx( state, ( _ ) => _.preferences.releaseCasesValue ),
    regularAccount: idx( state, ( _ ) => _.accounts[ REGULAR_ACCOUNT ].service ),
    database: idx( state, ( _ ) => _.storage.database ) || {
    },
    levelHealth: idx( state, ( _ ) => _.health.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
    keeperInfo: idx( state, ( _ ) => _.health.keeperInfo ),
    keeperApproveStatus: idx( state, ( _ ) => _.health.keeperApproveStatus ),
    accountShells: idx( state, ( _ ) => _.accounts.accountShells ),
    newBHRFlowStarted: idx( state, ( _ ) => _.health.newBHRFlowStarted ),
    cloudBackupStatus: idx( state, ( _ ) => _.cloud.cloudBackupStatus ) || CloudBackupStatus.PENDING,
    isPermissionSet: idx( state, ( _ ) => _.preferences.isPermissionSet ),
    isAuthenticated: idx( state, ( _ ) => _.setupAndAuth.isAuthenticated, ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    fetchNotifications,
    updateFCMTokens,
    downloadMShare,
    initializeTrustedContact,
    rejectTrustedContact,
    uploadRequestedShare,
    uploadSecondaryShareForPK,
    initializeHealthSetup,
    // initHealthCheck,
    autoSyncShells,
    clearWyreCache,
    clearRampCache,
    clearSwanCache,
    updateSwanStatus,
    addNewAccountShell,
    fetchFeeAndExchangeRates,
    createTempSwanAccountInfo,
    addTransferDetails,
    notificationsUpdated,
    setCurrencyCode,
    updatePreference,
    setFCMToken,
    setSecondaryDeviceAddress,
    setCardData,
    fetchKeeperTrustedChannel,
    onApprovalStatusChange,
    autoDownloadShareContact,
    setVersion,
    downloadSMShard,
    setCloudData,
    updateKeeperInfoToUnderCustody,
    updateCloudPermission,
    credsAuthenticated,
    setShowAllAccount,
    setIsPermissionGiven,
    updateLastSeen
  } )( Home )
)
