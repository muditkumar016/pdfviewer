import React from 'react';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  InteractionManager,
  StatusBar,
  BackHandler
} from 'react-native';
import { withTheme } from 'react-native-paper';
import NavBar from './NavBar';
import SortingModal from './SortingModal';
import BottomSlider from './BottomSlider';
import ConfirmationModal from './ConfirmationModal';
import {SortingFunction} from './utils';
import { usePdfContext } from './Context';
import RenameModal from './RenameModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PermissionsAndroid } from 'react-native'
import DirectoryBrowser from './DirectoryBrowser';
import FileLoader from './FileLoader';
import ListView from './ListView';
import PdfSchema from '../schemas/PdfSchema';
import UserData from '../schemas/UserData';
import Orientation from 'react-native-orientation';



const schema = [PdfSchema, UserData];

const FileScreen = ({navigation, theme}) => {
    const {allPdfs, setAllPdfs, findPDFs} = usePdfContext();

    // First Time Opening ?
    const [isFirst, setIsFirst] = useState(false);
    // Current sort variant
    const [sortVariant, setSortVariant] = useState(0);
    const [order, setOrder] = useState(-1);

    // Selected PDF
    const [selectedPdf, setSelectedPdf] = useState(null);

    // Sorting Modal
    const [sortingModalVisible, setSortingModalVisible] = useState(false);
    const showSortingModal = () => setSortingModalVisible(true);
    const hideSortingModal = () => setSortingModalVisible(false);

    // Copy or Cut operation
    const [op, setOp] = useState(0);

    // Bottom Slider
    const [isBottomSliderVisible, setIsBottomSliderVisible] = useState(false);
    const showBottomSlider = (item) => {
        setSelectedPdf(item);
        setIsBottomSliderVisible(true);
        
    }
    const hideBottomSlider = () => {
        setIsBottomSliderVisible(false);
        
    };
    
    // Confirmation Modal
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const showDeleteModal = () => {
        hideBottomSlider();
        setIsDeleteModalVisible(true)
    };

    const hideDeleteModal = () => setIsDeleteModalVisible(false);

    // Rename Modal
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const openRenameModal = () => {
        hideBottomSlider();
        setRenameModalOpen(true)
    }
    const closeRenameModal = () => setRenameModalOpen(false);

    // Directory Browser Modal
    const [browserModalOpen, setBrowserModalOpen] = useState(false);
    const openBrowserModal = (val) => {
        setOp(val);
        setBrowserModalOpen(true)
    }
    const closeBrowserModal = () => setBrowserModalOpen(false);

    const requestExternalStoreageWrite = async () => {
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            ]);
            const readGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE); 
            const writeGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            return readGranted && writeGranted
        } 
        catch (err) {
            //Handle this error
            console.log(err.message);
        }
    }

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            /* 2: Component is done animating */
            Realm.open({
                path: 'myrealm',
                schema: schema
            }).then(realm => {
                const user = realm.objects('user');
                if(!user.length) {
                    setIsFirst(true);
                }
            })

            const getPdfsWithPermission = async () => {
                let isGranted2 = await requestExternalStoreageWrite();
                if(isGranted2) {
                    await findPDFs(setAllPdfs);
                }
                else {
                    BackHandler.exitApp();
                }
            }
            getPdfsWithPermission();  
        });
        
    }, []);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          // The screen is focused
          // Call any action
            Orientation.lockToPortrait();
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    const sortPdfs = (sort_type, _order = -1) => {
        setSortVariant(sort_type);
        setOrder(_order);
        SortingFunction(setAllPdfs, sort_type, _order);
    }

    return (
        allPdfs._data.length === 0 ? 
        <SafeAreaView style={styles.container}>
            <StatusBar
            barStyle="light-content"
            backgroundColor="#694fad"/>
            <NavBar showSortingModal = {showSortingModal} navigation = {navigation} isRecent = {false}/>
            {isFirst ? <View style = {{flex: 1}}>
                <FileLoader/>
            </View>: null}
        </SafeAreaView> :
        <SafeAreaView style = {{flex: 1}}>
        <SafeAreaView style={styles.container} >
            <StatusBar
            barStyle="light-content"
            backgroundColor="#694fad"/>
            <NavBar showSortingModal = {showSortingModal} navigation = {navigation}/>
            <SortingModal 
            visible = {sortingModalVisible} 
            hideModal = {hideSortingModal} 
            theme = {theme} 
            sortPdfs = {sortPdfs}
            sortVariant = {sortVariant}
            _order = {order}
            />
            <ConfirmationModal
            visible = {isDeleteModalVisible}
            hideModal = {hideDeleteModal}
            selectedPdf = {selectedPdf}
            />
            {
                renameModalOpen &&
                <RenameModal
                visible = {renameModalOpen}
                hideModal = {closeRenameModal}
                selectedPdf = {selectedPdf}
                theme = {theme}
                />
            }

            <ListView
            data = {allPdfs}
            theme = {theme}
            navigation = {navigation}
            showBottomSlider = {showBottomSlider}
            />
            { isBottomSliderVisible && <BottomSlider openBrowserModal = {openBrowserModal} openRenameModal = {openRenameModal} showDeleteModal = {showDeleteModal} theme={theme} visible = {isBottomSliderVisible} hideModal = {hideBottomSlider} selectedPdf = {selectedPdf}/>}
            <DirectoryBrowser
            selectedPdf = {selectedPdf}
            op = {op}
            visible = {browserModalOpen}
            hideModal = {closeBrowserModal}
            />
        </SafeAreaView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        fontSize: 32,
        backgroundColor: "#fff"
    },
});

export default withTheme(FileScreen);