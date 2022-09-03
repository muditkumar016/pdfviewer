import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    Modal,
    Dimensions
} from 'react-native';
import { IconButton, Portal, withTheme, Button as PaperBtn, Card, TouchableRipple } from 'react-native-paper';
import { usePdfContext } from './Context';
import * as RNFS from 'react-native-fs';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntIcons from 'react-native-vector-icons/AntDesign';

const { width } = Dimensions.get("window");

const DirectoryBrowser = (props) => { 
    const {copyFile, moveFile, setAllPdfs, setFavPdfs, setRecentPdfs} = usePdfContext();
    const {visible, hideModal, op, selectedPdf} = props;
    const [data, setData] = useState([]);
    const [pathStack, setPathStack] = useState([]);

    const renderItem = ({item}) => {
        return (
        <TouchableRipple rippleColor="rgba(0, 0, 0, .32)"  onPress = {() => {getAllDirs(item.path)}}>
            <View style = {{width: width * 0.9 - 30, borderBottomWidth: 0.5, alignSelf: 'flex-end'}} elevation = {0}>
                <Card.Title 
                    title = {item.name} 
                    subtitle = {item.path} 
                    titleStyle = {{fontSize: 15}}
                    left = {() => <MaterialIcons name = "folder" color = '#694fad' size = {35} />}
                />
            </View>
        </TouchableRipple>
    );
    }

    const getAllDirs = async (path) => {
        setPathStack(prev => [...prev, path]);
        RNFS.readDir(path)
        .then(res => {
            let tmpData = [];
            res.forEach(dir => {
                if(dir.isDirectory()) {
                    tmpData.push({name: dir.name, path: dir.path});
                }
            })
            setData(tmpData);
        })
    }

    const goBack = () => {
        let newStk = [];
        for(let i = 0; i < pathStack.length - 1; ++i)
            newStk[i] = pathStack[i];

        if(newStk.length ) {
            getAllDirs(newStk[newStk.length - 1])
            setPathStack(newStk)
        }
        else {
            hideModal()
        }
    }

    useEffect(() => {
        setPathStack([]);
        getAllDirs(RNFS.ExternalStorageDirectoryPath);
        () => {setPathStack([]);  setData([])}
    }, [props])


    return (
        <Portal>
            <Modal transparent = {true}  visible={visible} onRequestClose = {hideModal}>
                <TouchableOpacity activeOpacity = {1} onPress = {hideModal} style = {styles.ModalStyle}>
                    <View style = {styles.listContainer} onStartShouldSetResponder={() => true}>
                        <View style = {styles.listHeader}>
                            <View style = {styles.headerTitle}>
                                <Text style = {{fontSize: 20, color: '#694fad', fontWeight:'bold'}}>
                                    Select a Folder
                                </Text>
                            </View>
                            <Card.Title 
                                title = {
                                    pathStack.length ?
                                    pathStack[pathStack.length - 1]:
                                    ''
                                } 
                                titleStyle = {{fontSize: 15}}
                                left = {() => 
                                <IconButton
                                    icon={() => <AntIcons name = "back" color = '#694fad' size = {30}/>}
                                    onPress={() => goBack()} />
                                }
                            />
                        </View>
                        <FlatList
                            data = {data}
                            renderItem={renderItem}
                            keyExtractor={item => item.path}
                        />
                        <View style = {{flexDirection: 'row', justifyContent: 'flex-end', opacity: 1}}>
                            <PaperBtn mode = "contained" onPress = {() => { op == 0 ? copyFile(selectedPdf, pathStack[pathStack.length - 1], setAllPdfs, setFavPdfs, setRecentPdfs): moveFile(selectedPdf, pathStack[pathStack.length - 1], setAllPdfs, setFavPdfs, setRecentPdfs); hideModal(1)}} style = {styles.btnStyle}>Select</PaperBtn>
                            <PaperBtn mode = "contained" onPress = {() => {hideModal(0);}} style = {styles.btnStyle}>Cancel</PaperBtn>
                        </View>
                    </View>  
                </TouchableOpacity>          
            </Modal>
        </Portal>
    )
}

const styles = StyleSheet.create({
    ModalStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'
        
    },
    listContainer: {
        backgroundColor: 'white', 
        justifyContent: 'flex-end', 
        width: width * 0.9, 
        height: 600,
        borderRadius: 10,
        paddingBottom: 10,
    },
    listHeader: {
        backgroundColor: 'white',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        borderBottomWidth: 0.5,
        textAlign: 'center',
        minHeight: 100
    },
    headerTitle: {
        textAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        paddingVertical: 10,
    },
    btnStyle: {
        width: 100, 
        alignSelf: 'flex-end', 
        marginTop: 20,
        marginRight: 10,
    }
})

export default withTheme(DirectoryBrowser);