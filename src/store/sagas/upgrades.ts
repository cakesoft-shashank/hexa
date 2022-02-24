import { AccountType, MultiSigAccount } from '../../bitcoin/utilities/Interface'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import AccountShell from '../../common/data/models/AccountShell'
import { updateAccountSettings, updateAccountShells } from '../actions/accounts'
import { call, put, select } from 'redux-saga/effects'
import { AccountsState } from '../reducers/accounts'
import dbManager from '../../storage/realm/dbManager'

export function* testAccountEnabler( ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  let testAccountShell: AccountShell
  accountShells.forEach( shell => {
    if( shell.primarySubAccount.type === AccountType.TEST_ACCOUNT ) testAccountShell = shell
  } )

  if( testAccountShell.primarySubAccount.visibility === AccountVisibility.HIDDEN ){
    const settings = {
      visibility: AccountVisibility.DEFAULT
    }
    yield put( updateAccountSettings( {
      accountShell: testAccountShell, settings
    } ) )
  }
}

export function* accountVisibilityResetter( ) {
  const accountShells: AccountShell[] = yield select(
    ( state ) => state.accounts.accountShells
  )

  for( const shell of accountShells ){
    if( shell.primarySubAccount.visibility !== AccountVisibility.DEFAULT ){
      const settings = {
        visibility: AccountVisibility.DEFAULT
      }
      yield put( updateAccountSettings( {
        accountShell: shell, settings
      } ) )
    }
  }
}


export function* restoreMultiSigTwoFAFlag( ) {
  // reintroduces the is2FA flag in the multisig accounts for the apps which are restored(<2.0.69) using the faulty backup(missing is2FA flag)
  const accountsState: AccountsState = yield select(
    ( state ) => state.accounts
  )

  for( const account of Object.values(accountsState.accounts) ){
    if([AccountType.SAVINGS_ACCOUNT, AccountType.DONATION_ACCOUNT].includes(account.type)){ 
      if((account as MultiSigAccount).xpubs && (account as MultiSigAccount).xpubs.secondary){ // level-2 activated multisig account found
        if(!(account as MultiSigAccount).is2FA){ // faulty multisig account: missing is2FA flag
          (account as MultiSigAccount).is2FA = true 

          yield put( updateAccountShells( {
            accounts: {
              [ account.id ]: account
            }
          } ) )
          yield call( dbManager.updateAccount, account.id, account )
        }
      }
    }
  }
}