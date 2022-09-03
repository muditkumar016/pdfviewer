import React from 'react';
import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  InteractionManager,
  Dimensions,
  StatusBar
} from 'react-native';
import { withTheme, Appbar, Searchbar, DefaultTheme } from 'react-native-paper';
import { RecyclerListView, LayoutProvider, DataProvider } from "recyclerlistview";
import PdfSchema from '../schemas/PdfSchema';
import UserData from '../schemas/UserData';
import BottomSlider from './BottomSlider';
import PdfItem from './PdfItem';
import ConfirmationModal from './ConfirmationModal';
import RenameModal from './RenameModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import DirectoryBrowser from './DirectoryBrowser';
import Orientation from 'react-native-orientation';
import ListView from './ListView';

const ViewTypes = {
    FULL: 0,
    HALF_LEFT: 1,
    HALF_RIGHT: 2
};

const theme = {
    ...DefaultTheme,
    roundness: 2,
    colors: {
      ...DefaultTheme.colors,
      primary: '#694fad',
      accent: '#f1c40f',
    },
};

const schema = [PdfSchema, UserData];

const SearchBar = (props) => {
    const {query, setQuery, navigation, Search} = props;
    return (
        <View style={styles.NavBar}>
            <Appbar style = {{backgroundColor: '#694fad'}}>
                <Appbar.BackAction onPress={() => navigation.goBack()} color = 'white'/>
                <Searchbar
                placeholder="Search"
                onChangeText={setQuery}
                value={query}
                iconColor = "#694fad"
                onSubmitEditing = {() => Search()}
                style = {styles.searchbar}
                autoFocus = {true}
                onIconPress = {() => Search()}
                />
            </Appbar>
        </View>
    )
};


const SearchScreen = ({navigation, theme}) => {
    const [allPdfs, setAllPdfs] = useState([]);
    const [query, setQuery] = useState('');
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [result, setResult] = useState(new DataProvider((r1, r2) => {
        return r1._id !== r2._id;
    }))
    let { width } = Dimensions.get("window");

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

    const hideDeleteModal = (isDeleted) => {
        if(isDeleted) {
            let newRes = [];
            result._data.forEach(obj => {
                if(obj._id !== selectedPdf._id) {
                    newRes.push(obj);
                }
            })
            setResult(prev => prev.cloneWithRows(newRes));

            let newAllPdfs = [];
            allPdfs.forEach(obj => {
                if(obj._id !== selectedPdf._id) {
                    newAllPdfs.push(obj);
                }
            })
            setAllPdfs(newAllPdfs);
        }
        setIsDeleteModalVisible(false);
    }

    // Rename Modal
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const openRenameModal = () => {
        hideBottomSlider();
        setRenameModalOpen(true)
    }

    // Directory Browser Modal
    const [browserModalOpen, setBrowserModalOpen] = useState(false);
    const openBrowserModal = (val) => {
        setOp(val);
        setBrowserModalOpen(true)
    }
    const closeBrowserModal = (isSelected) => {
        if(isSelected) {
            setTimeout(() => {
                GetAllPdfs();
            }, 1000);
        }
        setBrowserModalOpen(false)
    };

    const closeRenameModal = (isRenamed, newName) => {
        if(isRenamed) {
            let newRes = [];
            result._data.forEach(obj => {
                if(obj._id === selectedPdf._id) {
                    newRes.push({
                        ...selectedPdf,
                        path: selectedPdf.dir + '/' + newName,
                        name: newName
                    });
                }
                else {
                    newRes.push(obj);
                }
            })
            setResult(prev => prev.cloneWithRows(newRes));

            let newAllPdfs = [];
            allPdfs.forEach(obj => {
                if(obj._id !== selectedPdf._id) {
                    newAllPdfs.push(obj);
                }
            })
            setAllPdfs(newAllPdfs);
        }
        setRenameModalOpen(false)
    };

    const Search = () => {
        let res = [];
        let b = query.toLowerCase().split(' ').join('');
        for(let k = 0; k < allPdfs.length; ++k) {
            let a = allPdfs[k].searchName;
            let n = a.length, m = b.length;
            let dp = new Array(n + 1).fill(0).map(() => new Array(m + 1).fill(0));
            let ans = 0;
            for(let i = 1; i <= n; ++i) {
                for(let j = 1; j <= m; ++j) {
                    if(a[i - 1] == b[j - 1])
                        dp[i][j] = dp[i - 1][j - 1] + 1;
                    else
                        dp[i][j] = 0;
                    ans = Math.max(ans, dp[i][j]);
                }
            }

            if(ans >= (m + 1) / 2)
                res.push([k, ans]);
        }
        res.sort((a, b) => {
            if(a[1] > b[1])
                return - 1;
            if(a[1] < b[1])
                return 1;
            return 0;
        })

        for(let i = 0; i < res.length; ++i) {
            res[i] = allPdfs[res[i][0]];
        }

        if(res.length) {
            setResult(prev => prev.cloneWithRows(res));
        }
    }

    const GetAllPdfs = () => {
        Realm.open({
            path: 'myrealm',
            schema: schema
        }).then(realm => {
            const pdfList = realm.objects('Pdf');
            let tmp = [];
            for(let i = 0; i < pdfList.length; ++i) {
                let searchname = pdfList[i].name.toLowerCase().split(' ').join('');
                tmp.push({
                    _id: pdfList[i]._id,
                    name: pdfList[i].name,
                    path: pdfList[i].path,
                    dir: pdfList[i].dir,
                    size: pdfList[i].size,
                    displaySize: pdfList[i].displaySize,
                    displayPath: pdfList[i].displayPath,
                    creationDate: pdfList[i].creationDate,
                    lastRead: pdfList[i].lastRead,
                    isFav: pdfList[i].isFav,
                    searchName: searchname
                })
            }
            setAllPdfs(tmp);
        })
    }
    
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            GetAllPdfs();
        })
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
        <SafeAreaView style = {styles.container}>
            <StatusBar
            barStyle="light-content"
            backgroundColor="#694fad"/>
            <SearchBar query = {query} setQuery = {setQuery} navigation = {navigation} Search = {Search}/>
            {
                result._data.length === 0 ?
                <View>

                </View>:
                <SafeAreaView style = {styles.pdfContainer}>
                    <ConfirmationModal
                    visible = {isDeleteModalVisible}
                    hideModal = {hideDeleteModal}
                    selectedPdf = {selectedPdf}
                    />
                    <ListView
                    data = {result}
                    theme = {theme}
                    navigation = {navigation}
                    showBottomSlider = {showBottomSlider}
                    />
                </SafeAreaView>
            }
            {
                renameModalOpen &&
                <RenameModal
                visible = {renameModalOpen}
                hideModal = {closeRenameModal}
                selectedPdf = {selectedPdf}
                theme = {theme}
                />
            }
            { isBottomSliderVisible && <BottomSlider openBrowserModal = {openBrowserModal} openRenameModal = {openRenameModal} showDeleteModal = {showDeleteModal} theme={theme} visible = {isBottomSliderVisible} hideModal = {hideBottomSlider} selectedPdf = {selectedPdf}/>}
            <DirectoryBrowser
            selectedPdf = {selectedPdf}
            op = {op}
            visible = {browserModalOpen}
            hideModal = {closeBrowserModal}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    NavBar: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1000000,
        justifyContent: 'flex-end',
        backgroundColor: '#694fad',
        height: 55,
        marginBottom: 55,
    },
    searchbar: {
        flex:1,
        marginLeft: 10,
        height: 48,
    },
    pdfContainer: {
        flex: 1,
        marginTop: 55,
    }
});


export default withTheme(SearchScreen);