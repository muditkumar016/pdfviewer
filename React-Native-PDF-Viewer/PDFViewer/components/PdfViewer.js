import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  StatusBar
} from 'react-native';
import Pdf from 'react-native-pdf';
import { useWindowDimensions } from 'react-native';
import { Appbar } from 'react-native-paper';
import { Menu, Divider, Portal, Modal, TextInput as PaperTextInput, Button as PaperBtn, withTheme, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Realm from "realm";
import PdfSchema from '../schemas/PdfSchema';
import UserData from '../schemas/UserData';
import { usePdfContext } from './Context';
import Orientation from 'react-native-orientation';

const schema = [PdfSchema, UserData];

const MenuBar = (props) => {
    const {
        theme,
        visible,
        closeMenu,
        openMenu,
        showModal,
        isFav,
        setIsFav,

    } = props;
    return <Menu
                contentStyle = {{backgroundColor: theme.colors.primary, color: 'white'}}
                visible={visible}
                onDismiss={closeMenu}
                anchor={<Appbar.Action icon="dots-vertical" color = "white" onPress = {openMenu}/>}
            >
                <Menu.Item 
                    onPress={() => {showModal(); closeMenu();}} 
                    title="Go To Page" 
                    icon={({ size, color }) => (
                        <MaterialCommunityIcons name = "debug-step-over" size = {18} color = 'white'> </MaterialCommunityIcons>
                    )} 
                    titleStyle = {{color: 'white'}} 
                />
                <Divider />
                <Menu.Item 
                    onPress={() => {setIsFav(prev => !prev); 
                    closeMenu()}} 
                    icon={({ size, color }) => (
                        isFav ?
                        <MaterialIcons name = "favorite" size = {18} color = 'white'> </MaterialIcons>
                        : <MaterialIcons name = "favorite-outline" size = {18} color = 'white'/>
                    )} 
                    title = "Favourite"
                    titleStyle = {{color: 'white'}}/>
            </Menu>
}

const NavBar = (props) => {
    const { 
            theme, 
            appBarHeight, 
            navigation, 
            isVertical,
            setIsVertical, 
            singlePageMode, 
            setSinglePageMode, 
            darkMode, 
            setDarkMode, 
        } = props;

            

    return (
        <Animated.View style={[styles.NavBar, {transform: [{translateY: appBarHeight}]}]}>
            <Appbar style = {{backgroundColor: '#694fad'}}>
                <View style = {{flex: 1, justifyContent: 'space-between', flexDirection: 'row'}}>
                    <View>
                        <Appbar.BackAction onPress={() => navigation.goBack()} color = 'white'/>
                    </View>
                    <View style = {{flex: 1, flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <Appbar.Action
                            icon = {isVertical ? "arrow-expand-horizontal": "arrow-expand-vertical"}
                            onPress={() => setIsVertical(prev => !prev)}
                            color = 'white'
                        />
                        <Appbar.Action 
                            icon = {singlePageMode ? "script-outline" : "page-layout-header-footer"} 
                            onPress={() => setSinglePageMode(prev => !prev)} 
                            color = 'white'
                        />

                        <Appbar.Action 
                            icon = "theme-light-dark" 
                            onPress={() => setDarkMode(prev => !prev)} 
                            color = 'white'
                        />
                        {props.MenuBar}
                    </View>
                </View>
            </Appbar>
        </Animated.View>
    )
};

const PopUp = ({popUpVisible, onDismissSnackBar, text}) => (
    <Snackbar
        visible={popUpVisible}
        onDismiss={onDismissSnackBar}
        duration = {2000}
        >
        {text}
    </Snackbar>
);

const PdfViewer = ({navigation, route, theme}) => {
    // Get the functions to update recent PDFs
    const {setRecentPdfs, getRecentPdfs, setFavPdfs, getFavPdfs, setIsLoadingFavScreen, setIsLoadingHomeScreen} = usePdfContext();
    // Dynamic window height and width
    const windowWidth = useWindowDimensions().width;
    const windowHeight = useWindowDimensions().height;

    // Source obj for pdf-viewer
    const [source, setSource] = useState({});

    // Page movement controls
    const [curPage, setCurPage] = useState(1);
    const [initialPage, setInitialPage] = useState(1);
    const [totalPage, setTotalPage] = useState(null);
    const [pageInput, setPageInput] = useState("");
    const pdfRef = useRef(null);

    // Vertical/Horizontal View
    const [isVertical, setIsVertical] = useState(true);
    const chageOrientation = () => {
        Realm.open({
            path: "myrealm",
            schema: schema
        }).then(realm => {
            const curPdf = realm.objectForPrimaryKey('Pdf', route.params._id);
            realm.write(() => {
                curPdf.isVertical = !isVertical;
            })
        })
        setIsVertical(prev => !prev);
    }

    // Single Page Mode
    const [singlePageMode, setSinglePageMode] = useState(false);
    const chageSinglePageMode = () => {
        Realm.open({
            path: "myrealm",
            schema: schema
        }).then(realm => {
            const curPdf = realm.objectForPrimaryKey('Pdf', route.params._id);
            realm.write(() => {
                curPdf.isSinglePage = !singlePageMode;
            })
        })
        setSinglePageMode(prev => !prev)
    }

    // Dark Mode
    const [darkMode, setDarkMode] = useState(false);
    const changeDarkMode = () => {
        Realm.open({
            path: "myrealm",
            schema: schema
        }).then(realm => {
            const curPdf = realm.objectForPrimaryKey('Pdf', route.params._id);
            realm.write(() => {
                curPdf.isDarkMode = !darkMode;
            })
        })
        setDarkMode(prev => !prev);
    }

    // Favourite option
    const [isFav, setIsFav] = useState(false);
    const changeFav = () => {
        setIsFav(prev => !prev);
        setTimeout(() => {
            Realm.open({
                path: "myrealm",
                schema: schema
            }).then(realm => {
                const curPdf = realm.objectForPrimaryKey('Pdf', route.params._id);
                realm.write(() => {
                    curPdf.isFav = !isFav;
                })
                getFavPdfs(setFavPdfs, setIsLoadingFavScreen);
            })
        }, 500);
    }

    // AppBar animation  
    const [isHidden, setIsHidden] = useState(false);
    const appBarHeight = useRef(new Animated.Value(0)).current;
    const viewerOffset = useRef(new Animated.Value(55)).current;
    const scrollerOpacity = useRef(new Animated.Value(1)).current;


    // Modal stuffs
    // Jump to page Modal
    const [visible, setVisible] = React.useState(false);
    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    // Menu Stuffs
    const [menuVisible, setMenuVisible] = React.useState(false);
    const openMenu = () => setMenuVisible(true);
    const closeMenu = () => setMenuVisible(false);

    // POP-UP stuffs
    const [popUpVisible, setPopUpVisible] = React.useState(false);
    const onToggleSnackBar = () => setPopUpVisible(!popUpVisible);
    const onDismissSnackBar = () => setPopUpVisible(false); 
    const [mssg, setMssg] = useState("");

    // Error Messages
    const err = [
        "Requested page doesn't exist.",
        "Please enter a valid page no."
    ]

    const JumpToPage = () => {
        if(pageInput) {
            let page = parseInt(pageInput);
            if(page >= 1 && page <= totalPage){
                hideModal();
                setPageInput("");
                pdfRef.current.setPage(page);
                return;
            }
            else {
                setMssg(err[0]);
                onToggleSnackBar();
            }
        }
        setPageInput("");
        setMssg(err[1]);
        onToggleSnackBar();
    }

    const PageChangeByOne = (delta) => {
        if(curPage + delta >= 1 && curPage + delta <= totalPage) {
            pdfRef.current.setPage(curPage + delta);
        }
    }

    const ToggleAppBar = () => {
        Animated.timing(
            appBarHeight,
            {
                toValue: isHidden ? new Animated.Value(1): new Animated.Value(-55),
                duration: 300,
                useNativeDriver: true
            }
        ).start();

        Animated.timing(
            viewerOffset,
            {
                toValue: isHidden ? new Animated.Value(55): new Animated.Value(0),
                duration: 300,
                useNativeDriver: true
            }
        ).start();

        Animated.timing(
            scrollerOpacity,
            {
                toValue: isHidden ? new Animated.Value(1): new Animated.Value(0),
                duration: 300,
                useNativeDriver: true
            }
        ).start();

        setIsHidden(prev => !prev);
    }

    const setInitialValues = async () => {
        try {
            const realm = await Realm.open({
                path: "myrealm",
                schema: schema
            });
            const curPdf = realm.objectForPrimaryKey('Pdf', route.params._id);
            setDarkMode(curPdf.isDarkMode);
            setIsFav(curPdf.isFav);
            setIsVertical(curPdf.isVertical);
            setSinglePageMode(curPdf.isSinglePage);
            if(curPdf.lastReadPage !== null) {
                setInitialPage(curPdf.lastReadPage);
            }
            setSource({
                uri:`file:///${curPdf.path}`,
                cache: true
            })

            realm.write(() => {
                curPdf.lastRead = new Date();
            })

        } catch (err) {
            console.error("Failed to open the realm while setting Inital values", err.message);
        } 
    }

    useEffect(() => {
        Orientation.unlockAllOrientations()
        setInitialValues();
    }, [])

    return (
        <View style={styles.container}>
            <StatusBar
            barStyle="light-content"
            backgroundColor="#694fad"/>
            <NavBar 
                theme = {theme} 
                appBarHeight = {appBarHeight} 
                navigation = {navigation} 
                isVertical = {isVertical} 
                setIsVertical = {chageOrientation} 
                singlePageMode = {singlePageMode} 
                setSinglePageMode = {chageSinglePageMode} 
                darkMode = {darkMode} 
                setDarkMode = {changeDarkMode} 
                MenuBar = {<MenuBar theme = {theme} isFav = {isFav} setIsFav = {changeFav} visible = {menuVisible} openMenu = {openMenu} closeMenu = {closeMenu} showModal = {showModal}/>}
            />

            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={styles.ModalStyle}>
                    <PaperTextInput
                        label="Page No"
                        value = {pageInput.toString()}
                        onChangeText = {text =>{if((text[text.length - 1] >= '0' && text[text.length - 1] <= '9') || !text) setPageInput(text)}}
                        mode = "outlined"
                        underlineColor={theme.colors.primary}
                        theme={{ colors: { text: 'black' } }}
                        style = {{backgroundColor: 'white'}}
                        autoFocus = {true}
                        keyboardType = {'numeric'}
                    />
                    <PaperBtn icon = "debug-step-over" mode = "contained" onPress = {() => JumpToPage()} style = {{width: 100, alignSelf: 'center', marginTop: 20}}>Go</PaperBtn>
                </Modal>
            </Portal>

            <PopUp popUpVisible = {popUpVisible} onDismissSnackBar = {onDismissSnackBar} text = {mssg}/>

            <Animated.View style = {{...styles.scroll, opacity: scrollerOpacity}}>
                <TouchableOpacity style = {{...styles.PageChanger, backgroundColor: theme.colors.primary}} onPress = {() => PageChangeByOne(-1)}>
                    <Icon name = "minus" size = {11} color = "white"/>
                </TouchableOpacity>
                <Text style = {{...styles.TotalPages, borderLeftWidth: 0, borderTopLeftRadius: 3,borderBottomLeftRadius:3,}}>{curPage}</Text>
                <Text style = {styles.TotalPages}>{totalPage}</Text>
                <TouchableOpacity style = {{...styles.PageChanger, backgroundColor: theme.colors.primary, borderTopRightRadius: 3,borderBottomRightRadius:3}} onPress = {() => PageChangeByOne(1)}>
                    <Icon name = "plus" size = {12} color = "white"/>
                </TouchableOpacity>
            </Animated.View>

            <Animated.View style = {{transform: [{translateY: viewerOffset}]}}>
                <Pdf
                    ref = {pdfRef}
                    source={source}
                    enableAnnotationRendering = {true}
                    onLoadComplete={(numberOfPages,filePath)=>{
                        setTotalPage(numberOfPages);
                        getRecentPdfs(setRecentPdfs, setIsLoadingHomeScreen);
                    }}
                    onPageChanged={(page,numberOfPages)=>{
                        setCurPage(page);
                        Realm.open({
                            path: "myrealm",
                            schema: schema
                        }).then(realm => {
                            const curPdf = realm.objectForPrimaryKey('Pdf', route.params._id);
                            realm.write(() => {
                                curPdf.lastReadPage = page;
                            })
                        })
                    }}
                    onError={(error)=>{
                        console.log(error);
                    }}
                    onPressLink={(uri)=>{
                        console.log(`Link presse: ${uri}`)
                    }}
                    style={[styles.pdf, 
                        {
                            width:windowWidth,
                            height:windowHeight,
                        },
                    ]}
                    maxScale = {4.0}
                    onPageSingleTap = {(page) => ToggleAppBar()}
                    horizontal = {!isVertical}
                    enablePaging = {singlePageMode}
                    darkMode = {darkMode}
                    page = {initialPage}
                />
            </Animated.View>
            
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
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
    },
    pdf: {
        flex:1,
        zIndex: 100000000000,  
    },
    scroll: {
        flex: 1,
        borderWidth:1,
        position: 'absolute',
        width: 150,
        height: 40,
        left: 10,
        bottom: 10,
        zIndex: 1000000,
        borderRadius:5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'white'
    },
    PageChanger: {
        flex: 1,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    Input: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: 'black',
    },
    TotalPages: {
        flex: 1,
        fontSize: 15,
        paddingBottom: 2,
        paddingHorizontal: 8,
        borderLeftWidth: 1,
        textAlign: 'center'
    },
    ModalStyle: {
        backgroundColor: 'white',
        borderRadius:5,
        width: 300,
        padding: 20,
        alignSelf: 'center',
    }
});

export default withTheme(PdfViewer);