import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity
} from 'react-native';
import { Portal, RadioButton, withTheme, Button as PaperBtn, Divider, Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Modal } from 'react-native';

const SORT_VARIANT_ARR = [  'Sort By Name',
                            'Sort By Size',
                        ];

const SortingModal = (props) => {
    const {visible, hideModal, theme, sortPdfs, sortVariant, _order} = props;
    const [type, setType] = useState(0);
    const [order, setOrder] = useState(-1);
    useEffect(() => {
        setType(sortVariant);
        setOrder(_order);
    }, [])
    return (
        <Portal>
            <Modal animationType = 'fade' transparent = {true}  visible={visible} onRequestClose = {hideModal}>
                <TouchableOpacity activeOpacity = {1} onPress = {hideModal} style = {styles.ModalStyle}>
                    <View style = {styles.listContainer} onStartShouldSetResponder={() => true}>
                        <RadioButton.Group onValueChange={newValue => setType(newValue)} value={type}>
                            {SORT_VARIANT_ARR.map((val, index) => (
                                <View style = {styles.radioWrapper} key = {index}>
                                    <RadioButton value = {index} color = {theme.colors.primary}/>
                                    <Text style = {styles.radioText}>{val}</Text>
                                </View>
                            ))}               
                        </RadioButton.Group>
                        <Divider/>
                        <RadioButton.Group onValueChange={newValue => setOrder(newValue)} value={order}>
                            <View style = {styles.radioWrapper}>
                                <RadioButton value = {-1} color = {theme.colors.primary}/>
                                <Text style = {styles.radioText}>Ascending Order</Text>
                            </View>
                            <View style = {styles.radioWrapper}>
                                <RadioButton value = {1} color = {theme.colors.primary}/>
                                <Text style = {styles.radioText}>Descending Order</Text>
                            </View>        
                        </RadioButton.Group>
                        <PaperBtn 
                        icon = {() => <MaterialCommunityIcons icon = "sort" color = {theme.colors.primary} size= {20} />}
                        mode = "contained" 
                        onPress = {() => {sortPdfs(type, order); hideModal()}} 
                        style = {{width: 100, alignSelf: 'center', marginTop: 20}}>Sort</PaperBtn>
                    </View>  
                </TouchableOpacity>          
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    // ModalStyle: {
    //     backgroundColor: 'white',
    //     borderRadius:5,
    //     width: 300,
    //     padding: 20,
    //     alignSelf: 'center',
    // },
    ModalStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
        
    },
    listContainer: {
        backgroundColor: 'white', 
        justifyContent: 'center', 
        width: 250, 
        height: 250,
        borderRadius: 10,
        paddingTop: 10,
    },
    radioText: {
        fontSize: 17,
        marginLeft: 5,
    },  
    radioWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
    }
})

export default withTheme(SortingModal);