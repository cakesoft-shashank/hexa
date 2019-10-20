import moment from 'moment';
import DeviceInfo from 'react-native-device-info';
import bip39 from 'bip39';
import { AsyncStorage } from 'react-native';

import { asyncStorageKeys } from 'hexaConstants';

import Singleton from 'hexaSingleton';
// import ConnectivityTracker from "react-native-connectivity-tracker";
const CryptoJS = require('crypto-js');
// TODO: Date Format

const getUnixTimeDate = date => {
  const dateTime = new Date(date).getTime();
  const lastUpdateDate = Math.floor(dateTime / 1000);
  return lastUpdateDate;
};

const getUnixToDateFormat = unixDate =>
  moment.unix(unixDate).format('DD-MM-YYYY HH:mm:ss');
const getUnixToNormaDateFormat = unixDate =>
  moment.unix(unixDate).format('DD-MM-YYYY');

const getUnixToDateFormat1 = () => moment().format('hh:mm a , DD MMM YYYY');

const getUnixToDateFormat2 = () => moment().format('DD MMM YYYY , hh:mm a');

// //TODO: Network check
// let isNetwork: boolean;
// const onConnectivityChange = ( isConnected: any, timestamp: any, connectionInfo: any ) => {
//   console.log( "connection state change" );
//   isNetwork = isConnected;
// };

// ConnectivityTracker.init( {
//   onConnectivityChange,
//   attachConnectionInfo: false,
//   onError: ( msg: any ) => console.log( msg )
//   // verifyServersAreUp: () => store.dispatch(checkOurServersAreUp()),
// } );

const getNetwork = () => true; // isNetwork;

const encrypt = (data: any, password: string) => {
  const ciphertext = CryptoJS.AES.encrypt(data, password);
  return ciphertext.toString();
};

const encryptAgain = (data: any, password: string) => {
  const ciphertext = CryptoJS.AES.encrypt(data, password, {
    mode: CryptoJS.mode.ECB,
  });

  return ciphertext.toString();
};

const decrypt = (data: any, password: string) => {
  const bytes = CryptoJS.AES.decrypt(data, password);
  let str = false;
  try {
    str = bytes.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    /**/
  }
  return str;
};

// TODO: for sorting date wise transaction data
const sortFunction = (a: any, b: any) => {
  const dateA = new Date(a.received).getTime();
  const dateB = new Date(b.received).getTime();
  return dateA < dateB ? 1 : -1;
};

// TODO: func two date diff days count
// eslint-disable-next-line consistent-return
const dateDiffInDays = (date1: any, date2: any) => {
  try {
    const dt1 = new Date(date1);
    const dt2 = new Date(date2);
    return Math.floor(
      (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
        Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
        (1000 * 60 * 60 * 24),
    );
  } catch (error) {
    // console.log(error);
  }
};

const getRandomBetweenNumber = (min: number, max: number) => {
  const arrNumber = [];
  for (let i = 0; i < 3; i++) {
    const value = min + Math.floor(Math.random() * (max - min));
    if (arrNumber.indexOf(value) !== -1) {
      arrNumber.push(min + Math.floor(Math.random() * (max - min)));
    } else {
      arrNumber.push(value);
    }
  }
  return arrNumber;
};

const getDeviceModel = () => {
  const model = DeviceInfo.getModel();
  let modelName;
  if (model === 'iPhone 6s' || model === 'iPhone 6') {
    modelName = 'Iphone6';
  } else if (
    model === 'iPhone XS' ||
    model === 'iPhone XS Max' ||
    model === 'iPhone XR' ||
    model === 'iPhone X'
  ) {
    modelName = 'IphoneX';
  }
  return modelName;
};

const getStatusBarHeight = () => {
  const model = DeviceInfo.getModel();
  let height;
  if (
    model === 'iPhone XS' ||
    model === 'iPhone XS Max' ||
    model === 'iPhone XR' ||
    model === 'iPhone X'
  ) {
    height = 44;
  } else {
    height = 20;
  }
  return height;
};

const getIphoneSize = () => {
  const model = DeviceInfo.getModel();
  let iphoneSeries = 'iphone X';
  if (
    model === 'iPhone XS' ||
    model === 'iPhone XS Max' ||
    model === 'iPhone XR' ||
    model === 'iPhone X'
  ) {
    iphoneSeries = 'iphone X';
  } else {
    iphoneSeries = '!iphone X';
  }
  return iphoneSeries;
};

const getMnemonic = () => {
  const mnemonic = bip39.generateMnemonic();
  return mnemonic.split(' ');
};

const isJson = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

// Get and Set WalletDetails
const getWalletDetails = () => {
  const commonData = Singleton.getInstance();
  return commonData.getWalletDetails();
};
const setWalletDetails = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setWalletDetails(value);
  return true;
};
// Get and Set SetupWallet
const getSetupWallet = () => {
  const commonData = Singleton.getInstance();
  return commonData.getSetupWallet();
};

const setSetupWallet = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setSetupWallet(value);
  return true;
};

// TODO: Singleton  Set and Get RootViewController
const getRootViewController = () => {
  const commonData = Singleton.getInstance();
  return commonData.getRootViewController();
};
const setRootViewController = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setRootViewController(value);
  return true;
};

// TODO: Singleton Set and Get DeepLinkingUrl
const getDeepLinkingUrl = () => {
  const commonData = Singleton.getInstance();
  return commonData.getDeepLinkingUrl();
};
const setDeepLinkingUrl = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setDeepLinkingUrl(value);
  return true;
};

// TODO: Singleton Set and Get DeepLinkingType
const getDeepLinkingType = () => {
  const commonData = Singleton.getInstance();
  return commonData.getDeepLinkingType();
};
const setDeepLinkingType = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setDeepLinkingType(value);
  return true;
};

// TODO: Singleton SSS Details Get and Set Values
const getSSSDetails = () => {
  const commonData = Singleton.getInstance();
  return commonData.getSSSDetails();
};
const setSSSDetails = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setSSSDetails(value);
  return true;
};
// TODO: Singleton SSS Details RecordIDWise Get and Set Values
const getSSSDetailsRecordIDWise = () => {
  const commonData = Singleton.getInstance();
  return commonData.getSSSDetailsRecordIDWise();
};
const setSSSDetailsRecordIDWise = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setSSSDetailsRecordIDWise(value);
  return true;
};

// TODO: Singleton App Health Status
const getAppHealthStatus = () => {
  const commonData = Singleton.getInstance();
  return commonData.getAppHealthStatus();
};
const setAppHealthStatus = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setAppHealthStatus(value);
  return true;
};

// TODO: Singleton Bitcoin Class

const getRegularAccountObject = () => {
  const commonData = Singleton.getInstance();
  return commonData.getRegularAccountObject();
};

const setRegularAccountObject = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setRegularAccountObject(value);
  return true;
};

const getSecureAccountObject = () => {
  const commonData = Singleton.getInstance();
  return commonData.getSecureAccountObject();
};
const setSecureAccountObject = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setSecureAccountObject(value);
  return true;
};

const getS3ServiceObject = () => {
  const commonData = Singleton.getInstance();
  return commonData.getS3ServiceObject();
};
const setS3ServiceObject = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setS3ServiceObject(value);
  return true;
};

// Singleton Flag

const getFlagQRCodeScreen = () => {
  const commonData = Singleton.getInstance();
  return commonData.getFlagQRCodeScreen();
};
const setFlagQRCodeScreen = (value: any) => {
  const commonData = Singleton.getInstance();
  commonData.setFlagQRCodeScreen(value);
  return true;
};

// AsyncStorage values get and set

const getAsyncStorage = async (name: any) => {
  // console.log({ value: await AsyncStorage.getItem(asyncStorageKeys[name]) });
  return AsyncStorage.getItem(asyncStorageKeys[name]);
};

const setAsyncStorage = (name: any, value: any) => {
  AsyncStorage.setItem(asyncStorageKeys[name], value);
  return true;
};

module.exports = {
  getUnixTimeDate,
  getUnixToDateFormat,
  getUnixToNormaDateFormat,
  getUnixToDateFormat1,
  getUnixToDateFormat2,
  getNetwork,
  encrypt,
  encryptAgain,
  decrypt,
  sortFunction,
  dateDiffInDays,
  getRandomBetweenNumber,
  getDeviceModel,
  getStatusBarHeight,
  getIphoneSize,
  isJson,

  // Singleton
  getMnemonic,
  getWalletDetails,
  setWalletDetails,
  getSetupWallet,
  setSetupWallet,
  getRootViewController,
  setRootViewController,
  getDeepLinkingUrl,
  setDeepLinkingUrl,
  getDeepLinkingType,
  setDeepLinkingType,

  // Singleton SSS Details
  getSSSDetails,
  setSSSDetails,
  getSSSDetailsRecordIDWise,
  setSSSDetailsRecordIDWise,

  // Singleton App Health Status
  getAppHealthStatus,
  setAppHealthStatus,

  // Singleton Bitcoin Class
  getRegularAccountObject,
  setRegularAccountObject,
  getSecureAccountObject,
  setSecureAccountObject,
  getS3ServiceObject,
  setS3ServiceObject,

  // Singleton Flags
  getFlagQRCodeScreen,
  setFlagQRCodeScreen,

  // AsyncStorage
  getAsyncStorage,
  setAsyncStorage,
};
