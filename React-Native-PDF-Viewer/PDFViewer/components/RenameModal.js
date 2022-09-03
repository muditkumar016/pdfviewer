import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import { Portal, Modal, withTheme, Button as PaperBtn, TextInput as PaperTextInput } from 'react-native-paper';
import { usePdfContext } from './Context';

const RenameModal = (props) => {
    const {visible, hideModal, selectedPdf, theme} = props;
    const {setAllPdfs, setFavPdfs, setRecentPdfs, renameFile} = usePdfContext();
    const [input, setInput] = useState('');
    const [pdf, setPdf] = useState(null);

    useEffect(() => {
        if(selectedPdf !== null) {
            setPdf(selectedPdf);
            setInput(selectedPdf.name);
        }
        
    }, [])
    return (
    pdf === null ?
    <View></View> :
    (<Portal>
        <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.ModalStyle}>
            <PaperTextInput
                label="New Filename"
                value = {input}
                onChangeText = {text => setInput(text)}
                mode = "outlined"
                underlineColor={theme.colors.primary}
                theme={{ colors: { text: 'black' } }}
                style = {{backgroundColor: 'white'}}
                autoFocus = {true}
            />
            <View style = {{flexDirection: 'row', justifyContent: 'flex-end'}}>
                <PaperBtn mode = "contained" onPress = {() => { hideModal(1, input); renameFile(selectedPdf, setAllPdfs, setFavPdfs, setRecentPdfs, input);}} style = {styles.btnStyle}>Rename</PaperBtn>
                <PaperBtn mode = "contained" onPress = {() => {hideModal(0)}} style = {styles.btnStyle}>Cancel</PaperBtn>
            </View>
        </Modal>
    </Portal>)
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
        width: 100, 
        alignSelf: 'flex-end', 
        marginTop: 20,
        marginRight: 10,
    },
})

export default withTheme(RenameModal);