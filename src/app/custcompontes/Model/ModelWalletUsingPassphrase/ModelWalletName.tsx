import React, { Component } from 'react';
import { Modal, TouchableHighlight, View, Alert, StyleSheet } from 'react-native';
import { Button, Icon, Text, Textarea, Form } from "native-base";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import { SvgIcon } from "@up-shared/components";

//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

interface Props {
    data: [];
    closeModal: Function;
    click_Confirm: Function;
}

export default class ModelWalletName extends Component<Props, any> {
    render() {
        return (
            <Modal
                transparent
                animationType={ 'none' }
                visible={ this.props.data.length != 0 ? this.props.data[ 0 ].modalVisible : false }
                onRequestClose={ () =>
                    this.props.closeModal()
                }
            >
                <View style={ [
                    styles.modalBackground,
                    { backgroundColor: `rgba(0,0,0,0.4)` }
                ] }>
                    <View style={ styles.viewModelBody }>
                        <View style={ { flexDirection: "row", flex: 0.6 } }>
                            <Text style={ [ globalStyle.ffFiraSansMedium, {
                                fontSize: 20, color: "#2F2F2F", flex: 6, textAlign: "center", marginTop: 10,
                                marginLeft: 20, marginRight: 20
                            } ] }>Restore Wallet using Passphrase</Text>
                        </View>
                        <View style={ { flex: 1, alignItems: "center", justifyContent: "flex-start" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>Please put in the name that you used while setting up your Hexa Wallet</Text>
                        </View>
                        <View
                            style={ {
                                flex: 1,
                            } }
                        >
                            <Textarea style={ { borderRadius: 8, justifyContent: "center" } } rowSpan={ 4 } bordered placeholder="Enter the name of the wallet" />
                        </View>
                        <View style={ { flex: 0.5, alignItems: "center", justifyContent: "flex-end" } }>
                            <Text note style={ [ globalStyle.ffFiraSansMedium, { textAlign: "center" } ] }>In case you do not remember the name , please enter a name of your choice.</Text>
                        </View>
                        <View style={ { flex: 1, justifyContent: "flex-end" } }>
                            <FullLinearGradientButton
                                click_Done={ () => this.props.click_Confirm() }
                                title="Next"
                                disabled={ false }
                                style={ [ { borderRadius: 10 } ] } />
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create( {
    modalBackground: {
        flex: 1,
        justifyContent: 'center',

    },
    viewModelBody: {
        flex: 0.6,
        margin: 20,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#ffffff"
    }
} );