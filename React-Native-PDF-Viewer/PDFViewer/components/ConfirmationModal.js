import React from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Portal, Modal, withTheme, Button as PaperBtn } from 'react-native-paper';
import { usePdfContext } from './Context';

const ConfirmationModal = (props) => {
    const {visible, hideModal, selectedPdf} = props;
    const {setAllPdfs, setFavPdfs, setRecentPdfs, deleteFile} = usePdfContext();
    return (
        <Portal>
            <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.ModalStyle}>
                <Text>Are you sure you want to delete this pdf ?</Text>
                <View style = {{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <PaperBtn mode = "contained" onPress = {() => { hideModal(1); deleteFile(selectedPdf, setFavPdfs, setAllPdfs, setRecentPdfs);}} style = {styles.btnStyle}>Yes</PaperBtn>
                    <PaperBtn mode = "contained" onPress = {() => {hideModal(0)}} style = {styles.btnStyle}>No</PaperBtn>
                </View>            
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    ModalStyle: {
        backgroundColor: 'white',
        borderRadius:5,
        width: 300,
        padding: 20,
        alignSelf: 'center',
    },
    radioWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    btnStyle: {
        width: 50, 
        alignSelf: 'flex-end', 
        marginTop: 20,
        marginRight: 10,
    }
})

export default withTheme(ConfirmationModal);