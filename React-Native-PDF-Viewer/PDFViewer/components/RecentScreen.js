import React from 'react';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  InteractionManager,
  StatusBar
} from 'react-native';
import { withTheme } from 'react-native-paper';
import NavBar from './NavBar';
import SortingModal from './SortingModal';
import { SortingFunction } from './utils';
import BottomSlider from './BottomSlider';
import ConfirmationModal from './ConfirmationModal';
import { usePdfContext } from './Context';
import RenameModal from './RenameModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import DirectoryBrowser from './DirectoryBrowser';
import ListView from './ListView';
import Orientation from 'react-native-orientation';


const RecentScreen = ({navigation, theme}) => {
    const {recentPdfs, setRecentPdfs, getRecentPdfs } = usePdfContext();

    const [sortVariant, setSortVariant] = useState(0);
    const [order, setOrder] = useState(-1);
    
    const [selectedPdf, setSelectedPdf] = useState(null);

    // Copy or Cut operation
    const [op, setOp] = useState(0);

    // Sorting Modal
    const [sortingModalVisible, setSortingModalVisible] = React.useState(false);
    const showSortingModal = () => setSortingModalVisible(true);
    const hideSortingModal = () => setSortingModalVisible(false);

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

    const sortPdfs = (sort_type, _order = -1) => {
        setSortVariant(sort_type);
        setOrder(_order);
        SortingFunction(setRecentPdfs, sort_type, _order, "recent");
    }

    // Rename Modal
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const openRenameModal = () => {
        hideBottomSlider();
        setTimeout(() => {
            setRenameModalOpen(true)
        }, 50)
        
    }
    const closeRenameModal = () => setRenameModalOpen(false);

    // Directory Browser Modal
    const [browserModalOpen, setBrowserModalOpen] = useState(false);
    const openBrowserModal = (val) => {
        setOp(val);
        setBrowserModalOpen(true)
    }
    const closeBrowserModal = () => setBrowserModalOpen(false);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            /* 2: Component is done animating */
            //  Get storage permission for the first time
            getRecentPdfs(setRecentPdfs);
        });
    }, []) 

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
          // The screen is focused
          // Call any action
            Orientation.lockToPortrait();
        });
    
        // Return the function to unsubscribe from the event so it gets removed on unmount
        return unsubscribe;
    }, [navigation]);

    return (
        recentPdfs._data.length === 0 ? 
        <SafeAreaView style={styles.container}>
            <StatusBar
            barStyle="light-content"
            backgroundColor="#694fad"/>
            <NavBar showSortingModal = {showSortingModal} navigation = {navigation}/>
        </SafeAreaView> :
        <SafeAreaView style={styles.container}>
            <StatusBar
            barStyle="light-content"
            backgroundColor="#694fad"/>
            <NavBar showSortingModal = {showSortingModal} navigation = {navigation} isRecent = {true}/>
            <SortingModal 
            visible = {sortingModalVisible} 
            hideModal = {hideSortingModal} 
            theme = {theme} 
            sortPdfs = {sortPdfs}
            sortVariant = {sortVariant}
            setSortVariant = {setSortVariant}
            order = {order}
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
            {/* <RecyclerListView 
            layoutProvider={_layoutProvider} 
            dataProvider={recentPdfs} 
            rowRenderer={_rowRenderer}
            /> */}
            <ListView
            data = {recentPdfs}
            theme = {theme}
            navigation = {navigation}
            showBottomSlider = {showBottomSlider}
            />
            
            { isBottomSliderVisible && <BottomSlider openBrowserModal = {openBrowserModal} showDeleteModal = {showDeleteModal} theme={theme} visible = {isBottomSliderVisible} hideModal = {hideBottomSlider} selectedPdf = {selectedPdf} openRenameModal = {openRenameModal}/>}
            <DirectoryBrowser
            selectedPdf = {selectedPdf}
            op = {op}
            visible = {browserModalOpen}
            hideModal = {closeBrowserModal}
            />
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    pdfTabs: {
        // borderBottomWidth: 0.5,
    },
    header: {
        fontSize: 32,
        backgroundColor: "#fff"
    },
});

export default withTheme(RecentScreen);